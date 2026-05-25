const DODO_TEST_API_BASE = "https://test.dodopayments.com";
const DODO_LIVE_API_BASE = "https://live.dodopayments.com";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) throw new Error("Dodo Payments API key is not configured");

    const body = await readBody(req);
    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const productId = getProductId(plan);
    if (!productId) throw new Error(`${plan === "yearly" ? "Yearly" : "Monthly"} Dodo product is not configured`);

    const siteUrl = getSiteUrl(req);
    const checkoutResponse = await fetch(`${getDodoApiBase()}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        subscription_data: { trial_period_days: 7 },
        customer: {
          email: body.email || undefined,
          name: body.name || body.email || "TryCritique customer",
        },
        metadata: {
          source: "trycritique",
          plan,
          user_id: body.userId || "",
          email: body.email || "",
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
