module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return response.status(500).json({ error: "Supabase environment variables are missing." });
    }

    const { accessToken, password } = request.body || {};
    if (!accessToken || typeof accessToken !== "string") {
      return response.status(400).json({ error: "Reset session token is missing." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return response.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const upstream = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/auth/v1/user`, {
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
        error: payload?.msg || payload?.message || "Could not update password.",
      });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(500).json({ error: error?.message || "Could not update password." });
  }
};
