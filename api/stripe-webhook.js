import crypto from "node:crypto";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

function json(res, status, body) {
  res.status(status).json(body);
}

async function readRawBody(req) {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");

  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

function parseStripeSignature(signatureHeader = "") {
  return signatureHeader.split(",").reduce((parts, item) => {
    const [key, value] = item.split("=");
    if (!key || !value) return parts;
    if (!parts[key]) parts[key] = [];
    parts[key].push(value);
    return parts;
  }, {});
}

function safeEqual(a, b) {
  const left = Buffer.from(a || "", "hex");
  const right = Buffer.from(b || "", "hex");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function verifyStripeEvent(rawBody, signatureHeader, endpointSecret) {
  const parts = parseStripeSignature(signatureHeader);
  const timestamp = parts.t?.[0];
  const signatures = parts.v1 || [];
  if (!timestamp || !signatures.length) throw new Error("Missing Stripe signature.");

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) throw new Error("Stripe webhook timestamp is too old.");

  const expected = crypto
    .createHmac("sha256", endpointSecret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  if (!signatures.some((signature) => safeEqual(signature, expected))) {
    throw new Error("Stripe webhook signature verification failed.");
  }

  return JSON.parse(rawBody);
}

function fromUnix(seconds) {
  return seconds ? new Date(Number(seconds) * 1000).toISOString() : null;
}

async function stripeGet(secretKey, path) {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error?.message || "Stripe request failed.");
  return data;
}

function getPriceId(subscription) {
  return subscription?.items?.data?.[0]?.price?.id || subscription?.plan?.id || "";
}

function getPlan(subscription, fallback = "") {
  const metadataPlan = subscription?.metadata?.plan || fallback;
  if (metadataPlan === "monthly" || metadataPlan === "yearly") return metadataPlan;
  const interval = subscription?.items?.data?.[0]?.price?.recurring?.interval || subscription?.plan?.interval || "";
  if (interval === "year") return "yearly";
  if (interval === "month") return "monthly";
  return metadataPlan || "unknown";
}

async function upsertBillingSubscription(record) {
  const supabaseUrl = String(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase service role is not configured.");

  const response = await fetch(`${supabaseUrl}/rest/v1/billing_subscriptions?on_conflict=stripe_subscription_id`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(record),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Could not save subscription in Supabase.");
  return Array.isArray(data) ? data[0] : data;
}

async function saveSubscription(subscription, overrides = {}) {
  const metadata = subscription?.metadata || {};
  const record = {
    user_id: metadata.user_id || overrides.user_id || null,
    email: metadata.email || overrides.email || null,
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id || overrides.stripe_customer_id || null,
    stripe_subscription_id: subscription.id,
    stripe_price_id: getPriceId(subscription) || null,
    plan: getPlan(subscription, overrides.plan),
    status: subscription.status || "unknown",
    current_period_start: fromUnix(subscription.current_period_start),
    current_period_end: fromUnix(subscription.current_period_end),
    trial_start: fromUnix(subscription.trial_start),
    trial_end: fromUnix(subscription.trial_end),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    canceled_at: fromUnix(subscription.canceled_at),
    updated_at: new Date().toISOString(),
  };

  if (!record.stripe_subscription_id) throw new Error("Subscription id is missing.");
  return upsertBillingSubscription(record);
}

async function handleCheckoutCompleted(secretKey, session) {
  if (session.mode !== "subscription" || !session.subscription) return;
  const subscription = await stripeGet(secretKey, `/subscriptions/${session.subscription}?expand[]=items.data.price`);
  await saveSubscription(subscription, {
    user_id: session.client_reference_id || session.metadata?.user_id || null,
    email: session.customer_details?.email || session.customer_email || session.metadata?.email || null,
    stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
    plan: session.metadata?.plan || "",
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secretKey || !endpointSecret) throw new Error("Stripe webhook is not configured.");

    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    const event = verifyStripeEvent(rawBody, signature, endpointSecret);

    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(secretKey, event.data.object);
    }

    if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
      await saveSubscription(event.data.object);
    }

    return json(res, 200, { received: true });
  } catch (error) {
    return json(res, 400, { ok: false, error: error?.message || "Webhook failed." });
  }
}
