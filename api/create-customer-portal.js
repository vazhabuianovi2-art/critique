const STRIPE_API_BASE = "https://api.stripe.com/v1";

function getSiteUrl(req) {
  const configured = process.env.VITE_SITE_URL || process.env.SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = req.headers?.host || "localhost:5173";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function findCustomerByEmail(secretKey, email) {
  const params = new URLSearchParams();
  params.set("query", `email:'${String(email).replaceAll("'", "\\'")}'`);
  params.set("limit", "1");

  const response = await fetch(`${STRIPE_API_BASE}/customers/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Could not find Stripe customer");
  return data?.data?.[0]?.id || "";
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
    const customerId = body.customerId || (body.email ? await findCustomerByEmail(secretKey, body.email) : "");
    if (!customerId) throw new Error("No Stripe customer found for this email yet. Start a subscription first.");

    const params = new URLSearchParams();
    params.set("customer", customerId);
    params.set("return_url", `${getSiteUrl(req)}/dashboard?billing=portal-return`);

    const stripeResponse = await fetch(`${STRIPE_API_BASE}/billing_portal/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await stripeResponse.json();
    if (!stripeResponse.ok) {
      throw new Error(data?.error?.message || "Could not open billing portal");
    }

    res.status(200).json({ ok: true, url: data.url });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || "Billing portal failed" });
  }
}
