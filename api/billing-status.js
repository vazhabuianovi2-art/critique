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
    if (!supabaseUrl || !anonKey || !serviceRoleKey) throw new Error("Billing status is not configured.");

    const body = await readBody(req);
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
    const requestedEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const user = accessToken ? await getUserFromToken(supabaseUrl, anonKey, accessToken) : null;
    const email = String(user?.email || requestedEmail || "").trim().toLowerCase();
    if (!user?.id && !email) return json(res, 401, { ok: false, error: "Login session is missing." });

    const adminGrant = email
      ? await fetchLatestSubscription(supabaseUrl, serviceRoleKey, `provider=eq.admin&email=eq.${encodeURIComponent(email)}`)
      : null;
    const byUser = user?.id
      ? await fetchLatestSubscription(supabaseUrl, serviceRoleKey, `user_id=eq.${encodeURIComponent(user.id)}`)
      : null;
    const subscription = adminGrant || byUser || (email
      ? await fetchLatestSubscription(supabaseUrl, serviceRoleKey, `email=eq.${encodeURIComponent(email)}`)
      : null);

    return json(res, 200, { ok: true, subscription: publicSubscription(subscription) });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Billing status failed." });
  }
}
