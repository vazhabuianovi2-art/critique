const STRIPE_API_BASE = "https://api.stripe.com/v1";

function getSiteUrl(req) {
  const configured = process.env.VITE_SITE_URL || process.env.SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = req.headers?.host || "localhost:5173";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

function getPriceId(plan) {
  if (plan === "yearly") return process.env.STRIPE_YEARLY_PRICE_ID;
  return process.env.STRIPE_MONTHLY_PRICE_ID;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error("Stripe secret key is not configured");

    const body = await readBody(req);
    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const priceId = getPriceId(plan);
    if (!priceId) throw new Error(`${plan === "yearly" ? "Yearly" : "Monthly"} Stripe price is not configured`);

    const siteUrl = getSiteUrl(req);
    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("success_url", `${siteUrl}/dashboard?billing=success`);
    params.set("cancel_url", `${siteUrl}/dashboard?billing=cancelled`);
    params.set("allow_promotion_codes", "true");
    params.set("subscription_data[trial_period_days]", "7");
    if (body.email) params.set("customer_email", String(body.email));
    if (body.userId) params.set("client_reference_id", String(body.userId));
    params.set("metadata[source]", "trycritique");
    params.set("metadata[plan]", plan);

    const stripeResponse = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await stripeResponse.json();
    if (!stripeResponse.ok) {
      throw new Error(data?.error?.message || "Could not create checkout session");
    }

    res.status(200).json({ ok: true, url: data.url });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || "Checkout failed" });
  }
}
