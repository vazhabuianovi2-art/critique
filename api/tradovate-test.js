function json(response, status, body) {
  response.status(status).json(body);
}

async function readBody(request) {
  if (!request.body) return {};
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");
  return request.body;
}

function stripBom(value) {
  return String(value || "").replace(/^\uFEFF|^ï»¿/, "").trim();
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

function tradovateBaseUrl(environment) {
  return environment === "live" ? "https://live.tradovateapi.com" : "https://demo.tradovateapi.com";
}

function sanitizeAccount(account) {
  return {
    id: account?.id ?? null,
    name: account?.name || account?.nickname || "",
    nickname: account?.nickname || "",
    accountType: account?.accountType || account?.type || "",
    active: account?.active ?? null,
    clearingHouseId: account?.clearingHouseId ?? null,
    entityId: account?.entityId ?? null,
    riskCategoryId: account?.riskCategoryId ?? null,
  };
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return json(response, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const supabaseUrl = stripBom(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL).replace(/\/+$/, "");
    const anonKey = stripBom(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
    if (!supabaseUrl || !anonKey) {
      return json(response, 500, { ok: false, error: "Supabase auth is not configured." });
    }

    const body = await readBody(request);
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
    if (!accessToken) return json(response, 401, { ok: false, error: "Login session is missing." });

    const user = await getUserFromToken(supabaseUrl, anonKey, accessToken);
    if (!user?.id) return json(response, 401, { ok: false, error: "Login session expired. Sign in again." });

    const credentials = body.credentials && typeof body.credentials === "object" ? body.credentials : {};
    const environment = credentials.environment === "live" ? "live" : "demo";
    const name = stripBom(credentials.name);
    const password = String(credentials.password || "");
    const appId = stripBom(credentials.appId || "TryCritique");
    const appVersion = stripBom(credentials.appVersion || "0.1.0");
    const cid = stripBom(credentials.cid);
    const sec = stripBom(credentials.sec);
    const deviceId = stripBom(credentials.deviceId || `trycritique-${user.id.slice(0, 8)}`);

    if (!name || !password || !cid || !sec) {
      return json(response, 400, { ok: false, error: "Tradovate username, password, CID, and secret are required." });
    }

    const baseUrl = tradovateBaseUrl(environment);
    const tokenResponse = await fetch(`${baseUrl}/v1/auth/accesstokenrequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name, password, appId, appVersion, cid, sec, deviceId }),
    });
    const tokenPayload = await tokenResponse.json().catch(() => null);
    if (!tokenResponse.ok || !tokenPayload?.accessToken) {
      return json(response, 200, {
        ok: false,
        environment,
        error: tokenPayload?.errorText || tokenPayload?.message || `Tradovate login failed (${tokenResponse.status}).`,
      });
    }

    const accountResponse = await fetch(`${baseUrl}/v1/account/list`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${tokenPayload.accessToken}`,
      },
    });
    const accountPayload = await accountResponse.json().catch(() => null);
    if (!accountResponse.ok) {
      return json(response, 200, {
        ok: false,
        environment,
        authenticated: true,
        error: accountPayload?.errorText || accountPayload?.message || `Could not load Tradovate accounts (${accountResponse.status}).`,
      });
    }

    const accounts = Array.isArray(accountPayload) ? accountPayload.map(sanitizeAccount) : [];
    return json(response, 200, {
      ok: true,
      environment,
      accountCount: accounts.length,
      accounts,
      testedAt: new Date().toISOString(),
    });
  } catch (error) {
    return json(response, 500, { ok: false, error: error?.message || "Tradovate test failed." });
  }
}
