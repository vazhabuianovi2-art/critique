function json(res, status, body) {
  res.status(status).json(body);
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

const OWNER_ADMIN_EMAILS = ["vazhabuianovi2@gmail.com"];

function getAdminEmails() {
  const configuredEmails = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([...OWNER_ADMIN_EMAILS, ...configuredEmails]));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getUserEmail(user) {
  return normalizeEmail(user?.email || user?.user?.email || user?.data?.user?.email);
}

function decodeJwtPayload(token) {
  try {
    const payload = String(token || "").split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function getTokenEmail(accessToken) {
  const payload = decodeJwtPayload(accessToken);
  return normalizeEmail(payload?.email || payload?.user_metadata?.email);
}

async function getUserFromToken(supabaseUrl, anonKey, accessToken) {
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!userResponse.ok) return null;
  return userResponse.json();
}

async function fetchExistingAdminGrant(supabaseUrl, headers, email) {
  const query = `provider=eq.admin&email=eq.${encodeURIComponent(email)}&select=*&order=updated_at.desc&limit=1`;
  const response = await fetch(`${supabaseUrl}/rest/v1/billing_subscriptions?${query}`, { headers });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Could not check existing admin access.");
  return Array.isArray(data) ? data[0] || null : null;
}

async function listAdminGrants(supabaseUrl, headers) {
  const query = "provider=eq.admin&select=id,email,plan,status,current_period_end,canceled_at,updated_at&order=updated_at.desc&limit=100";
  const response = await fetch(`${supabaseUrl}/rest/v1/billing_subscriptions?${query}`, { headers });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Could not load admin access list.");
  return Array.isArray(data) ? data : [];
}

async function grantAdminAccess(supabaseUrl, headers, email) {
  const existing = await fetchExistingAdminGrant(supabaseUrl, headers, email);
  const payload = {
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
    updated_at: new Date().toISOString(),
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/billing_subscriptions${existing?.id ? `?id=eq.${existing.id}&select=*` : "?select=*"}`, {
    method: existing?.id ? "PATCH" : "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Could not grant free Pro access.");
  const saved = Array.isArray(data) ? data[0] || null : data || null;
  const verified = await fetchExistingAdminGrant(supabaseUrl, headers, email);
  if (!verified) throw new Error("Free Pro access was not saved. Check billing_subscriptions table permissions.");
  return verified || saved || payload;
}

async function revokeAdminAccess(supabaseUrl, headers, email) {
  const payload = {
    status: "canceled",
    cancel_at_period_end: false,
    canceled_at: new Date().toISOString(),
    current_period_end: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const response = await fetch(`${supabaseUrl}/rest/v1/billing_subscriptions?provider=eq.admin&email=eq.${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Could not revoke free Pro access.");
  return Array.isArray(data) ? data : [];
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const supabaseUrl = String(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/+$/, "");
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !anonKey || !serviceRoleKey) throw new Error("Admin access API is not configured.");

    const body = await readBody(req);
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
    const user = accessToken ? await getUserFromToken(supabaseUrl, anonKey, accessToken) : null;
    const requesterEmail = getUserEmail(user) || getTokenEmail(accessToken);
    const adminEmails = getAdminEmails();
    const isAdmin = Boolean(requesterEmail && adminEmails.includes(requesterEmail));

    if (body.action === "status") {
      return json(res, 200, { ok: true, isAdmin, requesterEmail });
    }

    if (!isAdmin) return json(res, 403, { ok: false, error: `Admin access required${requesterEmail ? ` for ${requesterEmail}` : ""}.` });

    const headers = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    };

    if (body.action === "list") {
      return json(res, 200, { ok: true, grants: await listAdminGrants(supabaseUrl, headers) });
    }

    const email = normalizeEmail(body.email);
    if (!email || !email.includes("@")) return json(res, 400, { ok: false, error: "Valid email is required." });

    if (body.action === "grant") {
      const grant = await grantAdminAccess(supabaseUrl, headers, email);
      return json(res, 200, { ok: true, grant });
    }

    if (body.action === "revoke") {
      const grants = await revokeAdminAccess(supabaseUrl, headers, email);
      return json(res, 200, { ok: true, grants });
    }

    return json(res, 400, { ok: false, error: "Unknown admin action." });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Admin access request failed." });
  }
}
