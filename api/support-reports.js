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

// Owner emails: prefer env var, always fall back to hardcoded owner as safety net.
const OWNER_ADMIN_EMAILS = (process.env.OWNER_ADMIN_EMAILS || "vazhabuianovi2@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

if (!OWNER_ADMIN_EMAILS.includes("vazhabuianovi2@gmail.com")) {
  OWNER_ADMIN_EMAILS.push("vazhabuianovi2@gmail.com");
}

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

function makeMessage({ sender, text, name, email }) {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    sender,
    text: String(text || "").trim().slice(0, 4000),
    name: String(name || "").trim().slice(0, 100),
    email: normalizeEmail(email),
    created_at: new Date().toISOString(),
  };
}

function normalizeMessages(messages) {
  return Array.isArray(messages) ? messages.filter((message) => message && typeof message === "object") : [];
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
      const payload = sanitizeReportPayload(body, user);
      const firstMessage = makeMessage({ sender: "user", text: payload.message, name: payload.name, email: payload.email });
      const chatPayload = {
        ...payload,
        messages: [firstMessage],
        admin_unread_count: 1,
        user_unread_count: 0,
        last_message_at: firstMessage.created_at,
      };
      const response = await fetch(`${supabaseUrl}/rest/v1/support_reports?select=*`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(chatPayload),
      });
      let data = await response.json().catch(() => null);
      if (!response.ok && /messages|unread|last_message/i.test(data?.message || data?.error || "")) {
        const fallbackResponse = await fetch(`${supabaseUrl}/rest/v1/support_reports?select=*`, {
          method: "POST",
          headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify(payload),
        });
        data = await supabaseJson(fallbackResponse, "Could not save support report.");
      } else if (!response.ok) {
        throw new Error(data?.message || data?.error || "Could not save support report.");
      }
      return json(res, 200, { ok: true, report: Array.isArray(data) ? data[0] : data });
    }

    if (action === "mine") {
      const reportEmail = requesterEmail || normalizeEmail(body.email);
      if (!user?.id && !reportEmail) return json(res, 401, { ok: false, error: "Please sign in to view your support reports." });
      const filters = [];
      if (user?.id) filters.push(`user_id.eq.${encodeURIComponent(user.id)}`);
      if (reportEmail) filters.push(`email.eq.${encodeURIComponent(reportEmail)}`);
      const query = `or=(${filters.join(",")})&select=*&order=created_at.desc&limit=25`;
      const response = await fetch(`${supabaseUrl}/rest/v1/support_reports?${query}`, { headers });
      const data = await supabaseJson(response, "Could not load support reports.");
      return json(res, 200, { ok: true, reports: Array.isArray(data) ? data : [] });
    }

    if (action === "send_message") {
      const id = String(body.id || "");
      const text = String(body.text || "").trim();
      if (!id) return json(res, 400, { ok: false, error: "Report id is required." });
      if (text.length < 1) return json(res, 400, { ok: false, error: "Message is required." });
      // Require a verified JWT — email-only access is not accepted
      if (!isAdmin && !user?.id) return json(res, 401, { ok: false, error: "Please sign in to reply." });

      const lookupResponse = await fetch(`${supabaseUrl}/rest/v1/support_reports?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, { headers });
      const rows = await supabaseJson(lookupResponse, "Could not load support report.");
      const report = Array.isArray(rows) ? rows[0] : null;
      if (!report) return json(res, 404, { ok: false, error: "Support report not found." });

      const reportEmail = normalizeEmail(report.email);
      const senderEmail = requesterEmail;
      const canUserReply = Boolean(user?.id && report.user_id === user.id) || Boolean(senderEmail && reportEmail && senderEmail === reportEmail);
      if (!isAdmin && !canUserReply) return json(res, 403, { ok: false, error: "You cannot reply to this report." });

      const sender = isAdmin ? "admin" : "user";
      const message = makeMessage({
        sender,
        text,
        name: isAdmin ? "TryCritique Support" : String(body.name || user?.user_metadata?.full_name || ""),
        email: senderEmail,
      });
      const messages = [...normalizeMessages(report.messages), message];
      const payload = {
        messages,
        admin_note: isAdmin ? text : report.admin_note || "",
        updated_at: message.created_at,
        last_message_at: message.created_at,
        admin_unread_count: sender === "user" ? Number(report.admin_unread_count || 0) + 1 : 0,
        user_unread_count: sender === "admin" ? Number(report.user_unread_count || 0) + 1 : 0,
        status: sender === "admin" && String(report.status || "open") === "open" ? "in_progress" : report.status || "open",
      };

      const response = await fetch(`${supabaseUrl}/rest/v1/support_reports?id=eq.${encodeURIComponent(id)}&select=*`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });
      const data = await supabaseJson(response, "Could not save support reply.");
      return json(res, 200, { ok: true, report: Array.isArray(data) ? data[0] : data, message });
    }

    if (action === "mark_read") {
      const id = String(body.id || "");
      if (!id) return json(res, 400, { ok: false, error: "Report id is required." });

      const lookupResponse = await fetch(`${supabaseUrl}/rest/v1/support_reports?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, { headers });
      const rows = await supabaseJson(lookupResponse, "Could not load support report.");
      const report = Array.isArray(rows) ? rows[0] : null;
      if (!report) return json(res, 404, { ok: false, error: "Support report not found." });

      const reportEmail = normalizeEmail(report.email);
      const readerEmail = requesterEmail || normalizeEmail(body.email);
      const canUserRead = Boolean(user?.id && report.user_id === user.id) || Boolean(readerEmail && reportEmail && readerEmail === reportEmail);
      if (!isAdmin && !canUserRead) return json(res, 403, { ok: false, error: "You cannot update this report." });

      const payload = isAdmin ? { admin_unread_count: 0 } : { user_unread_count: 0 };
      const response = await fetch(`${supabaseUrl}/rest/v1/support_reports?id=eq.${encodeURIComponent(id)}&select=*`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });
      const data = await supabaseJson(response, "Could not update support report.");
      return json(res, 200, { ok: true, report: Array.isArray(data) ? data[0] : data });
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
        admin_unread_count: 0,
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
