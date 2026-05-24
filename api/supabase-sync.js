function json(response, status, body) {
  response.status(status).json(body);
}

async function readBody(request) {
  if (!request.body) return {};
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");
  return request.body;
}

async function getUserFromToken(supabaseUrl, anonKey, accessToken) {
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!userResponse.ok) return null;
  return userResponse.json();
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return json(response, 405, { error: "Method not allowed" });
  }

  try {
    const supabaseUrl = String(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/+$/, "");
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json(response, 500, { error: "Supabase sync API is not configured." });
    }

    const body = await readBody(request);
    const { action, accessToken } = body;
    if (!accessToken || typeof accessToken !== "string") {
      return json(response, 401, { error: "Login session is missing." });
    }

    const user = await getUserFromToken(supabaseUrl, anonKey, accessToken);
    const userId = user?.id;
    if (!userId) {
      return json(response, 401, { error: "Login session expired. Sign in again." });
    }

    const headers = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    };

    if (action === "listTrades") {
      const upstream = await fetch(`${supabaseUrl}/rest/v1/trades?user_id=eq.${userId}&select=id,created_at,trade_data&order=created_at.desc`, {
        headers,
      });
      const payload = await upstream.json().catch(() => null);
      if (!upstream.ok) return json(response, upstream.status, { error: payload?.message || "Could not load trades." });
      return json(response, 200, { rows: payload || [] });
    }

    if (action === "saveTrade") {
      const trade = body.trade && typeof body.trade === "object" ? body.trade : null;
      if (!trade) return json(response, 400, { error: "Trade is missing." });
      const payload = { ...trade };
      delete payload.supabaseId;
      const rowId = trade.supabaseId || (typeof trade.id === "string" && trade.id.includes("-") ? trade.id : "");

      const url = rowId
        ? `${supabaseUrl}/rest/v1/trades?id=eq.${rowId}&user_id=eq.${userId}&select=id`
        : `${supabaseUrl}/rest/v1/trades?select=id`;
      const upstream = await fetch(url, {
        method: rowId ? "PATCH" : "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(rowId ? { trade_data: payload } : { user_id: userId, trade_data: payload }),
      });
      const result = await upstream.json().catch(() => null);
      if (!upstream.ok) return json(response, upstream.status, { error: result?.message || "Could not save trade." });
      const savedId = Array.isArray(result) ? result[0]?.id : result?.id;
      return json(response, 200, { trade: { ...trade, id: savedId || trade.id, supabaseId: savedId || trade.supabaseId } });
    }

    if (action === "deleteTrade") {
      const rowId = body.tradeId;
      if (!rowId || typeof rowId !== "string") return json(response, 400, { error: "Trade id is missing." });
      const upstream = await fetch(`${supabaseUrl}/rest/v1/trades?id=eq.${rowId}&user_id=eq.${userId}`, {
        method: "DELETE",
        headers,
      });
      if (!upstream.ok) {
        const result = await upstream.json().catch(() => null);
        return json(response, upstream.status, { error: result?.message || "Could not delete trade." });
      }
      return json(response, 200, { ok: true });
    }

    return json(response, 400, { error: "Unknown sync action." });
  } catch (error) {
    return json(response, 500, { error: error?.message || "Sync failed." });
  }
}
