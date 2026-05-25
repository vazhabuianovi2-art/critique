const DODO_TEST_API_BASE = "https://test.dodopayments.com";
const DODO_LIVE_API_BASE = "https://live.dodopayments.com";

function getDodoApiBase() {
  const environment = String(process.env.DODO_PAYMENTS_ENVIRONMENT || "").toLowerCase();
  return environment === "test_mode" || environment === "test" ? DODO_TEST_API_BASE : DODO_LIVE_API_BASE;
}

function getDodoPortalBase() {
  const environment = String(process.env.DODO_PAYMENTS_ENVIRONMENT || "").toLowerCase();
  return environment === "test_mode" || environment === "test"
    ? "https://test.customer.dodopayments.com"
    : "https://customer.dodopayments.com";
}

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
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function findCustomerByEmail(apiKey, email) {
  const params = new URLSearchParams();
  params.set("email", String(email).trim().toLowerCase());
  params.set("page_size", "1");

  const response = await fetch(`${getDodoApiBase()}/customers?${params.toString()}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || "Could not find Dodo customer");
  return data?.items?.[0]?.customer_id || "";
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
    const customerId = body.customerId || (body.email ? await findCustomerByEmail(apiKey, body.email) : "");
    const returnUrl = `${getSiteUrl(req)}/dashboard?billing=portal-return`;

    if (!customerId) {
      const businessId = process.env.DODO_BUSINESS_ID;
      if (!businessId) throw new Error("No Dodo customer found for this email yet. Start a subscription first.");
      return res.status(200).json({ ok: true, url: `${getDodoPortalBase()}/login/${businessId}` });
    }

    const portalResponse = await fetch(`${getDodoApiBase()}/customers/${encodeURIComponent(customerId)}/customer-portal/session?${new URLSearchParams({ return_url: returnUrl }).toString()}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await portalResponse.json().catch(() => ({}));
    if (!portalResponse.ok) {
      throw new Error(data?.message || data?.error?.message || "Could not open Dodo customer portal");
    }
    if (!data.link) throw new Error("Dodo did not return a customer portal link");

    res.status(200).json({ ok: true, url: data.link });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || "Billing portal failed" });
  }
}
