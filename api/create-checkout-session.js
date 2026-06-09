const DODO_TEST_API_BASE = "https://test.dodopayments.com";
const DODO_LIVE_API_BASE = "https://live.dodopayments.com";

// Strip UTF-8 BOM (﻿) that may be present when env vars are copy-pasted from .env files.
function stripBom(s) {
  return String(s || "").replace(/﻿/g, "").trim();
}

// Returns true if the user has any prior subscription row in billing_subscriptions.
// Used to skip the free trial on reactivation — only the first checkout gets a trial.
async function checkHasPriorSubscription(supabaseUrl, serviceRoleKey, userId, email) {
  try {
    const orParts = [];
    if (userId) orParts.push(`user_id.eq.${userId}`);
    if (email) orParts.push(`email.eq.${encodeURIComponent(email)}`);
    if (!orParts.length) return false;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/billing_subscriptions?or=(${orParts.join(",")})&select=id&limit=1`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const data = await response.json().catch(() => null);
    return Array.isArray(data) && data.length > 0;
  } catch {
    // On error default to no trial (conservative — prevents accidental double trial)
    return true;
  }
}

function getDodoApiBase() {
  const environment = String(process.env.DODO_PAYMENTS_ENVIRONMENT || "").toLowerCase();
  return environment === "test_mode" || environment === "test" ? DODO_TEST_API_BASE : DODO_LIVE_API_BASE;
}

function getSiteUrl(req) {
  const configured = process.env.VITE_SITE_URL || process.env.SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = req.headers?.host || "localhost:5173";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

function getProductId(plan) {
  if (plan === "yearly") return process.env.DODO_YEARLY_PRODUCT_ID;
  return process.env.DODO_MONTHLY_PRODUCT_ID;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

// Verify the Supabase access token and return the authenticated user.
// Returns null if the token is missing, expired, or invalid.
async function verifyAccessToken(accessToken) {
  const supabaseUrl = stripBom(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL).replace(/\/+$/, "");
  const anonKey = stripBom(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
  if (!supabaseUrl || !anonKey || !accessToken) return null;

  try {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!userResponse.ok) return null;
    return await userResponse.json();
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) throw new Error("Dodo Payments API key is not configured");

    const body = await readBody(req);

    // --- Auth check: require a valid Supabase session ---
    const accessToken = typeof body.accessToken === "string" ? body.accessToken.trim() : "";
    if (!accessToken) {
      return res.status(401).json({ ok: false, error: "Authentication required." });
    }
    const user = await verifyAccessToken(accessToken);
    if (!user?.id) {
      return res.status(401).json({ ok: false, error: "Invalid or expired session. Please sign in again." });
    }
    // Use verified identity — do not trust client-supplied email/userId
    const verifiedEmail = user.email || body.email || "";
    const verifiedUserId = user.id;
    // ---------------------------------------------------

    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const productId = getProductId(plan);
    if (!productId) throw new Error(`${plan === "yearly" ? "Yearly" : "Monthly"} Dodo product is not configured`);

    // Check prior subscription — returning users do not get a second free trial
    const supabaseUrl = stripBom(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL).replace(/\/+$/, "");
    const serviceRoleKey = stripBom(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const hasPriorSubscription = supabaseUrl && serviceRoleKey
      ? await checkHasPriorSubscription(supabaseUrl, serviceRoleKey, verifiedUserId, verifiedEmail)
      : false;

    const siteUrl = getSiteUrl(req);
    const checkoutResponse = await fetch(`${getDodoApiBase()}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        ...(hasPriorSubscription ? {} : { subscription_data: { trial_period_days: 7 } }),
        customer: {
          email: verifiedEmail || undefined,
          name: verifiedEmail || "TryCritique customer",
        },
        metadata: {
          source: "trycritique",
          plan,
          user_id: verifiedUserId,
          email: verifiedEmail,
        },
        return_url: `${siteUrl}/dashboard?billing=success`,
        cancel_url: `${siteUrl}/dashboard?billing=cancelled`,
      }),
    });

    const data = await checkoutResponse.json().catch(() => ({}));
    if (!checkoutResponse.ok) {
      throw new Error(data?.message || data?.error?.message || "Could not create Dodo checkout session");
    }
    if (!data.checkout_url) throw new Error("Dodo did not return a checkout URL");

    res.status(200).json({ ok: true, url: data.checkout_url });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || "Checkout failed" });
  }
}
