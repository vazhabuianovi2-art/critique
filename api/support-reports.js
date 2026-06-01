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

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getAdminEmails() {
  const configuredEmails = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
  return Array.from(new Set([...OWNER_ADMIN_EMAILS, ...configuredEmails]));
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
  const data = await userResponse.json().catch(() => null);
  return data?.user || data;
}

function sanitizeReportPayload(body, user) {
  const type = String(body.type || "Bug").slice(0, 40);
  const priority = String(body.priority || "Medium").slice(0, 20);
  const title = String(body.title || "").trim().slice(0, 160);
  const message = String(body.message || "").trim().slice(0, 4000);
  if (!title || title.length < 3) throw new Error("Short title is required.");
  if (!message || message.length < 10) throw new Error("Please describe the issue or idea.");

  return {
    user_id: user?.id || null,
    email: normalizeEmail(user?.email || body.email),
    name: String(body.name || user?.user_metadata?.full_name || "").trim().slice(0, 100),
    type,
    priority,
    status: "open",
    title,
    message,
    page: String(body.page || "").slice(0, 300),
    browser: String(body.browser || "").slice(0, 300),
    admin_note: "",
    updated_at: new Date().toISOString(),
  };
}

async function supabaseJson(response, fallbackMessage) {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.error || fallbackMessage);
  return data;
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
    if (!supabaseUrl || !anonKey || !serviceRoleKey) throw new Error("Support API is not configured.");

    const body = await readBody(req);
    const action = String(body.action || "create");
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
    const user = accessToken ? await getUserFromToken(supabaseUrl, anonKey, accessToken) : null;
    const requesterEmail = normalizeEmail(user?.email) || getTokenEmail(accessToken);
    const isAdmin = Boolean(requesterEmail && getAdminEmails().includes(requesterEmail));
    const headers = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    };

    if (action === "create") {
      if (!user?.id) return json(res, 401, { ok: false, error: "Please sign in before sending support feedback." });
      const payload = sanitizeReportPayload(body, user);
      const response = await fetch(`${supabaseUrl}/rest/v1/support_reports?select=*`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });
      const data = await supabaseJson(response, "Could not save support report.");
      return json(res, 200, { ok: true, report: Array.isArray(data) ? data[0] : data });
    }

    if (action === "mine") {
      if (!user?.id) return json(res, 401, { ok: false, error: "Please sign in to view your support reports." });
      const query = `user_id=eq.${encodeURIComponent(user.id)}&select=*&order=created_at.desc&limit=25`;
      const response = await fetch(`${supabaseUrl}/rest/v1/support_reports?${query}`, { headers });
      const data = await supabaseJson(response, "Could not load support reports.");
      return json(res, 200, { ok: true, reports: Array.isArray(data) ? data : [] });
    }

    if (!isAdmin) return json(res, 403, { ok: false, error: "Admin access required." });

    if (action === "list") {
      const status = String(body.status || "all").toLowerCase();
      const statusQuery = status && status !== "all" ? `status=eq.${encodeURIComponent(status)}&` : "";
      const response = await fetch(`${supabaseUrl}/rest/v1/support_reports?${statusQuery}select=*&order=created_at.desc&limit=100`, { headers });
      const data = await supabaseJson(response, "Could not load support inbox.");
      return json(res, 200, { ok: true, reports: Array.isArray(data) ? data : [] });
    }

    if (action === "update") {
      const id = String(body.id || "");
      if (!id) return json(res, 400, { ok: false, error: "Report id is required." });
      const payload = {
        status: String(body.status || "open").slice(0, 30),
        admin_note: String(body.adminNote || "").slice(0, 2000),
        updated_at: new Date().toISOString(),
      };
      const response = await fetch(`${supabaseUrl}/rest/v1/support_reports?id=eq.${encodeURIComponent(id)}&select=*`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });
      const data = await supabaseJson(response, "Could not update support report.");
      return json(res, 200, { ok: true, report: Array.isArray(data) ? data[0] : data });
    }

    return json(res, 400, { ok: false, error: "Unknown support action." });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Support request failed." });
  }
}
