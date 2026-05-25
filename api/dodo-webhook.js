import crypto from "node:crypto";

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

function getSignatureValues(signatureHeader = "") {
  return signatureHeader
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^v\d+=?/, ""));
}

function getWebhookSecrets(secret) {
  const trimmed = String(secret || "").trim();
  const values = [Buffer.from(trimmed, "utf8")];
  if (trimmed.startsWith("whsec_")) {
    const base64 = trimmed.slice("whsec_".length);
    values.push(Buffer.from(base64, "base64"));
  }
  return values;
}

function safeCompare(left, right) {
  const a = Buffer.from(left || "");
  const b = Buffer.from(right || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function verifyDodoEvent(rawBody, headers, secret) {
  const webhookId = headers["webhook-id"] || headers["Webhook-Id"];
  const timestamp = headers["webhook-timestamp"] || headers["Webhook-Timestamp"];
  const signature = headers["webhook-signature"] || headers["Webhook-Signature"];
  if (!webhookId || !timestamp || !signature) throw new Error("Missing Dodo webhook signature headers.");

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) throw new Error("Dodo webhook timestamp is too old.");

  const signedPayload = `${webhookId}.${timestamp}.${rawBody}`;
  const received = getSignatureValues(signature);
  const expected = getWebhookSecrets(secret).flatMap((key) => {
    const digest = crypto.createHmac("sha256", key).update(signedPayload, "utf8").digest();
    return [digest.toString("base64"), digest.toString("hex")];
  });

  if (!received.some((value) => expected.some((candidate) => safeCompare(value, candidate)))) {
    throw new Error("Dodo webhook signature verification failed.");
  }

  return JSON.parse(rawBody);
}

async function upsertBillingSubscription(record) {
  const supabaseUrl = String(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase service role is not configured.");

  const response = await fetch(`${supabaseUrl}/rest/v1/billing_subscriptions?on_conflict=dodo_subscription_id`, {
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

function normalizeDodoDate(value) {
  return value ? new Date(value).toISOString() : null;
}

function getDodoPlan(subscription) {
  const metadataPlan = subscription?.metadata?.plan;
  if (metadataPlan === "monthly" || metadataPlan === "yearly") return metadataPlan;
  const interval = subscription?.subscription_period_interval;
  if (interval === "Year") return "yearly";
  if (interval === "Month") return "monthly";
  return "Pro";
}

async function saveDodoSubscription(subscription) {
  const metadata = subscription?.metadata || {};
  const subscriptionId = subscription?.subscription_id || subscription?.id;
  if (!subscriptionId) throw new Error("Dodo subscription id is missing.");

  return upsertBillingSubscription({
    provider: "dodo",
    user_id: metadata.user_id || null,
    email: String(metadata.email || subscription?.customer?.email || subscription?.email || "").trim().toLowerCase() || null,
    dodo_customer_id: subscription?.customer_id || subscription?.customer?.customer_id || subscription?.customer?.id || null,
    dodo_subscription_id: subscriptionId,
    dodo_product_id: subscription?.product_id || subscription?.product?.product_id || null,
    plan: getDodoPlan(subscription),
    status: subscription?.status || "unknown",
    current_period_start: normalizeDodoDate(subscription?.previous_billing_date || subscription?.created_at),
    current_period_end: normalizeDodoDate(subscription?.next_billing_date || subscription?.expires_at),
    trial_start: subscription?.trial_period_days ? normalizeDodoDate(subscription?.created_at) : null,
    trial_end: normalizeDodoDate(subscription?.trial_end || subscription?.trial_ends_at),
    cancel_at_period_end: Boolean(subscription?.cancel_at_next_billing_date),
    canceled_at: normalizeDodoDate(subscription?.cancelled_at),
    updated_at: new Date().toISOString(),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY || process.env.DODO_WEBHOOK_SECRET;
    if (!webhookKey) throw new Error("Dodo webhook key is not configured.");

    const rawBody = await readRawBody(req);
    const event = verifyDodoEvent(rawBody, req.headers, webhookKey);

    if (String(event.type || "").startsWith("subscription.")) {
      await saveDodoSubscription(event.data);
    }

    return json(res, 200, { received: true });
  } catch (error) {
    return json(res, 400, { ok: false, error: error?.message || "Webhook failed." });
  }
}
