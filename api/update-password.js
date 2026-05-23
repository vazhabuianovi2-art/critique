export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabaseUrl = String(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/+$/, "");
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey) {
      return response.status(500).json({ error: "Supabase environment variables are missing." });
    }

    let body = {};
    try {
      body = typeof request.body === "string"
        ? JSON.parse(request.body || "{}")
        : request.body || {};
    } catch {
      return response.status(400).json({ error: "Invalid request body." });
    }
    const { accessToken, password } = body;
    if (!accessToken || typeof accessToken !== "string") {
      return response.status(400).json({ error: "Reset session token is missing." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return response.status(400).json({ error: "Password must be at least 6 characters." });
    }

    if (serviceRoleKey) {
      const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: "GET",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        const payload = await userResponse.json().catch(() => null);
        return response.status(userResponse.status).json({
          error: payload?.msg || payload?.message || "Reset session expired. Send a new reset email.",
        });
      }

      const user = await userResponse.json();
      const userId = user?.id;
      if (!userId) {
        return response.status(400).json({ error: "Could not identify the reset user." });
      }

      const adminResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!adminResponse.ok) {
        const payload = await adminResponse.json().catch(() => null);
        return response.status(adminResponse.status).json({
          error: payload?.msg || payload?.message || `Could not update password (${adminResponse.status}).`,
        });
      }

      return response.status(200).json({ ok: true });
    }

    const upstream = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!upstream.ok) {
      const payload = await upstream.json().catch(() => null);
      return response.status(upstream.status).json({
        error: payload?.msg || payload?.message || `Could not update password (${upstream.status}).`,
      });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(500).json({ error: error?.message || "Could not update password." });
  }
}
