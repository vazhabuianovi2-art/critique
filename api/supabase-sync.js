function json(response, status, body) {
  response.status(status).json(body);
}

function authExpired(response, message = "Login session expired. Sign in again.") {
  return json(response, 200, { ok: false, authExpired: true, error: message });
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
    // Strip UTF-8 BOM (﻿ / ﻿) that can be accidentally pasted into Vercel env vars
    const stripBom = (s) => String(s || "").replace(/^﻿/, "").trim();
    const supabaseUrl = stripBom(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL).replace(/\/+$/, "");
    const anonKey = stripBom(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
    const serviceRoleKey = stripBom(process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json(response, 500, { error: "Supabase sync API is not configured." });
    }

    const body = await readBody(request);
    const { action, accessToken } = body;
    if (!accessToken || typeof accessToken !== "string") {
      return authExpired(response, "Login session is missing.");
    }

    const user = await getUserFromToken(supabaseUrl, anonKey, accessToken);
    const userId = user?.id;
    if (!userId) {
      return authExpired(response);
    }

    const headers = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    };

    if (action === "loadAll") {
      // Fetch trades + account in a single round-trip to avoid two cold starts
      const [tradesRes, accountRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/trades?user_id=eq.${userId}&select=id,created_at,trade_data&order=created_at.desc`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=account_data&limit=1`, { headers }),
      ]);
      const [tradesData, accountData] = await Promise.all([
        tradesRes.json().catch(() => null),
        accountRes.json().catch(() => null),
      ]);
      if (!tradesRes.ok) return json(response, tradesRes.status, { error: tradesData?.message || "Could not load trades." });
      const accountRow = Array.isArray(accountData) ? accountData[0] : null;
      return json(response, 200, { ok: true, rows: Array.isArray(tradesData) ? tradesData : [], account: accountRow?.account_data || null });
    }

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

    if (action === "loadAccount") {
      const upstream = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=account_data&limit=1`, {
        headers,
      });
      const result = await upstream.json().catch(() => null);
      if (!upstream.ok) return json(response, upstream.status, { error: result?.message || "Could not load account profile." });
      const row = Array.isArray(result) ? result[0] : null;
      return json(response, 200, { account: row?.account_data || null });
    }

    if (action === "saveAccount") {
      const account = body.account && typeof body.account === "object" ? body.account : null;
      if (!account) return json(response, 400, { error: "Account is missing." });
      const upstream = await fetch(`${supabaseUrl}/rest/v1/profiles?on_conflict=id&select=account_data`, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          id: userId,
          account_data: account,
          updated_at: new Date().toISOString(),
        }),
      });
      const result = await upstream.json().catch(() => null);
      if (!upstream.ok) return json(response, upstream.status, { error: result?.message || "Could not save account profile." });
      const row = Array.isArray(result) ? result[0] : result;
      return json(response, 200, { account: row?.account_data || account });
    }

    if (action === "replaceTrades") {
      const trades = Array.isArray(body.trades) ? body.trades : [];
      const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/trades?user_id=eq.${userId}`, {
        method: "DELETE",
        headers,
      });
      if (!deleteResponse.ok) {
        const result = await deleteResponse.json().catch(() => null);
        return json(response, deleteResponse.status, { error: result?.message || "Could not clear old trades." });
      }

      if (!trades.length) return json(response, 200, { rows: [] });

      const rowsToInsert = trades.map((trade, index) => {
        const localId = Date.now() + index;
        const tradeData = {
          ...trade,
          id: localId,
          createdAt: trade.createdAt || localId,
        };
        delete tradeData.supabaseId;
        return { user_id: userId, trade_data: tradeData };
      });

      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/trades?select=id,created_at,trade_data`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(rowsToInsert),
      });
      const result = await insertResponse.json().catch(() => null);
      if (!insertResponse.ok) return json(response, insertResponse.status, { error: result?.message || "Could not restore trades." });
      return json(response, 200, { rows: result || [] });
    }

    return json(response, 400, { error: "Unknown sync action." });
  } catch (error) {
    return json(response, 500, { error: error?.message || "Sync failed." });
  }
}
