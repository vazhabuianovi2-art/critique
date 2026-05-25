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
    const accessToken = body.accessToken;
    if (!accessToken || typeof accessToken !== "string") return json(res, 401, { ok: false, error: "Login session is missing." });

    const user = await getUserFromToken(supabaseUrl, anonKey, accessToken);
    if (!user?.id) return json(res, 401, { ok: false, error: "Login session expired. Sign in again." });

    const url = `${supabaseUrl}/rest/v1/billing_subscriptions?user_id=eq.${encodeURIComponent(user.id)}&select=*&order=updated_at.desc&limit=1`;
    const response = await fetch(url, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || "Could not load billing status.");

    return json(res, 200, { ok: true, subscription: Array.isArray(data) ? data[0] || null : null });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Billing status failed." });
  }
}
