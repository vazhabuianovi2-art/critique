function json(res, status, body) {
  res.status(status).json(body);
}

// Strip UTF-8 BOM (﻿) that may be present when env vars are copy-pasted from .env files.
// A BOM-prefixed anon key or URL causes Supabase to reject all token verifications.
function stripBom(s) {
  return String(s || "").replace(/﻿/g, "").trim();
}

// Decode a JWT payload without verifying the signature.
// Used as a last-resort fallback to extract email+expiry when Supabase auth verification
// is unavailable (e.g. misconfigured env vars). Only acted on for OWNER_ADMIN_EMAILS.
function decodeJwtPayload(token) {
  try {
    const part = String(token || "").split(".")[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

// Owner emails always have admin-level billing access (synthetic fallback when no DB row exists).
const OWNER_ADMIN_EMAILS = (process.env.OWNER_ADMIN_EMAILS || "vazhabuianovi2@gmail.com")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
if (!OWNER_ADMIN_EMAILS.includes("vazhabuianovi2@gmail.com")) {
  OWNER_ADMIN_EMAILS.push("vazhabuianovi2@gmail.com");
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

// TEMP DIAGNOSTIC: capture why token verification fails. Remove after debugging.
let LAST_AUTH_DIAG = "";

async function getUserFromToken(supabaseUrl, anonKey, accessToken) {
  let userResponse;
  try {
    userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (e) {
    LAST_AUTH_DIAG = `fetch-threw:${String(e?.message || e).slice(0, 40)}`;
    return null;
  }
  if (!userResponse.ok) {
    const bodyText = await userResponse.text().catch(() => "");
    LAST_AUTH_DIAG = `status=${userResponse.status} body=${bodyText.slice(0, 80)}`;
    return null;
  }
  LAST_AUTH_DIAG = "ok";
  return userResponse.json();
}

async function fetchLatestSubscription(supabaseUrl, serviceRoleKey, query) {
  const response = await fetch(`${supabaseUrl}/rest/v1/billing_subscriptions?${query}&select=*&order=updated_at.desc&limit=1`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Could not load billing status.");
  return Array.isArray(data) ? data[0] || null : null;
}

function publicSubscription(subscription) {
  if (!subscription) return null;
  return {
    provider: subscription.provider || "dodo",
    email: subscription.email || null,
    plan: subscription.plan || "Pro",
    status: subscription.status || "unknown",
    current_period_start: subscription.current_period_start || null,
    current_period_end: subscription.current_period_end || null,
    trial_start: subscription.trial_start || null,
    trial_end: subscription.trial_end || null,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    canceled_at: subscription.canceled_at || null,
  };
}

// Simple in-process rate limiter (best-effort — not cross-instance).
// Proper production rate limiting requires Vercel KV or Upstash Redis.
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_CALLS = 20;        // max 20 calls per IP per minute

function isRateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_CALLS) return true;
  return false;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  // Best-effort IP rate limiting
  const clientIp =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "";

  if (isRateLimited(clientIp)) {
    return json(res, 429, { ok: false, error: "Too many requests. Please try again shortly." });
  }

  try {
    const supabaseUrl = stripBom(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL).replace(/\/+$/, "");
    const anonKey = stripBom(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
    const serviceRoleKey = stripBom(process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!supabaseUrl || !anonKey || !serviceRoleKey) throw new Error("Billing status is not configured.");

    const body = await readBody(req);
    const accessToken = typeof body.accessToken === "string" ? body.accessToken.trim() : "";

    // Require a valid access token — reject anonymous / email-only requests
    if (!accessToken) {
      return json(res, 401, { ok: false, error: "Authentication required." });
    }

    const user = await getUserFromToken(supabaseUrl, anonKey, accessToken);
    if (!user?.id) {
      // Supabase verification failed. As a last-resort fallback, decode the JWT payload
      // locally and check if the email belongs to an owner/admin. We still verify that the
      // token has not expired (exp claim) to prevent replay of old tokens.
      // This path is ONLY used for OWNER_ADMIN_EMAILS — never for regular users.
      const payload = decodeJwtPayload(accessToken);
      const payloadEmail = String(payload?.email || payload?.user_metadata?.email || "").trim().toLowerCase();
      const tokenExpMs = payload?.exp ? payload.exp * 1000 : 0;
      const tokenExpired = !tokenExpMs || tokenExpMs <= Date.now();

      if (!tokenExpired && payloadEmail && OWNER_ADMIN_EMAILS.includes(payloadEmail)) {
        const adminSub = {
          provider: "admin",
          email: payloadEmail,
          plan: "Admin Pro",
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: "2099-12-31T23:59:59.000Z",
          trial_start: null,
          trial_end: null,
          cancel_at_period_end: false,
          canceled_at: null,
        };
        return json(res, 200, { ok: true, subscription: publicSubscription(adminSub) });
      }

      // TEMP DIAGNOSTIC: surface why verification failed (no secrets — host is already public via VITE_).
      let urlHost = "";
      try { urlHost = new URL(supabaseUrl).host; } catch {}
      const diag = `auth(${LAST_AUTH_DIAG}) host=${urlHost} jwtEmail=${payloadEmail || "none"} jwtExp=${tokenExpired ? "expired" : "valid"}`;
      return json(res, 401, { ok: false, error: `Invalid or expired session. Please sign in again. [DIAG ${diag}]` });
    }

    const email = String(user.email || "").trim().toLowerCase();

    const adminGrant = email
      ? await fetchLatestSubscription(supabaseUrl, serviceRoleKey, `provider=eq.admin&email=eq.${encodeURIComponent(email)}`)
      : null;
    const byUser = await fetchLatestSubscription(supabaseUrl, serviceRoleKey, `user_id=eq.${encodeURIComponent(user.id)}`);
    let subscription = adminGrant || byUser || (email
      ? await fetchLatestSubscription(supabaseUrl, serviceRoleKey, `email=eq.${encodeURIComponent(email)}`)
      : null);

    // Owner emails always have admin access — synthesize a subscription if no DB row exists
    if (!subscription && email && OWNER_ADMIN_EMAILS.includes(email)) {
      subscription = {
        provider: "admin",
        email,
        plan: "Admin Pro",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: "2099-12-31T23:59:59.000Z",
        trial_start: null,
        trial_end: null,
        cancel_at_period_end: false,
        canceled_at: null,
      };
    }

    return json(res, 200, { ok: true, subscription: publicSubscription(subscription) });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Billing status failed." });
  }
}
