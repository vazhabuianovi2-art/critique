function json(res, status, body) {
  res.status(status).json(body);
}

const STRIPE_API_BASE = "https://api.stripe.com/v1";

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

async function stripeGet(secretKey, path) {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error?.message || "Could not load Stripe billing status.");
  return data;
}

function stripeDate(seconds) {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

function normalizeStripeSubscription(subscription, email) {
  if (!subscription?.id) return null;
  const price = subscription.items?.data?.[0]?.price;
  const interval = price?.recurring?.interval || "";
  const metadataPlan = subscription.metadata?.plan || "";

  return {
    email,
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id || null,
    stripe_subscription_id: subscription.id,
    stripe_price_id: price?.id || null,
    plan: metadataPlan || (interval === "year" ? "yearly" : interval === "month" ? "monthly" : "Pro"),
    status: subscription.status || "unknown",
    current_period_start: stripeDate(subscription.current_period_start),
    current_period_end: stripeDate(subscription.current_period_end),
    trial_start: stripeDate(subscription.trial_start),
    trial_end: stripeDate(subscription.trial_end),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    canceled_at: stripeDate(subscription.canceled_at),
  };
}

async function fetchStripeSubscriptionByEmail(secretKey, email) {
  if (!secretKey || !email) return null;
  const search = new URLSearchParams();
  search.set("query", `email:'${String(email).replaceAll("'", "\\'")}'`);
  search.set("limit", "1");

  const customers = await stripeGet(secretKey, `/customers/search?${search.toString()}`);
  const customerId = customers?.data?.[0]?.id;
  if (!customerId) return null;

  const params = new URLSearchParams();
  params.set("customer", customerId);
  params.set("status", "all");
  params.set("limit", "10");

  const subscriptions = await stripeGet(secretKey, `/subscriptions?${params.toString()}`);
  const preferred = subscriptions?.data?.find((item) => ["trialing", "active"].includes(item.status)) || subscriptions?.data?.[0] || null;
  return normalizeStripeSubscription(preferred, email);
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
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!supabaseUrl || !anonKey || !serviceRoleKey) throw new Error("Billing status is not configured.");

    const body = await readBody(req);
    const accessToken = body.accessToken;
    if (!accessToken || typeof accessToken !== "string") return json(res, 401, { ok: false, error: "Login session is missing." });

    const user = await getUserFromToken(supabaseUrl, anonKey, accessToken);
    if (!user?.id) return json(res, 401, { ok: false, error: "Login session expired. Sign in again." });

    const email = user.email || body.email || "";
    const byUser = await fetchLatestSubscription(supabaseUrl, serviceRoleKey, `user_id=eq.${encodeURIComponent(user.id)}`);
    const subscription = byUser || (email
      ? await fetchLatestSubscription(supabaseUrl, serviceRoleKey, `email=eq.${encodeURIComponent(email)}`)
      : null);

    const stripeSubscription = subscription || await fetchStripeSubscriptionByEmail(stripeSecretKey, email);

    return json(res, 200, { ok: true, subscription: stripeSubscription });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Billing status failed." });
  }
}
