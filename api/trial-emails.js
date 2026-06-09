/**
 * Trial email sequence — called daily by Vercel cron at 09:00 UTC.
 * Sends three emails per user:
 *   day1  → Welcome + quick-start guide (sent on the first run after trial_start)
 *   day3  → "Have you found your patterns yet?" feature highlight
 *   day6  → "Your trial ends tomorrow" urgency email
 *
 * Requires env vars:
 *   RESEND_API_KEY           — from resend.com
 *   CRON_SECRET              — shared secret to protect the endpoint
 *   VITE_SUPABASE_URL        — already set
 *   SUPABASE_SERVICE_ROLE_KEY — already set
 *   VITE_SITE_URL            — e.g. https://trycritique.com
 *
 * Supabase migration (run once in SQL Editor):
 *   ALTER TABLE public.billing_subscriptions
 *     ADD COLUMN IF NOT EXISTS trial_emails_sent JSONB DEFAULT '{}'::JSONB;
 */

const RESEND_API = "https://api.resend.com/emails";
const FROM_EMAIL = "TryCritique <hello@trycritique.com>";

function stripBom(s) {
  return String(s || "").replace(/^﻿/, "").trim();
}

function getSiteUrl() {
  return (process.env.VITE_SITE_URL || process.env.SITE_URL || "https://trycritique.com").replace(/\/$/, "");
}

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Resend error ${res.status}`);
  return data;
}

function daysSince(isoDate) {
  if (!isoDate) return null;
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
}

// ── Email templates ────────────────────────────────────────────────────────

function emailDay1(siteUrl, email) {
  const appUrl = `${siteUrl}?ref=email_d1`;
  return {
    subject: "Your TryCritique trial has started 🎯",
    html: `
<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f172a">
  <div style="font-size:28px;font-weight:900;color:#7c3aed;margin-bottom:24px">TryCritique</div>
  <h1 style="font-size:22px;font-weight:900;margin:0 0 12px">Your 7-day trial has started.</h1>
  <p style="color:#475569;line-height:1.7;margin:0 0 20px">
    Most traders lose to the same 2–3 patterns every week without realising it.
    TryCritique finds them for you — ranked by dollar impact.
  </p>
  <p style="color:#475569;line-height:1.7;margin:0 0 28px">
    <strong>To get value in the next 5 minutes:</strong><br>
    1. Open the <strong>Journal</strong> and log today's trades.<br>
    2. After 3+ trades visit <strong>Mistake Detector</strong>.<br>
    3. It will show exactly what's costing you money.
  </p>
  <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-weight:900;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:15px">
    Open TryCritique →
  </a>
  <p style="margin-top:32px;font-size:12px;color:#94a3b8">You're receiving this because you started a trial at trycritique.com. <a href="${siteUrl}" style="color:#7c3aed">Manage account</a></p>
</div>`,
  };
}

function emailDay3(siteUrl) {
  const appUrl = `${siteUrl}?ref=email_d3`;
  return {
    subject: "Have you found your trading patterns yet?",
    html: `
<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f172a">
  <div style="font-size:28px;font-weight:900;color:#7c3aed;margin-bottom:24px">TryCritique</div>
  <h1 style="font-size:22px;font-weight:900;margin:0 0 12px">Day 3 — time to check the Mistake Detector.</h1>
  <p style="color:#475569;line-height:1.7;margin:0 0 16px">
    If you've logged a few trades, your <strong>Mistake Detector</strong> now has enough data to show patterns.
  </p>
  <div style="background:#f8f5ff;border-left:4px solid #7c3aed;border-radius:8px;padding:16px 20px;margin-bottom:24px">
    <div style="font-weight:900;color:#4c1d95;margin-bottom:6px">What you'll find:</div>
    <ul style="margin:0;padding-left:18px;color:#475569;line-height:1.9">
      <li>Which mistakes cost you the <strong>most money</strong></li>
      <li>How often each pattern repeats</li>
      <li>One focused fix for this week</li>
    </ul>
  </div>
  <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-weight:900;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:15px">
    Open Mistake Detector →
  </a>
  <p style="margin-top:32px;font-size:12px;color:#94a3b8">4 days left on your trial. <a href="${siteUrl}" style="color:#7c3aed">Upgrade anytime</a></p>
</div>`,
  };
}

function emailDay6(siteUrl) {
  const appUrl = `${siteUrl}?ref=email_d6`;
  const billingUrl = `${siteUrl}?billing=1&ref=email_d6`;
  return {
    subject: "Your trial ends tomorrow — don't lose your data",
    html: `
<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f172a">
  <div style="font-size:28px;font-weight:900;color:#7c3aed;margin-bottom:24px">TryCritique</div>
  <h1 style="font-size:22px;font-weight:900;margin:0 0 12px">Your trial ends tomorrow.</h1>
  <p style="color:#475569;line-height:1.7;margin:0 0 16px">
    After tomorrow your journal, statistics, and mistake patterns will be locked.
    All your data stays safe — you just won't be able to add or analyse until you upgrade.
  </p>
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin-bottom:24px">
    <div style="font-weight:900;color:#9a3412;font-size:15px;margin-bottom:8px">What you keep with Pro:</div>
    <div style="color:#7c2d12;line-height:1.8">
      ✓ Unlimited trade logging<br>
      ✓ Mistake Detector — always on<br>
      ✓ Statistics &amp; calendar analytics<br>
      ✓ Economic news impact tracking<br>
      ✓ Cloud sync across devices
    </div>
  </div>
  <a href="${billingUrl}" style="display:inline-block;background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;font-weight:900;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:15px">
    Keep My Access →
  </a>
  <p style="margin-top:16px;font-size:13px;color:#64748b">
    Or <a href="${appUrl}" style="color:#7c3aed">open the app</a> and upgrade from inside.
  </p>
  <p style="margin-top:32px;font-size:12px;color:#94a3b8">trycritique.com — cancel anytime, no questions asked.</p>
</div>`,
  };
}

// ── Main handler ───────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Protect endpoint — only Vercel cron (CRON_SECRET header) or manual call with secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.authorization || "";
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ ok: false, error: "Unauthorized." });
    }
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  try {
    const supabaseUrl = stripBom(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL).replace(/\/+$/, "");
    const serviceRoleKey = stripBom(process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase env vars missing.");

    const siteUrl = getSiteUrl();
    const headers = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    };

    // Fetch all active trials started in the last 8 days
    const trialsRes = await fetch(
      `${supabaseUrl}/rest/v1/billing_subscriptions?trial_start=not.is.null&status=in.(trialing,on_trial,active)&select=id,email,trial_start,trial_emails_sent&order=trial_start.asc&limit=500`,
      { headers }
    );
    const trials = await trialsRes.json().catch(() => []);
    if (!trialsRes.ok || !Array.isArray(trials)) {
      return res.status(500).json({ ok: false, error: "Could not load trials." });
    }

    const results = { sent: [], skipped: [], errors: [] };

    for (const row of trials) {
      const { id, email, trial_start, trial_emails_sent: sent = {} } = row;
      if (!email) continue;

      const day = daysSince(trial_start);
      if (day === null || day > 8) continue;

      const toSend = [];
      if (day >= 0 && !sent.day1) toSend.push("day1");
      if (day >= 3 && !sent.day3) toSend.push("day3");
      if (day >= 6 && !sent.day6) toSend.push("day6");
      if (!toSend.length) { results.skipped.push(email); continue; }

      for (const key of toSend) {
        try {
          const template =
            key === "day1" ? emailDay1(siteUrl, email) :
            key === "day3" ? emailDay3(siteUrl) :
            emailDay6(siteUrl);

          await sendEmail({ to: email, ...template });

          // Mark as sent in DB
          const nextSent = { ...sent, [key]: new Date().toISOString() };
          await fetch(`${supabaseUrl}/rest/v1/billing_subscriptions?id=eq.${id}`, {
            method: "PATCH",
            headers: { ...headers, Prefer: "return=minimal" },
            body: JSON.stringify({ trial_emails_sent: nextSent }),
          });

          sent[key] = new Date().toISOString();
          results.sent.push({ email, key });
        } catch (err) {
          results.errors.push({ email, key, error: err.message });
        }
      }
    }

    console.log("[trial-emails] done:", results);
    return res.status(200).json({ ok: true, ...results });
  } catch (err) {
    console.error("[trial-emails] fatal:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
