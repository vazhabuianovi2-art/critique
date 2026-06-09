import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  formatMoney,
  formatTimeInput,
  formatDisplayName,
  getFirstDisplayName,
  getPnlToneClass,
  getPnlPillClass,
  getPnlArrow,
  getAccountTypeLabel,
  formatEconomicRangeDate,
  getEconomicWeekLabel,
  getEventImpactTone,
  getEventImpactClass,
  getEventImpactLabel,
  getEventImpactFolderClass,
} from "./utils/formatters";
import {
  formatDateKey,
  getMondayDate,
  isWeekendDateKey,
  getWeekGroupKey,
  getMonthGroupKey,
  getYearGroupKey,
} from "./utils/dates";
import { BRAND_NAME } from "./utils/constants";
import { BrandBolt } from "./components/ui/BrandBolt";
import { DashboardEmptyState } from "./components/ui/EmptyState";
import { LandingHeader } from "./components/landing/LandingHeader";
import { LandingHero } from "./components/landing/LandingHero";
import { LandingFeatures } from "./components/landing/LandingFeatures";
import { LandingHowItWorks } from "./components/landing/LandingHowItWorks";
import { LandingTestimonials } from "./components/landing/LandingTestimonials";
import { LandingPricing } from "./components/landing/LandingPricing";
import { LandingFAQ } from "./components/landing/LandingFAQ";
import { LandingFinalCTA } from "./components/landing/LandingFinalCTA";
import { LandingFooter } from "./components/landing/LandingFooter";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  Lock,
  Mail,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogIn,
  MessageSquare,
  Moon,
  Maximize2,
  Minimize2,
  PauseCircle,
  PlayCircle,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  CreditCard,
  LogOut,
  Target,
  TrendingUp,
  Trash2,
  Upload,
  User,
  UserPlus,
  Volume2,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ShaderBackground from "@/components/ui/shader-background";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const STORAGE_KEY = "critique_video_style_trades_v1";
const ACCOUNT_KEY = "critique_video_style_account_v1";
const ACCOUNTS_KEY = "critique_video_style_accounts_v1";
const ACTIVE_ACCOUNT_KEY = "critique_video_style_active_account_v1";
const ROUTINE_KEY = "critique_pre_trade_routine_v1";
const THEME_KEY = "critique_theme_mode_v1";
const ACTIVE_PAGE_KEY = "critique_active_page_v1";
const SIDEBAR_COLLAPSED_KEY = "critique_sidebar_collapsed_v1";
const STRATEGIES_OBJ_KEY = "critique_strategies_objects_v1";
const RESTORE_CACHE_PREFIX = "critique_last_successful_restore_v1";
function getBillingCacheKey(userId) {
  return userId ? `critique_billing_access_v2_${userId}` : null;
}
const USER_TRADES_KEY_PREFIX = "critique_user_trades_v2";
const USER_TRADES_BACKUP_KEY_PREFIX = "critique_user_trades_last_nonempty_v1";
const DELETED_TRADES_KEY_PREFIX = "critique_deleted_trades_v1";
const REMEMBER_EMAIL_KEY = "critique_remember_email_v1";
const PROFILE_PHOTO_KEY = "critique_profile_photo_v1";
const PROFILE_NAME_KEY = "critique_profile_name_v1";
const TRADING_PREFERENCES_KEY = "critique_settings_preferences_v1";
const CUSTOM_STRATEGIES_KEY = "critique_custom_strategies_v1";
const ECONOMIC_CALENDAR_CACHE_KEY = "critique_economic_calendar_v1";
const MAX_SCREENSHOTS = 5;
const OWNER_ADMIN_EMAILS = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_OWNER_ADMIN_EMAILS) ||
  "vazhabuianovi2@gmail.com"
).split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
const TAWK_TO_PROPERTY_ID = "6a1ecbced0b6e01c2e34b60c";
const TAWK_TO_WIDGET_ID = "1jq44o7ki";
const BRAND_MARK = <BrandBolt className="h-8 w-8" />;
const DASHBOARD_NAV_EVENT = "trycritique:navigate-dashboard";

function requestDashboardNavigation() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DASHBOARD_NAV_EVENT));
}
const TRADING_SESSIONS = ["Asia", "London", "NY-AM", "Lunch", "NY-PM", "Pre-Market"];
const LEGACY_DEFAULT_STRATEGIES = ["Liquidity Sweep", "ICT FVG", "Order Block", "Breaker Block", "Silver Bullet"];
const DEFAULT_STRATEGIES = [];
const EMOTION_OPTIONS = [
  ["Confident", "Ready", "✦"],
  ["Calm", "Focus", "◌"],
  ["Focused", "Clear", "◎"],
  ["Excited", "Energy", "↑"],
  ["Euphoric", "Peak", "★"],
  ["Anxious", "Tension", "~"],
  ["Fearful", "Careful", "◇"],
  ["Frustrated", "Block", "✕"],
  ["Regretful", "Review", "↩"],
  ["Impulsive", "Rush", "⚡"],
  ["Greedy", "Risk", "$"],
  ["FOMO", "Impulse", "↗"],
  ["Revenge", "Reset", "!"],
];
const MISTAKE_OPTIONS = ["None", "Early Entry", "Late Entry", "No Confirmation", "Overtrading", "Emotional Trade", "Bad Risk Management", "Moved Stop Loss"];
const RULE_BROKEN_OPTIONS = ["None", "Moved SL", "Overrisk", "No Confirmation", "Chased Price", "Revenge Trade"];
const SETUP_QUALITY_OPTIONS = ["A+", "A", "B", "C", "D"];

function getEnvValue(key) {
  try {
    // Strip UTF-8 BOM (﻿) that may be pasted accidentally into Vercel env vars
    return String(import.meta.env?.[key] || "").replace(/^﻿/, "").trim();
  } catch {
    return "";
  }
}

function getSiteOrigin() {
  const configured = getEnvValue("VITE_SITE_URL").replace(/\/+$/, "");
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      try {
        return new URL(`https://${configured}`).origin;
      } catch {
        return configured.split("/")[0];
      }
    }
  }
  try {
    return window.location.origin;
  } catch {
    return "";
  }
}

function getAuthRedirectUrl(path = "") {
  return `${getSiteOrigin()}${String(path || "").startsWith("/") ? path : `/${path}`}`;
}

function getAuthPageFromPath() {
  if (typeof window === "undefined") return "landing";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/auth/login") return "login";
  if (path === "/auth/register") return "register";
  if (path === "/auth/forgot") return "forgot";
  if (path === "/auth/reset-password") return "updatePassword";
  if (path === "/terms") return "terms";
  if (path === "/privacy") return "privacy";
  if (path === "/refund") return "refund";
  if (path === "/contact") return "contact";
  return "landing";
}

function getPathForAuthPage(page) {
  const paths = {
    landing: "/",
    login: "/auth/login",
    register: "/auth/register",
    forgot: "/auth/forgot",
    updatePassword: "/auth/reset-password",
    terms: "/terms",
    privacy: "/privacy",
    refund: "/refund",
    contact: "/contact",
  };
  return paths[page] || "/";
}

function enterAppRoute() {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/dashboard") {
    window.history.replaceState(null, "", "/dashboard");
  }
}

function isPublicAuthPath() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path === "/" || path === "/auth/login" || path === "/auth/register" || path === "/auth/forgot";
}

function isOwnerAdminEmail(email) {
  return OWNER_ADMIN_EMAILS.includes(String(email || "").trim().toLowerCase());
}

const SUPABASE_URL = getEnvValue("VITE_SUPABASE_URL");
const SUPABASE_ANON_KEY = getEnvValue("VITE_SUPABASE_ANON_KEY") || getEnvValue("VITE_SUPABASE_KEY");
const hasValidSupabaseUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL);
const hasValidSupabaseKey = SUPABASE_ANON_KEY.length > 40;
const supabase = hasValidSupabaseUrl && hasValidSupabaseKey ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
}) : null;
const isSupabaseReady = Boolean(supabase);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFriendlyAuthError(error, fallback = "Authentication failed. Try again.") {
  const message = String(error?.message || error || "");
  if (/failed to fetch|networkerror|load failed|fetch/i.test(message)) {
    return "The reset link is valid, but the browser could not reach Supabase to save the new password. Turn off VPN/ad blocker if enabled, refresh once, and try again.";
  }
  return message || fallback;
}

function isSupabaseAuthExpiredError(error) {
  const message = String(error?.message || error || "");
  return error?.status === 401 || /fresh login session|session expired|jwt expired|invalid token|not authenticated|401/i.test(message);
}

async function safeLocalSignOut() {
  if (!supabase) return;
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    try {
      await supabase.auth.getSession();
    } catch {}
  }
}

function getPasswordResetPayloadFromUrl() {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return {
      tokenHash: searchParams.get("token_hash") || "",
      type: searchParams.get("type") || hashParams.get("type") || "recovery",
      code: searchParams.get("code") || "",
      accessToken: hashParams.get("access_token") || "",
      refreshToken: hashParams.get("refresh_token") || "",
    };
  } catch {
    return { tokenHash: "", type: "recovery", code: "", accessToken: "", refreshToken: "" };
  }
}

async function postPasswordUpdate(payload) {
  const response = await fetch("/api/update-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response.ok) return;
  const result = await response.json().catch(() => null);
  throw new Error(result?.error || `Could not update password (${response.status}).`);
}

async function updatePasswordWithRetry(password, resetPayload = {}) {
  if (resetPayload.tokenHash || resetPayload.code || resetPayload.accessToken) {
    await postPasswordUpdate({ ...resetPayload, password });
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (accessToken) {
    let apiError = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (attempt > 0) await wait(700 * attempt);
      try {
        await postPasswordUpdate({ accessToken, password });
        return;
      } catch (error) {
        apiError = error;
        if (!/50\d|failed to fetch|network/i.test(String(error?.message || error))) throw apiError;
      }
    }
    if (apiError) throw apiError;
  }

  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) {
      await wait(850 * attempt);
      try {
        await supabase.auth.refreshSession();
      } catch {
        await supabase.auth.getSession();
      }
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) return;
    lastError = error;
    if (!/failed to fetch|networkerror|load failed|fetch/i.test(String(error?.message || error))) break;
    await wait(650);
  }

  throw lastError;
}

async function getCurrentAccessToken() {
  if (!supabase) return "";
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  const expiresAt = session?.expires_at ? session.expires_at * 1000 : 0;
  if (session?.access_token && expiresAt > Date.now() + 30000) return session.access_token;
  const refreshed = await supabase.auth.refreshSession().catch(() => null);
  return refreshed?.data?.session?.access_token || "";
}

function getSubscriptionBadge(subscription) {
  if (!subscription) return { label: "No active plan", detail: null, tone: "zinc" };
  const status = String(subscription.status || "").toLowerCase();
  const now = Date.now();
  const trialEndMs = subscription.trial_end ? new Date(subscription.trial_end).getTime() : 0;
  const isAdmin = String(subscription.provider || "").toLowerCase() === "admin";
  if (isAdmin) return { label: "Admin Pro", detail: null, tone: "emerald" };
  if (["trialing", "on_trial"].includes(status) && trialEndMs > now) {
    const daysLeft = Math.max(1, Math.ceil((trialEndMs - now) / (1000 * 60 * 60 * 24)));
    return { label: "Free Trial", detail: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`, tone: "fuchsia" };
  }
  if (status === "active") {
    const plan = subscription.plan === "yearly" ? "Pro Yearly" : "Pro Monthly";
    return { label: plan, detail: "Active", tone: "emerald" };
  }
  return { label: "No active plan", detail: null, tone: "zinc" };
}

function isSubscriptionAccessActive(subscription) {
  if (!subscription) return false;
  const status = String(subscription.status || "").toLowerCase();
  const now = Date.now();
  const trialEndMs = subscription.trial_end ? new Date(subscription.trial_end).getTime() : 0;
  const periodEndMs = subscription.current_period_end ? new Date(subscription.current_period_end).getTime() : 0;
  const hasFutureTrial = Boolean(trialEndMs && trialEndMs > now);
  const hasFuturePaidPeriod = Boolean(periodEndMs && periodEndMs > now);

  if (["trialing", "on_trial"].includes(status)) return hasFutureTrial || hasFuturePaidPeriod;
  if (status === "active") {
    if (subscription.cancel_at_period_end) return hasFuturePaidPeriod;
    return periodEndMs ? hasFuturePaidPeriod : true;
  }
  return false;
}

async function fetchBillingSubscription(authUser) {
  if (!authUser?.id && !authUser?.email) return null;
  const accessToken = await getCurrentAccessToken();
  if (!accessToken) return null;
  const response = await fetch("/api/billing-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken, email: authUser?.email }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || "Could not load billing status.");
  return data.subscription || null;
}

async function postAdminEntitlements(action, payload = {}) {
  const accessToken = await getCurrentAccessToken();
  if (!accessToken) throw new Error("Login session is missing.");
  const response = await fetch("/api/admin-entitlements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, accessToken, ...payload }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || "Admin request failed.");
  return data;
}

async function postSupportReports(action, payload = {}) {
  const canSendWithoutSession = ["create", "mine", "send_message", "mark_read"].includes(action);

  async function sendWithToken(token) {
    const response = await fetch("/api/support-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, accessToken: token, ...payload }),
    });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  }

  let accessToken = await getCurrentAccessToken();
  if (!accessToken) {
    const refreshed = await refreshCurrentSession();
    accessToken = refreshed?.access_token || "";
  }
  if (!accessToken && !canSendWithoutSession) throw new Error("Login session is missing.");

  let { response, data } = await sendWithToken(accessToken);
  if (response.status === 401) {
    const refreshed = await refreshCurrentSession();
    if (refreshed?.access_token) {
      ({ response, data } = await sendWithToken(refreshed.access_token));
    }
  }

  if (!response.ok || !data.ok) throw new Error(data.error || "Support request failed.");
  return data;
}

async function refreshCurrentSession() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.refreshSession();
  if (error) return null;
  return data?.session || null;
}

async function postSupabaseSync(action, payload = {}) {
  async function sendWithToken(token) {
    const response = await fetch("/api/supabase-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, accessToken: token, ...payload }),
    });
    const result = await response.json().catch(() => null);
    return { response, result };
  }

  let accessToken = await getCurrentAccessToken();
  if (!accessToken) {
    const refreshed = await refreshCurrentSession();
    accessToken = refreshed?.access_token || "";
  }
  if (!accessToken) throw new Error("Cloud sync is waiting for a fresh login session.");

  let { response, result } = await sendWithToken(accessToken);
  if (result?.authExpired || response.status === 401) {
    const refreshed = await refreshCurrentSession();
    if (refreshed?.access_token) {
      ({ response, result } = await sendWithToken(refreshed.access_token));
    }
  }

  if (result?.authExpired) {
    const error = new Error(result?.error || "Login session expired. Sign in again.");
    error.status = 401;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(result?.error || `Sync failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return result;
}

function SafeResponsiveContainer({ children, minHeight = 240 }) {
  const hostRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const updateReadyState = () => {
      const rect = host.getBoundingClientRect();
      setSize({
        width: Math.max(1, Math.floor(rect.width || 0)),
        height: Math.max(1, Math.floor(rect.height || minHeight)),
      });
    };

    updateReadyState();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateReadyState) : null;
    observer?.observe(host);
    window.addEventListener("resize", updateReadyState);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateReadyState);
    };
  }, [minHeight]);

  return (
    <div ref={hostRef} style={{ width: "100%", height: "100%", minHeight }}>
      {size.width > 1 && size.height > 1 ? (
        <ResponsiveContainer width={size.width} height={size.height} minWidth={1} minHeight={minHeight}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}

function getFullscreenElement() {
  if (typeof document === "undefined") return null;
  return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
}

async function toggleAppFullscreen() {
  if (typeof document === "undefined") return;
  const element = document.documentElement;
  if (getFullscreenElement()) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (exit) await exit.call(document);
    return;
  }
  const request = element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
  if (request) await request.call(element);
}

function getUserDisplayName(user, fallback = "User") {
  const metadata = user?.user_metadata || {};
  let savedName = "";
  try {
    savedName = localStorage.getItem(getProfileNameKey(user?.id)) || "";
  } catch {
    savedName = "";
  }
  return formatDisplayName(savedName || metadata.full_name || metadata.name || metadata.user_name || user?.email, fallback);
}

function getProfileNameKey(userId) {
  return userId ? `${PROFILE_NAME_KEY}_${userId}` : PROFILE_NAME_KEY;
}

function getProfilePhotoKey(userId) {
  return userId ? `${PROFILE_PHOTO_KEY}_${userId}` : PROFILE_PHOTO_KEY;
}

function getAccountsKey(userId) {
  return userId ? `${ACCOUNTS_KEY}_${userId}` : ACCOUNTS_KEY;
}

function getActiveAccountKey(userId) {
  return userId ? `${ACTIVE_ACCOUNT_KEY}_${userId}` : ACTIVE_ACCOUNT_KEY;
}

function readStoredAccounts(userId) {
  try {
    const savedAccounts = JSON.parse(localStorage.getItem(getAccountsKey(userId)) || "null");
    if (Array.isArray(savedAccounts) && savedAccounts.length) {
      return savedAccounts.map((item, index) => ({ ...defaultAccount, ...item, id: item.id || `acc-${index + 1}` }));
    }
    if (userId) return [];
    const legacyAccount = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
    return legacyAccount?.id ? [{ ...defaultAccount, ...legacyAccount, id: legacyAccount.id }] : [];
  } catch {
    return [];
  }
}

function readStoredActiveAccountId(userId) {
  try {
    return localStorage.getItem(getActiveAccountKey(userId)) || "";
  } catch {
    return "";
  }
}

function getStoredProfilePhoto(user) {
  const metadataPhoto = user?.user_metadata?.profile_photo || user?.user_metadata?.avatar_url || "";
  if (metadataPhoto) return metadataPhoto;
  try {
    return localStorage.getItem(getProfilePhotoKey(user?.id)) || localStorage.getItem(PROFILE_PHOTO_KEY) || "";
  } catch {
    return "";
  }
}

const THEME_STYLE_CSS = `
  html,
  body,
  #root {
    width: 100% !important;
    min-width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    text-align: initial !important;
    overflow-x: hidden !important;
    background: #000 !important;
  }

  #root {
    display: block !important;
  }

  main.app-main {
    width: auto !important;
    max-width: none !important;
  }

  @media (min-width: 1024px) {
    main.app-main {
      width: calc(100vw - 16rem) !important;
      margin-left: 16rem !important;
    }

    .sidebar-collapsed .sidebar-label { display: none !important; }
    .sidebar-collapsed aside.app-sidebar {
      width: 5rem !important;
      padding-left: 0.6rem !important;
      padding-right: 0.6rem !important;
    }
    .sidebar-collapsed main.app-main {
      width: calc(100vw - 5rem) !important;
      margin-left: 5rem !important;
    }
    .sidebar-collapsed aside.app-sidebar .sidebar-header { flex-direction: column; gap: 0.6rem; }
    .sidebar-collapsed aside.app-sidebar .sidebar-account-section { display: none !important; }
    .sidebar-collapsed aside.app-sidebar .sidebar-nav button { justify-content: center; padding-left: 0; padding-right: 0; }
    .sidebar-collapsed aside.app-sidebar .account-sidebar-card { justify-content: center; padding-left: 0; padding-right: 0; }
    .sidebar-collapsed aside.app-sidebar .sidebar-bottom { left: 0.6rem; right: 0.6rem; }
  }

  @media (max-width: 1023px) {
    main.app-main {
      width: 100% !important;
      margin-left: 0 !important;
      padding-bottom: calc(6.5rem + env(safe-area-inset-bottom, 0px)) !important;
    }
  }

  @media (max-width: 640px) {
    main.app-main {
      padding: .75rem !important;
      padding-bottom: calc(6.5rem + env(safe-area-inset-bottom, 0px)) !important;
    }

    h1 {
      overflow-wrap: anywhere;
    }
  }

  .light-theme {
    background: linear-gradient(135deg, #fbf7ff 0%, #ffffff 42%, #f8fbff 100%) !important;
    color: #0f172a !important;
  }

  /* Demo modal always stays dark regardless of light-theme */
  .light-theme .demo-modal-root { color: #ffffff !important; }
  .light-theme .demo-modal-root .text-white { color: #ffffff !important; }
  .light-theme .demo-modal-root .text-zinc-300 { color: rgba(212,212,216,1) !important; }
  .light-theme .demo-modal-root .text-zinc-400 { color: rgba(161,161,170,1) !important; }
  .light-theme .demo-modal-root .text-zinc-500 { color: rgba(113,113,122,1) !important; }
  .light-theme .demo-modal-root .text-zinc-600 { color: rgba(82,82,91,1) !important; }
  .light-theme .demo-modal-root .text-violet-200 { color: #ddd6fe !important; }
  .light-theme .demo-modal-root .text-violet-300 { color: #c4b5fd !important; }
  .light-theme .demo-modal-root .text-violet-400 { color: #a78bfa !important; }
  .light-theme .demo-modal-root .text-fuchsia-400 { color: #e879f9 !important; }
  .light-theme .demo-modal-root .text-emerald-400 { color: #34d399 !important; }
  .light-theme .demo-modal-root .text-cyan-400 { color: #22d3ee !important; }
  .light-theme .demo-modal-root .text-amber-300 { color: #fcd34d !important; }
  .light-theme .demo-modal-root .text-amber-400 { color: #fbbf24 !important; }
  .light-theme .demo-modal-root .text-red-400 { color: #f87171 !important; }
  .light-theme .demo-modal-root .text-red-300 { color: #fca5a5 !important; }

  .light-theme main.app-main {
    background: linear-gradient(135deg, #fbf7ff 0%, #ffffff 45%, #f8fbff 100%) !important;
    color: #0f172a !important;
  }

  .light-theme aside.fixed {
    background: linear-gradient(180deg, #ffffff 0%, #fbf7ff 52%, #f7edff 100%) !important;
    color: #0f172a !important;
    border-right-color: rgba(178,74,242, 0.22) !important;
    box-shadow: 12px 0 35px rgba(178,74,242, 0.08) !important;
  }

  .light-theme .bg-black,
  .light-theme .bg-zinc-950,
  .light-theme .bg-zinc-900,
  .light-theme .bg-[#050005],
  .light-theme .bg-[#070707],
  .light-theme .bg-[#020202],
  .light-theme .bg-\[\#0d0d0d\],
  .light-theme .bg-\[\#0c0c0c\],
  .light-theme .bg-\[\#0a0a0a\],
  .light-theme .bg-\[\#0a0a12\],
  .light-theme .bg-\[\#09030d\],
  .light-theme .bg-\[\#050505\],
  .light-theme .bg-\[\#050307\],
  .light-theme .bg-\[\#08070b\] {
    background-color: #ffffff !important;
    color: #0f172a !important;
  }

  /* Global light-mode border fixes for white/opacity borders */
  .light-theme [class*="border-white/10"],
  .light-theme [class*="border-white/15"],
  .light-theme [class*="border-white/20"] {
    border-color: rgba(148,163,184,0.30) !important;
  }

  /* Light-mode overrides for new journal + trade card elements */
  .light-theme .journal-search-panel,
  .light-theme .journal-sort-panel {
    background-color: #ffffff !important;
    border-color: rgba(148,163,184,0.35) !important;
    color: #0f172a !important;
  }

  .light-theme .journal-filter-panel {
    background-color: #f8fafc !important;
    border-color: rgba(148,163,184,0.35) !important;
    color: #0f172a !important;
  }
  .light-theme .journal-filter-panel label,
  .light-theme .journal-filter-panel span,
  .light-theme .journal-filter-panel p {
    color: #374151 !important;
  }
  .light-theme .journal-filter-panel input,
  .light-theme .journal-filter-panel select,
  .light-theme .journal-filter-panel [class*="bg-black"] {
    background-color: #ffffff !important;
    border-color: rgba(148,163,184,0.40) !important;
    color: #0f172a !important;
  }
  .light-theme .journal-filter-panel input::placeholder {
    color: #9ca3af !important;
  }
  .light-theme .journal-filter-panel button {
    background-color: #ffffff !important;
    border-color: rgba(148,163,184,0.40) !important;
    color: #374151 !important;
  }
  .light-theme .journal-filter-panel button:hover {
    background-color: #f1f5f9 !important;
  }
  .light-theme .journal-filter-panel [class*="border-white/10"],
  .light-theme .journal-filter-panel [class*="border-white/15"] {
    border-color: rgba(148,163,184,0.35) !important;
  }
  .light-theme .journal-filter-panel [class*="text-zinc-"] {
    color: #374151 !important;
  }
  .light-theme .journal-filter-panel [class*="text-fuchsia-"] {
    color: #8a0fd7 !important;
  }

  .light-theme .trade-card,
  .light-theme .trade-card * {
    background-color: #ffffff !important;
    border-color: rgba(148,163,184,0.30) !important;
    color: #0f172a !important;
  }
  .light-theme .trade-card .trade-no-screenshot {
    background-color: #f8fafc !important;
  }
  .light-theme .trade-card .trade-screenshot-area {
    background-color: #f1f5f9 !important;
  }

  .light-theme .journal-stats-grid .card,
  .light-theme .journal-stats-grid [class*="border-white"] {
    background-color: #ffffff !important;
    border-color: rgba(148,163,184,0.30) !important;
    color: #0f172a !important;
  }

  .light-theme .light-card {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 55%, #f8fbff 100%) !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.22) !important;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08) !important;
  }

  .light-theme .light-card-soft {
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 55%, #f5f3ff 100%) !important;
    color: #0f172a !important;
    border-color: rgba(148, 163, 184, 0.28) !important;
  }

  .light-theme [class*="bg-black/30"],
  .light-theme [class*="bg-black/40"],
  .light-theme [class*="bg-black/50"],
  .light-theme [class*="bg-black/70"],
  .light-theme [class*="bg-black/75"],
  .light-theme [class*="bg-black/80"],
  .light-theme [class*="bg-black/95"] {
    background-color: rgba(255, 255, 255, 0.72) !important;
    color: #0f172a !important;
  }

  .light-theme .auth-shell {
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 48%, #f7efff 100%) !important;
    color: #0f172a !important;
  }

  .light-theme .auth-shell [class*="bg-black/35"],
  .light-theme .auth-shell [class*="bg-black/45"] {
    background-color: rgba(255, 255, 255, 0.82) !important;
    color: #0f172a !important;
  }

  .light-theme .auth-shell input,
  .light-theme .auth-shell textarea,
  .light-theme .auth-shell select {
    background-color: #f8fafc !important;
    border-color: rgba(148, 163, 184, 0.34) !important;
    color: #0f172a !important;
  }

  .light-theme .auth-shell input::placeholder,
  .light-theme .auth-shell textarea::placeholder {
    color: #94a3b8 !important;
  }

  .light-theme .auth-shell [class*="text-fuchsia-300"] {
    color: #9e1aef !important;
  }

  .light-theme .auth-shell [class*="text-emerald-300"],
  .light-theme .auth-shell [class*="text-emerald-400"] {
    color: #059669 !important;
  }

  .light-theme .auth-shell [class*="border-white/10"],
  .light-theme .auth-shell [class*="border-emerald-500/20"],
  .light-theme .auth-shell [class*="border-fuchsia-500/20"],
  .light-theme .auth-shell [class*="border-fuchsia-500/30"] {
    border-color: rgba(203, 213, 225, 0.9) !important;
  }

  @keyframes authFloat {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(0, -12px, 0); }
  }

  @keyframes authGlowPulse {
    0%, 100% { box-shadow: 0 0 28px rgba(178,74,242,.18), inset 0 1px 0 rgba(255,255,255,.08); }
    50% { box-shadow: 0 0 54px rgba(178,74,242,.36), inset 0 1px 0 rgba(255,255,255,.12); }
  }

  @keyframes authShimmer {
    0% { transform: translateX(-120%) rotate(8deg); opacity: 0; }
    18% { opacity: .5; }
    52% { opacity: .16; }
    100% { transform: translateX(160%) rotate(8deg); opacity: 0; }
  }

  @keyframes authGridDrift {
    0% { background-position: 0 0; }
    100% { background-position: 48px 48px; }
  }

  .auth-animated-grid {
    display: none;
  }

  .auth-card-panel,
  .auth-float-card,
  .auth-hero-metric {
    position: relative;
    overflow: hidden;
  }

  .auth-card-panel::after,
  .auth-float-card::after,
  .auth-hero-metric::after {
    content: "";
    position: absolute;
    inset: -35% auto -35% -40%;
    width: 42%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent);
    animation: authShimmer 6.8s ease-in-out infinite;
    pointer-events: none;
  }

  .auth-brand-button {
    border-radius: 1.15rem;
    transition: transform 240ms ease, filter 240ms ease;
  }

  .auth-brand-button:hover {
    transform: translateY(-2px);
    filter: drop-shadow(0 0 18px rgba(178,74,242,.34));
  }

  .auth-hero-mark {
    animation: authGlowPulse 3.8s ease-in-out infinite;
  }

  .auth-float-card {
    animation: authFloat 7s ease-in-out infinite;
  }

  .auth-float-two {
    animation-delay: -2.2s;
  }

  .auth-float-three {
    animation-delay: -4.1s;
  }

  .auth-submit-button {
    position: relative;
    overflow: hidden;
  }

  .auth-submit-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.20), transparent);
    transform: translateX(-130%);
    transition: transform 520ms ease;
  }

  .auth-submit-button:hover::before {
    transform: translateX(130%);
  }

  .hero-dashboard-stage {
    perspective: 1200px;
  }

  .hero-dashboard-card,
  .hero-float-card,
  .hero-metric-card,
  .hero-progress-fill {
    transition: transform 360ms ease, box-shadow 360ms ease, border-color 360ms ease, filter 360ms ease;
  }

  .hero-dashboard-stage:hover .hero-dashboard-card {
    transform: translateY(-10px) rotateX(5deg) rotateY(-7deg) scale(1.015);
    box-shadow: 0 42px 110px rgba(126, 34, 206, 0.32);
  }

  .hero-dashboard-stage:hover .hero-float-profit {
    transform: translate(-14px, -12px) rotate(-5deg);
  }

  .hero-dashboard-stage:hover .hero-float-streak {
    transform: translate(12px, -8px) rotate(5deg);
  }

  .hero-dashboard-stage:hover .hero-float-dd {
    transform: translate(8px, 12px) rotate(-3deg);
  }

  .hero-dashboard-stage:hover .hero-metric-card {
    transform: translateY(-6px);
    border-color: rgba(178,74,242, 0.38);
  }

  .hero-dashboard-stage:hover .hero-progress-fill {
    transform: scaleX(1.12);
    filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.45));
  }

  @media (prefers-reduced-motion: no-preference) {
    .hero-float-card {
      animation: heroFloat 5.5s ease-in-out infinite;
    }

    .hero-float-streak {
      animation-delay: 0.8s;
    }

    .hero-float-dd {
      animation-delay: 1.4s;
    }
  }

  @keyframes heroFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-7px); }
  }

  /* ── Premium landing styles ── */
  .glass-card {
    background: rgba(10, 5, 20, 0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .glass-card-vivid {
    background: rgba(12, 4, 28, 0.6);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    border: 1px solid rgba(178,74,242,0.2);
    box-shadow: 0 0 0 1px rgba(178,74,242,0.08), 0 24px 64px rgba(126,34,206,0.25), inset 0 1px 0 rgba(255,255,255,0.07);
  }
  .gradient-border {
    position: relative;
  }
  .gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(178,74,242,0.6), rgba(178,74,242,0.4), rgba(20,184,166,0.3));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
  .glow-fuchsia {
    box-shadow: 0 0 40px rgba(178,74,242,0.18), 0 24px 64px rgba(126,34,206,0.22);
  }
  .glow-fuchsia:hover {
    box-shadow: 0 0 60px rgba(178,74,242,0.28), 0 24px 80px rgba(126,34,206,0.3);
  }
  .text-gradient-primary {
    background: linear-gradient(135deg, #c084fc 0%, #c270f5 40%, #67e8f9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .text-gradient-hero {
    background: linear-gradient(100deg, #818cf8 0%, #c084fc 35%, #c270f5 65%, #34d399 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(178,74,242,0.35), rgba(178,74,242,0.35), transparent);
    margin: 0;
  }
  .eyebrow-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    background: linear-gradient(135deg, rgba(178,74,242,0.15), rgba(178,74,242,0.12));
    border: 1px solid rgba(178,74,242,0.28);
    color: #c270f5;
    box-shadow: 0 0 20px rgba(178,74,242,0.12), inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .btn-primary-glow {
    background: linear-gradient(135deg, #7c3aed, #a855f7, #b24bf3);
    box-shadow: 0 4px 24px rgba(178,74,242,0.35), 0 0 0 1px rgba(178,74,242,0.3);
    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  .btn-primary-glow:hover {
    box-shadow: 0 8px 40px rgba(178,74,242,0.5), 0 0 0 1px rgba(178,74,242,0.5);
    transform: translateY(-1px);
  }
  .btn-ghost-glow {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.12);
    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  .btn-ghost-glow:hover {
    background: rgba(178,74,242,0.1);
    border-color: rgba(178,74,242,0.4);
    box-shadow: 0 0 20px rgba(178,74,242,0.15);
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .float-card-glow {
    background: rgba(8, 3, 18, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(178,74,242,0.18);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07);
  }

  .stats-interactive-card {
    position: relative;
    overflow: hidden;
    transform: translateZ(0);
    transition:
      transform 260ms cubic-bezier(.2,.8,.2,1),
      border-color 260ms ease,
      box-shadow 260ms ease,
      background 260ms ease;
  }

  .stats-interactive-card::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.06) 42%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.04) 58%, transparent 100%);
    transform: translateX(-135%);
    transition: transform 700ms cubic-bezier(.2,.8,.2,1);
  }

  .stats-interactive-card::after {
    content: "";
    position: absolute;
    inset: auto 12% -42% 12%;
    height: 58%;
    border-radius: 999px;
    pointer-events: none;
    filter: blur(34px);
    opacity: 0;
    transition: opacity 260ms ease;
  }

  .stats-interactive-card:hover {
    transform: translateY(-8px) scale(1.028);
  }

  .stats-interactive-card:hover::before {
    transform: translateX(135%);
  }

  .stats-interactive-card:hover::after {
    opacity: 1;
  }

  .stats-card-green {
    background: linear-gradient(145deg, rgba(4,18,12,0.92), rgba(2,6,4,0.96) 48%, rgba(5,36,20,0.84));
    border-color: rgba(34,197,94,0.18);
  }

  .stats-card-green::after {
    background: rgba(34,197,94,0.28);
  }

  .stats-card-green:hover {
    border-color: rgba(34,197,94,0.38);
    box-shadow: 0 26px 80px rgba(16,185,129,0.14), inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .stats-card-amber {
    background: linear-gradient(145deg, rgba(35,16,5,0.92), rgba(8,4,2,0.96) 48%, rgba(54,24,7,0.84));
    border-color: rgba(245,158,11,0.20);
  }

  .stats-card-amber::after {
    background: rgba(245,158,11,0.24);
  }

  .stats-card-amber:hover {
    border-color: rgba(245,158,11,0.42);
    box-shadow: 0 26px 80px rgba(245,158,11,0.12), inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .stats-card-purple {
    background: linear-gradient(145deg, rgba(20,7,31,0.92), rgba(4,4,6,0.96) 48%, rgba(37,12,58,0.72));
    border-color: rgba(178,74,242,0.22);
  }

  .stats-card-purple::after {
    background: rgba(178,74,242,0.24);
  }

  .stats-card-purple:hover {
    border-color: rgba(178,74,242,0.48);
    box-shadow: 0 26px 80px rgba(178,74,242,0.15), inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .light-theme .stats-interactive-card {
    background: linear-gradient(145deg, #ffffff 0%, #fbf7ff 54%, #ffffff 100%) !important;
    border-color: rgba(226,232,240,.95) !important;
    color: #111827 !important;
    box-shadow: 0 14px 34px rgba(15,23,42,.07) !important;
  }

  .light-theme .stats-interactive-card::before {
    background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,.22) 34%, rgba(178,74,242,.18) 50%, rgba(16,185,129,.08) 64%, transparent 100%) !important;
  }

  .light-theme .stats-interactive-card::after {
    opacity: .35;
    filter: blur(42px);
  }

  .light-theme .stats-card-green {
    background: linear-gradient(145deg, #ffffff 0%, #f0fdf4 58%, #ecfdf5 100%) !important;
    border-color: rgba(16,185,129,.24) !important;
  }

  .light-theme .stats-card-green::after {
    background: rgba(16,185,129,.16) !important;
  }

  .light-theme .stats-card-green:hover {
    border-color: rgba(16,185,129,.38) !important;
    box-shadow: 0 22px 54px rgba(16,185,129,.16), 0 0 0 1px rgba(16,185,129,.10) inset !important;
  }

  .light-theme .stats-card-amber {
    background: linear-gradient(145deg, #ffffff 0%, #fff7ed 58%, #fffbeb 100%) !important;
    border-color: rgba(245,158,11,.26) !important;
  }

  .light-theme .stats-card-amber::after {
    background: rgba(245,158,11,.15) !important;
  }

  .light-theme .stats-card-amber:hover {
    border-color: rgba(245,158,11,.42) !important;
    box-shadow: 0 22px 54px rgba(245,158,11,.14), 0 0 0 1px rgba(245,158,11,.10) inset !important;
  }

  .light-theme .stats-card-purple {
    background: linear-gradient(145deg, #ffffff 0%, #faf5ff 55%, #f9f1fe 100%) !important;
    border-color: rgba(178,74,242,.25) !important;
  }

  .light-theme .stats-card-purple::after {
    background: rgba(178,74,242,.15) !important;
  }

  .light-theme .stats-card-purple:hover {
    border-color: rgba(178,74,242,.46) !important;
    box-shadow: 0 22px 54px rgba(178,74,242,.15), 0 0 0 1px rgba(178,74,242,.10) inset !important;
  }

  @media (prefers-reduced-motion: no-preference) {
    .stats-soft-float {
      animation: statsSoftFloat 5.8s ease-in-out infinite;
    }
  }

  @keyframes statsSoftFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  .light-theme [class*="from-zinc-950"],
  .light-theme [class*="via-black"],
  .light-theme [class*="to-black"] {
    --tw-gradient-from: #ffffff !important;
    --tw-gradient-via: #fbf7ff !important;
    --tw-gradient-to: #ffffff !important;
  }

  .light-theme [class*="from-fuchsia-950"] {
    --tw-gradient-from: #faf5ff !important;
    --tw-gradient-via: #f9f1fe !important;
    --tw-gradient-to: #ffffff !important;
  }

  .light-theme [class*="from-emerald-950"] {
    --tw-gradient-from: #ecfdf5 !important;
    --tw-gradient-via: #f0fdf4 !important;
    --tw-gradient-to: #ffffff !important;
  }

  .light-theme [class*="from-cyan-950"] {
    --tw-gradient-from: #ecfeff !important;
    --tw-gradient-via: #f0fdfa !important;
    --tw-gradient-to: #ffffff !important;
  }

  .light-theme [class*="from-orange-950"] {
    --tw-gradient-from: #fff7ed !important;
    --tw-gradient-via: #fffbeb !important;
    --tw-gradient-to: #ffffff !important;
  }

  .light-theme [class*="from-red-950"] {
    --tw-gradient-from: #fef2f2 !important;
    --tw-gradient-via: #fff7ed !important;
    --tw-gradient-to: #ffffff !important;
  }

  .light-theme .border-white\/8,
  .light-theme .border-white\/10,
  .light-theme .border-white\/15,
  .light-theme .border-white\/20 {
    border-color: rgba(148, 163, 184, 0.34) !important;
  }

  .light-theme .text-white,
  .light-theme .text-zinc-200,
  .light-theme .text-zinc-300 {
    color: #0f172a !important;
  }

  .light-theme .text-zinc-400,
  .light-theme .text-zinc-500,
  .light-theme .text-zinc-600 {
    color: #64748b !important;
  }

  /* ── Pale color classes → vibrant equivalents for light mode ── */
  .light-theme .text-emerald-200 { color: #047857 !important; }
  .light-theme .text-emerald-300 { color: #059669 !important; }
  .light-theme .text-emerald-400 { color: #059669 !important; }
  .light-theme .text-red-200     { color: #b91c1c !important; }
  .light-theme .text-red-300     { color: #dc2626 !important; }
  .light-theme .text-red-400     { color: #dc2626 !important; }
  .light-theme .text-amber-200   { color: #92400e !important; }
  .light-theme .text-amber-300   { color: #b45309 !important; }
  .light-theme .text-amber-400   { color: #d97706 !important; }
  .light-theme .text-fuchsia-200 { color: #7e22ce !important; }
  .light-theme .text-fuchsia-300 { color: #9333ea !important; }
  .light-theme .text-fuchsia-400 { color: #9333ea !important; }
  .light-theme .text-violet-200  { color: #6d28d9 !important; }
  .light-theme .text-violet-300  { color: #7c3aed !important; }
  .light-theme .text-cyan-200    { color: #0e7490 !important; }
  .light-theme .text-cyan-300    { color: #0891b2 !important; }
  .light-theme .text-blue-200    { color: #1d4ed8 !important; }
  .light-theme .text-blue-300    { color: #2563eb !important; }
  .light-theme .text-sky-300     { color: #0284c7 !important; }
  .light-theme .text-pink-300    { color: #db2777 !important; }

  /* ── Low-opacity colored backgrounds → visible tints for light mode ── */
  .light-theme [class*="bg-emerald-500/1"],
  .light-theme [class*="bg-emerald-500/2"] {
    background: rgba(5,150,105,.13) !important;
    border-color: rgba(5,150,105,.32) !important;
  }
  .light-theme [class*="bg-red-500/1"],
  .light-theme [class*="bg-red-500/2"] {
    background: rgba(220,38,38,.11) !important;
    border-color: rgba(220,38,38,.30) !important;
  }
  .light-theme [class*="bg-amber-500/1"],
  .light-theme [class*="bg-amber-500/2"] {
    background: rgba(217,119,6,.11) !important;
    border-color: rgba(217,119,6,.30) !important;
  }
  .light-theme [class*="bg-fuchsia-500/1"],
  .light-theme [class*="bg-fuchsia-500/2"] {
    background: rgba(147,51,234,.10) !important;
    border-color: rgba(147,51,234,.28) !important;
  }
  .light-theme [class*="bg-violet-500/1"],
  .light-theme [class*="bg-violet-500/2"] {
    background: rgba(124,58,237,.10) !important;
    border-color: rgba(124,58,237,.28) !important;
  }
  .light-theme [class*="bg-cyan-500/1"],
  .light-theme [class*="bg-cyan-500/2"] {
    background: rgba(8,145,178,.11) !important;
    border-color: rgba(8,145,178,.28) !important;
  }
  .light-theme [class*="bg-blue-500/1"],
  .light-theme [class*="bg-blue-500/2"] {
    background: rgba(37,99,235,.10) !important;
    border-color: rgba(37,99,235,.28) !important;
  }

  .light-theme .text-black {
    color: #0f172a !important;
  }

  .light-theme .account-type-card {
    background: #ffffff !important;
    color: #0f172a !important;
    border-color: rgba(148, 163, 184, 0.34) !important;
  }

  .light-theme .account-type-card:hover {
    border-color: rgba(178,74,242, 0.45) !important;
    box-shadow: 0 10px 24px rgba(178,74,242, 0.10) !important;
  }

  .light-theme .account-type-card.border-fuchsia-500 {
    background: linear-gradient(135deg, #faf5ff 0%, #ffffff 55%, #f9f1fe 100%) !important;
    border-color: rgba(178,74,242, 0.75) !important;
  }

  .light-theme .date-picker-trigger {
    background: #ffffff !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.32) !important;
    box-shadow: 0 8px 22px rgba(178,74,242, 0.08) !important;
  }

  .light-theme .date-picker-trigger:hover,
  .light-theme .date-picker-trigger:focus {
    border-color: rgba(178,74,242, 0.65) !important;
    box-shadow: 0 0 0 2px rgba(178,74,242, 0.12), 0 10px 25px rgba(178,74,242, 0.12) !important;
  }

  .light-theme .date-picker-value {
    color: #0f172a !important;
    font-weight: 900 !important;
  }

  .light-theme .date-picker-placeholder {
    color: #64748b !important;
    font-weight: 800 !important;
  }

  .light-theme .date-picker-popover {
    background: #ffffff !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.40) !important;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16) !important;
    opacity: 1 !important;
    isolation: isolate !important;
    overflow: hidden !important;
  }

  .light-theme .date-picker-popover::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 60%, #ffffff 100%);
    opacity: 1;
  }

  .light-theme .date-picker-title {
    color: #0f172a !important;
  }

  .light-theme .date-picker-nav {
    background: #ffffff !important;
    color: #720cb0 !important;
    border-color: rgba(178,74,242, 0.30) !important;
    box-shadow: 0 8px 20px rgba(178,74,242, 0.10) !important;
  }

  .light-theme .date-picker-weekdays {
    color: #64748b !important;
  }

  .light-theme .date-picker-day-current {
    background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%) !important;
    color: #ffffff !important;
    border: 1px solid rgba(178,74,242, 0.34) !important;
  }

  .light-theme .date-picker-day-muted {
    background: #f8fafc !important;
    color: #94a3b8 !important;
  }

  .date-picker-day-number {
    color: inherit !important;
    opacity: 1 !important;
    visibility: visible !important;
    display: inline-block !important;
    font-weight: 900 !important;
  }

  .light-theme .date-picker-day,
  .light-theme .date-picker-day span,
  .light-theme .date-picker-day-number {
    color: #0f172a !important;
    font-weight: 900 !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .light-theme .date-picker-day-current {
    background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%) !important;
    color: #ffffff !important;
    border: 1px solid rgba(178,74,242, 0.42) !important;
  }

  .light-theme .date-picker-day-muted {
    background: #f8fafc !important;
    color: #475569 !important;
    opacity: 0.72 !important;
  }

  .light-theme .date-picker-day-selected {
    background: linear-gradient(135deg, #a855f7, #b24bf3) !important;
    color: #ffffff !important;
    border-color: rgba(178,74,242, 0.70) !important;
    box-shadow: 0 8px 20px rgba(178,74,242, 0.24) !important;
  }

  .light-theme .date-picker-day-selected .date-picker-day-number {
    color: #ffffff !important;
  }

  .light-theme .date-picker-day-selected:hover {
    background: #9e1aef !important;
    color: #ffffff !important;
  }

  .light-theme .date-picker-day:hover:not(.date-picker-day-selected) {
    background: rgba(178,74,242, 0.14) !important;
    color: #720cb0 !important;
  }

  .light-theme .date-picker-day:hover:not(.date-picker-day-selected) .date-picker-day-number {
    color: #720cb0 !important;
  }

  .light-theme .custom-select-trigger {
    background: #ffffff !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.32) !important;
    box-shadow: 0 8px 22px rgba(178,74,242, 0.08) !important;
  }

  .light-theme .custom-select-trigger:hover,
  .light-theme .custom-select-trigger:focus {
    border-color: rgba(178,74,242, 0.65) !important;
    box-shadow: 0 0 0 2px rgba(178,74,242, 0.12), 0 10px 25px rgba(178,74,242, 0.12) !important;
  }

  .light-theme .custom-select-menu {
    background: #ffffff !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.38) !important;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16) !important;
  }

  .light-theme .custom-select-option {
    min-height: 36px !important;
    color: #0f172a !important;
    background: transparent !important;
  }

  .light-theme .custom-select-option span {
    color: inherit !important;
  }

  .light-theme .custom-select-option:hover {
    background: rgba(178,74,242, 0.10) !important;
    color: #720cb0 !important;
  }

  .light-theme .custom-select-option.bg-fuchsia-500,
  .light-theme .custom-select-option.bg-emerald-500,
  .light-theme .custom-select-option.bg-red-500,
  .light-theme .custom-select-option.bg-amber-500,
  .light-theme .custom-select-option.bg-blue-500,
  .light-theme .custom-select-option.bg-cyan-500,
  .light-theme .custom-select-option.bg-orange-500 {
    color: #ffffff !important;
  }

  .light-theme .custom-select-option.bg-fuchsia-500 span,
  .light-theme .custom-select-option.bg-emerald-500 span,
  .light-theme .custom-select-option.bg-red-500 span,
  .light-theme .custom-select-option.bg-amber-500 span,
  .light-theme .custom-select-option.bg-blue-500 span,
  .light-theme .custom-select-option.bg-cyan-500 span,
  .light-theme .custom-select-option.bg-orange-500 span {
    color: #ffffff !important;
  }

  /* All per-option color overrides removed — plain text for all dropdown options */

  .custom-select-active,
  .custom-select-active span {
    color: #f4f4f5 !important;
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  .light-theme .custom-select-active,
  .light-theme .custom-select-active span {
    color: #0f172a !important;
    font-weight: 900 !important;
  }

  .light-theme .custom-select-active {
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  .light-theme .custom-select-option:not(.custom-select-active),
  .light-theme .custom-select-option:not(.custom-select-active) span {
    color: #0f172a !important;
  }

  .custom-select-option-ny-am.bg-emerald-500,
  .custom-select-option-ny-pm.bg-fuchsia-500,
  .custom-select-option-ny-am.bg-emerald-500 span,
  .custom-select-option-ny-pm.bg-fuchsia-500 span {
    color: #ffffff !important;
  }

  .custom-select-menu {
    background: #0e0e0e !important;
    scrollbar-width: thin;
    scrollbar-color: rgba(178,74,242,.65) rgba(24,24,27,.95);
  }

  .custom-select-menu::-webkit-scrollbar {
    width: 8px;
  }

  .custom-select-menu::-webkit-scrollbar-track {
    background: rgba(24,24,27,.95);
    border-radius: 999px;
  }

  .custom-select-menu::-webkit-scrollbar-thumb {
    background: rgba(178,74,242,0.45);
    border-radius: 999px;
  }

  .custom-select-option,
  .custom-select-option span,
  .custom-select-selected,
  .custom-select-selected span {
    color: #e4e4e7 !important;
    text-shadow: none !important;
  }

  /* Trade Type: green Buy / red Sell with a colored dot (Sydview style) */
  .custom-select-option-buy,
  .custom-select-selected.custom-select-option-buy,
  .custom-select-option-sell,
  .custom-select-selected.custom-select-option-sell {
    display: flex !important;
    align-items: center !important;
    gap: 0.5rem !important;
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }
  /* hide checkmark placeholder for buy/sell since they use dot ::before */
  .custom-select-option-buy .w-4,
  .custom-select-option-sell .w-4 { display: none !important; }
  .custom-select-option-buy span,
  .custom-select-selected.custom-select-option-buy span,
  .custom-select-active.custom-select-option-buy span { color: #34d399 !important; }
  .custom-select-option-sell span,
  .custom-select-selected.custom-select-option-sell span,
  .custom-select-active.custom-select-option-sell span { color: #f87171 !important; }
  .custom-select-option-buy::before,
  .custom-select-option-sell::before {
    content: "";
    display: block;
    flex-shrink: 0;
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 9999px;
  }
  .custom-select-option-buy::before { background: #34d399; box-shadow: 0 0 6px rgba(52,211,153,0.55); }
  .custom-select-option-sell::before { background: #f87171; box-shadow: 0 0 6px rgba(248,113,113,0.55); }

  .custom-select-option:not(.custom-select-active):hover,
  .custom-select-option:not(.custom-select-active):hover span {
    color: #ffffff !important;
    background: transparent !important;
  }

  .custom-select-active,
  .custom-select-active span {
    color: #ffffff !important;
    background: transparent !important;
    font-weight: 700 !important;
    box-shadow: none !important;
    border-color: transparent !important;
  }

  .date-picker-popover {
    color: #f8fafc !important;
    width: 17.5rem !important;
    max-width: min(17.5rem, calc(100vw - 2rem)) !important;
  }

  .date-picker-day-current .date-picker-day-number {
    color: #f8fafc !important;
  }

  .date-picker-day-muted .date-picker-day-number {
    color: #64748b !important;
  }

  .date-picker-day-selected .date-picker-day-number {
    color: #ffffff !important;
  }

  .light-theme .account-sidebar-card {
    background: #ffffff !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.28) !important;
    box-shadow: 0 10px 28px rgba(178,74,242, 0.10) !important;
  }

  .light-theme .account-sidebar-card:hover {
    border-color: rgba(178,74,242, 0.55) !important;
    box-shadow: 0 14px 34px rgba(178,74,242, 0.16) !important;
  }

  .light-theme input,
  .light-theme textarea,
  .light-theme select {
    background-color: #ffffff !important;
    color: #0f172a !important;
    border-color: rgba(148, 163, 184, 0.35) !important;
  }

  .light-theme input::placeholder,
  .light-theme textarea::placeholder {
    color: #94a3b8 !important;
  }

  .light-theme .bg-white\/5,
  .light-theme .bg-white\/10,
  .light-theme .bg-white\/\[0\.03\] {
    background-color: rgba(148, 163, 184, 0.10) !important;
  }

  .light-theme .shadow-\[0_0_22px_rgba\(217\,70\,239\,0\.12\)\],
  .light-theme .shadow-\[0_0_28px_rgba\(217\,70\,239\,0\.22\)\],
  .light-theme .shadow-\[0_0_45px_rgba\(168\,85\,247\,0\.13\)\],
  .light-theme .shadow-\[0_0_35px_rgba\(16\,185\,129\,0\.08\)\] {
    box-shadow: 0 16px 40px rgba(178,74,242, 0.12) !important;
  }

  .light-theme .bg-fuchsia-500.text-black,
  .light-theme .bg-emerald-500.text-black,
  .light-theme .bg-red-500.text-black,
  .light-theme .bg-amber-500.text-black,
  .light-theme .bg-blue-500.text-black,
  .light-theme .bg-cyan-500.text-black,
  .light-theme .bg-orange-500.text-black,
  .light-theme .bg-fuchsia-500 {
    color: #ffffff !important;
  }

  .light-theme {
    --tooltip-bg: #ffffff;
    --tooltip-border: rgba(178,74,242, 0.32);
    --tooltip-text: #0f172a;
  }

  .light-theme svg text[fill="white"] {
    fill: #0f172a !important;
  }

  .light-theme button[class*="bg-fuchsia-500"],
  .light-theme button[class*="bg-fuchsia-500"] * {
    color: #ffffff !important;
  }

  .light-theme .date-picker-popover .text-zinc-400,
  .light-theme .date-picker-popover .text-zinc-500 {
    color: #64748b !important;
  }

  .light-theme .date-picker-popover .text-fuchsia-300,
  .light-theme .date-picker-popover .text-fuchsia-200 {
    color: #b24bf3 !important;
  }

  .light-theme .view-all-button {
    background: #b24bf3 !important;
    color: #ffffff !important;
    border-color: rgba(178,74,242, 0.70) !important;
    box-shadow: 0 10px 24px rgba(178,74,242, 0.20) !important;
  }

  .light-theme .view-all-button:hover {
    background: #9e1aef !important;
    color: #ffffff !important;
  }

  .light-theme .activity-stat-emerald {
    background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 55%, #d1fae5 100%) !important;
    border-color: rgba(16, 185, 129, 0.55) !important;
    color: #047857 !important;
  }

  .light-theme .activity-stat-red {
    background: linear-gradient(135deg, #fef2f2 0%, #ffffff 55%, #fee2e2 100%) !important;
    border-color: rgba(239, 68, 68, 0.55) !important;
    color: #dc2626 !important;
  }

  .light-theme .activity-stat-fuchsia {
    background: linear-gradient(135deg, #faf5ff 0%, #ffffff 55%, #e7c6fb 100%) !important;
    border-color: rgba(178,74,242, 0.55) !important;
    color: #9e1aef !important;
  }

  .activity-day-cell {
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .activity-day-empty {
    background: linear-gradient(135deg, rgba(15,15,18,.88) 0%, rgba(2,2,3,.96) 100%) !important;
    border-color: rgba(255,255,255,.10) !important;
  }

  .activity-day-win {
    background: linear-gradient(135deg, rgba(16,185,129,.18) 0%, rgba(4,55,43,.72) 55%, rgba(1,12,10,.96) 100%) !important;
    border-color: rgba(16,185,129,.38) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
  }

  .activity-day-loss {
    background: linear-gradient(135deg, rgba(239,68,68,.18) 0%, rgba(69,10,10,.72) 55%, rgba(15,2,3,.96) 100%) !important;
    border-color: rgba(239,68,68,.38) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
  }

  .activity-day-breakeven {
    background: linear-gradient(135deg, rgba(245,158,11,.17) 0%, rgba(69,37,4,.72) 55%, rgba(14,8,1,.96) 100%) !important;
    border-color: rgba(245,158,11,.38) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
  }

  .activity-day-win:hover {
    border-color: rgba(52,211,153,.62) !important;
    box-shadow: 0 0 16px rgba(16,185,129,.14), inset 0 1px 0 rgba(255,255,255,.08) !important;
  }

  .activity-day-breakeven:hover {
    border-color: rgba(251,191,36,.62) !important;
    box-shadow: 0 0 16px rgba(245,158,11,.14), inset 0 1px 0 rgba(255,255,255,.08) !important;
  }

  .activity-day-selected.activity-day-breakeven {
    box-shadow: 0 0 0 1px rgba(255,255,255,.28), 0 0 16px rgba(245,158,11,.14) !important;
  }

  .activity-day-loss:hover {
    border-color: rgba(251,113,133,.62) !important;
    box-shadow: 0 0 16px rgba(239,68,68,.14), inset 0 1px 0 rgba(255,255,255,.08) !important;
  }

  .activity-day-selected.activity-day-win {
    box-shadow: 0 0 0 1px rgba(255,255,255,.28), 0 0 16px rgba(16,185,129,.14) !important;
  }

  .activity-day-selected.activity-day-loss {
    box-shadow: 0 0 0 1px rgba(255,255,255,.28), 0 0 16px rgba(239,68,68,.14) !important;
  }

  .light-theme .activity-day-empty {
    background: linear-gradient(135deg, #ffffff 0%, #faf5ff 58%, #e7c6fb 100%) !important;
    border-color: rgba(178,74,242, 0.28) !important;
    box-shadow: inset 0 0 18px rgba(178,74,242, 0.08) !important;
  }

  .light-theme .activity-day-win {
    background: linear-gradient(135deg, #34d399 0%, #10b981 60%, #059669 100%) !important;
    border-color: rgba(5, 150, 105, 0.65) !important;
    box-shadow: 0 10px 24px rgba(16, 185, 129, 0.22), inset 0 1px 0 rgba(255,255,255,0.22) !important;
  }

  .light-theme .activity-day-loss {
    background: linear-gradient(135deg, #fb7185 0%, #ef4444 60%, #dc2626 100%) !important;
    border-color: rgba(220, 38, 38, 0.65) !important;
    box-shadow: 0 10px 24px rgba(239, 68, 68, 0.22), inset 0 1px 0 rgba(255,255,255,0.22) !important;
  }

  .light-theme .trade-card {
    background: #ffffff !important;
    border-color: rgba(226, 232, 240, 0.96) !important;
    box-shadow: 0 16px 38px rgba(15, 23, 42, 0.07) !important;
  }

  .light-theme .trade-screenshot-area {
    margin: 0 !important;
    width: 100% !important;
    height: 190px !important;
    overflow: hidden !important;
    border-radius: 16px 16px 0 0 !important;
    background: #020617 !important;
    border: 0 !important;
    border-bottom: 1px solid rgba(203, 213, 225, 0.95) !important;
    box-shadow: none !important;
  }

  .light-theme .trade-screenshot-image {
    opacity: 1 !important;
    filter: contrast(1.14) saturate(1.08) !important;
    border-radius: 0 !important;
  }

  .light-theme .trade-screenshot-area::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: 16px 16px 0 0;
    background: linear-gradient(to top, rgba(15,23,42,.26), rgba(15,23,42,.04) 34%, transparent 62%);
    box-shadow: inset 0 0 0 1px rgba(15,23,42,.10);
  }

  .light-theme .trade-screenshot-overlay {
    background: linear-gradient(to top, rgba(15,23,42,.28), rgba(15,23,42,.06) 34%, transparent 66%) !important;
    opacity: 1 !important;
  }

  .light-theme .trade-no-screenshot {
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 60%, #f1f5f9 100%) !important;
    color: #475569 !important;
  }

  .light-theme .trade-no-screenshot-icon {
    background: #ffffff !important;
    border-color: rgba(203, 213, 225, 0.95) !important;
    color: #7c3aed !important;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
  }

  .light-theme .trade-no-screenshot-text {
    color: #7c3aed !important;
    font-weight: 900 !important;
  }

  .light-theme .trade-tag {
    background: linear-gradient(135deg, rgba(178,74,242, 0.20), rgba(178,74,242, 0.10)) !important;
    border-color: rgba(178,74,242, 0.55) !important;
    color: #720cb0 !important;
    box-shadow: 0 8px 20px rgba(178,74,242, 0.16) !important;
  }

  .light-theme .trade-analysis-note {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 58%, #f8fbff 100%) !important;
    color: #0f172a !important;
    border: 1px solid rgba(178,74,242, 0.24) !important;
    box-shadow: 0 10px 28px rgba(178,74,242, 0.08) !important;
  }

  .light-theme .best-performance-card {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 52%, #f3e8ff 100%) !important;
    border-color: rgba(178,74,242, 0.30) !important;
    box-shadow: 0 12px 30px rgba(178,74,242, 0.10) !important;
  }

  .light-theme .best-performance-card:hover {
    border-color: rgba(178,74,242, 0.75) !important;
    box-shadow: 0 0 32px rgba(178,74,242, 0.22) !important;
  }

  .light-theme .best-performance-card .text-white {
    color: #0f172a !important;
  }

  .weekday-card {
    min-height: 180px;
    border-radius: 0.75rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, rgba(0,0,0,.88), rgba(10,6,15,.94) 55%, rgba(88,28,135,.18));
    transition: all .3s ease;
  }

  .weekday-card:hover,
  .weekday-card-active {
    transform: translateY(-4px);
    background: linear-gradient(135deg, rgba(0,0,0,.94), rgba(12,8,18,.94) 48%, rgba(88,28,135,.30));
    box-shadow: 0 0 26px rgba(178,74,242,.16);
  }

  .strategy-detail-card,
  .strategy-summary-row,
  .statistics-pattern-panel,
  .statistics-tabs {
    position: relative;
    overflow: hidden;
  }

  .statistics-tabs::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(178,74,242,.08), transparent 45%, rgba(16,185,129,.035));
    pointer-events: none;
  }

  .statistics-tab {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: .5rem;
    border-radius: .85rem;
    padding: .75rem 1.25rem;
    font-size: .875rem;
    font-weight: 900;
    color: #a1a1aa;
    transition: all .25s ease;
  }

  .statistics-tab:hover {
    color: #fff;
    background: rgba(178,74,242,.10);
    box-shadow: 0 0 18px rgba(178,74,242,.10);
  }

  .statistics-tab-active {
    color: #ffffff;
    background: linear-gradient(135deg, rgba(178,74,242,.95), rgba(178,74,242,.78));
    box-shadow: 0 0 22px rgba(178,74,242,.28), inset 0 1px 0 rgba(255,255,255,.18);
  }

  .statistics-tab-icon {
    display: inline-flex;
    height: 1.35rem;
    width: 1.35rem;
    align-items: center;
    justify-content: center;
    border-radius: .45rem;
    background: rgba(255,255,255,.08);
    color: currentColor;
    font-size: .78rem;
  }

  .statistics-tab-active .statistics-tab-icon {
    background: rgba(255,255,255,.18);
  }

  .dashboard-hero,
  .dashboard-panel,
  .dashboard-activity-card,
  .dashboard-recent-list,
  .dashboard-routine-card,
  .journal-hero {
    position: relative;
    overflow: hidden;
  }

  .journal-sort-panel {
    position: relative;
    overflow: visible !important;
    z-index: 25;
  }

  .journal-search-panel {
    position: relative;
    overflow: visible !important;
    z-index: 30;
  }

  .dashboard-panel::before,
  .dashboard-activity-card::before,
  .dashboard-recent-list::before,
  .dashboard-routine-card::before,
  .journal-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(178,74,242,.12), transparent 42%, rgba(16,185,129,.04));
  }

  .journal-search-panel::before,
  .journal-sort-panel::before {
    content: none;
  }

  .dashboard-panel > *,
  .dashboard-activity-card > *,
  .dashboard-recent-list > *,
  .dashboard-routine-card > *,
  .journal-hero > *,
  .journal-search-panel > *,
  .journal-sort-panel > * {
    position: relative;
    z-index: 1;
  }

  .dashboard-activity-card {
    overflow: visible !important;
  }

  .dashboard-activity-card .light-tooltip {
    z-index: 9999 !important;
  }

  .dashboard-activity-card .activity-day-cell {
    overflow: visible !important;
  }

  .dashboard-performance-card,
  .dashboard-score-card {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #0a0a0a 0%, #080808 58%, #060606 100%) !important;
    border-color: rgba(255,255,255,.12) !important;
    box-shadow: 0 18px 45px rgba(0,0,0,.28) !important;
    transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
  }

  .dashboard-performance-card:hover,
  .dashboard-score-card:hover {
    border-color: rgba(255,255,255,.18) !important;
    box-shadow: 0 18px 45px rgba(0,0,0,.32) !important;
  }

  .dashboard-recent-card,
  .quick-insights-section,
  .dashboard-activity-card,
  .dashboard-events-card,
  .dashboard-routine-cta,
  .dashboard-empty,
  .dashboard-mistake-alert {
    background: linear-gradient(135deg, #16161d 0%, #101116 58%, #0c0d11 100%) !important;
    border-color: rgba(255,255,255,.22) !important;
    box-shadow: 0 18px 45px rgba(0,0,0,.28) !important;
    transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
  }

  .dashboard-recent-card,
  .quick-insights-section,
  .dashboard-activity-card,
  .dashboard-events-card,
  .dashboard-routine-cta {
    background: linear-gradient(135deg, #070709 0%, #030304 58%, #010102 100%) !important;
    border-color: rgba(255,255,255,.16) !important;
  }

  .dashboard-empty {
    background: #000000 !important;
    border-color: rgba(255,255,255,.10) !important;
    box-shadow: none !important;
  }

  .dashboard-empty:hover {
    border-color: rgba(255,255,255,.16) !important;
    box-shadow: none !important;
  }

  .dashboard-recent-card:hover,
  .quick-insights-section:hover,
  .dashboard-activity-card:hover,
  .dashboard-routine-cta:hover,
  .dashboard-events-card:hover,
  .dashboard-empty:hover,
  .dashboard-mistake-alert:hover {
    border-color: rgba(255,255,255,.24) !important;
    box-shadow: 0 22px 52px rgba(0,0,0,.38) !important;
  }

  .dashboard-activity-card::before {
    content: none !important;
  }

  .dashboard-chart-summary {
    background-color: #08090b !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  }

  .dashboard-chart-area,
  .dashboard-radar-card,
  .dashboard-score-summary {
    background-color: #070709 !important;
    border-color: rgba(255,255,255,.15) !important;
    backdrop-filter: blur(10px);
  }

  .dashboard-performance-icon,
  .dashboard-recent-icon,
  .dashboard-section-icon,
  .dashboard-routine-icon {
    background: #09090b !important;
    border-color: rgba(255,255,255,.16) !important;
  }

  .dashboard-recent-list {
    background: #050506 !important;
    border-color: rgba(255,255,255,.14) !important;
  }

  .dashboard-events-filters,
  .dashboard-activity-grid {
    background: #050506 !important;
    border-color: rgba(255,255,255,.14) !important;
  }

  .dashboard-dash-card {
    filter: brightness(1.16);
  }

  .dashboard-dash-card:hover {
    filter: brightness(1.24);
  }

  .dashboard-performance-tab,
  .dashboard-performance-tab-active {
    transition: all .25s ease !important;
  }

  .dashboard-performance-tab:hover,
  .dashboard-performance-tab-active:hover {
    transform: translateY(-1px);
  }

  .light-theme .dashboard-performance-card,
  .light-theme .dashboard-score-card,
  .light-theme .dashboard-chart-area,
  .light-theme .dashboard-radar-card,
  .light-theme .dashboard-score-summary,
  .light-theme .dashboard-chart-summary {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 55%, #f8fbff 100%) !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242,.28) !important;
    box-shadow: 0 18px 42px rgba(178,74,242,.10) !important;
  }

  .light-theme .dashboard-section-icon {
    background: rgba(178,74,242,.12) !important;
    color: #9e1aef !important;
    border-color: rgba(178,74,242,.35) !important;
  }

  .dashboard-primary-btn,
  .dashboard-start-btn {
    transition: all .25s ease !important;
  }

  .dashboard-primary-btn:hover,
  .dashboard-start-btn:hover {
    transform: translateY(-1px) scale(1.02);
  }

  .dashboard-hero {
    border: 1px solid transparent;
    background:
      linear-gradient(135deg, #14071d 0%, #16081e 48%, #180d17 76%, #21130d 100%) padding-box,
      linear-gradient(135deg, rgba(178,74,242,.58) 0%, rgba(122,42,170,.48) 58%, rgba(132,76,36,.62) 100%) border-box;
    box-shadow: 0 18px 48px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.035);
  }

  .dashboard-hero-bg {
    background:
      radial-gradient(circle at 10% 0%, rgba(178,74,242,.09), transparent 34%),
      radial-gradient(circle at 100% 100%, rgba(123,69,31,.20), transparent 42%),
      linear-gradient(135deg, rgba(18,6,27,.98) 0%, rgba(20,7,27,.98) 52%, rgba(26,13,20,.98) 78%, rgba(31,18,12,.98) 100%) !important;
  }

  .dashboard-inspiration {
    background: linear-gradient(135deg, rgba(13,7,17,.76) 0%, rgba(17,8,18,.78) 58%, rgba(31,17,12,.76) 100%) !important;
    border: 0 !important;
    box-shadow: none !important;
  }

  .dashboard-inspiration .moving-text-wrap {
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  .dashboard-dash-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.035), transparent 46%);
    opacity: 0;
    transition: opacity .25s ease;
    pointer-events: none;
  }

  .dashboard-dash-card:hover::before {
    opacity: 1;
  }

  .dashboard-recent-row:hover img {
    transform: scale(1.06);
  }

  .light-theme .dashboard-hero {
    background: linear-gradient(135deg, #ffffff 0%, #faf5ff 52%, #fff8f5 100%) !important;
    border: 1px solid rgba(178,74,242,.22) !important;
    box-shadow: 0 8px 28px rgba(178,74,242,.10) !important;
    color: #0f172a !important;
  }

  .light-theme .dashboard-panel,
  .light-theme .dashboard-activity-card,
  .light-theme .dashboard-recent-list,
  .light-theme .dashboard-routine-card {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 55%, #f8fbff 100%) !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242,.28) !important;
    box-shadow: 0 18px 42px rgba(178,74,242,.10) !important;
  }

  .light-theme .dashboard-inspiration {
    background: linear-gradient(135deg, #ffffff 0%, #faf5ff 100%) !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242,.24) !important;
  }

  .light-theme .dashboard-dash-card {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 54%, #f8fbff 100%) !important;
    color: #0f172a !important;
    box-shadow: 0 14px 34px rgba(178,74,242,.10) !important;
  }

  .journal-action-btn {
    transition: all .25s ease !important;
  }

  .journal-action-btn:hover {
    border-color: rgba(178,74,242,.65) !important;
    color: #d6a0f8 !important;
    box-shadow: 0 0 18px rgba(178,74,242,.16) !important;
    transform: translateY(-1px);
  }

  .journal-add-btn {
    transition: all .25s ease !important;
  }

  .journal-add-btn:hover {
    background: #9e1aef !important;
    box-shadow: 0 0 26px rgba(178,74,242,.34) !important;
    transform: translateY(-1px) scale(1.02);
  }

  .journal-empty {
    box-shadow: 0 18px 42px rgba(178,74,242,.10);
  }

  .fullscreen-toggle-button {
    backdrop-filter: blur(14px);
    background: linear-gradient(135deg, rgba(178,74,242,.18), rgba(5,5,5,.92) 48%, rgba(34,197,94,.12)) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 14px 36px rgba(0,0,0,.35), 0 0 24px rgba(178,74,242,.16);
  }

  .fullscreen-toggle-button:hover {
    transform: translateY(-1px) scale(1.03);
    border-color: rgba(214,160,248,.75) !important;
    color: #ffffff !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 18px 44px rgba(0,0,0,.42), 0 0 30px rgba(178,74,242,.25);
  }

  .onboarding-checklist {
    box-shadow: 0 18px 45px rgba(16,185,129,.08), 0 0 30px rgba(178,74,242,.08);
  }

  .onboarding-step {
    transition: transform .22s ease, border-color .22s ease, background .22s ease;
  }

  .onboarding-step:hover {
    transform: translateY(-1px);
    border-color: rgba(178,74,242,.45);
  }

  .journal-metric-box {
    background: linear-gradient(135deg, rgba(178,74,242,.14), rgba(88,28,135,.10) 55%, rgba(0,0,0,.22)) !important;
  }

  .journal-list-metric-chip {
    border: 1px solid rgba(178,74,242,.35);
    background: rgba(178,74,242,.12);
    color: #d6a0f8;
    border-radius: 999px;
    padding: .35rem .7rem;
    font-weight: 900;
    box-shadow: 0 0 14px rgba(178,74,242,.10);
  }

  .light-theme .journal-hero,
  .light-theme .journal-search-panel,
  .light-theme .journal-sort-panel,
  .light-theme .journal-empty,
  .light-theme .onboarding-checklist {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 55%, #f8fbff 100%) !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242,.28) !important;
    box-shadow: 0 18px 42px rgba(178,74,242,.10) !important;
  }

  .light-theme .onboarding-step {
    background: rgba(255,255,255,.82) !important;
    border-color: rgba(178,74,242,.20) !important;
  }

  .light-theme .fullscreen-toggle-button {
    background: linear-gradient(135deg, #ffffff 0%, #faf5ff 54%, #ecfdf5 100%) !important;
    color: #720cb0 !important;
    border-color: rgba(178,74,242,.32) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 14px 34px rgba(126,34,206,.14), 0 0 18px rgba(178,74,242,.12) !important;
  }

  .light-theme .journal-metric-box {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 52%, #f3e8ff 100%) !important;
    border-color: rgba(178,74,242,.38) !important;
    box-shadow: 0 10px 24px rgba(178,74,242,.10) !important;
  }

  .light-theme .journal-metric-box .text-white {
    color: #0f172a !important;
  }

  .light-theme .journal-list-metric-chip {
    background: linear-gradient(135deg, #ffffff, #faf5ff) !important;
    color: #720cb0 !important;
    border-color: rgba(178,74,242,.40) !important;
    box-shadow: 0 8px 20px rgba(178,74,242,.10) !important;
  }

  .light-theme .journal-hero-icon {
    background: rgba(178,74,242,.12) !important;
    border-color: rgba(178,74,242,.35) !important;
    color: #9e1aef !important;
  }

  .light-theme .journal-action-btn {
    background: #ffffff !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242,.28) !important;
  }

  .light-theme .journal-action-btn:hover {
    background: #faf5ff !important;
    color: #720cb0 !important;
    border-color: rgba(178,74,242,.55) !important;
  }

  .light-theme .journal-add-btn,
  .light-theme .journal-add-btn * {
    color: #ffffff !important;
  }

  .light-theme .journal-backup-btn.journal-backup-btn {
    background: #ecfdf5 !important;
    color: #047857 !important;
    border-color: rgba(16,185,129,.28) !important;
    box-shadow: 0 10px 24px rgba(16,185,129,.10) !important;
  }

  .light-theme .journal-backup-btn.journal-backup-btn * {
    color: #047857 !important;
  }

  .light-theme .journal-backup-btn.journal-backup-btn:hover {
    background: #d1fae5 !important;
    color: #065f46 !important;
    border-color: rgba(16,185,129,.38) !important;
  }

  .light-theme .statistics-tabs {
    background: #ffffff !important;
    border-color: rgba(178,74,242,.28) !important;
    box-shadow: 0 14px 34px rgba(178,74,242,.10) !important;
  }

  .light-theme .statistics-tab {
    color: #64748b !important;
  }

  .light-theme .statistics-tab:hover {
    color: #720cb0 !important;
    background: rgba(178,74,242,.10) !important;
  }

  .light-theme .statistics-tab-active {
    color: #ffffff !important;
    background: linear-gradient(135deg, #b24bf3, #a855f7) !important;
    box-shadow: 0 0 22px rgba(178,74,242,.22) !important;
  }

  .statistics-strategy-panel,
  .charts-pro-card {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  }

  .light-theme .weekday-card,
  .light-theme .strategy-detail-card,
  .light-theme .strategy-summary-row,
  .light-theme .statistics-pattern-panel,
  .light-theme .statistics-strategy-panel,
  .light-theme .charts-pro-card {
    background: linear-gradient(135deg, #ffffff, #fbf7ff 55%, #f3e8ff) !important;
    color: #0f172a !important;
    border: 1px solid rgba(178,74,242,.22) !important;
  }

  .statistics-pattern-pro {
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 24px 60px rgba(0,0,0,.28);
  }

  .weekday-card-pro:hover,
  .weekday-card-pro.weekday-card-active {
    box-shadow: 0 0 30px rgba(178,74,242,.18), inset 0 1px 0 rgba(255,255,255,.05) !important;
  }

  .light-theme .statistics-pattern-pro {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 55%, #f8fbff 100%) !important;
    border-color: rgba(178,74,242, 0.26) !important;
    box-shadow: 0 18px 42px rgba(178,74,242,.10) !important;
  }

  .light-theme .weekday-card-pro {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 58%, #f3e8ff 100%) !important;
    border-color: rgba(178,74,242, 0.24) !important;
    box-shadow: 0 12px 30px rgba(178,74,242,.08) !important;
  }

  .light-theme .weekday-card-pro:hover,
  .light-theme .weekday-card-pro.weekday-card-active {
    border-color: rgba(178,74,242,.65) !important;
    box-shadow: 0 0 28px rgba(178,74,242,.16) !important;
  }

  .light-theme .weekday-card-pro .text-white {
    color: #0f172a !important;
  }

  .statistics-strategy-panel,
  .charts-pro-card {
    position: relative;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 24px 60px rgba(0,0,0,.28);
  }

  .strategy-detail-pro:hover,
  .strategy-rank-row:hover,
  .charts-pro-card:hover {
    box-shadow: 0 0 30px rgba(178,74,242,.18), inset 0 1px 0 rgba(255,255,255,.05) !important;
  }

  .light-theme .statistics-strategy-panel,
  .light-theme .charts-pro-card {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 55%, #f8fbff 100%) !important;
    border-color: rgba(178,74,242, 0.26) !important;
    box-shadow: 0 18px 42px rgba(178,74,242,.10) !important;
  }

  .light-theme .strategy-rank-row,
  .light-theme .strategy-detail-pro {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 58%, #f3e8ff 100%) !important;
    border-color: rgba(178,74,242, 0.24) !important;
  }

  .light-theme .statistics-chart-panel {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 58%, #f8fbff 100%) !important;
    color: #0f172a !important;
    border: 1px solid rgba(178,74,242, 0.20) !important;
    box-shadow: 0 16px 42px rgba(178,74,242, 0.10) !important;
  }

  .light-theme .statistics-timeline-card {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 48%, #f3e8ff 100%) !important;
    border-color: rgba(178,74,242, 0.32) !important;
  }

  .light-theme .statistics-timeline-card:hover {
    border-color: rgba(178,74,242, 0.70) !important;
    box-shadow: 0 0 34px rgba(178,74,242, 0.18) !important;
  }

  .light-theme .statistics-winloss-card {
    background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 48%, #faf5ff 100%) !important;
    border-color: rgba(16, 185, 129, 0.30) !important;
  }

  .light-theme .statistics-winloss-card:hover {
    border-color: rgba(16, 185, 129, 0.65) !important;
    box-shadow: 0 0 34px rgba(16, 185, 129, 0.16) !important;
  }

  .light-theme .statistics-winloss-circle {
    background: #ffffff !important;
    box-shadow: 0 16px 40px rgba(16, 185, 129, 0.12) !important;
  }

  .light-theme .statistics-chart-panel .text-white {
    color: #0f172a !important;
  }

  .light-theme .calendar-hero,
  .light-theme .calendar-shell,
  .light-theme .calendar-selected-panel,
  .light-theme .calendar-hero-pro,
  .light-theme .calendar-shell-pro,
  .light-theme .calendar-selected-pro {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 56%, #f8fbff 100%) !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.28) !important;
    box-shadow: 0 18px 42px rgba(178,74,242, 0.10) !important;
  }

  .light-theme .calendar-nav-button {
    background: #ffffff !important;
    color: #720cb0 !important;
    border: 1px solid rgba(178,74,242, 0.30) !important;
    box-shadow: 0 8px 22px rgba(178,74,242, 0.10) !important;
  }

  .light-theme .calendar-top-pill {
    background: #ffffff !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.30) !important;
    box-shadow: 0 8px 22px rgba(178,74,242, 0.08) !important;
  }

  .light-theme .calendar-top-pill-neutral {
    background: linear-gradient(135deg, #ffffff 0%, #faf5ff 100%) !important;
    color: #720cb0 !important;
    border-color: rgba(178,74,242, 0.35) !important;
  }

  .light-theme .calendar-top-pill-green {
    background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%) !important;
    color: #047857 !important;
    border-color: rgba(16, 185, 129, 0.45) !important;
  }

  .light-theme .calendar-top-pill-red {
    background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%) !important;
    color: #dc2626 !important;
    border-color: rgba(239, 68, 68, 0.45) !important;
  }

  .light-theme .calendar-top-pill-label {
    color: #64748b !important;
  }

  .calendar-hero-pro,
  .calendar-shell-pro,
  .calendar-selected-pro {
    position: relative;
    overflow: hidden;
  }

  .calendar-shell-pro::before,
  .calendar-selected-pro::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(178,74,242,.10), transparent 42%, rgba(16,185,129,.04));
  }

  .calendar-shell-pro > *,
  .calendar-selected-pro > * {
    position: relative;
    z-index: 1;
  }

  .calendar-day {
    overflow: hidden;
  }

  .calendar-day-simple {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  }

  .calendar-day-simple:hover {
    transform: none !important;
  }

  .calendar-day-badge {
    border-width: 1px;
    border-radius: 999px;
    padding: .25rem .55rem;
    font-size: .7rem;
    font-weight: 900;
  }

  .calendar-pnl {
    width: fit-content !important;
    max-width: max-content !important;
    min-width: 0 !important;
    margin-left: auto !important;
    white-space: nowrap !important;
    line-height: 1 !important;
    transform: none !important;
    transform-origin: right center;
  }

  .calendar-day-number,
  .calendar-day-number-muted {
    position: relative;
    z-index: 20;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    height: 1.75rem !important;
    min-width: 1.75rem !important;
    padding: 0 .25rem !important;
    border-radius: .65rem !important;
    font-size: 18px !important;
    line-height: 1 !important;
    text-shadow: 0 2px 12px rgba(0,0,0,.45);
  }

  .calendar-day-number {
    background: rgba(255,255,255,.06) !important;
  }

  .calendar-day-number-muted {
    background: rgba(255,255,255,.03) !important;
  }

  .calendar-day::before {
    content: none;
  }

  .calendar-day-empty {
    border-color: rgba(178,74,242, 0.34) !important;
    background: radial-gradient(circle at top right, rgba(178,74,242,.13), #050505 48%) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 0 16px rgba(178,74,242,.12) !important;
  }

  .calendar-day-win {
    border-color: rgba(16, 185, 129, 0.48) !important;
    background: rgba(6, 78, 59, 0.22) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;
  }

  .calendar-day-loss {
    border-color: rgba(239, 68, 68, 0.48) !important;
    background: rgba(127, 29, 29, 0.22) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;
  }

  .calendar-day-breakeven {
    border-color: rgba(245, 158, 11, 0.48) !important;
    background: rgba(120, 53, 15, 0.22) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;
  }

  .calendar-day-weekend {
    border-color: rgba(255,255,255, 0.06) !important;
    background: #070707 !important;
    box-shadow: none !important;
  }

  .calendar-day-empty:hover,
  .calendar-day-weekend:hover {
    border-color: rgba(255,255,255,.12) !important;
    box-shadow: none !important;
  }

  .calendar-day-win:hover {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;
  }

  .calendar-day-loss:hover {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;
  }

  .calendar-day-breakeven:hover {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;
  }

  .calendar-day-selected {
    border-color: rgba(178,74,242, 0.85) !important;
    box-shadow: 0 0 0 1px rgba(178,74,242,0.32), 0 0 28px rgba(178,74,242,0.28) !important;
  }

  .calendar-neon-panel::after {
    content: "";
    position: absolute;
    inset: -1px;
    pointer-events: none;
    border-radius: inherit;
    box-shadow: inset 0 0 22px rgba(178,74,242,.10), 0 0 28px rgba(178,74,242,.10);
  }

  .calendar-week-header {
    box-shadow: 0 0 14px rgba(178,74,242,.08) !important;
  }

  .light-theme .calendar-day-empty {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 55%, #f5f3ff 100%) !important;
    border-color: rgba(178,74,242, 0.28) !important;
    box-shadow: 0 10px 24px rgba(178,74,242,.08) !important;
  }

  .light-theme .calendar-day-win {
    background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 52%, #d1fae5 100%) !important;
    border-color: rgba(16, 185, 129, 0.58) !important;
    box-shadow: 0 12px 28px rgba(16, 185, 129, 0.13) !important;
  }

  .light-theme .calendar-day-loss {
    background: linear-gradient(135deg, #fef2f2 0%, #ffffff 52%, #fee2e2 100%) !important;
    border-color: rgba(239, 68, 68, 0.58) !important;
    box-shadow: 0 12px 28px rgba(239, 68, 68, 0.13) !important;
  }

  .light-theme .calendar-day-breakeven {
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 52%, #fef3c7 100%) !important;
    border-color: rgba(245, 158, 11, 0.58) !important;
    box-shadow: 0 12px 28px rgba(245, 158, 11, 0.13) !important;
  }

  .light-theme .calendar-day-weekend {
    background: #ffffff !important;
    border-color: rgba(0,0,0, 0.08) !important;
  }

  .light-theme .calendar-day-number {
    color: #0f172a !important;
    background: rgba(178,74,242, 0.10) !important;
  }

  .light-theme .calendar-day-number-muted {
    color: #94a3b8 !important;
    background: rgba(148, 163, 184, 0.10) !important;
  }

  .light-theme .calendar-empty-dash,
  .light-theme .calendar-no-trading,
  .light-theme .calendar-no-trades {
    color: #7e22ce !important;
  }

  /* ── Calendar Grid Cells – dark mode base ── */
  .cal-grid-cell { background: #0d0d0d; }
  .cal-grid-cell-empty { border-color: rgba(255,255,255,.06) !important; background: #070707 !important; }
  .cal-grid-cell-win { border-color: rgba(16,185,129,.45) !important; background: rgba(6,78,59,.22) !important; }
  .cal-grid-cell-loss { border-color: rgba(239,68,68,.45) !important; background: rgba(127,29,29,.22) !important; }
  .cal-grid-cell-breakeven { border-color: rgba(245,158,11,.45) !important; background: rgba(120,53,15,.22) !important; }
  .cal-grid-cell-weekend { border-color: rgba(255,255,255,.06) !important; background: #070707 !important; }
  .cal-grid-cell:not(.cal-grid-cell-selected):hover { border-color: rgba(178,74,242,.35) !important; background-color: rgba(178,74,242,.06) !important; }
  .cal-grid-cell-selected { border-color: rgba(178,74,242,.80) !important; box-shadow: 0 0 0 1px rgba(178,74,242,.35), 0 0 22px rgba(178,74,242,.22) !important; }

  /* ── Calendar Grid Cells – light mode ── */
  .light-theme .cal-grid-cell { background: #ffffff !important; }
  .light-theme .cal-grid-cell-empty {
    background: linear-gradient(145deg, #faf5ff 0%, #ffffff 60%) !important;
    border-color: rgba(124,58,237,.22) !important;
    box-shadow: 0 2px 10px rgba(124,58,237,.06) !important;
  }
  .light-theme .cal-grid-cell-win {
    background: linear-gradient(145deg, #f0fdf4 0%, #ffffff 55%, #dcfce7 100%) !important;
    border-color: rgba(16,185,129,.50) !important;
    box-shadow: 0 4px 14px rgba(16,185,129,.11) !important;
  }
  .light-theme .cal-grid-cell-loss {
    background: linear-gradient(145deg, #fef2f2 0%, #ffffff 55%, #fee2e2 100%) !important;
    border-color: rgba(239,68,68,.50) !important;
    box-shadow: 0 4px 14px rgba(239,68,68,.11) !important;
  }
  .light-theme .cal-grid-cell-breakeven {
    background: linear-gradient(145deg, #fffbeb 0%, #ffffff 55%, #fef3c7 100%) !important;
    border-color: rgba(245,158,11,.50) !important;
    box-shadow: 0 4px 14px rgba(245,158,11,.11) !important;
  }
  .light-theme .cal-grid-cell-weekend {
    background: #f8fafc !important;
    border-color: rgba(0,0,0,.07) !important;
    box-shadow: none !important;
  }
  .light-theme .cal-grid-cell:not(.cal-grid-cell-selected):hover {
    border-color: rgba(124,58,237,.40) !important;
    background: rgba(124,58,237,.05) !important;
    box-shadow: 0 6px 18px rgba(124,58,237,.10) !important;
  }
  .light-theme .cal-grid-cell-selected {
    border-color: rgba(124,58,237,.75) !important;
    box-shadow: 0 0 0 2px rgba(124,58,237,.28), 0 6px 20px rgba(124,58,237,.15) !important;
  }
  /* Day numbers & text inside cells */
  .light-theme .cal-grid-cell .text-white { color: #1e293b !important; }
  .light-theme .cal-grid-cell .text-zinc-600 { color: #94a3b8 !important; }
  .light-theme .cal-grid-cell .text-zinc-700 { color: #cbd5e1 !important; }
  .light-theme .cal-grid-cell .text-fuchsia-400 { color: #6d28d9 !important; }
  .light-theme .cal-grid-cell .text-zinc-500 { color: #94a3b8 !important; }
  .light-theme .cal-trade-count { background: rgba(15,23,42,.07) !important; color: #475569 !important; }
  /* Week column */
  .light-theme .cal-grid-week-col {
    background: rgba(124,58,237,.07) !important;
    border-color: rgba(124,58,237,.22) !important;
  }
  .light-theme .cal-grid-week-col .text-emerald-400 { color: #059669 !important; }
  .light-theme .cal-grid-week-col .text-red-400 { color: #dc2626 !important; }
  .light-theme .cal-grid-week-col .text-zinc-400 { color: #64748b !important; }
  .light-theme .cal-grid-week-col .bg-white\/8 { background: rgba(15,23,42,.07) !important; }
  /* Day column headers (MON/TUE..) */
  .light-theme .calendar-col-header {
    background: #f1f5f9 !important;
    border-color: rgba(226,232,240,.85) !important;
    color: #64748b !important;
  }
  .light-theme .calendar-col-header-week {
    background: rgba(124,58,237,.10) !important;
    border-color: rgba(124,58,237,.28) !important;
    color: #6d28d9 !important;
  }

  .light-theme .calendar-trade-count {
    background: rgba(15, 23, 42, 0.08) !important;
    color: #334155 !important;
  }

  .light-theme .calendar-week-summary {
    background: linear-gradient(135deg, #faf5ff 0%, #ffffff 55%, #e7c6fb 100%) !important;
    border-color: rgba(178,74,242, 0.42) !important;
    box-shadow: 0 12px 30px rgba(178,74,242,0.10) !important;
  }

  .light-theme .calendar-week-header {
    color: #64748b !important;
    border-color: rgba(148, 163, 184, 0.22) !important;
  }

  .light-theme .calendar-week-header-special {
    background: linear-gradient(135deg, #faf5ff, #ffffff) !important;
    color: #9e1aef !important;
    border-color: rgba(178,74,242,0.35) !important;
  }

  .light-theme .light-tooltip {
    background: #ffffff !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.32) !important;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16) !important;
  }

  .light-theme .light-tooltip * {
    color: #0f172a !important;
  }

  .light-theme button[class*="bg-black"],
  .light-theme button[class*="bg-zinc-950"],
  .light-theme button[class*="bg-zinc-900"],
  .light-theme [role="button"][class*="bg-black"] {
    background: #ffffff !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.30) !important;
    box-shadow: 0 8px 22px rgba(178,74,242, 0.08) !important;
  }

  .light-theme button[class*="bg-black"]:hover,
  .light-theme button[class*="bg-zinc-950"]:hover,
  .light-theme button[class*="bg-zinc-900"]:hover {
    background: #faf5ff !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.55) !important;
    box-shadow: 0 12px 30px rgba(178,74,242, 0.14) !important;
  }

  .light-theme button[class*="bg-fuchsia-500"],
  .light-theme .view-all-button,
  .light-theme button[class*="bg-emerald-500"],
  .light-theme button[class*="bg-red-600"] {
    color: #ffffff !important;
  }

  .light-theme .rounded-xl[class*="bg-zinc-950"],
  .light-theme .rounded-2xl[class*="bg-black"],
  .light-theme section[class*="bg-zinc-950"],
  .light-theme section[class*="to-black"],
  .light-theme .space-y-5 > div,
  .light-theme .space-y-6 > div[class*="bg-zinc-950"],
  .light-theme .space-y-6 > div[class*="bg-black"],
  .light-theme .grid > div[class*="bg-zinc-950"],
  .light-theme .grid > div[class*="bg-black"] {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 58%, #f8fbff 100%) !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.22) !important;
  }

  .light-theme .fixed .bg-black,
  .light-theme .fixed .bg-zinc-950 {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 58%, #ffffff 100%) !important;
    color: #0f172a !important;
  }

  .light-theme .rounded-full[class*="bg-white/10"],
  .light-theme .rounded-full[class*="bg-white/5"],
  .light-theme .rounded-md[class*="bg-white/10"],
  .light-theme .rounded-md[class*="bg-white/5"] {
    background: rgba(178,74,242, 0.10) !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242, 0.20) !important;
  }

  .trade-context-modern {
    position: relative;
  }

  .trade-context-modern::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at top left, rgba(178,74,242,.12), transparent 34%), radial-gradient(circle at bottom right, rgba(16,185,129,.07), transparent 30%);
  }

  .trade-context-modern > * {
    position: relative;
    z-index: 1;
  }

  .trade-context-card {
    border: 1px solid rgba(255,255,255,.09);
    background: linear-gradient(135deg, rgba(255,255,255,.035), rgba(0,0,0,.42));
    border-radius: 1rem;
    padding: 1rem;
    transition: all .25s ease;
  }

  .trade-context-card:hover {
    border-color: rgba(178,74,242,.38);
    background: linear-gradient(135deg, rgba(178,74,242,.075), rgba(0,0,0,.44));
    box-shadow: 0 0 18px rgba(178,74,242,.10);
  }

  .trade-context-modern label > span:first-child {
    color: #d4d4d8 !important;
    font-size: .78rem !important;
    font-weight: 900 !important;
    letter-spacing: .02em !important;
  }

  .trade-context-result {
    min-height: 2.5rem;
    display: flex;
    align-items: center;
    border-radius: .75rem;
    border-width: 1px;
    padding: .65rem .85rem;
    font-weight: 900;
  }

  .trade-context-modern .custom-select-trigger,
  .trade-context-input {
    height: 2.75rem !important;
    border-radius: .8rem !important;
    background: rgba(0,0,0,.42) !important;
    border-color: rgba(255,255,255,.10) !important;
    box-shadow: none !important;
  }

  .trade-context-modern .custom-select-trigger:hover,
  .trade-context-modern .custom-select-trigger:focus,
  .trade-context-input:hover,
  .trade-context-input:focus {
    border-color: rgba(178,74,242,.50) !important;
    box-shadow: 0 0 0 1px rgba(178,74,242,.12), 0 0 18px rgba(178,74,242,.10) !important;
  }

  .trade-context-modern .custom-select-selected,
  .trade-context-modern .custom-select-selected span {
    color: #f4f4f5 !important;
  }

  .trade-context-modern .custom-select-menu {
    border-radius: 1rem !important;
    padding: .35rem !important;
    background: #060606 !important;
    border-color: rgba(178,74,242,.28) !important;
    box-shadow: 0 18px 45px rgba(0,0,0,.90), 0 0 20px rgba(178,74,242,.10) !important;
  }

  .trade-context-modern .custom-select-option {
    min-height: 2.4rem !important;
    border-radius: .75rem !important;
    color: #d4d4d8 !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .trade-context-modern .custom-select-option span {
    color: inherit !important;
  }

  .trade-context-modern .custom-select-option:hover {
    background: rgba(178,74,242,.12) !important;
    color: #e7c6fb !important;
  }

  .trade-context-modern .custom-select-active {
    background: transparent !important;
    color: #ffffff !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  /* trade-context per-option colors removed */

  .light-theme .trade-context-modern,
  .light-theme .trade-context-card {
    background: linear-gradient(135deg, #ffffff 0%, #fbf7ff 58%, #ffffff 100%) !important;
    color: #0f172a !important;
    border-color: rgba(178,74,242,.24) !important;
  }

  .light-theme .trade-context-modern .custom-select-trigger,
  .light-theme .trade-context-input,
  .light-theme .trade-context-card {
    background: #ffffff !important;
    color: #0f172a !important;
  }

  .light-theme .trade-context-modern .custom-select-selected,
  .light-theme .trade-context-modern .custom-select-selected span {
    color: #0f172a !important;
  }

  .light-theme .trade-context-modern .custom-select-menu {
    background: #ffffff !important;
    border-color: rgba(203,213,225,.95) !important;
    box-shadow: 0 18px 44px rgba(15,23,42,.14) !important;
  }

  .light-theme .trade-context-modern .custom-select-option {
    background: #ffffff !important;
    color: #111827 !important;
  }

  .light-theme .trade-context-modern .custom-select-option:hover,
  .light-theme .trade-context-modern .custom-select-active {
    background: #f8fafc !important;
    color: #720cb0 !important;
    border: 1px solid rgba(178,74,242,.24) !important;
  }

  .light-theme .trade-context-modern .custom-select-option-no,
  .light-theme .trade-context-modern .custom-select-option-no span {
    color: #dc2626 !important;
  }

  .segmented-choice-active {
    transform: translateY(-1px);
  }

  .light-theme .segmented-choice-active {
    background: linear-gradient(135deg, #b24bf3 0%, #a855f7 100%) !important;
    border-color: rgba(158,26,239,.72) !important;
    color: #ffffff !important;
    box-shadow: 0 10px 26px rgba(178,74,242,.22), 0 0 0 3px rgba(178,74,242,.10) !important;
  }

  .light-theme .segmented-choice-idle {
    background: #ffffff !important;
    color: #111827 !important;
    border-color: rgba(203,213,225,.90) !important;
  }

  .light-theme .segmented-choice-idle:hover {
    border-color: rgba(178,74,242,.38) !important;
    color: #720cb0 !important;
    background: #faf5ff !important;
  }

  /* session-neon styles removed — dropdowns use plain text */


  .pnl-switcher {
    display: inline-flex;
    align-items: baseline;
    gap: .5rem;
    animation: pnlSwitcherSlide 1.15s cubic-bezier(.2,.8,.2,1) both;
  }

  .pnl-switcher-label {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    border: 1px solid rgba(178,74,242,.28);
    background: rgba(178,74,242,.12);
    padding: .18rem .45rem;
    font-size: .62rem;
    font-weight: 950;
    color: #d6a0f8;
    letter-spacing: .08em;
    vertical-align: middle;
    box-shadow: 0 0 14px rgba(178,74,242,.12);
  }

  @keyframes pnlSwitcherSlide {
    0% { opacity: 0; transform: translateY(12px) scale(.96); filter: brightness(.85); }
    65% { opacity: 1; transform: translateY(0) scale(1.025); filter: brightness(1.22); }
    100% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); }
  }

  .animated-number {
    display: inline-block;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    animation: animatedNumberPop .95s ease both;
    text-shadow: 0 2px 18px rgba(0,0,0,.72);
  }
  .light-theme .animated-number { text-shadow: none !important; }
  .light-theme .stat-card-value { color: #1e293b !important; }
  .light-theme .stat-card-label { color: #64748b !important; }
  .light-theme .stat-card-item { background: #ffffff !important; border-color: rgba(226,232,240,.85) !important; }

  @keyframes animatedNumberPop {
    0% { opacity: .35; transform: translateY(8px) scale(.96); filter: brightness(.8); }
    55% { opacity: 1; transform: translateY(0) scale(1.025); filter: brightness(1.25); }
    100% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); }
  }

  .moving-text-wrap {
    position: relative;
    overflow: hidden;
    width: 100%;
    min-height: 54px;
    border-radius: 1.1rem;
    padding: 0;
    isolation: isolate;
    background: linear-gradient(135deg, rgba(8,8,11,.96), rgba(11,9,15,.94) 50%, rgba(5,8,8,.96));
    border: 1px solid rgba(255,255,255,.10);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
  }

  .moving-text-wrap::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: radial-gradient(circle at 12% 50%, rgba(178,74,242,.055), transparent 30%), radial-gradient(circle at 88% 50%, rgba(34,197,94,.035), transparent 28%);
  }

  .moving-text-wrap::after {
    content: "";
    position: absolute;
    left: 18%;
    right: 18%;
    top: 0;
    height: 1px;
    z-index: 2;
    background: linear-gradient(to right, transparent, rgba(255,255,255,.16), transparent);
  }

  .moving-text-track {
    position: relative;
    z-index: 2;
    height: 54px;
  }

  .moving-text-slide {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .85rem;
    padding: 0 1.5rem;
    text-align: center;
    opacity: 0;
    transform: translateY(12px);
    animation: quoteSlideShow 36s ease-in-out infinite;
  }

  .moving-text-slide:nth-child(1) { animation-delay: 0s; }
  .moving-text-slide:nth-child(2) { animation-delay: 6s; }
  .moving-text-slide:nth-child(3) { animation-delay: 12s; }
  .moving-text-slide:nth-child(4) { animation-delay: 18s; }
  .moving-text-slide:nth-child(5) { animation-delay: 24s; }
  .moving-text-slide:nth-child(6) { animation-delay: 30s; }

  .moving-text-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .85rem;
    max-width: 100%;
    font-size: clamp(1.05rem, 1.35vw, 1.35rem);
    font-weight: 950;
    font-style: italic;
    color: #ffffff;
    letter-spacing: .01em;
    text-shadow: 0 2px 18px rgba(0,0,0,.82);
  }

  .moving-text-spark {
    display: inline-flex;
    height: 1.6rem;
    width: 1.6rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid rgba(178,74,242,.44);
    background: rgba(178,74,242,.14);
    color: #d6a0f8;
    font-size: .72rem;
    font-style: normal;
    box-shadow: 0 0 18px rgba(178,74,242,.24), inset 0 1px 0 rgba(255,255,255,.10);
    animation: inspirationSpark 2.4s ease-in-out infinite;
    will-change: transform, filter, opacity;
  }

  .moving-text-spark:nth-child(3) {
    animation-delay: 1.1s;
  }

  .daily-inspiration-star {
    display: inline-block;
    animation: inspirationStarTwinkle 1.9s ease-in-out infinite;
    color: #d6a0f8;
    filter: drop-shadow(0 0 10px rgba(178,74,242,.7));
  }

  .daily-inspiration-star:last-child {
    animation-delay: .85s;
  }

  .waving-hand {
    display: inline-block;
    transform-origin: 70% 70%;
    animation: waveHand 3.2s ease-in-out infinite;
    will-change: transform;
  }

  .moving-text-divider {
    display: none;
  }

  @keyframes quoteSlideShow {
    0% { opacity: 0; transform: translateY(10px); }
    3% { opacity: 1; transform: translateY(0); }
    13% { opacity: 1; transform: translateY(0); }
    16.66% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 0; transform: translateY(-10px); }
  }

  @keyframes inspirationSpark {
    0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: .82; filter: brightness(1); }
    35% { transform: translateY(-3px) rotate(14deg) scale(1.16); opacity: 1; filter: brightness(1.35); }
    70% { transform: translateY(2px) rotate(-10deg) scale(.96); opacity: .9; filter: brightness(1.08); }
  }

  @keyframes inspirationStarTwinkle {
    0%, 100% { transform: translateY(0) scale(1) rotate(0deg); opacity: .7; }
    50% { transform: translateY(-2px) scale(1.22) rotate(18deg); opacity: 1; }
  }

  @keyframes waveHand {
    0%, 100% { transform: rotate(0deg); }
    16% { transform: rotate(10deg); }
    32% { transform: rotate(-6deg); }
    48% { transform: rotate(8deg); }
    64% { transform: rotate(-3deg); }
    80% { transform: rotate(0deg); }
  }

  .mistake-coach-hero {
    position: relative;
    overflow: hidden;
    border-radius: 2rem;
    border: 1px solid transparent;
    background:
      linear-gradient(135deg, #14071d 0%, #16081e 48%, #180d17 76%, #21130d 100%) padding-box,
      linear-gradient(135deg, rgba(178,74,242,.58) 0%, rgba(122,42,170,.48) 58%, rgba(132,76,36,.62) 100%) border-box;
    padding: 1.4rem;
    box-shadow: 0 18px 48px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.035);
  }

  .mistake-coach-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 10% 0%, rgba(178,74,242,.09), transparent 34%),
      radial-gradient(circle at 100% 100%, rgba(123,69,31,.20), transparent 42%),
      linear-gradient(135deg, rgba(18,6,27,.98) 0%, rgba(20,7,27,.98) 52%, rgba(26,13,20,.98) 78%, rgba(31,18,12,.98) 100%);
  }

  .coach-flow-step,
  .coach-summary-card,
  .mistake-help-banner,
  .mistake-guide-panel,
  .guide-mini-card,
  .mini-coach-metric {
    position: relative;
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(0,0,0,.28);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  }

  .coach-flow-step {
    display: flex;
    gap: .8rem;
    align-items: flex-start;
    border-radius: 1.25rem;
    padding: 1rem;
  }

  .coach-flow-number {
    display: flex;
    height: 2rem;
    width: 2rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: .8rem;
    border: 1px solid rgba(178,74,242,.35);
    background: rgba(178,74,242,.14);
    color: #d6a0f8;
    font-size: .8rem;
    font-weight: 950;
  }

  .coach-summary-card {
    border-radius: 1.6rem;
    border-color: rgba(178,74,242,.24);
    background: linear-gradient(135deg, rgba(255,255,255,.055), rgba(0,0,0,.38));
    padding: 1.25rem;
  }

  .mini-coach-metric {
    border-radius: 1rem;
    padding: .85rem;
  }

  .mini-coach-danger {
    border-color: rgba(239,68,68,.25);
    background: rgba(239,68,68,.10);
  }

  .coach-risk-badge {
    border-radius: 999px;
    padding: .45rem .75rem;
    font-size: .7rem;
    font-weight: 950;
    white-space: nowrap;
  }

  .coach-risk-high { border: 1px solid rgba(239,68,68,.35); background: rgba(239,68,68,.14); color: #fca5a5; }
  .coach-risk-medium { border: 1px solid rgba(245,158,11,.35); background: rgba(245,158,11,.14); color: #fcd34d; }
  .coach-risk-low { border: 1px solid rgba(16,185,129,.35); background: rgba(16,185,129,.14); color: #86efac; }

  .mistake-help-banner {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    border-radius: 1.5rem;
    border-color: rgba(245,158,11,.28);
    background: rgba(245,158,11,.10);
    padding: 1rem;
  }

  .mistake-guide-panel {
    overflow: hidden;
    border-radius: 1.75rem;
    border-color: rgba(178,74,242,.20);
    background: linear-gradient(135deg, rgba(178,74,242,.08), rgba(0,0,0,.22));
    padding: 1.15rem;
  }

  .mistake-guide-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .guide-mini-card {
    border-radius: 1.15rem;
    padding: 1rem;
  }

  .mistake-hero-clean,
  .mistake-panel-clean {
    position: relative;
    overflow: hidden;
    border-radius: 2rem;
    border: 1px solid rgba(178,74,242,.22);
    background: linear-gradient(135deg, rgba(10,3,16,.96), rgba(0,0,0,.96) 52%, rgba(16,5,23,.96));
    padding: 1.25rem;
    box-shadow: 0 22px 60px rgba(178,74,242,.10), inset 0 1px 0 rgba(255,255,255,.04);
  }

  .mistake-hero-clean::before,
  .mistake-panel-clean::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at top left, rgba(239,68,68,.13), transparent 32%), radial-gradient(circle at bottom right, rgba(178,74,242,.12), transparent 34%);
  }

  .mistake-hero-clean > *,
  .mistake-panel-clean > * {
    position: relative;
    z-index: 1;
  }

  .mistake-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .mistake-eyebrow {
    font-size: .72rem;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .14em;
  }

  .mistake-badge-red,
  .mistake-badge-green,
  .mistake-badge-amber,
  .mistake-badge-cyan {
    border-radius: 999px;
    padding: .4rem .75rem;
    font-size: .68rem;
    font-weight: 950;
    white-space: nowrap;
  }

  .mistake-badge-red { border: 1px solid rgba(239,68,68,.35); background: rgba(239,68,68,.12); color: #fca5a5; }
  .mistake-badge-green { border: 1px solid rgba(16,185,129,.35); background: rgba(16,185,129,.12); color: #86efac; }
  .mistake-badge-amber { border: 1px solid rgba(245,158,11,.35); background: rgba(245,158,11,.12); color: #fcd34d; }
  .mistake-badge-cyan { border: 1px solid rgba(6,182,212,.35); background: rgba(6,182,212,.12); color: #67e8f9; }

  .issue-clean-card {
    width: 100%;
    border-radius: 1.25rem;
    border: 1px solid rgba(239,68,68,.20);
    background: linear-gradient(135deg, rgba(239,68,68,.08), rgba(0,0,0,.28));
    padding: 1rem;
    text-align: left;
    transition: all .25s ease;
  }

  .issue-clean-card:hover,
  .issue-clean-card-active {
    transform: translateY(-2px);
    border-color: rgba(239,68,68,.58);
    background: linear-gradient(135deg, rgba(239,68,68,.16), rgba(0,0,0,.32));
    box-shadow: 0 0 28px rgba(239,68,68,.14);
  }

  .issue-clean-number,
  .fix-step-number {
    display: flex;
    height: 2.4rem;
    width: 2.4rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: .95rem;
    font-size: .85rem;
    font-weight: 950;
    border: 1px solid rgba(239,68,68,.34);
    background: rgba(239,68,68,.12);
    color: #fca5a5;
  }

  .fix-step-card {
    display: flex;
    gap: .9rem;
    align-items: flex-start;
    border-radius: 1.15rem;
    border: 1px solid rgba(16,185,129,.22);
    background: rgba(16,185,129,.08);
    padding: 1rem;
  }

  .fix-step-number {
    border-color: rgba(16,185,129,.34);
    background: rgba(16,185,129,.12);
    color: #86efac;
  }

  .light-theme .mistake-coach-hero,
  .light-theme .coach-summary-card,
  .light-theme .coach-flow-step,
  .light-theme .mistake-help-banner,
  .light-theme .mistake-guide-panel,
  .light-theme .guide-mini-card,
  .light-theme .mini-coach-metric,
  .light-theme .mistake-hero-clean,
  .light-theme .mistake-panel-clean {
    background: rgba(255,255,255,.88) !important;
    border-color: rgba(226,232,240,.95) !important;
    color: #111827 !important;
    box-shadow: 0 18px 45px rgba(15,23,42,.075) !important;
  }

  .light-theme .mistake-hero-clean::before,
  .light-theme .mistake-panel-clean::before {
    background: radial-gradient(circle at top left, rgba(239,68,68,.08), transparent 32%), radial-gradient(circle at bottom right, rgba(178,74,242,.08), transparent 34%) !important;
  }

  .light-theme .issue-clean-card,
  .light-theme .fix-step-card {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.95) !important;
    box-shadow: 0 10px 24px rgba(15,23,42,.045) !important;
  }

  .light-theme .issue-clean-card:hover,
  .light-theme .issue-clean-card-active {
    border-color: rgba(239,68,68,.34) !important;
    box-shadow: 0 16px 34px rgba(239,68,68,.10) !important;
  }

  /* ── What Pro Includes feature items (light mode) ── */
  .light-theme .pro-feature-item {
    background: #f1f5f9 !important;
    border-color: rgba(148,163,184,.45) !important;
    color: #1e293b !important;
    font-weight: 700 !important;
  }
  .light-theme .pro-feature-item:hover {
    background: #e9f0ff !important;
    border-color: rgba(109,40,217,.30) !important;
  }

  /* ── Fix step cards more visible in light mode ── */
  .light-theme .fix-step-card {
    background: linear-gradient(135deg, #f0fdf4, #f8fafc) !important;
    border-color: rgba(5,150,105,.28) !important;
    box-shadow: 0 3px 12px rgba(5,150,105,.08) !important;
  }
  .light-theme .fix-step-card .text-zinc-300,
  .light-theme .fix-step-card .text-zinc-400 { color: #1e293b !important; }

  /* Premium white mode inspired by clean SaaS dashboard styling */
  .light-theme,
  .light-theme main.app-main,
  .light-theme body {
    background: radial-gradient(circle at top left, rgba(178,74,242,.10), transparent 30%), linear-gradient(135deg, #f7f8fc 0%, #ffffff 44%, #f8fafc 100%) !important;
    color: #111827 !important;
  }

  .light-theme aside.fixed {
    background: rgba(255,255,255,.92) !important;
    backdrop-filter: blur(18px) !important;
    border-right: 1px solid rgba(226,232,240,.9) !important;
    box-shadow: 18px 0 45px rgba(15,23,42,.06) !important;
  }

  /* ── Sidebar account card (light mode) ── */
  .light-theme .account-sidebar-card {
    background: #ffffff !important;
    border-color: rgba(178,74,242,.22) !important;
    color: #0f172a !important;
    box-shadow: 0 4px 14px rgba(178,74,242,.10) !important;
  }
  .light-theme .account-sidebar-card:hover {
    background: #faf5ff !important;
    border-color: rgba(178,74,242,.40) !important;
    box-shadow: 0 8px 22px rgba(178,74,242,.14) !important;
  }
  .light-theme .account-sidebar-card .text-white,
  .light-theme .account-sidebar-card .text-zinc-200 { color: #0f172a !important; }
  .light-theme .account-sidebar-card .text-zinc-400,
  .light-theme .account-sidebar-card .text-zinc-500 { color: #64748b !important; }

  /* ── Sidebar nav items (light mode) ── */
  .light-theme .sidebar-nav-item {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: #475569 !important;
  }
  .light-theme .sidebar-nav-item:hover {
    background: rgba(124,58,237,.08) !important;
    color: #5b21b6 !important;
  }
  .light-theme .sidebar-nav-item-active {
    background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%) !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    border-left: none !important;
    box-shadow: 0 4px 14px rgba(109,40,217,.32) !important;
  }
  .light-theme .sidebar-nav-item-active svg,
  .light-theme .sidebar-nav-item-active .text-fuchsia-400,
  .light-theme .sidebar-nav-item-active .text-fuchsia-200 { color: #ffffff !important; }
  .light-theme .sidebar-nav-item svg { color: #94a3b8 !important; }
  .light-theme .sidebar-nav-item:hover svg { color: #5b21b6 !important; }
  .light-theme .sidebar-nav-item-active .bg-fuchsia-500 { background: rgba(255,255,255,.25) !important; }

  /* ── Journal trade rows (light mode) ── */
  .light-theme .trade-list-row {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.85) !important;
  }
  .light-theme .trade-list-row:hover {
    background: #f8f5ff !important;
    border-color: rgba(124,58,237,.28) !important;
  }
  .light-theme .trade-list-row .text-white { color: #0f172a !important; }
  .light-theme .trade-list-row .text-zinc-300 { color: #334155 !important; }
  .light-theme .trade-list-row .text-zinc-400,
  .light-theme .trade-list-row .text-zinc-500,
  .light-theme .trade-list-row .text-zinc-600 { color: #64748b !important; }
  .light-theme .trade-list-row .border-white\/8 { border-color: rgba(226,232,240,.8) !important; }
  .light-theme .trade-list-row .bg-white\/\[0\.03\] { background: #f1f5f9 !important; }
  .light-theme .trade-list-row .border-\[#0d0d0d\] { border-color: #ffffff !important; }

  /* ── Dashboard mini-calendar (light mode) ── */
  .light-theme .activity-day-header {
    background: #f1f5f9 !important;
    border-color: rgba(226,232,240,.85) !important;
    color: #64748b !important;
  }
  .light-theme .dashboard-activity-grid {
    background: #f8fafc !important;
    border-color: rgba(226,232,240,.85) !important;
    box-shadow: none !important;
  }

  /* ── Trading Strategies Modal (light mode) ── */
  .light-theme .strategies-modal-panel {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.9) !important;
    color: #0f172a !important;
  }
  .light-theme .strategies-modal-panel .border-white\/8,
  .light-theme .strategies-modal-panel .border-white\/10,
  .light-theme .strategies-modal-panel .border-white\/15 { border-color: rgba(226,232,240,.85) !important; }
  .light-theme .strategies-modal-panel .bg-\[#0a0a0a\],
  .light-theme .strategies-modal-panel .bg-black,
  .light-theme .strategies-modal-panel .bg-black\/40 { background: #f8fafc !important; }
  .light-theme .strategies-modal-panel .text-white,
  .light-theme .strategies-modal-panel .text-zinc-100,
  .light-theme .strategies-modal-panel .text-zinc-200 { color: #0f172a !important; }
  .light-theme .strategies-modal-panel .text-zinc-400,
  .light-theme .strategies-modal-panel .text-zinc-500 { color: #64748b !important; }
  .light-theme .strategies-modal-panel .text-fuchsia-300,
  .light-theme .strategies-modal-panel .text-fuchsia-200 { color: #7c3aed !important; }
  .light-theme .strategies-modal-panel input,
  .light-theme .strategies-modal-panel textarea {
    background: #ffffff !important;
    border-color: rgba(148,163,184,.4) !important;
    color: #0f172a !important;
  }
  .light-theme .strategies-modal-panel .hover\:border-white\/15:hover { border-color: rgba(124,58,237,.3) !important; }
  .light-theme .strategies-modal-panel .border-fuchsia-500\/40 { border-color: rgba(124,58,237,.45) !important; }
  .light-theme .strategies-modal-panel .bg-fuchsia-500\/8 { background: rgba(124,58,237,.08) !important; }
  .light-theme .strategies-modal-panel .border-white\/20 { border-color: rgba(148,163,184,.5) !important; }

  /* ── MultiSelect Dropdown (light mode) ── */
  .light-theme .multi-select-trigger {
    background: #ffffff !important;
    border-color: rgba(148,163,184,.45) !important;
    color: #0f172a !important;
  }
  .light-theme .multi-select-trigger .text-zinc-600 { color: #94a3b8 !important; }
  .light-theme .multi-select-trigger .text-zinc-200 { color: #0f172a !important; }
  .light-theme .multi-select-menu {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.9) !important;
    box-shadow: 0 12px 32px rgba(15,23,42,.14) !important;
  }
  .light-theme .multi-select-menu button { color: #334155 !important; }
  .light-theme .multi-select-menu button:hover { background: rgba(124,58,237,.06) !important; }
  .light-theme .multi-select-menu .border-white\/20 { border-color: rgba(148,163,184,.45) !important; }
  .light-theme .multi-select-menu .text-zinc-400 { color: #64748b !important; }
  .light-theme .multi-select-menu .text-zinc-200 { color: #1e293b !important; }

  /* ── Strategy Dropdown (light mode) ── */
  .light-theme .strategy-dropdown-trigger {
    background: #ffffff !important;
    border-color: rgba(148,163,184,.45) !important;
    color: #0f172a !important;
  }
  .light-theme .strategy-dropdown-trigger .text-zinc-400 { color: #94a3b8 !important; }
  .light-theme .strategy-dropdown-menu {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.9) !important;
    box-shadow: 0 12px 32px rgba(15,23,42,.14) !important;
  }
  .light-theme .strategy-dropdown-menu button { color: #334155 !important; }
  .light-theme .strategy-dropdown-menu button:hover { background: rgba(124,58,237,.07) !important; color: #6d28d9 !important; }
  .light-theme .strategy-dropdown-menu .text-zinc-300 { color: #334155 !important; }
  .light-theme .strategy-dropdown-menu .text-fuchsia-400 { color: #7c3aed !important; }
  .light-theme .strategy-dropdown-menu .border-white\/8 { border-color: rgba(226,232,240,.8) !important; }

  /* ── Account Dropdown (light mode) ── */
  .light-theme .account-dropdown-trigger {
    background: #ffffff !important;
    border-color: rgba(148,163,184,.45) !important;
  }
  .light-theme .account-dropdown-trigger .text-white { color: #0f172a !important; }
  .light-theme .account-dropdown-trigger .text-zinc-400 { color: #64748b !important; }
  .light-theme .account-dropdown-trigger .text-fuchsia-400 { color: #7c3aed !important; }
  .light-theme .account-dropdown-menu {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.9) !important;
    box-shadow: 0 12px 32px rgba(15,23,42,.14) !important;
  }
  .light-theme .account-dropdown-menu button { color: #334155 !important; }
  .light-theme .account-dropdown-menu button:hover { background: rgba(124,58,237,.06) !important; }
  .light-theme .account-dropdown-menu .text-zinc-200 { color: #0f172a !important; }
  .light-theme .account-dropdown-menu .text-zinc-500 { color: #64748b !important; }
  .light-theme .account-dropdown-menu .text-fuchsia-400 { color: #7c3aed !important; }
  .light-theme .account-dropdown-menu .text-white { color: #0f172a !important; }
  .light-theme .account-dropdown-menu .hover\:bg-fuchsia-500\/\[0\.06\]:hover { background: rgba(124,58,237,.07) !important; }

  /* ── Add Trade Modal (light mode) ── */
  .light-theme .trade-modal-panel {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.9) !important;
    box-shadow: 0 28px 80px rgba(15,23,42,.16) !important;
    color: #0f172a !important;
  }
  .light-theme .trade-modal-panel .text-white,
  .light-theme .trade-modal-panel .text-zinc-100,
  .light-theme .trade-modal-panel .text-zinc-200,
  .light-theme .trade-modal-panel .text-zinc-300 { color: #0f172a !important; }
  .light-theme .trade-modal-panel .text-zinc-400,
  .light-theme .trade-modal-panel .text-zinc-500 { color: #64748b !important; }
  .light-theme .trade-modal-panel .text-fuchsia-400,
  .light-theme .trade-modal-panel .text-fuchsia-300 { color: #7c3aed !important; }
  .light-theme .trade-form-section {
    background: #f8fafc !important;
    border-color: rgba(226,232,240,.85) !important;
  }
  .light-theme .trade-form-section-header {
    background: #f1f5f9 !important;
    border-color: rgba(226,232,240,.85) !important;
  }
  .light-theme .trade-form-section-title { color: #334155 !important; }
  .light-theme .trade-form-section .border-fuchsia-500\/20 { border-color: rgba(124,58,237,.25) !important; }
  .light-theme .trade-form-section .bg-fuchsia-500\/8 { background: rgba(124,58,237,.1) !important; }
  .light-theme .trade-modal-panel label,
  .light-theme .trade-modal-panel .block.text-sm { color: #1e293b !important; }
  .light-theme .trade-modal-panel input,
  .light-theme .trade-modal-panel select,
  .light-theme .trade-modal-panel textarea {
    background: #ffffff !important;
    border-color: rgba(148,163,184,.45) !important;
    color: #0f172a !important;
  }
  .light-theme .trade-modal-panel input:disabled { background: #f1f5f9 !important; color: #64748b !important; }
  .light-theme .trade-modal-panel input::placeholder,
  .light-theme .trade-modal-panel textarea::placeholder { color: #94a3b8 !important; }
  .light-theme .trade-modal-panel .bg-black,
  .light-theme .trade-modal-panel .bg-zinc-900,
  .light-theme .trade-modal-panel .bg-zinc-950,
  .light-theme .trade-modal-panel .bg-\[#0a0a0a\] { background: #ffffff !important; }
  .light-theme .trade-modal-panel .border-white\/10,
  .light-theme .trade-modal-panel .border-white\/8,
  .light-theme .trade-modal-panel .border-white\/15 { border-color: rgba(226,232,240,.8) !important; }
  .light-theme .trade-modal-shell { background: rgba(15,23,42,.45) !important; }

  /* ── Account Modal – dark mode base ── */
  .account-modal-panel {
    background: #030303;
    border: 1px solid #292b31;
    box-shadow: 0 26px 90px rgba(0,0,0,0.88);
    color: #ffffff;
  }

  /* ── Account Modal (light mode) ── */
  .light-theme .account-modal-panel {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.95) !important;
    box-shadow: 0 26px 80px rgba(15,23,42,.14) !important;
    color: #0f172a !important;
  }
  .light-theme .account-modal-panel .text-white,
  .light-theme .account-modal-panel .text-zinc-100,
  .light-theme .account-modal-panel .text-zinc-200,
  .light-theme .account-modal-panel .text-zinc-300 { color: #0f172a !important; }
  .light-theme .account-modal-panel .text-zinc-400,
  .light-theme .account-modal-panel .text-zinc-500 { color: #64748b !important; }
  .light-theme .account-modal-panel .text-fuchsia-300 { color: #9e1aef !important; }
  .light-theme .account-modal-panel .border-white\/10,
  .light-theme .account-modal-panel .border-white\/15 { border-color: rgba(226,232,240,.9) !important; }
  .light-theme .account-modal-panel input,
  .light-theme .account-modal-panel select,
  .light-theme .account-modal-panel textarea {
    background: #f8fafc !important;
    border-color: rgba(148,163,184,.4) !important;
    color: #0f172a !important;
  }
  .light-theme .account-modal-panel input::placeholder,
  .light-theme .account-modal-panel textarea::placeholder { color: #94a3b8 !important; }
  .light-theme .account-modal-panel .bg-\[#030303\],
  .light-theme .account-modal-panel .bg-zinc-900,
  .light-theme .account-modal-panel .bg-zinc-950 { background: #f8fafc !important; }

  .light-theme aside.fixed button.bg-fuchsia-500,
  .light-theme .journal-add-btn,
  .light-theme .dashboard-primary-btn,
  .light-theme button[class*="bg-fuchsia-500"]:not(.sidebar-nav-item) {
    background: linear-gradient(135deg, #b24bf3, #8b5cf6) !important;
    color: #ffffff !important;
    border-color: transparent !important;
    box-shadow: 0 14px 30px rgba(178,74,242,.24) !important;
  }

  .light-theme .dashboard-hero,
  .light-theme .journal-hero,
  .light-theme .calendar-hero-pro,
  .light-theme .dashboard-performance-card,
  .light-theme .dashboard-score-card,
  .light-theme .dashboard-recent-card,
  .light-theme .dashboard-activity-card,
  .light-theme section,
  .light-theme .statistics-chart-panel,
  .light-theme .statistics-pattern-pro,
  .light-theme .statistics-strategy-panel,
  .light-theme .charts-pro-card,
  .light-theme .trade-card,
  .light-theme .journal-search-panel,
  .light-theme .journal-sort-panel,
  .light-theme .calendar-shell-pro,
  .light-theme .calendar-selected-pro,
  .light-theme .trade-context-modern,
  .light-theme .rounded-2xl[class*="bg-gradient"],
  .light-theme .rounded-xl[class*="bg-gradient"] {
    background: rgba(255,255,255,.86) !important;
    backdrop-filter: blur(18px) !important;
    border-color: rgba(226,232,240,.9) !important;
    color: #111827 !important;
    box-shadow: 0 18px 45px rgba(15,23,42,.075) !important;
  }

  .light-theme .journal-hero,
  .light-theme .calendar-hero-pro {
    background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(250,245,255,.92) 55%, rgba(255,255,255,.96)) !important;
    border-color: rgba(178,74,242,.20) !important;
  }

  /* ── Inline-style gradient headers (Calendar, Statistics, Mistake Detector) ── */
  .light-theme .page-hero-gradient {
    background: linear-gradient(135deg, #ffffff 0%, #faf5ff 52%, #fff8f0 100%) !important;
    border: 1px solid rgba(178,74,242,.25) !important;
    box-shadow: 0 8px 28px rgba(178,74,242,.10) !important;
  }
  .light-theme .page-hero-gradient-bg { opacity: 0 !important; }
  .light-theme .page-hero-gradient .page-hero-title { color: #0f172a !important; }
  .light-theme .page-hero-gradient .page-hero-subtitle { color: #64748b !important; }
  .light-theme .page-hero-gradient * { color: #0f172a; }
  .light-theme .page-hero-gradient .text-white,
  .light-theme .page-hero-gradient .text-zinc-100,
  .light-theme .page-hero-gradient .text-zinc-200,
  .light-theme .page-hero-gradient .text-zinc-300 { color: #0f172a !important; }
  .light-theme .page-hero-gradient .text-zinc-400,
  .light-theme .page-hero-gradient .text-zinc-500 { color: #64748b !important; }
  .light-theme .page-hero-gradient .text-fuchsia-300,
  .light-theme .page-hero-gradient .text-fuchsia-200 { color: #9e1aef !important; }
  .light-theme .page-hero-gradient .text-emerald-300 { color: #059669 !important; }
  .light-theme .page-hero-gradient .border-white\/10,
  .light-theme .page-hero-gradient .border-white\/15,
  .light-theme .page-hero-gradient .border-white\/20 { border-color: rgba(148,163,184,.35) !important; }
  .light-theme .page-hero-gradient .bg-white\/10,
  .light-theme .page-hero-gradient .bg-white\/15 { background-color: rgba(0,0,0,.05) !important; }
  .light-theme .page-hero-gradient .via-white\/15 { opacity: 0 !important; }

  /* ── Dashboard hero dark overlay ── */
  .light-theme .dashboard-hero-bg { opacity: 0 !important; }
  .light-theme .dashboard-hero * { color: #0f172a; }
  .light-theme .dashboard-hero .text-white,
  .light-theme .dashboard-hero .text-zinc-100,
  .light-theme .dashboard-hero .text-zinc-200,
  .light-theme .dashboard-hero .text-zinc-300 { color: #0f172a !important; }
  .light-theme .dashboard-hero .text-zinc-400,
  .light-theme .dashboard-hero .text-zinc-500,
  .light-theme .dashboard-hero .text-zinc-600 { color: #64748b !important; }
  .light-theme .dashboard-hero .text-fuchsia-300,
  .light-theme .dashboard-hero .text-fuchsia-200 { color: #9e1aef !important; }
  .light-theme .dashboard-hero .text-emerald-300 { color: #059669 !important; }
  .light-theme .dashboard-hero .border-white\/15 { border-color: rgba(178,74,242,.20) !important; }
  .light-theme .dashboard-hero .border-white\/10 { border-color: rgba(148,163,184,.30) !important; }
  .light-theme .bg-\[#09090d\] { background-color: #f8fafc !important; }
  .light-theme .bg-\[#0a0d0c\] { background-color: #f0fdf4 !important; }

  /* ── Routine progress bar track ── */
  .light-theme .routine-progress-track { background-color: #e2e8f0 !important; }

  .light-theme .dashboard-hero::before,
  .light-theme .journal-hero::before,
  .light-theme .dashboard-panel::before,
  .light-theme .dashboard-activity-card::before,
  .light-theme .dashboard-recent-list::before,
  .light-theme .journal-search-panel::before,
  .light-theme .journal-sort-panel::before,
  .light-theme .trade-context-modern::before {
    background: radial-gradient(circle at top left, rgba(178,74,242,.10), transparent 34%), radial-gradient(circle at bottom right, rgba(16,185,129,.055), transparent 30%) !important;
  }

  .light-theme .dashboard-inspiration,
  .light-theme .moving-text-wrap {
    background: linear-gradient(135deg, #ffffff, #faf5ff 55%, #ffffff) !important;
    border-color: rgba(178,74,242,.18) !important;
    box-shadow: 0 12px 30px rgba(178,74,242,.10), inset 0 1px 0 rgba(255,255,255,.85) !important;
  }

  .light-theme .moving-text-item {
    color: #111827 !important;
    text-shadow: none !important;
  }

  .light-theme .moving-text-spark {
    background: rgba(178,74,242,.10) !important;
    color: #9e1aef !important;
    border-color: rgba(178,74,242,.26) !important;
    box-shadow: 0 10px 22px rgba(178,74,242,.10) !important;
  }

  /* ── Stat tile cards – dark mode ──────────────────────────────── */
  .stat-tile-green  { background: linear-gradient(135deg, #10271f 0%, #0a1713 52%, #070b09 100%); border-color: rgba(16,185,129,0.35); }
  .stat-tile-red    { background: linear-gradient(135deg, #271010 0%, #170a0a 52%, #0b0707 100%); border-color: rgba(239,68,68,0.35); }
  .stat-tile-amber  { background: linear-gradient(135deg, #30200b 0%, #1b1207 52%, #0e0a05 100%); border-color: rgba(245,158,11,0.35); }
  .stat-tile-purple { background: linear-gradient(135deg, #281430 0%, #170c1c 52%, #0b080d 100%); border-color: rgba(178,74,242,0.35); }
  .stat-tile-green:hover  { border-color: rgba(16,185,129,0.55); }
  .stat-tile-red:hover    { border-color: rgba(239,68,68,0.55); }
  .stat-tile-amber:hover  { border-color: rgba(245,158,11,0.55); }
  .stat-tile-purple:hover { border-color: rgba(178,74,242,0.55); }

  /* ── Stat tile cards – light mode ─────────────────────────────── */
  .light-theme .stat-tile-green,
  .light-theme .stat-tile-red,
  .light-theme .stat-tile-amber,
  .light-theme .stat-tile-purple {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.9) !important;
    border-left: none !important;
    border-top: 3px solid transparent !important;
    box-shadow: 0 1px 6px rgba(15,23,42,.05), 0 6px 24px rgba(15,23,42,.06) !important;
  }
  .light-theme .stat-tile-green  { border-top-color: #10b981 !important; }
  .light-theme .stat-tile-red    { border-top-color: #ef4444 !important; }
  .light-theme .stat-tile-amber  { border-top-color: #f59e0b !important; }
  .light-theme .stat-tile-purple { border-top-color: #8b5cf6 !important; }
  .light-theme .stat-tile-green:hover  { box-shadow: 0 4px 12px rgba(15,23,42,.06), 0 12px 36px rgba(16,185,129,.12) !important; border-color: rgba(16,185,129,.30) !important; }
  .light-theme .stat-tile-red:hover    { box-shadow: 0 4px 12px rgba(15,23,42,.06), 0 12px 36px rgba(239,68,68,.12) !important; border-color: rgba(239,68,68,.28) !important; }
  .light-theme .stat-tile-amber:hover  { box-shadow: 0 4px 12px rgba(15,23,42,.06), 0 12px 36px rgba(245,158,11,.12) !important; border-color: rgba(245,158,11,.28) !important; }
  .light-theme .stat-tile-purple:hover { box-shadow: 0 4px 12px rgba(15,23,42,.06), 0 12px 36px rgba(139,92,246,.12) !important; border-color: rgba(139,92,246,.28) !important; }
  /* hide dark glow in light mode */
  .light-theme .stat-tile-green .stat-tile-glow,
  .light-theme .stat-tile-red .stat-tile-glow,
  .light-theme .stat-tile-amber .stat-tile-glow,
  .light-theme .stat-tile-purple .stat-tile-glow { opacity: 0 !important; }
  /* all text inside stat tile – plain dark */
  .light-theme .stat-tile-green  *,
  .light-theme .stat-tile-red    *,
  .light-theme .stat-tile-amber  *,
  .light-theme .stat-tile-purple * { color: #0f172a !important; }
  /* label: muted slate */
  .light-theme .stat-tile-green  .stat-tile-label,
  .light-theme .stat-tile-red    .stat-tile-label,
  .light-theme .stat-tile-amber  .stat-tile-label,
  .light-theme .stat-tile-purple .stat-tile-label { color: #64748b !important; opacity: 1; }
  /* badge */
  .light-theme .stat-tile-green  .stat-tile-badge { background: #f0fdf4 !important; border-color: rgba(16,185,129,.30) !important; color: #065f46 !important; }
  .light-theme .stat-tile-red    .stat-tile-badge { background: #fef2f2 !important; border-color: rgba(239,68,68,.28) !important; color: #991b1b !important; }
  .light-theme .stat-tile-amber  .stat-tile-badge { background: #fffbeb !important; border-color: rgba(245,158,11,.28) !important; color: #78350f !important; }
  .light-theme .stat-tile-purple .stat-tile-badge { background: #f5f3ff !important; border-color: rgba(139,92,246,.26) !important; color: #4c1d95 !important; }
  /* icon box */
  .light-theme .stat-tile-green  .stat-tile-icon { background: #f0fdf4 !important; border-color: rgba(16,185,129,.30) !important; color: #059669 !important; }
  .light-theme .stat-tile-red    .stat-tile-icon { background: #fef2f2 !important; border-color: rgba(239,68,68,.28) !important; color: #dc2626 !important; }
  .light-theme .stat-tile-amber  .stat-tile-icon { background: #fffbeb !important; border-color: rgba(245,158,11,.28) !important; color: #d97706 !important; }
  .light-theme .stat-tile-purple .stat-tile-icon { background: #f5f3ff !important; border-color: rgba(139,92,246,.26) !important; color: #7c3aed !important; }
  /* sparkline */
  .light-theme .stat-tile-green  .stat-tile-line { color: #10b981 !important; opacity: 0.5 !important; }
  .light-theme .stat-tile-red    .stat-tile-line { color: #ef4444 !important; opacity: 0.5 !important; }
  .light-theme .stat-tile-amber  .stat-tile-line { color: #f59e0b !important; opacity: 0.5 !important; }
  .light-theme .stat-tile-purple .stat-tile-line { color: #8b5cf6 !important; opacity: 0.5 !important; }

  .light-theme .dashboard-dash-card,
  .light-theme .group.relative.overflow-hidden.rounded-xl.border.bg-gradient-to-br,
  .light-theme .statistics-metric-card,
  .light-theme .best-performance-card,
  .light-theme .weekday-card-pro,
  .light-theme .strategy-rank-row,
  .light-theme .strategy-detail-pro,
  .light-theme .trade-context-card,
  .light-theme .journal-metric-box,
  .light-theme .activity-stat-fuchsia,
  .light-theme .activity-stat-emerald,
  .light-theme .activity-stat-red,
  .light-theme .activity-stat-amber {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.95) !important;
    color: #111827 !important;
    box-shadow: 0 12px 32px rgba(15,23,42,.065) !important;
  }

  .light-theme .dashboard-dash-card:hover,
  .light-theme .statistics-metric-card:hover,
  .light-theme .best-performance-card:hover,
  .light-theme .weekday-card-pro:hover,
  .light-theme .trade-card:hover,
  .light-theme .trade-context-card:hover {
    border-color: rgba(178,74,242,.34) !important;
    box-shadow: 0 18px 44px rgba(178,74,242,.14) !important;
  }

  .light-theme .text-white,
  .light-theme h1,
  .light-theme h2,
  .light-theme h3,
  .light-theme .font-black {
    color: #111827 !important;
  }

  .light-theme .text-zinc-200,
  .light-theme .text-zinc-300,
  .light-theme .text-zinc-400,
  .light-theme .text-zinc-500 {
    color: #64748b !important;
  }

  .light-theme .text-fuchsia-300,
  .light-theme .text-fuchsia-400,
  .light-theme .text-fuchsia-500 {
    color: #9e1aef !important;
  }

  .light-theme .text-emerald-300,
  .light-theme .text-emerald-400,
  .light-theme .text-emerald-500 {
    color: #059669 !important;
  }

  .light-theme .text-red-300,
  .light-theme .text-red-400,
  .light-theme .text-red-500 {
    color: #dc2626 !important;
  }

  .light-theme .text-amber-300,
  .light-theme .text-amber-400,
  .light-theme .text-amber-500 {
    color: #d97706 !important;
  }

  .light-theme input,
  .light-theme textarea,
  .light-theme .custom-select-trigger,
  .light-theme .date-picker-trigger,
  .light-theme .trade-context-input {
    background: #ffffff !important;
    color: #111827 !important;
    border-color: rgba(226,232,240,.95) !important;
    box-shadow: 0 8px 22px rgba(15,23,42,.045) !important;
  }

  .light-theme input:focus,
  .light-theme textarea:focus,
  .light-theme .custom-select-trigger:focus,
  .light-theme .date-picker-trigger:focus {
    border-color: rgba(178,74,242,.55) !important;
    box-shadow: 0 0 0 3px rgba(178,74,242,.12), 0 12px 28px rgba(178,74,242,.12) !important;
  }

  .light-theme .custom-select-menu,
  .light-theme .date-picker-popover,
  .light-theme .light-tooltip {
    background: rgba(255,255,255,.98) !important;
    color: #111827 !important;
    border-color: rgba(178,74,242,.22) !important;
    box-shadow: 0 24px 60px rgba(15,23,42,.16) !important;
  }

  .light-theme .custom-select-option:hover,
  .light-theme .custom-select-active {
    background: #faf5ff !important;
    color: #720cb0 !important;
  }

  .light-theme .dashboard-chart-area,
  .light-theme .dashboard-radar-card,
  .light-theme .dashboard-score-summary,
  .light-theme .dashboard-recent-list,
  .light-theme .calendar-shell-pro,
  .light-theme .trade-screenshot-area,
  .light-theme .trade-no-screenshot {
    background: #f8fafc !important;
    border-color: rgba(226,232,240,.95) !important;
  }

  .light-theme .rounded-full[class*="bg-white/10"],
  .light-theme .rounded-md[class*="bg-white/10"],
  .light-theme [class*="bg-white/5"],
  .light-theme [class*="bg-black/25"],
  .light-theme [class*="bg-black/30"],
  .light-theme [class*="bg-black/35"],
  .light-theme [class*="bg-black/40"],
  .light-theme [class*="bg-black/45"],
  .light-theme [class*="bg-black/70"] {
    background: rgba(248,250,252,.86) !important;
    color: #111827 !important;
    border-color: rgba(226,232,240,.9) !important;
  }

  /* ── Currency Impact pills (light mode) ── */
  .light-theme .currency-impact-item {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.85) !important;
    box-shadow: 0 2px 10px rgba(15,23,42,.06) !important;
  }
  .light-theme .currency-impact-item .text-white { color: #0f172a !important; }
  .light-theme .currency-impact-item .text-zinc-500 { color: #64748b !important; }
  .light-theme .currency-pill-win {
    background: rgba(5,150,105,.18) !important;
    border-color: rgba(5,150,105,.42) !important;
    color: #065f46 !important;
  }
  .light-theme .currency-pill-loss {
    background: rgba(220,38,38,.14) !important;
    border-color: rgba(220,38,38,.38) !important;
    color: #991b1b !important;
  }
  .light-theme .currency-pill-neutral {
    background: #e2e8f0 !important;
    border-color: rgba(100,116,139,.35) !important;
    color: #1e293b !important;
  }

  /* ── Activity stat cards (light mode) ── */
  .light-theme .activity-stat-fuchsia {
    background: linear-gradient(135deg, #fdf4ff, #faf5ff) !important;
    border-color: rgba(147,51,234,.30) !important;
  }
  .light-theme .activity-stat-fuchsia .text-fuchsia-300,
  .light-theme .activity-stat-fuchsia .text-zinc-400 { color: #7e22ce !important; }

  .light-theme .activity-stat-emerald {
    background: linear-gradient(135deg, #f0fdf4, #ecfdf5) !important;
    border-color: rgba(5,150,105,.30) !important;
  }
  .light-theme .activity-stat-emerald .text-emerald-300,
  .light-theme .activity-stat-emerald .text-zinc-400 { color: #047857 !important; }

  .light-theme .activity-stat-red {
    background: linear-gradient(135deg, #fef2f2, #fff5f5) !important;
    border-color: rgba(220,38,38,.28) !important;
  }
  .light-theme .activity-stat-red .text-red-300,
  .light-theme .activity-stat-red .text-zinc-400 { color: #b91c1c !important; }

  .light-theme .activity-stat-amber {
    background: linear-gradient(135deg, #fffbeb, #fefce8) !important;
    border-color: rgba(217,119,6,.28) !important;
  }
  .light-theme .activity-stat-amber .text-amber-300,
  .light-theme .activity-stat-amber .text-zinc-400 { color: #92400e !important; }

  .light-theme [class*="activity-stat-"] .bg-white\/5 { opacity: 0 !important; }
  .light-theme [class*="activity-stat-"] .text-zinc-400 { font-weight: 800 !important; }

  .light-theme .calendar-day-number,
  .light-theme .date-picker-day-number {
    color: #111827 !important;
    text-shadow: none !important;
  }

  .light-theme .calendar-day-selected,
  .light-theme .date-picker-day-selected {
    border-color: rgba(178,74,242,.70) !important;
    box-shadow: 0 0 0 3px rgba(178,74,242,.12), 0 14px 30px rgba(178,74,242,.16) !important;
  }

  .light-theme .pnl-switcher-label,
  .light-theme .trade-tag,
  .light-theme .journal-list-metric-chip,
  .light-theme .calendar-top-pill-neutral {
    background: #faf5ff !important;
    color: #720cb0 !important;
    border-color: rgba(178,74,242,.24) !important;
    box-shadow: 0 8px 20px rgba(178,74,242,.08) !important;
  }

  .light-theme .calendar-page-pro {
    background: radial-gradient(circle at top left, rgba(178,74,242,.08), transparent 26%), linear-gradient(135deg, #f8fafc 0%, #ffffff 46%, #f9fafb 100%) !important;
    color: #111827 !important;
  }

  .light-theme .calendar-page-pro > .mb-8 {
    color: #111827 !important;
  }

  .light-theme .calendar-page-pro .hidden button:not(.calendar-nav-button):not(.calendar-top-pill) {
    background: #ffffff !important;
    color: #111827 !important;
    border-color: rgba(226,232,240,.96) !important;
    box-shadow: 0 10px 26px rgba(15,23,42,.06) !important;
  }

  .light-theme .calendar-summary-pro {
    border-radius: 1.75rem !important;
    background: linear-gradient(135deg, rgba(248,250,252,.92), rgba(255,255,255,.72) 54%, rgba(241,245,249,.88)) !important;
    padding: .15rem !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.86) !important;
  }

  .light-theme .calendar-summary-card-pro.calendar-summary-card-pro {
    background: linear-gradient(135deg, rgba(255,255,255,.90), rgba(248,250,252,.82)) !important;
    border-color: rgba(226,232,240,.82) !important;
    box-shadow: 0 12px 30px rgba(15,23,42,.055) !important;
  }

  .light-theme .calendar-summary-good.calendar-summary-card-pro {
    background: linear-gradient(135deg, rgba(255,255,255,.92), rgba(236,253,245,.78)) !important;
  }

  .light-theme .calendar-summary-bad.calendar-summary-card-pro {
    background: linear-gradient(135deg, rgba(255,255,255,.92), rgba(255,241,242,.74)) !important;
  }

  .light-theme .calendar-summary-warn.calendar-summary-card-pro {
    background: linear-gradient(135deg, rgba(255,255,255,.92), rgba(255,251,235,.78)) !important;
  }

  .light-theme .dashboard-hero,
  .light-theme .dashboard-performance-card,
  .light-theme .dashboard-score-card,
  .light-theme .dashboard-recent-card,
  .light-theme .dashboard-activity-card,
  .light-theme .dashboard-routine-cta,
  .light-theme .quick-insights-section,
  .light-theme .dashboard-events-card,
  .light-theme .dashboard-empty,
  .light-theme .dashboard-mistake-alert {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.96) !important;
    color: #111827 !important;
    box-shadow: 0 18px 42px rgba(15,23,42,.07) !important;
  }

  .light-theme .dashboard-hero {
    background: linear-gradient(135deg, #ffffff 0%, #fbfdff 58%, #f8fafc 100%) !important;
  }

  .light-theme .dashboard-inspiration,
  .light-theme .moving-text-wrap {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.96) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 10px 26px rgba(15,23,42,.045) !important;
  }

  .light-theme .moving-text-item {
    color: #334155 !important;
  }

  .light-theme .moving-text-spark {
    background: #f8fafc !important;
    color: #8a0fd7 !important;
    border-color: rgba(226,232,240,.96) !important;
    box-shadow: none !important;
  }

  .light-theme .dashboard-section-icon,
  .light-theme .dashboard-performance-icon,
  .light-theme .dashboard-recent-icon,
  .light-theme .dashboard-routine-icon {
    background: #f8fafc !important;
    color: #7c3aed !important;
    border-color: rgba(226,232,240,.96) !important;
    box-shadow: 0 10px 24px rgba(15,23,42,.06) !important;
  }

  .light-theme .dashboard-routine-icon {
    color: #059669 !important;
  }

  .light-theme .dashboard-start-btn.dashboard-start-btn {
    background: #ecfdf5 !important;
    color: #047857 !important;
    border-color: rgba(16,185,129,.28) !important;
    box-shadow: 0 12px 26px rgba(16,185,129,.10) !important;
  }

  .light-theme .dashboard-start-btn.dashboard-start-btn:hover {
    background: #d1fae5 !important;
    color: #065f46 !important;
    border-color: rgba(16,185,129,.38) !important;
    box-shadow: 0 16px 34px rgba(16,185,129,.14) !important;
  }

  .light-theme .dashboard-dash-card {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.96) !important;
    box-shadow: 0 14px 32px rgba(15,23,42,.06) !important;
    filter: none !important;
  }

  .light-theme .dashboard-dash-card .rounded-full,
  .light-theme .dashboard-dash-card [class*="rounded-full"][class*="bg-"],
  .light-theme .dashboard-dash-card [class*="rounded-md"][class*="bg-"] {
    background: #f8fafc !important;
    color: #475569 !important;
    border: 1px solid rgba(226,232,240,.96) !important;
    box-shadow: none !important;
  }

  .light-theme .dashboard-dash-card .dashboard-card-badge.dashboard-card-badge {
    background: #dcfce7 !important;
    color: #047857 !important;
    border-color: rgba(16,185,129,.22) !important;
    box-shadow: none !important;
  }

  .light-theme .dashboard-recent-list {
    background: #f8fafc !important;
    border-color: rgba(226,232,240,.96) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.8) !important;
  }

  .light-theme .dashboard-events-filters,
  .light-theme .dashboard-activity-grid {
    background: #f8fafc !important;
    border-color: rgba(226,232,240,.96) !important;
  }

  .light-theme button.dashboard-recent-row.dashboard-recent-row {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.96) !important;
    color: #111827 !important;
    box-shadow: 0 8px 22px rgba(15,23,42,.045) !important;
  }

  .light-theme button.dashboard-recent-row.dashboard-recent-row:hover {
    background: #fbfdff !important;
    border-color: rgba(148,163,184,.55) !important;
    box-shadow: 0 14px 30px rgba(15,23,42,.075) !important;
  }

  .light-theme .dashboard-recent-row .text-white {
    color: #111827 !important;
  }

  .light-theme .dashboard-recent-row span,
  .light-theme .dashboard-recent-row div {
    color: #111827 !important;
  }

  .light-theme .dashboard-recent-row .text-zinc-400,
  .light-theme .dashboard-recent-row .text-zinc-500 {
    color: #64748b !important;
  }

  .light-theme .dashboard-recent-row .text-fuchsia-100,
  .light-theme .dashboard-recent-row .trade-tag {
    background: #f1f5f9 !important;
    color: #475569 !important;
    border-color: rgba(203,213,225,.95) !important;
  }

  .light-theme .dashboard-routine-cta {
    background: linear-gradient(135deg, #ffffff 0%, #f8fffb 100%) !important;
    border-color: rgba(16,185,129,.20) !important;
  }

  .light-theme .dashboard-routine-cta .bg-zinc-800 {
    background: #e2e8f0 !important;
  }

  .light-theme .pretrade-modal-panel {
    background: #ffffff !important;
    color: #111827 !important;
    border-color: rgba(226,232,240,.96) !important;
    box-shadow: 0 28px 80px rgba(15,23,42,.18) !important;
  }

  .light-theme .pretrade-routine-item {
    background: #ffffff !important;
    color: #111827 !important;
    border-color: rgba(226,232,240,.96) !important;
    box-shadow: 0 10px 26px rgba(15,23,42,.055) !important;
  }

  .light-theme .pretrade-routine-item:hover {
    border-color: rgba(178,74,242,.26) !important;
    box-shadow: 0 16px 36px rgba(15,23,42,.08) !important;
  }

  .light-theme .pretrade-routine-item-checked {
    background: #f0fdf4 !important;
    border-color: rgba(16,185,129,.26) !important;
  }

  .light-theme .pretrade-routine-item .rounded-full {
    background: #ffffff !important;
    border-color: rgba(148,163,184,.55) !important;
    box-shadow: inset 0 0 0 2px rgba(255,255,255,.75) !important;
  }

  .light-theme .pretrade-routine-item-checked .rounded-full {
    background: #10b981 !important;
    border-color: #10b981 !important;
    color: #ffffff !important;
    box-shadow: 0 8px 20px rgba(16,185,129,.22) !important;
  }

  .light-theme .pretrade-status-card {
    background: #f8fafc !important;
    color: #111827 !important;
    border-color: rgba(226,232,240,.96) !important;
  }

  .light-theme .mobile-bottom-nav,
  .light-theme .fixed.bottom-0 {
    background: rgba(255,255,255,.94) !important;
    border-color: rgba(226,232,240,.92) !important;
    backdrop-filter: blur(18px) !important;
  }

  .light-theme .account-switcher-menu,
  .light-theme .sidebar-user-menu {
    background: rgba(255,255,255,.97) !important;
    color: #111827 !important;
    border-color: rgba(226,232,240,.95) !important;
    box-shadow: 0 24px 70px rgba(15,23,42,.16), 0 0 0 1px rgba(178,74,242,.08) inset !important;
    ring-color: transparent !important;
  }

  .light-theme .account-switcher-menu > div:first-child {
    border-bottom-color: rgba(226,232,240,.9) !important;
    background: linear-gradient(135deg, #ffffff, #faf5ff) !important;
  }

  .light-theme .account-switcher-menu button,
  .light-theme .sidebar-user-menu button {
    background: #ffffff !important;
    color: #111827 !important;
    border-color: rgba(226,232,240,.85) !important;
    box-shadow: none !important;
  }

  .light-theme .account-switcher-menu button:hover,
  .light-theme .sidebar-user-menu button:hover {
    background: #faf5ff !important;
    border-color: rgba(178,74,242,.26) !important;
    color: #720cb0 !important;
  }

  .light-theme .account-switcher-menu .bg-fuchsia-500,
  .light-theme .sidebar-user-menu .bg-fuchsia-500 {
    background: linear-gradient(135deg, #b24bf3, #8b5cf6) !important;
    color: #ffffff !important;
  }

  .light-theme .account-switcher-menu [class*="bg-blue-500"],
  .light-theme .account-switcher-menu [class*="bg-white/15"] {
    background: #eef2ff !important;
    color: #475569 !important;
    border-color: rgba(203,213,225,.8) !important;
  }

  .light-theme .account-switcher-menu .border-t,
  .light-theme .sidebar-user-menu .h-px {
    border-color: rgba(226,232,240,.9) !important;
    background: rgba(226,232,240,.9) !important;
  }

  .light-theme .calendar-hero-pro,
  .light-theme .calendar-shell-pro,
  .light-theme .calendar-guide-pro,
  .light-theme .calendar-summary-card-pro,
  .light-theme .calendar-week-summary-pro,
  .light-theme .mistake-panel-clean,
  .light-theme .mistake-coach-hero,
  .light-theme .issue-clean-card,
  .light-theme .fix-step-card,
  .light-theme .coach-summary-card,
  .light-theme .guide-mini-card,
  .light-theme .mini-coach-metric {
    background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(250,245,255,.78) 58%, rgba(255,255,255,.96)) !important;
    color: #111827 !important;
    border-color: rgba(226,232,240,.95) !important;
    box-shadow: 0 18px 44px rgba(15,23,42,.07) !important;
  }

  .light-theme .calendar-hero-pro::before,
  .light-theme .calendar-shell-pro::before,
  .light-theme .mistake-panel-clean::before,
  .light-theme .mistake-coach-hero::before {
    background: radial-gradient(circle at top left, rgba(178,74,242,.10), transparent 34%), radial-gradient(circle at bottom right, rgba(16,185,129,.08), transparent 36%) !important;
  }

  /* Calendar day details modal */
  .calendar-day-modal-pro {
    background: linear-gradient(135deg, #050505 0%, #090909 52%, #07030b 100%) !important;
    box-shadow: 0 26px 90px rgba(0,0,0,.80), 0 0 34px rgba(178,74,242,.10) !important;
  }

  .calendar-day-modal-head {
    background: linear-gradient(135deg, rgba(255,255,255,.035), rgba(0,0,0,.20)) !important;
  }

  .calendar-modal-day-badge {
    display: flex;
    height: 3.5rem;
    width: 3.5rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
    font-size: 1.25rem;
    font-weight: 950;
    color: #fff;
  }

  .calendar-modal-day-win { background: #16a34a; box-shadow: 0 0 22px rgba(22,163,74,.32); }
  .calendar-modal-day-loss { background: #dc2626; box-shadow: 0 0 22px rgba(220,38,38,.32); }
  .calendar-modal-day-be { background: #d97706; box-shadow: 0 0 22px rgba(217,119,6,.28); }
  .calendar-modal-day-empty { background: #7e22ce; box-shadow: 0 0 22px rgba(126,34,206,.28); }

  .calendar-modal-status {
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.12);
    padding: .25rem .65rem;
    font-size: .75rem;
    font-weight: 950;
  }

  .calendar-modal-status-win { border-color: rgba(251,146,60,.40); background: rgba(251,146,60,.14); color: #fdba74; }
  .calendar-modal-status-loss { border-color: rgba(248,113,113,.40); background: rgba(248,113,113,.14); color: #fca5a5; }
  .calendar-modal-status-be { border-color: rgba(245,158,11,.40); background: rgba(245,158,11,.14); color: #fcd34d; }
  .calendar-modal-status-empty { border-color: rgba(178,74,242,.35); background: rgba(178,74,242,.12); color: #d6a0f8; }

  .calendar-day-modal-summary {
    margin: 2rem 1.5rem 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(255,255,255,.10);
    padding: 1.6rem;
  }

  .calendar-day-modal-summary-win { border-color: rgba(16,185,129,.32); background: rgba(16,185,129,.10); }
  .calendar-day-modal-summary-loss { border-color: rgba(239,68,68,.32); background: rgba(239,68,68,.10); }
  .calendar-day-modal-summary-be { border-color: rgba(245,158,11,.32); background: rgba(245,158,11,.10); }
  .calendar-day-modal-summary-empty { border-color: rgba(178,74,242,.28); background: rgba(178,74,242,.08); }

  .calendar-modal-trade-row {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(0,0,0,.42);
    padding: 1.1rem;
  }

  .calendar-modal-trade-row::before {
    content: "";
    position: absolute;
    inset-y: 0;
    left: 0;
    width: 4px;
  }

  .calendar-modal-trade-win { border-color: rgba(16,185,129,.35); background: linear-gradient(135deg, rgba(16,185,129,.09), rgba(0,0,0,.45)); }
  .calendar-modal-trade-loss { border-color: rgba(239,68,68,.35); background: linear-gradient(135deg, rgba(239,68,68,.09), rgba(0,0,0,.45)); }
  .calendar-modal-trade-be { border-color: rgba(245,158,11,.35); background: linear-gradient(135deg, rgba(245,158,11,.09), rgba(0,0,0,.45)); }
  .calendar-modal-trade-win::before { background: #10b981; box-shadow: 0 0 16px rgba(16,185,129,.60); }
  .calendar-modal-trade-loss::before { background: #ef4444; box-shadow: 0 0 16px rgba(239,68,68,.60); }
  .calendar-modal-trade-be::before { background: #f59e0b; box-shadow: 0 0 16px rgba(245,158,11,.60); }

  .light-theme .calendar-day-modal-pro,
  .light-theme .calendar-day-modal-head,
  .light-theme .calendar-day-modal-summary,
  .light-theme .calendar-modal-trade-row {
    background: #ffffff !important;
    color: #111827 !important;
    border-color: rgba(226,232,240,.95) !important;
    box-shadow: 0 18px 50px rgba(15,23,42,.14) !important;
  }

  .light-theme .calendar-day-modal-pro .text-white,
  .light-theme .calendar-day-modal-pro h2 {
    color: #111827 !important;
  }

  .light-theme .calendar-day-modal-summary-win { background: #ecfdf5 !important; border-color: rgba(16,185,129,.25) !important; }
  .light-theme .calendar-day-modal-summary-loss { background: #fef2f2 !important; border-color: rgba(239,68,68,.25) !important; }
  .light-theme .calendar-day-modal-summary-be { background: #fffbeb !important; border-color: rgba(245,158,11,.25) !important; }
  .light-theme .calendar-modal-trade-win { background: #f0fdf4 !important; border-color: rgba(16,185,129,.25) !important; }
  .light-theme .calendar-modal-trade-loss { background: #fff1f2 !important; border-color: rgba(239,68,68,.25) !important; }
  .light-theme .calendar-modal-trade-be { background: #fffbeb !important; border-color: rgba(245,158,11,.25) !important; }

  /* 10/10 Calendar premium polish */
  .calendar-hero-pro {
    border-radius: 2rem !important;
    border-color: rgba(178,74,242,.20) !important;
    background: linear-gradient(135deg, rgba(13,13,16,.97), rgba(7,7,9,.98) 52%, rgba(18,12,24,.94)) !important;
    box-shadow: 0 24px 70px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05) !important;
  }

  .calendar-hero-pro::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at top left, rgba(178,74,242,.13), transparent 33%), radial-gradient(circle at bottom right, rgba(16,185,129,.075), transparent 34%);
  }

  .calendar-hero-stats-pro {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .75rem;
    min-width: min(100%, 440px);
  }

  .calendar-summary-card-pro,
  .calendar-guide-pro,
  .calendar-shell-pro,
  .calendar-week-summary-pro {
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(255,255,255,.045);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  }

  .calendar-summary-card-pro {
    position: relative;
    overflow: hidden;
    border-radius: 1.5rem;
    padding: 1.15rem;
  }

  .calendar-summary-card-pro::before {
    content: "";
    position: absolute;
    right: -2.5rem;
    top: -2.5rem;
    height: 8rem;
    width: 8rem;
    border-radius: 999px;
    background: rgba(255,255,255,.055);
    filter: blur(14px);
  }

  .calendar-summary-good { border-color: rgba(16,185,129,.24); background: rgba(16,185,129,.075); }
  .calendar-summary-bad { border-color: rgba(239,68,68,.24); background: rgba(239,68,68,.075); }
  .calendar-summary-warn { border-color: rgba(245,158,11,.24); background: rgba(245,158,11,.075); }

  .calendar-summary-dot-pro {
    height: .65rem;
    width: .65rem;
    border-radius: 999px;
    background: currentColor;
    opacity: .85;
    box-shadow: 0 0 14px currentColor;
  }

  .calendar-summary-good .calendar-summary-dot-pro { color: #34d399; }
  .calendar-summary-bad .calendar-summary-dot-pro { color: #fb7185; }
  .calendar-summary-warn .calendar-summary-dot-pro { color: #fbbf24; }

  .calendar-guide-pro {
    position: relative;
    overflow: hidden;
    border-radius: 1.75rem;
    border-color: rgba(178,74,242,.18);
    background: linear-gradient(135deg, rgba(178,74,242,.075), rgba(255,255,255,.035) 42%, rgba(16,185,129,.045));
    padding: 1.25rem;
    box-shadow: 0 18px 46px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04);
  }

  .calendar-guide-pro::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at top left, rgba(178,74,242,.10), transparent 34%), radial-gradient(circle at bottom right, rgba(16,185,129,.06), transparent 34%);
  }

  .calendar-guide-pro > * { position: relative; z-index: 1; }

  .calendar-legend-pro {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .65rem;
    min-width: min(100%, 440px);
  }

  .calendar-legend-pro span {
    display: flex;
    align-items: center;
    gap: .55rem;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(0,0,0,.22);
    padding: .65rem .85rem;
    color: #d4d4d8;
    font-size: .78rem;
    font-weight: 950;
  }

  .calendar-legend-pro i {
    height: .7rem;
    width: .7rem;
    border-radius: 999px;
    box-shadow: 0 0 12px currentColor;
  }

  .calendar-shell-pro {
    border-radius: 2rem !important;
    border-color: rgba(255,255,255,.10) !important;
    background: linear-gradient(135deg, rgba(255,255,255,.045), rgba(0,0,0,.30)) !important;
    padding: 1.35rem !important;
    box-shadow: 0 22px 60px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.04) !important;
  }

  .calendar-week-header {
    border-radius: 1rem !important;
    background: rgba(255,255,255,.045) !important;
    letter-spacing: .14em !important;
  }

  .calendar-day-simple {
    border-radius: 1.1rem !important;
    min-height: 128px !important;
    padding: .9rem !important;
    transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease !important;
  }

  .light-theme .account-create-button {
    background: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%) !important;
    border: 1px solid rgba(178,74,242,.28) !important;
    color: #720cb0 !important;
  }

  .light-theme .account-create-button:hover {
    background: linear-gradient(135deg, #f3e8ff 0%, #ffffff 100%) !important;
    border-color: rgba(178,74,242,.48) !important;
  }

  .light-theme .account-create-button .account-create-icon {
    background: linear-gradient(135deg, #b24bf3, #a855f7) !important;
    color: #ffffff !important;
    box-shadow: 0 10px 24px rgba(178,74,242,.22) !important;
  }

  .light-theme .account-create-button .text-fuchsia-300,
  .light-theme .account-create-button .text-zinc-400 {
    color: #720cb0 !important;
  }

  .light-theme .segmented-choice-active,
  .light-theme .segmented-choice-active.font-black {
    background: linear-gradient(135deg, #b24bf3 0%, #a855f7 100%) !important;
    border-color: rgba(158,26,239,.72) !important;
    color: #ffffff !important;
    box-shadow: 0 10px 26px rgba(178,74,242,.22), 0 0 0 3px rgba(178,74,242,.10) !important;
  }

  .calendar-day-event-pill {
    max-width: calc(100% - 3.5rem);
  }

  .calendar-day-top-row {
    position: absolute;
    top: .9rem;
    left: .9rem;
    right: .9rem;
    z-index: 25;
  }

  .calendar-day-result-stack {
    bottom: .75rem;
  }

  @media (max-width: 1280px) {
    .calendar-shell-pro {
      padding: .95rem !important;
    }

    .calendar-shell-pro > .grid {
      min-width: 1040px !important;
      gap: .65rem !important;
    }

    .calendar-day-simple,
    .calendar-week-summary-pro {
      min-height: 118px !important;
    }
  }

  @media (max-width: 768px) {
    .calendar-page-pro {
      margin: -.75rem !important;
      padding: .75rem !important;
    }

    .calendar-hero-pro,
    .calendar-shell-pro,
    .calendar-selected-pro,
    .calendar-summary-card-pro,
    .calendar-guide-pro,
    .economic-calendar-panel {
      border-radius: 1.15rem !important;
      padding: 1rem !important;
    }

    .calendar-hero-pro h1 {
      font-size: clamp(1.9rem, 10vw, 2.75rem) !important;
      line-height: 1 !important;
    }

    .calendar-hero-pro p {
      font-size: .82rem !important;
      line-height: 1.45 !important;
    }

    .calendar-shell-pro > .grid {
      min-width: 0 !important;
      gap: .25rem !important;
    }

    .calendar-day-top-row {
      top: .35rem !important;
      left: .35rem !important;
      right: .35rem !important;
    }

    .calendar-day-result-stack {
      left: .35rem !important;
      right: .35rem !important;
      bottom: .3rem !important;
      gap: .2rem !important;
    }

    .calendar-day-number,
    .calendar-day-number-muted {
      height: 1.3rem !important;
      min-width: 1.3rem !important;
      font-size: .68rem !important;
      border-radius: .4rem !important;
    }

    .calendar-week-header {
      font-size: .58rem !important;
      padding-block: .55rem !important;
      letter-spacing: .03em !important;
    }

    .calendar-day-event-pill {
      display: none !important;
    }

    .calendar-day-result-stack .rounded-md {
      font-size: .6rem !important;
      padding: .1rem .25rem !important;
    }

    .calendar-trade-count,
    .calendar-weekend-icon,
    .calendar-empty-dash {
      display: none !important;
    }

    .calendar-day-simple {
      min-height: 54px !important;
      border-radius: .55rem !important;
      padding: .1rem !important;
    }

    .calendar-day-event-pill {
      display: none !important;
    }

    .calendar-day-modal-pro {
      max-height: calc(100dvh - 1rem) !important;
      border-radius: 1.1rem !important;
    }

    .calendar-day-modal-head {
      align-items: flex-start !important;
      padding: 1rem !important;
    }

    .calendar-modal-day-badge {
      height: 3.15rem !important;
      min-width: 3.15rem !important;
      border-radius: .9rem !important;
    }
  }

  @media (max-width: 640px) {
    .mobile-bottom-nav {
      padding-bottom: calc(.5rem + env(safe-area-inset-bottom, 0px)) !important;
    }

    .calendar-shell-pro > .grid {
      gap: .2rem !important;
    }

    .calendar-week-summary-pro .text-lg {
      font-size: .98rem !important;
    }

    .journal-stats-grid,
    .statistics-status-strip-pro,
    .mistake-status-strip-pro {
      grid-template-columns: 1fr !important;
    }

    .statistics-command-main-pro,
    .stats-hero-metric,
    .stats-insight-card,
    .mistake-command-main-pro,
    .mistake-filter-card-pro,
    .mistake-page-header-pro,
    .rounded-2xl {
      max-width: 100%;
    }

    .calendar-day-modal-summary {
      margin: 1rem !important;
      padding: 1rem !important;
    }
  }

  .calendar-day-simple:hover {
    transform: translateY(-2px) !important;
    border-color: rgba(178,74,242,.55) !important;
    box-shadow: 0 16px 34px rgba(178,74,242,.12), inset 0 1px 0 rgba(255,255,255,.05) !important;
  }

  .calendar-day-number,
  .calendar-day-number-muted {
    height: 2rem !important;
    min-width: 2rem !important;
    border-radius: .8rem !important;
    font-size: 1rem !important;
    font-weight: 950 !important;
  }

  .calendar-week-summary-pro {
    min-height: 128px !important;
    border-radius: 1.1rem !important;
    background: rgba(178,74,242,.075) !important;
  }

  .calendar-day-win { background: linear-gradient(135deg, rgba(16,185,129,.18), rgba(0,0,0,.22)) !important; }
  .calendar-day-loss { background: linear-gradient(135deg, rgba(239,68,68,.18), rgba(0,0,0,.22)) !important; }
  .calendar-day-breakeven { background: linear-gradient(135deg, rgba(245,158,11,.16), rgba(0,0,0,.22)) !important; }
  .calendar-day-empty,
  .calendar-day-weekend { background: rgba(0,0,0,.24) !important; }

  .calendar-day-selected {
    border-color: rgba(178,74,242,.85) !important;
    box-shadow: 0 0 0 1px rgba(178,74,242,.30), 0 0 34px rgba(178,74,242,.24) !important;
  }

  .light-theme .calendar-summary-card-pro,
  .light-theme .calendar-guide-pro,
  .light-theme .calendar-shell-pro,
  .light-theme .calendar-week-summary-pro {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.95) !important;
    color: #111827 !important;
    box-shadow: 0 16px 38px rgba(15,23,42,.065) !important;
  }

  .light-theme .calendar-hero-pro {
    background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(250,245,255,.92) 55%, rgba(255,255,255,.96)) !important;
    border-color: rgba(178,74,242,.20) !important;
    box-shadow: 0 18px 45px rgba(15,23,42,.075) !important;
  }

  .light-theme .calendar-guide-pro::before,
  .light-theme .calendar-hero-pro::before {
    background: radial-gradient(circle at top left, rgba(178,74,242,.055), transparent 32%), radial-gradient(circle at bottom right, rgba(16,185,129,.045), transparent 34%) !important;
  }

  .light-theme .calendar-legend-pro span {
    background: #f8fafc !important;
    border-color: rgba(226,232,240,.95) !important;
    color: #111827 !important;
  }

  .light-theme .calendar-day-win { background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 52%, #d1fae5 100%) !important; }
  .light-theme .calendar-day-loss { background: linear-gradient(135deg, #fef2f2 0%, #ffffff 52%, #fee2e2 100%) !important; }
  .light-theme .calendar-day-breakeven { background: linear-gradient(135deg, #fffbeb 0%, #ffffff 52%, #fef3c7 100%) !important; }
  .light-theme .calendar-day-empty,
  .light-theme .calendar-day-weekend { background: #ffffff !important; }

  @media (max-width: 768px) {
    .calendar-hero-stats-pro,
    .calendar-legend-pro {
      grid-template-columns: 1fr;
      min-width: 100%;
    }
  }

  /* 10/10 Statistics premium polish */
  .statistics-page-pro {
    --stats-border: rgba(255,255,255,.10);
    --stats-card: rgba(255,255,255,.045);
  }

  .statistics-hero-pro {
    position: relative;
    overflow: hidden;
    border-radius: 2rem;
    border: 1px solid transparent;
    background:
      linear-gradient(135deg, #14071d 0%, #16081e 48%, #180d17 76%, #21130d 100%) padding-box,
      linear-gradient(135deg, rgba(178,74,242,.58) 0%, rgba(122,42,170,.48) 58%, rgba(132,76,36,.62) 100%) border-box;
    padding: 1.45rem;
    box-shadow: 0 18px 48px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.035);
  }

  .statistics-hero-pro::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 10% 0%, rgba(178,74,242,.09), transparent 34%),
      radial-gradient(circle at 100% 100%, rgba(123,69,31,.20), transparent 42%),
      linear-gradient(135deg, rgba(18,6,27,.98) 0%, rgba(20,7,27,.98) 52%, rgba(26,13,20,.98) 78%, rgba(31,18,12,.98) 100%);
  }

  .stats-flow-step-pro,
  .statistics-filter-pro,
  .statistics-status-strip-pro,
  .statistics-command-main-pro,
  .statistics-command-side-pro,
  .stats-hero-metric,
  .stats-insight-card,
  .statistics-tabs-pro {
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(255,255,255,.045);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  }

  .stats-flow-step-pro {
    display: flex;
    gap: .8rem;
    align-items: flex-start;
    border-radius: 1.25rem;
    padding: 1rem;
  }

  .stats-flow-number-pro {
    display: flex;
    height: 2rem;
    width: 2rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: .8rem;
    border: 1px solid rgba(178,74,242,.35);
    background: rgba(178,74,242,.14);
    color: #d6a0f8;
    font-size: .8rem;
    font-weight: 950;
  }

  .statistics-filter-pro {
    border-radius: 1.6rem;
    border-color: rgba(178,74,242,.24);
    background: linear-gradient(135deg, rgba(255,255,255,.055), rgba(0,0,0,.38));
    padding: 1.25rem;
  }

  .statistics-filter-btn-pro {
    min-height: 2.55rem;
    border-radius: .8rem;
    border: 1px solid rgba(178,74,242,.28);
    background: rgba(178,74,242,.10);
    color: #d6a0f8;
    font-size: .82rem;
    font-weight: 950;
    transition: all .2s ease;
  }

  .statistics-filter-btn-pro:hover {
    border-color: rgba(178,74,242,.55);
    background: rgba(178,74,242,.16);
    transform: translateY(-1px);
  }

  .statistics-status-strip-pro {
    margin-top: 1.25rem;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: .75rem;
    border-radius: 1.5rem;
    padding: .85rem;
  }

  .statistics-status-strip-pro > div {
    display: flex;
    min-height: 4rem;
    flex-direction: column;
    justify-content: center;
    gap: .35rem;
    border-radius: 1rem;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(0,0,0,.20);
    padding: .75rem .9rem;
  }

  .statistics-status-strip-pro span {
    color: #71717a;
    font-size: .68rem;
    font-weight: 950;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .statistics-status-strip-pro b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #fff;
    font-size: .95rem;
    font-weight: 950;
  }

  .statistics-command-center-pro {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(320px, .6fr);
    gap: 1.25rem;
  }

  .statistics-command-main-pro,
  .statistics-command-side-pro {
    position: relative;
    overflow: hidden;
    border-radius: 1.8rem;
    background: linear-gradient(135deg, rgba(255,255,255,.045), rgba(0,0,0,.28));
    padding: 1.25rem;
    box-shadow: 0 18px 46px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.04);
  }

  .statistics-command-main-pro::before,
  .statistics-command-side-pro::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at top left, rgba(178,74,242,.08), transparent 34%), radial-gradient(circle at bottom right, rgba(16,185,129,.05), transparent 34%);
  }

  .statistics-command-main-pro > *,
  .statistics-command-side-pro > * {
    position: relative;
    z-index: 1;
  }

  .stats-edge-badge {
    border-radius: 999px;
    padding: .55rem .85rem;
    font-size: .75rem;
    font-weight: 950;
    white-space: nowrap;
  }

  .stats-edge-good { border: 1px solid rgba(16,185,129,.35); background: rgba(16,185,129,.12); color: #86efac; }
  .stats-edge-warn { border: 1px solid rgba(245,158,11,.35); background: rgba(245,158,11,.12); color: #fcd34d; }
  .stats-edge-bad { border: 1px solid rgba(239,68,68,.35); background: rgba(239,68,68,.12); color: #fca5a5; }

  .stats-hero-metric {
    border-radius: 1.25rem;
    padding: 1rem;
  }

  .stats-hero-good {
    border-color: rgba(16,185,129,.35);
    background: linear-gradient(135deg, rgba(6,46,30,.92) 0%, rgba(4,26,18,.96) 52%, rgba(8,42,28,.92) 100%);
    box-shadow: 0 8px 32px rgba(16,185,129,.10), inset 0 1px 0 rgba(255,255,255,.04);
  }
  .stats-hero-bad {
    border-color: rgba(239,68,68,.35);
    background: linear-gradient(135deg, rgba(46,8,8,.92) 0%, rgba(26,4,4,.96) 52%, rgba(42,8,8,.92) 100%);
    box-shadow: 0 8px 32px rgba(239,68,68,.10), inset 0 1px 0 rgba(255,255,255,.04);
  }
  .stats-hero-warn {
    border-color: rgba(245,158,11,.35);
    background: linear-gradient(135deg, rgba(46,30,4,.92) 0%, rgba(30,18,2,.96) 52%, rgba(46,28,2,.92) 100%);
    box-shadow: 0 8px 32px rgba(245,158,11,.10), inset 0 1px 0 rgba(255,255,255,.04);
  }
  .stats-hero-main {
    border-color: rgba(178,74,242,.35);
    background: linear-gradient(135deg, rgba(30,8,46,.92) 0%, rgba(18,4,30,.96) 52%, rgba(28,6,44,.92) 100%);
    box-shadow: 0 8px 32px rgba(178,74,242,.10), inset 0 1px 0 rgba(255,255,255,.04);
  }

  .stats-insight-card {
    border-radius: 1.15rem;
    padding: 1rem;
  }

  .stats-insight-good { border-color: rgba(16,185,129,.24); background: rgba(16,185,129,.075); }
  .stats-insight-bad { border-color: rgba(239,68,68,.24); background: rgba(239,68,68,.075); }
  .stats-insight-warn { border-color: rgba(245,158,11,.24); background: rgba(245,158,11,.075); }
  .stats-insight-main { border-color: rgba(178,74,242,.24); background: rgba(178,74,242,.075); }

  .stats-beginner-guide-pro {
    position: relative;
    overflow: hidden;
    border-radius: 1.8rem;
    border: 1px solid rgba(178,74,242,.18);
    background: linear-gradient(135deg, rgba(178,74,242,.075), rgba(255,255,255,.035) 42%, rgba(16,185,129,.045));
    padding: 1.25rem;
    box-shadow: 0 18px 46px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04);
  }

  .stats-beginner-guide-pro::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at top left, rgba(178,74,242,.10), transparent 34%), radial-gradient(circle at bottom right, rgba(16,185,129,.06), transparent 34%);
  }

  .stats-beginner-guide-pro > * {
    position: relative;
    z-index: 1;
  }

  .stats-reading-order-pro {
    display: grid;
    min-width: min(100%, 440px);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .65rem;
  }

  .stats-reading-order-pro span {
    border-radius: 999px;
    border: 1px solid rgba(178,74,242,.24);
    background: rgba(178,74,242,.10);
    padding: .65rem .85rem;
    color: #d6a0f8;
    font-size: .78rem;
    font-weight: 950;
    text-align: center;
  }

  .stat-definition-card-pro {
    border-radius: 1.25rem;
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(0,0,0,.24);
    padding: 1rem;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  }

  .stats-help-dot-pro {
    display: flex;
    height: 1.5rem;
    width: 1.5rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid rgba(178,74,242,.28);
    background: rgba(178,74,242,.12);
    color: #d6a0f8;
    font-size: .72rem;
    font-weight: 950;
  }

  .statistics-tabs-pro {
    display: inline-flex;
    flex-wrap: wrap;
    gap: .35rem;
    border-radius: 1.25rem;
    padding: .45rem;
  }

  .statistics-tab-pro {
    display: flex;
    align-items: center;
    gap: .5rem;
    border-radius: .95rem;
    padding: .75rem 1.15rem;
    color: #a1a1aa;
    font-size: .88rem;
    font-weight: 950;
    transition: all .2s ease;
  }

  .statistics-tab-pro:hover {
    background: rgba(178,74,242,.10);
    color: #fff;
  }

  .statistics-tab-pro-active {
    background: linear-gradient(135deg, rgba(178,74,242,.95), rgba(178,74,242,.78));
    color: #fff;
    box-shadow: 0 0 22px rgba(178,74,242,.22), inset 0 1px 0 rgba(255,255,255,.18);
  }

  .statistics-tab-icon-pro {
    display: inline-flex;
    height: 1.35rem;
    width: 1.35rem;
    align-items: center;
    justify-content: center;
    border-radius: .45rem;
    background: rgba(255,255,255,.08);
    font-size: .78rem;
  }

  .light-theme .stats-beginner-guide-pro,
  .light-theme .stat-definition-card-pro,
  .light-theme .statistics-hero-pro,
  .light-theme .statistics-filter-pro,
  .light-theme .statistics-status-strip-pro,
  .light-theme .statistics-status-strip-pro > div,
  .light-theme .statistics-command-main-pro,
  .light-theme .statistics-command-side-pro,
  .light-theme .stats-flow-step-pro,
  .light-theme .stats-hero-metric,
  .light-theme .stats-insight-card,
  .light-theme .statistics-tabs-pro {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.95) !important;
    box-shadow: 0 16px 38px rgba(15,23,42,.065) !important;
  }

  .light-theme .stats-beginner-guide-pro::before,
  .light-theme .statistics-hero-pro::before,
  .light-theme .statistics-command-main-pro::before,
  .light-theme .statistics-command-side-pro::before {
    background: radial-gradient(circle at top left, rgba(178,74,242,.055), transparent 32%), radial-gradient(circle at bottom right, rgba(16,185,129,.045), transparent 34%) !important;
  }

  .light-theme .stats-reading-order-pro span,
  .light-theme .stats-help-dot-pro {
    background: #faf5ff !important;
    border-color: rgba(178,74,242,.22) !important;
    color: #720cb0 !important;
  }

  .light-theme .statistics-filter-btn-pro {
    background: #faf5ff !important;
    border-color: rgba(178,74,242,.22) !important;
    color: #720cb0 !important;
    box-shadow: 0 8px 20px rgba(178,74,242,.08) !important;
  }

  .light-theme .statistics-status-strip-pro b,
  .light-theme .stats-flow-step-pro .font-black,
  .light-theme .stats-hero-metric .text-white,
  .light-theme .stats-insight-card .text-white {
    color: #111827 !important;
  }

  .light-theme .statistics-tab-pro {
    color: #64748b !important;
  }

  .light-theme .statistics-tab-pro:hover {
    background: #faf5ff !important;
    color: #720cb0 !important;
  }

  .light-theme .statistics-tab-pro-active,
  .light-theme .statistics-tab-pro-active * {
    color: #ffffff !important;
  }

  @media (max-width: 1024px) {
    .statistics-command-center-pro {
      grid-template-columns: 1fr;
    }
    .statistics-status-strip-pro {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .statistics-status-strip-pro {
      grid-template-columns: 1fr;
    }
    .statistics-tabs-pro {
      display: grid;
      grid-template-columns: 1fr;
      width: 100%;
    }
  }

  /* 10/10 Mistake Detector premium polish */
  .mistake-page-pro {
    --mistake-card: rgba(255,255,255,.055);
    --mistake-border: rgba(255,255,255,.10);
    --mistake-muted: #a1a1aa;
  }

  .mistake-page-header-pro {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 520px);
    gap: 1.25rem;
    align-items: end;
    border-bottom: 1px solid rgba(255,255,255,.08);
    padding-bottom: 1.5rem;
  }

  .mistake-page-icon-pro {
    display: flex;
    height: 3.25rem;
    width: 3.25rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: 1.1rem;
    border: 1px solid rgba(178,74,242,.32);
    background: rgba(178,74,242,.10);
    color: #d6a0f8;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
  }

  .mistake-filter-card-pro,
  .mistake-status-strip-pro {
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(255,255,255,.045);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  }

  .mistake-filter-card-pro {
    border-radius: 1.5rem;
    padding: 1rem;
  }

  .mistake-clear-btn-pro {
    min-height: 2.5rem;
    border-radius: .75rem;
    border: 1px solid rgba(178,74,242,.28);
    background: rgba(178,74,242,.10);
    color: #d6a0f8;
    font-size: .875rem;
    font-weight: 950;
    transition: all .2s ease;
  }

  .mistake-clear-btn-pro:hover {
    border-color: rgba(178,74,242,.55);
    background: rgba(178,74,242,.16);
    transform: translateY(-1px);
  }

  .mistake-status-strip-pro {
    margin-top: 1.25rem;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: .75rem;
    border-radius: 1.5rem;
    padding: .85rem;
  }

  .mistake-status-strip-pro > div {
    display: flex;
    min-height: 4rem;
    flex-direction: column;
    justify-content: center;
    gap: .35rem;
    border-radius: 1rem;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(0,0,0,.20);
    padding: .75rem .9rem;
  }

  .mistake-status-strip-pro span {
    font-size: .68rem;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .12em;
  }

  .mistake-status-strip-pro b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #fff;
    font-size: .95rem;
    font-weight: 950;
  }

  .mistake-page-divider-pro {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: .25rem 0;
    color: #a1a1aa;
    font-size: .72rem;
    font-weight: 950;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .mistake-page-divider-pro::before,
  .mistake-page-divider-pro::after {
    content: "";
    height: 1px;
    flex: 1;
    background: linear-gradient(to right, transparent, rgba(255,255,255,.12), transparent);
  }

  .mistake-page-divider-pro span {
    margin: 0 .9rem;
    border-radius: 999px;
    border: 1px solid rgba(178,74,242,.22);
    background: rgba(178,74,242,.08);
    padding: .35rem .7rem;
    color: #d6a0f8;
  }

  .mistake-coach-hero,
  .mistake-panel-clean,
  .mistake-guide-panel,
  .coach-summary-card,
  .reason-card-premium-force {
    backdrop-filter: blur(18px);
  }

  .mistake-coach-hero {
    border: 1px solid transparent !important;
    background:
      linear-gradient(135deg, #14071d 0%, #16081e 48%, #180d17 76%, #21130d 100%) padding-box,
      linear-gradient(135deg, rgba(178,74,242,.58) 0%, rgba(122,42,170,.48) 58%, rgba(132,76,36,.62) 100%) border-box !important;
    box-shadow: 0 18px 48px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.035) !important;
  }

  .mistake-coach-hero::before {
    background:
      radial-gradient(circle at 10% 0%, rgba(178,74,242,.09), transparent 34%),
      radial-gradient(circle at 100% 100%, rgba(123,69,31,.20), transparent 42%),
      linear-gradient(135deg, rgba(18,6,27,.98) 0%, rgba(20,7,27,.98) 52%, rgba(26,13,20,.98) 78%, rgba(31,18,12,.98) 100%) !important;
  }

  .mistake-panel-clean,
  .mistake-guide-panel {
    border-color: rgba(255,255,255,.10) !important;
    background: linear-gradient(135deg, rgba(255,255,255,.045), rgba(0,0,0,.28)) !important;
    box-shadow: 0 18px 46px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.04) !important;
  }

  .mistake-panel-clean::before,
  .mistake-guide-panel::before {
    opacity: .55 !important;
  }

  .coach-summary-card,
  .coach-flow-step,
  .guide-mini-card,
  .mini-coach-metric,
  .issue-clean-card,
  .fix-step-card {
    border-color: rgba(255,255,255,.10) !important;
    background: rgba(255,255,255,.045) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;
  }

  .issue-clean-card-active,
  .issue-clean-card:hover {
    border-color: rgba(239,68,68,.38) !important;
    background: rgba(239,68,68,.08) !important;
    box-shadow: 0 16px 34px rgba(239,68,68,.10) !important;
  }

  .fix-step-card {
    border-color: rgba(16,185,129,.24) !important;
    background: rgba(16,185,129,.075) !important;
  }

  .mistake-detector-clean .rounded-2xl,
  .mistake-detector-clean .rounded-\[1\.4rem\],
  .mistake-detector-clean .rounded-\[2rem\] {
    box-shadow: none;
  }

  .mistake-detector-clean .text-5xl,
  .mistake-detector-clean .text-4xl,
  .mistake-detector-clean .text-3xl {
    letter-spacing: -0.04em;
  }

  .light-theme .mistake-page-pro {
    --mistake-card: #ffffff;
    --mistake-border: rgba(226,232,240,.95);
    --mistake-muted: #64748b;
  }

  .light-theme .mistake-page-header-pro {
    border-bottom-color: rgba(226,232,240,.95) !important;
  }

  .light-theme .mistake-page-icon-pro,
  .light-theme .mistake-filter-card-pro,
  .light-theme .mistake-status-strip-pro,
  .light-theme .mistake-status-strip-pro > div,
  .light-theme .mistake-clear-btn-pro {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.95) !important;
    color: #111827 !important;
    box-shadow: 0 12px 30px rgba(15,23,42,.055) !important;
  }

  .light-theme .mistake-page-icon-pro {
    color: #9e1aef !important;
    background: #faf5ff !important;
  }

  .light-theme .mistake-clear-btn-pro {
    color: #720cb0 !important;
  }

  .light-theme .mistake-status-strip-pro b {
    color: #111827 !important;
  }

  .light-theme .mistake-page-divider-pro::before,
  .light-theme .mistake-page-divider-pro::after {
    background: linear-gradient(to right, transparent, rgba(148,163,184,.35), transparent) !important;
  }

  .light-theme .mistake-page-divider-pro span {
    background: #faf5ff !important;
    border-color: rgba(178,74,242,.22) !important;
    color: #720cb0 !important;
  }

  .light-theme .mistake-coach-hero,
  .light-theme .mistake-panel-clean,
  .light-theme .mistake-guide-panel,
  .light-theme .coach-summary-card,
  .light-theme .coach-flow-step,
  .light-theme .guide-mini-card,
  .light-theme .mini-coach-metric,
  .light-theme .issue-clean-card,
  .light-theme .fix-step-card {
    background: #ffffff !important;
    border-color: rgba(226,232,240,.95) !important;
    box-shadow: 0 16px 38px rgba(15,23,42,.065) !important;
  }

  .light-theme .mistake-coach-hero::before,
  .light-theme .mistake-panel-clean::before {
    background: radial-gradient(circle at top left, rgba(178,74,242,.055), transparent 32%), radial-gradient(circle at bottom right, rgba(16,185,129,.045), transparent 34%) !important;
  }

  .light-theme .issue-clean-card-active,
  .light-theme .issue-clean-card:hover {
    background: #fff7f7 !important;
    border-color: rgba(239,68,68,.34) !important;
    box-shadow: 0 18px 38px rgba(239,68,68,.08) !important;
  }

  .light-theme .fix-step-card {
    background: #f0fdf4 !important;
    border-color: rgba(16,185,129,.22) !important;
  }

  .light-theme .custom-select-menu,
  .light-theme .trade-context-modern .custom-select-menu {
    background: #ffffff !important;
    border-color: rgba(203,213,225,.95) !important;
    box-shadow: 0 18px 44px rgba(15,23,42,.14) !important;
  }

  .light-theme .custom-select-menu .custom-select-option,
  .light-theme .trade-context-modern .custom-select-option {
    background: #ffffff !important;
    color: #111827 !important;
    box-shadow: none !important;
  }

  .light-theme .custom-select-menu .custom-select-option span,
  .light-theme .trade-context-modern .custom-select-option span {
    color: inherit !important;
  }

  .light-theme .custom-select-menu .custom-select-option:hover,
  .light-theme .custom-select-menu .custom-select-active,
  .light-theme .trade-context-modern .custom-select-option:hover,
  .light-theme .trade-context-modern .custom-select-active {
    background: #f8fafc !important;
    color: #720cb0 !important;
    border-color: rgba(178,74,242,.24) !important;
  }

  .light-theme .date-picker-popover .date-picker-day-current {
    background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%) !important;
    color: #ffffff !important;
    border-color: rgba(178,74,242,.42) !important;
  }

  .light-theme .date-picker-popover .date-picker-day-current .date-picker-day-number {
    color: #ffffff !important;
  }

  .light-theme .date-picker-popover .date-picker-day-selected {
    background: linear-gradient(135deg, #9333ea 0%, #b24bf3 100%) !important;
    color: #ffffff !important;
    border-color: rgba(147,51,234,.74) !important;
    box-shadow: 0 10px 24px rgba(147,51,234,.24) !important;
  }

  .light-theme .date-picker-popover .date-picker-day-muted {
    background: #faf5ff !important;
    color: #ffffff !important;
    opacity: .58 !important;
  }

  .light-theme .multi-choice-active,
  .light-theme .strategy-choice-active {
    color: #111827 !important;
  }

  .light-theme .multi-choice-active *,
  .light-theme .strategy-choice-active * {
    color: #111827 !important;
  }

  @media (max-width: 768px) {
    main.app-main {
      padding-left: .85rem !important;
      padding-right: .85rem !important;
      padding-bottom: calc(6.75rem + env(safe-area-inset-bottom, 0px)) !important;
    }

    .mobile-header-pro {
      position: sticky !important;
      top: .75rem !important;
      z-index: 35 !important;
      border-radius: 1.15rem !important;
      padding: .8rem .9rem !important;
      box-shadow: 0 16px 34px rgba(0,0,0,.28), 0 0 22px rgba(178,74,242,.12) !important;
    }

    .mobile-add-trade-button {
      min-height: 2.35rem !important;
      white-space: nowrap !important;
    }

    .mobile-bottom-nav {
      border-radius: 1.15rem 1.15rem 0 0 !important;
      box-shadow: 0 -18px 45px rgba(0,0,0,.42), 0 -1px 0 rgba(178,74,242,.22) !important;
    }

    .mobile-nav-fab {
      border: 1px solid rgba(255,255,255,.14) !important;
      background: linear-gradient(135deg, #d6a0f8, #b24bf3 48%, #7c3aed) !important;
      box-shadow: 0 16px 34px rgba(178,74,242,.34), 0 0 0 6px rgba(0,0,0,.65) !important;
    }

    .fullscreen-toggle-button {
      height: 2.55rem !important;
      width: 2.55rem !important;
      right: .85rem !important;
      top: .85rem !important;
      border-radius: 1rem !important;
    }

    .dashboard-hero,
    .dashboard-performance-card,
    .dashboard-recent-card,
    .dashboard-activity-card,
    .journal-hero,
    .journal-search-panel,
    .journal-sort-panel,
    .onboarding-checklist,
    .trade-modal-panel {
      border-radius: 1.15rem !important;
    }

    .dashboard-hero,
    .dashboard-performance-card,
    .dashboard-recent-card,
    .dashboard-activity-card,
    .journal-hero,
    .journal-search-panel,
    .journal-sort-panel {
      padding: 1rem !important;
    }

    .dashboard-hero h1,
    .journal-hero h1 {
      font-size: clamp(1.65rem, 8vw, 2.15rem) !important;
      line-height: 1.06 !important;
    }

    .dashboard-hero .flex.flex-wrap.gap-3,
    .journal-hero .flex.flex-wrap.gap-2 {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      width: 100% !important;
    }

    .dashboard-hero .flex.flex-wrap.gap-3 > *,
    .journal-hero .flex.flex-wrap.gap-2 > * {
      justify-content: center !important;
      min-height: 2.75rem !important;
      width: 100% !important;
    }

    .journal-action-btn,
    .journal-add-btn {
      min-width: 0 !important;
      padding-inline: .75rem !important;
      font-size: .76rem !important;
    }

    .journal-search-panel .flex.flex-col.gap-4.lg\\:flex-row {
      gap: .75rem !important;
    }

    .date-picker-popover,
    .journal-search-panel .custom-select-menu,
    .trade-modal-panel .custom-select-menu {
      max-width: calc(100vw - 2rem) !important;
    }

    .journal-sort-panel > .flex {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: .9rem !important;
    }

    .journal-sort-panel .flex.items-center.gap-3 {
      display: grid !important;
      grid-template-columns: auto minmax(0, 1fr) auto !important;
      width: 100% !important;
    }

    .journal-sort-panel .w-36 {
      width: 100% !important;
    }

    .trade-modal-shell {
      align-items: stretch !important;
      padding: 0 !important;
    }

    .trade-modal-panel {
      min-height: 100dvh !important;
      width: 100% !important;
      max-width: none !important;
      border-left: 0 !important;
      border-right: 0 !important;
      border-radius: 0 !important;
      padding: 1rem !important;
    }

    .trade-modal-panel .grid.md\\:grid-cols-2,
    .trade-modal-panel .grid.md\\:grid-cols-2 > *,
    .trade-modal-panel .md\\:col-span-2 {
      grid-column: auto !important;
    }

    .trade-modal-panel .mt-6.flex.items-center.justify-between {
      position: sticky !important;
      bottom: 0 !important;
      z-index: 20 !important;
      margin-inline: -1rem !important;
      padding: .9rem 1rem calc(.9rem + env(safe-area-inset-bottom, 0px)) !important;
      background: rgba(0,0,0,.92) !important;
      backdrop-filter: blur(16px) !important;
    }

    .trade-modal-panel .mt-6.flex.items-center.justify-between > button {
      min-height: 2.8rem !important;
      flex: 1 !important;
      justify-content: center !important;
    }

    .onboarding-checklist {
      padding: 1rem !important;
    }

    .onboarding-checklist .grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 420px) {
    .mobile-header-pro {
      margin-bottom: 1rem !important;
    }

    .mobile-header-pro .text-xl {
      font-size: 1.05rem !important;
    }

    .mobile-bottom-nav {
      padding-bottom: calc(.55rem + env(safe-area-inset-bottom, 0px)) !important;
    }

    .mobile-bottom-nav button {
      border-radius: .85rem !important;
    }

    .mobile-bottom-nav svg {
      height: 16px !important;
      width: 16px !important;
    }

    .mobile-bottom-nav span {
      font-size: 8px !important;
    }

    .mobile-nav-fab {
      top: -1.55rem !important;
      height: 3rem !important;
      width: 3rem !important;
      border-radius: 1rem !important;
    }

    .dashboard-hero .flex.flex-wrap.gap-3,
    .journal-hero .flex.flex-wrap.gap-2 {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 1024px) {
    .mistake-page-header-pro {
      grid-template-columns: 1fr;
      align-items: start;
    }
    .mistake-status-strip-pro {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .mistake-page-header-pro .flex.items-center.gap-3 {
      align-items: flex-start;
    }
    .mistake-status-strip-pro {
      grid-template-columns: 1fr;
    }
    .mistake-filter-card-pro .grid {
      grid-template-columns: 1fr !important;
    }
  }

`;

const starterTrades = [
  {
    id: 1,
    createdAt: 1,
    date: "2026-05-15",
    pair: "MNQ",
    direction: "BUY",
    quantity: 2,
    setup: "Liquidity Sweep",
    session: "NY-PM",
    result: "Win",
    emotion: "Calm",
    risk: 200,
    pnl: 590,
    notes: "Clean liquidity sweep. Waited for confirmation before entry.",
    mistake: "None",
    screenshots: [],
    tags: ["result:win", "A+ Setup", "Liquidity"],
  },
];

const defaultAccount = {
  id: "acc-default",
  name: "My Account",
  type: "Demo Account",
  currency: "USD",
  balance: 10000,
  description: "My trading account",
};

const ACCOUNT_TYPE_OPTIONS = [
  { emoji: "💰", type: "Live Account", description: "Real money trading account" },
  { emoji: "🎯", type: "Demo Account", description: "Practice trading with virtual money" },
  { emoji: "📈", type: "Backtesting", description: "Historical strategy testing" },
  { emoji: "🏆", type: "Funded Account", description: "Prop firm or funded trading account" },
  { emoji: "📋", type: "Paper Trading", description: "Simulated trading environment" },
];

function getAccountTypeOption(type) {
  return ACCOUNT_TYPE_OPTIONS.find((option) => option.type === type) || ACCOUNT_TYPE_OPTIONS[1];
}

const createAccountPlaceholder = {
  ...defaultAccount,
  id: "create-account",
  name: "Create account",
  type: "No account yet",
  currency: "USD",
  balance: 0,
  description: "Create your first trading account",
  isPlaceholder: true,
};

function readTradingPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(TRADING_PREFERENCES_KEY) || "null") || {};
    const savedRisk = Number(saved.defaultRisk);
    return {
      timezone: normalizeTimezoneValue(saved.timezone || "Asia/Tbilisi"),
      defaultSession: TRADING_SESSIONS.includes(saved.defaultSession) ? saved.defaultSession : "",
      defaultRisk: Number.isFinite(savedRisk) && savedRisk > 0 ? String(savedRisk) : "",
    };
  } catch {
    return { timezone: "Asia/Tbilisi", defaultSession: "", defaultRisk: "" };
  }
}

const emptyForm = {
  symbol: "",
  direction: "Buy",
  quantity: "",
  pnl: "",
  risk: "",
  date: formatDateKey(new Date()),
  entryTime: "",
  exitTime: "",
  currency: "USD",
  session: "Select trading session",
  strategy: "",
  result: "Win",
  tags: "result:win",
  emotion: "Calm",
  mistake: "None",
  notes: "",
  whatWentWell: "",
  whatWentWrong: "",
  ruleFollowed: "Yes",
  entryTiming: "On Time",
  confirmation: "Yes",
  ruleBroken: "None",
  marketCondition: "Trending",
  setupQuality: "B",
  entryQuality: "3",
  exitQuality: "3",
  screenshots: [],
};

function createEmptyTradeForm(dateOverride) {
  const preferences = readTradingPreferences();
  return {
    ...emptyForm,
    date: typeof dateOverride === "string" ? dateOverride : formatDateKey(new Date()),
    session: preferences.defaultSession || "Select trading session",
    risk: preferences.defaultRisk,
    screenshots: [],
  };
}

const nav = [
  [LayoutDashboard, "Dashboard"],
  [BookOpen, "Journal"],
  [Calendar, "Calendar"],
  [BarChart3, "Statistics"],
  [Target, "Mistake Detector"],
];

const quotes = [
  "Success is where preparation and opportunity meet.",
  "Discipline is the bridge between goals and accomplishment.",
  "The market rewards patience and punishes greed.",
  "Your only limit is your mindset. Trade with intention.",
  "Every expert was once a beginner. Keep learning.",
  "Today's preparation determines tomorrow's achievement.",
];

const routineItems = [
  { id: "news", label: "News checked", detail: "High impact events reviewed", icon: "⚡" },
  { id: "bias", label: "Market bias confirmed", detail: "Daily/HTF direction is clear", icon: "🎯" },
  { id: "liquidity", label: "Liquidity levels marked", detail: "PDH/PDL, Asia high/low, equal highs/lows", icon: "💧" },
  { id: "setup", label: "Valid setup only", detail: "Entry matches your trading model", icon: "✅" },
  { id: "risk", label: "Risk defined", detail: "Stop loss, target and max loss prepared", icon: "$" },
  { id: "emotion", label: "Emotion check", detail: "No FOMO, revenge, or overtrading", icon: "🧠" },
];

function normalizeScreenshots(value) {
  const candidates = [];
  if (Array.isArray(value?.screenshots)) candidates.push(...value.screenshots);
  if (value?.screenshot) candidates.push(value.screenshot);
  if (value?.screenshotUrl) candidates.push(value.screenshotUrl);
  if (value?.image) candidates.push(value.image);
  if (value?.imageUrl) candidates.push(value.imageUrl);
  if (value?.photo) candidates.push(value.photo);
  return candidates.filter(Boolean).slice(0, MAX_SCREENSHOTS);
}

function normalizeTags(value) {
  if (Array.isArray(value?.tags)) return value.tags.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof value?.tags === "string") return value.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  return [];
}

function splitMultiValues(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function joinMultiValues(values = []) {
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))].join(", ");
}

function getResultTagFromPnl(value) {
  return resultToTag(getResultFromPnl(value));
}

function syncResultTag(tagsValue, pnl, result) {
  const tags = normalizeTags({ tags: tagsValue }).filter((tag) => !String(tag).toLowerCase().startsWith("result:"));
  return [resultToTag(normalizeTradeResult(result) || getResultFromPnl(pnl)), ...tags].join(", ");
}

function parseAnimatedValue(value) {
  if (typeof value === "number") {
    return {
      canAnimate: true,
      target: value,
      formatter: (next) => Number(next).toLocaleString("en-US", { maximumFractionDigits: Number.isInteger(value) ? 0 : 1 }),
    };
  }

  const text = String(value ?? "").trim();
  const compact = text.replaceAll(",", "");
  const isMoney = compact.startsWith("$") || compact.startsWith("-$");
  const isPercent = compact.endsWith("%");
  const numberText = compact.replace("$", "").replace("%", "");
  const target = Number(numberText);

  if (Number.isFinite(target) && compact !== "") {
    if (isMoney) return { canAnimate: true, target, formatter: formatMoney };
    if (isPercent) {
      const decimals = numberText.includes(".") ? numberText.split(".")[1].length : 0;
      return { canAnimate: true, target, formatter: (next) => `${Number(next).toFixed(decimals)}%` };
    }
    const decimals = numberText.includes(".") ? numberText.split(".")[1].length : 0;
    return {
      canAnimate: true,
      target,
      formatter: (next) => Number(next).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    };
  }

  return { canAnimate: false, target: 0, formatter: () => text };
}

function AnimatedValue({ value, className = "" }) {
  const parsed = useMemo(() => parseAnimatedValue(value), [value]);
  const [display, setDisplay] = useState(String(value ?? ""));

  useEffect(() => {
    if (!parsed.canAnimate || !Number.isFinite(parsed.target)) {
      setDisplay(String(value ?? ""));
      return undefined;
    }

    const duration = 1250;
    const startTime = performance.now();
    const endValue = parsed.target;
    let frameId;

    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = endValue * eased;
      setDisplay(parsed.formatter(current));
      if (progress < 1) frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, parsed]);

  return <span className={`animated-number ${className}`}>{display}</span>;
}

function RotatingPnlValue({ pnl, balance }) {
  const [mode, setMode] = useState("money");
  const percent = Number(balance || 0) ? (Number(pnl || 0) / Number(balance || 1)) * 100 : 0;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMode((current) => (current === "money" ? "percent" : "money"));
    }, 13000);
    return () => window.clearInterval(intervalId);
  }, []);

  const value = mode === "money" ? formatMoney(pnl) : `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
  const label = mode === "money" ? "USD" : "ACCOUNT";

  return (
    <span className="pnl-switcher" key={mode}>
      <AnimatedValue value={value} />
      <span className="pnl-switcher-label">{label}</span>
    </span>
  );
}

function getTradeDateKey(trade) {
  if (!trade?.date) return "";
  const raw = String(trade.date).trim();
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(raw)) return raw;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? raw : formatDateKey(date);
}

function getEconomicEventDateKey(event) {
  if (event?.dateKey) return String(event.dateKey);
  const raw = String(event?.date || "").trim();
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(raw)) return raw.slice(0, 10);
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? "" : formatDateKey(date);
}

function getEventsForDate(events = [], dateKey) {
  if (!dateKey) return [];
  return (Array.isArray(events) ? events : []).filter((event) => getEconomicEventDateKey(event) === dateKey);
}

function groupEconomicEventsByDate(events = []) {
  return (Array.isArray(events) ? events : []).reduce((map, event) => {
    const dateKey = getEconomicEventDateKey(event);
    if (!dateKey) return map;
    if (!map[dateKey]) map[dateKey] = [];
    map[dateKey].push(event);
    return map;
  }, {});
}

function getEconomicWeekRange(events = [], week) {
  const keys = (Array.isArray(events) ? events : [])
    .filter((event) => event.week === week)
    .map((event) => getEconomicEventDateKey(event))
    .filter(Boolean)
    .sort();
  if (!keys.length) return "";
  return `${formatEconomicRangeDate(keys[0])} - ${formatEconomicRangeDate(keys[keys.length - 1])}`;
}

function getEconomicCalendarWeekRangeLabel(week) {
  const now = new Date();
  const day = now.getDay();
  const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  const offsets = { last: -7, this: 0, next: 7 };
  const start = new Date(sunday);
  start.setDate(sunday.getDate() + (offsets[week] || 0));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${formatEconomicRangeDate(formatDateKey(start))} - ${formatEconomicRangeDate(formatDateKey(end))}`;
}

function getPrimaryEventImpact(events = []) {
  return (
    events.find((event) => getEventImpactTone(event.impact) === "red") ||
    events.find((event) => getEventImpactTone(event.impact) === "zinc") ||
    events.find((event) => getEventImpactTone(event.impact) === "amber") ||
    events[0]
  )?.impact || "Low";
}

function getTradeCurrencyCodes(trade) {
  const raw = `${trade?.pair || ""} ${trade?.symbol || ""} ${trade?.instrument || ""}`.toUpperCase();
  const codes = ["USD", "EUR", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF", "CNY", "CNH", "HKD", "SGD", "MXN", "SEK", "NOK", "DKK", "PLN", "TRY", "ZAR", "BRL", "INR"];
  return codes.filter((code) => raw.includes(code));
}

function getPrimaryNewsEvent(events = [], preferredCurrencies = []) {
  const preferred = new Set(preferredCurrencies);
  const matching = preferred.size ? events.filter((event) => preferred.has(String(event.country || "").toUpperCase())) : [];
  const ordered = matching.length ? matching : events;
  return (
    ordered.find((event) => getEventImpactTone(event.impact) === "red") ||
    ordered.find((event) => getEventImpactTone(event.impact) === "zinc") ||
    ordered.find((event) => getEventImpactTone(event.impact) === "amber") ||
    ordered[0] ||
    null
  );
}

function addNewsAggregate(bucket, key, values) {
  if (!key) return;
  if (!bucket[key]) bucket[key] = { ...values, count: 0, pnl: 0, trades: 0, wins: 0, losses: 0, breakEvens: 0, grossWin: 0, grossLoss: 0 };
  bucket[key].count += Number(values.count || 0);
  bucket[key].pnl += Number(values.pnl || 0);
  bucket[key].trades += Number(values.trades || 0);
  bucket[key].wins += Number(values.wins || 0);
  bucket[key].losses += Number(values.losses || 0);
  bucket[key].breakEvens += Number(values.breakEvens || 0);
  bucket[key].grossWin += Number(values.grossWin || 0);
  bucket[key].grossLoss += Number(values.grossLoss || 0);
}

function getNewsPerformanceStats(trades = [], events = []) {
  const groupedTrades = groupTradesByDate(trades);
  const eventsByDate = (Array.isArray(events) ? events : []).reduce((groups, event) => {
    const dateKey = getEconomicEventDateKey(event);
    if (!dateKey) return groups;
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(event);
    return groups;
  }, {});
  const rows = [];
  const byEvent = {};
  const byCurrency = {};
  const byImpact = {};

  Object.entries(groupedTrades).forEach(([dateKey, dayTrades]) => {
    const dayEvents = eventsByDate[dateKey] || [];
    if (!dayEvents.length || !dayTrades.length) return;
    const dayCurrencies = Array.from(new Set(dayTrades.flatMap(getTradeCurrencyCodes)));
    const event = getPrimaryNewsEvent(dayEvents, dayCurrencies);
    if (!event) return;
    const stats = summarizeTrades(dayTrades);
    const eventKey = `${event.country}-${event.title}`;
    addNewsAggregate(byEvent, eventKey, {
      name: event.title,
      country: event.country,
      impact: event.impact,
      count: 1,
      pnl: stats.pnl,
      trades: stats.count,
      wins: stats.wins,
      losses: stats.losses,
      breakEvens: stats.breakEvens || 0,
      grossWin: dayTrades.reduce((total, trade) => total + Math.max(0, Number(trade.pnl || 0)), 0),
      grossLoss: dayTrades.reduce((total, trade) => total + Math.min(0, Number(trade.pnl || 0)), 0),
    });

    const impactKey = event.impact || getPrimaryEventImpact(dayEvents);
    addNewsAggregate(byImpact, impactKey, {
      name: impactKey,
      count: 1,
      pnl: stats.pnl,
      trades: stats.count,
      wins: stats.wins,
      losses: stats.losses,
      breakEvens: stats.breakEvens || 0,
      grossWin: dayTrades.reduce((total, trade) => total + Math.max(0, Number(trade.pnl || 0)), 0),
      grossLoss: dayTrades.reduce((total, trade) => total + Math.min(0, Number(trade.pnl || 0)), 0),
    });

    dayTrades.forEach((trade) => {
      const tradePnl = Number(trade.pnl || 0);
      const tradeCurrencies = getTradeCurrencyCodes(trade);
      const eventCurrencies = new Set(dayEvents.map((item) => String(item.country || "").toUpperCase()).filter(Boolean));
      const matchedCurrencies = tradeCurrencies.filter((currency) => eventCurrencies.has(currency));
      const currencyKeys = matchedCurrencies.length ? matchedCurrencies : [String(event.country || "").toUpperCase()].filter(Boolean);
      Array.from(new Set(currencyKeys)).forEach((currency) => {
        addNewsAggregate(byCurrency, currency, {
          name: currency,
          count: 1,
          pnl: tradePnl,
          trades: 1,
          wins: tradePnl > 0 ? 1 : 0,
          losses: tradePnl < 0 ? 1 : 0,
          breakEvens: tradePnl === 0 ? 1 : 0,
          grossWin: Math.max(0, tradePnl),
          grossLoss: Math.min(0, tradePnl),
        });
      });
    });

    rows.push({ event, dateKey, events: dayEvents, eventCount: dayEvents.length, ...stats });
  });

  rows.sort((a, b) => Number(b.pnl || 0) - Number(a.pnl || 0));
  const sortRows = (object) => Object.values(object).sort((a, b) => Number(b.pnl || 0) - Number(a.pnl || 0));
  return {
    rows,
    totalEventCount: (Array.isArray(events) ? events : []).length,
    totalNewsTrades: rows.reduce((total, row) => total + Number(row.count || 0), 0),
    best: rows[0] || null,
    worst: [...rows].sort((a, b) => Number(a.pnl || 0) - Number(b.pnl || 0))[0] || null,
    eventRows: sortRows(byEvent),
    currencyRows: sortRows(byCurrency),
    impactRows: sortRows(byImpact),
  };
}

function getTradeOrderValue(trade) {
  const createdAt = Number(trade?.createdAt || 0);
  if (createdAt) return createdAt;
  const numericId = Number(trade?.id || 0);
  return Number.isNaN(numericId) ? 0 : numericId;
}

function sortTradesChronologically(trades = []) {
  return [...(Array.isArray(trades) ? trades : [])].sort((a, b) => {
    const dateCompare = String(getTradeDateKey(a)).localeCompare(String(getTradeDateKey(b)));
    if (dateCompare) return dateCompare;
    return getTradeOrderValue(a) - getTradeOrderValue(b);
  });
}

function getTradeRR(trade) {
  const risk = Number(trade?.risk || 0);
  const pnl = Number(trade?.pnl || 0);
  return risk ? pnl / risk : 0;
}

function getResultFromPnl(value) {
  const pnl = Number(value || 0);
  if (pnl > 0) return "Win";
  if (pnl < 0) return "Loss";
  return "Break Even";
}

const TRADE_RESULT_OPTIONS = ["Win", "Loss", "Break Even", "Partial"];

function normalizeTradeResult(value) {
  const raw = String(value || "").trim();
  const normalized = raw.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (["win", "won", "profit", "profitable"].includes(normalized)) return "Win";
  if (["loss", "lose", "lost"].includes(normalized)) return "Loss";
  if (["break even", "breakeven", "break", "be"].includes(normalized)) return "Break Even";
  if (["partial", "partially", "partial win", "partial loss"].includes(normalized)) return "Partial";
  return "";
}

function resultToTag(result) {
  const normalized = normalizeTradeResult(result) || "Break Even";
  return `result:${normalized.toLowerCase().replace(/\s+/g, "-")}`;
}

function getTradeResult(trade) {
  const direct = normalizeTradeResult(trade?.result || trade?.outcome);
  if (direct) return direct;
  const tagResult = normalizeTags(trade).find((tag) => normalizeTradeResult(String(tag).replace(/^result:/i, "")));
  if (tagResult) return normalizeTradeResult(String(tagResult).replace(/^result:/i, ""));
  return getResultFromPnl(trade?.pnl);
}

function getResultTone(result) {
  const normalized = normalizeTradeResult(result) || result;
  if (normalized === "Win") return "emerald";
  if (normalized === "Loss") return "red";
  if (normalized === "Partial") return "fuchsia";
  return "amber";
}

function isBreakEvenTrade(trade) {
  return Number(trade?.pnl || 0) === 0;
}

function getTradeResultClass(result) {
  const normalized = normalizeTradeResult(result) || "Break Even";
  if (normalized === "Win") return "border-transparent bg-transparent text-emerald-400";
  if (normalized === "Loss") return "border-transparent bg-transparent text-red-400";
  if (normalized === "Partial") return "border-transparent bg-transparent text-fuchsia-300";
  return "border-transparent bg-transparent text-amber-400";
}

function getTradeDirectionClass(direction) {
  return "border-white/20 bg-white/10 text-white";
}

function createTradeFromForm(form, existingId, account, existingTrade = null) {
  const pnl = Number(form.pnl || 0);
  const timestamp = Number(existingTrade?.createdAt || form.createdAt || 0) || Date.now();
  return {
    id: existingId || existingTrade?.id || timestamp,
    createdAt: timestamp,
    accountId: account?.id || defaultAccount.id,
    accountName: account?.name || "v",
    accountType: account?.type || "Demo Account",
    accountCurrency: account?.currency || "USD",
    date: form.date,
    entryTime: form.entryTime || "",
    exitTime: form.exitTime || "",
    currency: form.currency || account?.currency || "USD",
    pair: String(form.symbol || "").toUpperCase(),
    direction: String(form.direction || "Buy").toUpperCase(),
    quantity: Number(form.quantity || 0),
    setup: form.strategy || "Manual Trade",
    session: form.session,
    result: normalizeTradeResult(form.result) || getResultFromPnl(pnl),
    emotion: form.emotion,
    risk: (() => {
      const rawRisk = Number(form.risk || 0);
      if (form.currency === "%" && rawRisk > 0) {
        const bal = Number(account?.balance || 0);
        return bal > 0 ? (rawRisk / 100) * bal : rawRisk;
      }
      return rawRisk;
    })(),
    pnl,
    notes: form.notes,
    whatWentWell: form.whatWentWell || "",
    whatWentWrong: form.whatWentWrong || "",
    ruleFollowed: form.ruleFollowed || "Yes",
    entryTiming: form.entryTiming || "On Time",
    confirmation: form.confirmation || "Yes",
    ruleBroken: form.ruleBroken || "None",
    marketCondition: form.marketCondition || "Trending",
    setupQuality: form.setupQuality || existingTrade?.setupQuality || "",
    entryQuality: Number(form.entryQuality || 0),
    exitQuality: Number(form.exitQuality || 0),
    mistake: form.mistake || "None",
    screenshots: normalizeScreenshots(form),
    tags: normalizeTags(form),
  };
}

function formFromTrade(trade) {
  return {
    symbol: trade.pair || "",
    direction: trade.direction === "SELL" ? "Sell" : "Buy",
    quantity: String(trade.quantity ?? ""),
    pnl: String(trade.pnl ?? ""),
    risk: String(trade.risk ?? ""),
    date: trade.date || "",
    entryTime: trade.entryTime || "",
    exitTime: trade.exitTime || "",
    currency: trade.currency || trade.accountCurrency || "USD",
    session: trade.session || "",
    strategy: trade.setup || "",
    result: getTradeResult(trade),
    tags: normalizeTags(trade).join(", "),
    emotion: trade.emotion || "",
    mistake: trade.mistake || "None",
    notes: trade.notes || "",
    whatWentWell: trade.whatWentWell || "",
    whatWentWrong: trade.whatWentWrong || "",
    ruleFollowed: trade.ruleFollowed || "Yes",
    entryTiming: trade.entryTiming || "On Time",
    confirmation: trade.confirmation || "Yes",
    ruleBroken: trade.ruleBroken || "None",
    marketCondition: trade.marketCondition || "Trending",
    setupQuality: trade.setupQuality || "",
    entryQuality: String(trade.entryQuality ?? "3"),
    exitQuality: String(trade.exitQuality ?? "3"),
    screenshots: normalizeScreenshots(trade),
  };
}

function summarizeTrades(trades = []) {
  const safe = Array.isArray(trades) ? trades : [];
  const pnl = safe.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
  const wins = safe.filter((trade) => getTradeResult(trade) === "Win").length;
  const losses = safe.filter((trade) => getTradeResult(trade) === "Loss").length;
  const breakEvens = safe.filter((trade) => getTradeResult(trade) === "Break Even").length;
  const partials = safe.filter((trade) => getTradeResult(trade) === "Partial").length;
  const decisive = wins + losses + partials;
  return { count: safe.length, pnl, wins, losses, breakEvens, partials, decisive, winRate: decisive ? ((wins + partials) / decisive) * 100 : 0, breakEvenRate: safe.length ? (breakEvens / safe.length) * 100 : 0, partialRate: safe.length ? (partials / safe.length) * 100 : 0 };
}

function groupTradesByDate(trades = []) {
  return trades.reduce((groups, trade) => {
    const key = getTradeDateKey(trade);
    if (!key) return groups;
    if (!groups[key]) groups[key] = [];
    groups[key].push(trade);
    return groups;
  }, {});
}

function getSortedTradeDateGroups(trades = []) {
  return Object.entries(groupTradesByDate(trades)).sort(([dateA], [dateB]) => dateA.localeCompare(dateB));
}

function getDailyPerformanceSeries(trades = [], mode = "EquityCurve") {
  if (mode === "DailyP&L") {
    return getSortedTradeDateGroups(trades).map(([date, dayTrades]) => ({
      date,
      chartKey: date,
      value: summarizeTrades(dayTrades).pnl,
    }));
  }

  const orderedTrades = sortTradesChronologically(trades);
  const points = [];
  let cumulativePnl = 0;
  const cumulativeTrades = [];

  if (orderedTrades.length) {
    const firstDate = getTradeDateKey(orderedTrades[0]);
    points.push({ date: firstDate, chartKey: `${firstDate}-start`, tradeNumber: 0, value: 0 });
  }

  orderedTrades.forEach((trade, index) => {
    const date = getTradeDateKey(trade);
    cumulativePnl += Number(trade.pnl || 0);
    cumulativeTrades.push(trade);
    const cumulativeSummary = summarizeTrades(cumulativeTrades);

    points.push({
      date,
      chartKey: `${date || "trade"}-${index + 1}`,
      tradeNumber: index + 1,
      value: mode === "WinRate" ? Math.round(cumulativeSummary.winRate * 10) / 10 : cumulativePnl,
    });
  });

  return points;
}

function getCalendarCells(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const firstWeekday = firstDay.getDay();
  const mondayOffset = firstWeekday === 0 ? -6 : 1 - firstWeekday;
  const start = new Date(year, monthIndex, 1 + mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { key: formatDateKey(date), day: date.getDate(), dayIndex: date.getDay(), isCurrentMonth: date.getMonth() === monthIndex };
  });
}

function getLastTradingDays(count = 20) {
  const weeks = Math.ceil(count / 5);
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() + mondayOffset);
  const start = new Date(currentWeekMonday);
  start.setDate(currentWeekMonday.getDate() - (weeks - 1) * 7);
  const days = [];
  for (let week = 0; week < weeks; week += 1) {
    for (let weekday = 0; weekday < 5; weekday += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + weekday);
      days.push({ key: formatDateKey(date), weekday });
    }
  }
  return days.slice(-count);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeImageToDataUrl(file, maxSize = 512, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadScreenshotsForTrade(event, form, setForm) {
  const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
  if (!files.length) return;
  const current = normalizeScreenshots(form);
  const slots = Math.max(MAX_SCREENSHOTS - current.length, 0);
  if (slots <= 0) return;
  // Resize to max 1200px and compress to JPEG 80% — keeps charts readable but reduces file size ~90%
  const uploaded = (await Promise.all(
    files.slice(0, slots).map((file) => resizeImageToDataUrl(file, 1200, 0.80).catch(() => null))
  )).filter(Boolean);
  setForm({ ...form, screenshots: [...current, ...uploaded].slice(0, MAX_SCREENSHOTS) });
  event.target.value = "";
}

function getNewestDashboardTrades(trades, limit = 8) {
  return [...trades]
    .sort((a, b) => Number(b.createdAt || b.id || 0) - Number(a.createdAt || a.id || 0))
    .slice(0, limit);
}

function tradeBelongsToAccount(trade, account) {
  if (!account) return true;
  if (account.isPlaceholder || String(account.id) === String(createAccountPlaceholder.id)) return false;
  if (trade?.accountId) return String(trade.accountId) === String(account.id);
  if (trade?.accountName) return String(trade.accountName) === String(account.name);
  return true;
}

function getTradesForAccount(trades = [], account) {
  return (Array.isArray(trades) ? trades : []).filter((trade) => tradeBelongsToAccount(trade, account));
}

function calculateAccountBalance(account, trades = []) {
  const startingBalance = Number(account?.balance || 0);
  const accountTrades = getTradesForAccount(trades, account);
  const tradePnl = accountTrades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
  return { startingBalance, tradePnl, currentBalance: startingBalance + tradePnl };
}

function getCurrentStreak(trades = []) {
  const ordered = [...trades].sort((a, b) => Number(b.createdAt || b.id || 0) - Number(a.createdAt || a.id || 0));
  const first = ordered.find((trade) => Number(trade.pnl || 0) !== 0);
  if (!first) return { type: "Neutral", count: 0 };
  const isWin = Number(first.pnl || 0) > 0;
  let count = 0;
  for (const trade of ordered) {
    const pnl = Number(trade.pnl || 0);
    if (pnl === 0) continue;
    if ((pnl > 0) === isWin) count += 1;
    else break;
  }
  return { type: isWin ? "Win" : "Loss", count };
}

function getTopGroup(statsGroup = {}, fallback = "No data") {
  const rows = Object.entries(statsGroup);
  if (!rows.length) return { name: fallback, count: 0, pnl: 0 };
  const [name, item] = rows.sort((a, b) => Number(b[1].pnl || 0) - Number(a[1].pnl || 0))[0];
  return { name, ...item };
}

function getWorstMistake(statsGroup = {}) {
  const rows = Object.entries(statsGroup).filter(([name]) => name && name !== "None");
  if (!rows.length) return { name: "No major mistake", count: 0, pnl: 0, losses: 0 };
  // Only consider mistakes that actually appeared on losing trades
  const lossRows = rows.filter(([, item]) => Number(item.losses || 0) > 0);
  if (!lossRows.length) return { name: "No loss pattern", count: 0, pnl: 0, losses: 0 };
  const [name, item] = lossRows.sort((a, b) => Number(a[1].pnl || 0) - Number(b[1].pnl || 0))[0];
  return { name, ...item };
}

function getDashboardInsights(trades = [], stats = {}) {
  const bestSession = getTopGroup(stats.sessionStats, "No session");
  const bestStrategy = getTopGroup(stats.strategyStats, "No strategy");
  const worstMistake = getWorstMistake(stats.mistakeStats);
  const streak = getCurrentStreak(trades);
  const riskTrades = trades.filter((trade) => Number(trade.risk || 0) > 0);
  const avgRisk = riskTrades.length ? riskTrades.reduce((sum, trade) => sum + Number(trade.risk || 0), 0) / riskTrades.length : 0;
  return [
    { title: "Best Session", value: bestSession.name, detail: `${formatMoney(bestSession.pnl || 0)} · ${bestSession.count || 0} trades`, tone: "emerald", icon: "☀" },
    { title: "Best Strategy", value: bestStrategy.name, detail: `${formatMoney(bestStrategy.pnl || 0)} net P&L`, tone: "fuchsia", icon: "ϟ" },
    { title: "Current Streak", value: streak.count ? `${streak.count} ${streak.type}` : "Neutral", detail: streak.type === "Loss" ? "Slow down and protect capital" : "Stay disciplined", tone: streak.type === "Loss" ? "red" : "emerald", icon: streak.type === "Loss" ? "↘" : "↗" },
    { title: "Avg Risk", value: formatMoney(avgRisk), detail: "Average risk per trade", tone: "amber", icon: "$" },
    { title: "Mistake Watch", value: worstMistake.losses ? worstMistake.name : "Clean execution", detail: worstMistake.losses ? `${worstMistake.losses} loss${worstMistake.losses === 1 ? "" : "es"} · ${formatMoney(Math.abs(worstMistake.pnl || 0))} lost` : "No loss pattern detected", tone: worstMistake.losses ? "red" : "emerald", icon: "!" },
  ];
}

function getRiskWarnings(form, accountBalance) {
  const risk = Number(form?.risk || 0);
  const balance = Number(accountBalance?.currentBalance || accountBalance?.startingBalance || 0);
  const warnings = [];
  if (!risk || !balance) return warnings;
  const riskPercent = (risk / balance) * 100;
  if (riskPercent > 2) warnings.push({ tone: "red", title: "High Risk", text: `Risk is ${riskPercent.toFixed(2)}% of account. Consider reducing size.` });
  else if (riskPercent > 1) warnings.push({ tone: "amber", title: "Risk Warning", text: `Risk is ${riskPercent.toFixed(2)}% of account. Keep discipline.` });
  else warnings.push({ tone: "emerald", title: "Risk OK", text: `Risk is ${riskPercent.toFixed(2)}% of account.` });
  return warnings;
}

function getRiskDashboardStats(trades = [], startingBalance = 50000) {
  const safe = Array.isArray(trades) ? trades : [];
  const riskTrades = safe.filter((trade) => Number(trade.risk || 0) > 0);
  const avgRisk = riskTrades.length ? riskTrades.reduce((sum, trade) => sum + Number(trade.risk || 0), 0) / riskTrades.length : 0;
  const maxRisk = riskTrades.length ? Math.max(...riskTrades.map((trade) => Number(trade.risk || 0))) : 0;
  const avgRiskPercent = startingBalance ? (avgRisk / Number(startingBalance || 1)) * 100 : 0;
  const maxRiskPercent = startingBalance ? (maxRisk / Number(startingBalance || 1)) * 100 : 0;
  const losses = safe.filter((trade) => Number(trade.pnl || 0) < 0);
  const biggestLoss = losses.length ? Math.min(...losses.map((trade) => Number(trade.pnl || 0))) : 0;
  const riskScores = riskTrades.map((trade) => Number(trade.risk || 0));
  const riskMean = riskScores.length ? riskScores.reduce((sum, value) => sum + value, 0) / riskScores.length : 0;
  const riskVariance = riskScores.length > 1 ? riskScores.reduce((sum, value) => sum + Math.pow(value - riskMean, 2), 0) / (riskScores.length - 1) : 0;
  const riskStd = Math.sqrt(riskVariance);
  const consistencyScore = riskMean ? Math.max(0, Math.min(100, 100 - (riskStd / riskMean) * 100)) : 0;
  const streak = getCurrentStreak(safe);
  return { avgRisk, maxRisk, avgRiskPercent, maxRiskPercent, biggestLoss, consistencyScore, lossStreak: streak.type === "Loss" ? streak.count : 0, riskTrades: riskTrades.length };
}

function getMistakeDetectorStats(trades = []) {
  const safe = Array.isArray(trades) ? trades : [];
  const losses = safe.filter((trade) => Number(trade.pnl || 0) < 0);
  const wins = safe.filter((trade) => Number(trade.pnl || 0) > 0);
  const issueMap = {};
  const rootMap = {
    Execution: { key: "Execution", title: "Execution", count: 0, pnl: 0, issues: [] },
    Psychology: { key: "Psychology", title: "Psychology", count: 0, pnl: 0, issues: [] },
    Risk: { key: "Risk", title: "Risk", count: 0, pnl: 0, issues: [] },
    Setup: { key: "Setup", title: "Setup Quality", count: 0, pnl: 0, issues: [] },
    Discipline: { key: "Discipline", title: "Discipline", count: 0, pnl: 0, issues: [] },
  };

  function addIssue(key, title, trade, type, fix, weight = 1) {
    if (!issueMap[key]) issueMap[key] = { key, title, type, fix, count: 0, weightedCount: 0, pnl: 0, trades: [] };
    issueMap[key].count += 1;
    issueMap[key].weightedCount += weight;
    issueMap[key].pnl += Number(trade.pnl || 0);
    issueMap[key].trades.push(trade);
    if (rootMap[type]) {
      rootMap[type].count += weight;
      rootMap[type].pnl += Number(trade.pnl || 0);
      if (!rootMap[type].issues.includes(title)) rootMap[type].issues.push(title);
    }
  }

  losses.forEach((trade) => {
    const mistakes = splitMultiValues(trade.mistake).filter((item) => item && item !== "None");
    const primaryMistake = mistakes[0] || "Unclassified mistake";
    const timing = trade.entryTiming || "On Time";
    const emotions = splitMultiValues(trade.emotion).length ? splitMultiValues(trade.emotion) : ["Calm"];
    const brokenRules = splitMultiValues(trade.ruleBroken).filter((item) => item && item !== "None");
    const setupQuality = trade.setupQuality || "";

    if (mistakes.length) mistakes.forEach((mistake) => addIssue(`mistake-${mistake}`, mistake, trade, "Execution", `Focus on removing ${mistake.toLowerCase()} before increasing size.`, 1.3));
    else addIssue("unclassified", "Unclassified mistake", trade, "Discipline", "Tag the exact mistake after each loss so the detector can become more accurate.", 0.6);

    // Only flag timing as a separate issue if it is not already captured in the mistake tag
    const timingAlreadyTagged = (timing === "Early" && mistakes.some((m) => /early/i.test(m))) || (timing === "Late" && mistakes.some((m) => /late/i.test(m)));
    if (!timingAlreadyTagged && ["Early", "Late"].includes(timing)) addIssue(`timing-${timing}`, `${timing} entry timing`, trade, "Execution", timing === "Late" ? "Stop chasing price. Wait for the next valid retracement or skip the trade." : "Do not enter before full confirmation. Let the setup complete first.", 1.4);
    emotions.filter((emotion) => ["Fearful", "Greedy", "FOMO", "Revenge"].includes(emotion)).forEach((emotion) => addIssue(`emotion-${emotion}`, `${emotion} emotion`, trade, "Psychology", "Add a 30-second pause before entry and confirm you are not trading from emotion.", 1.2));
    if (Number(trade.entryQuality || 0) > 0 && Number(trade.entryQuality || 0) <= 2) addIssue("entry-low", "Low entry quality", trade, "Execution", "Wait for full confirmation. Do not enter before the setup is complete.", 1.25);
    if (Number(trade.exitQuality || 0) > 0 && Number(trade.exitQuality || 0) <= 2) addIssue("exit-low", "Low exit quality", trade, "Execution", "Pre-plan partials, target and invalidation before entering the trade.", 1);
    if (["No", "Partial"].includes(trade.ruleFollowed) || brokenRules.length) addIssue("rules-broken", brokenRules[0] || "Rules not fully followed", trade, "Discipline", "Only take trades that match your checklist. If rules are not met, skip the trade.", 1.35);
    if (["Bad Risk Management", "Moved Stop Loss", "Overrisk"].includes(primaryMistake) || brokenRules.some((rule) => ["Moved SL", "Overrisk"].includes(rule))) addIssue("risk-control", "Risk control problem", trade, "Risk", "Reduce size and never move stop loss after entry. Risk must be decided before execution.", 1.4);
    if (["C", "D"].includes(setupQuality)) addIssue("setup-quality", "Weak setup quality", trade, "Setup", "Trade only A/B setups and write why the setup deserves execution before entry.", 1.2);
  });

  const issues = Object.values(issueMap).sort((a, b) => b.weightedCount !== a.weightedCount ? b.weightedCount - a.weightedCount : Math.abs(b.pnl) - Math.abs(a.pnl));
  const roots = Object.values(rootMap).filter((root) => root.count > 0).sort((a, b) => b.count - a.count);
  const mainIssue = issues[0] || null;
  const mainRoot = roots[0] || null;
  const confidence = losses.length && mainIssue ? Math.round(Math.min(100, (mainIssue.count / losses.length) * 100)) : 0;
  const affectedPnl = mainIssue ? mainIssue.pnl : 0;
  const cleanTrades = safe.filter((trade) => Number(trade.pnl || 0) >= 0 && (!trade.mistake || trade.mistake === "None")).length;
  const winProfile = { emotion: getMostCommonValue(wins, "emotion", "No emotion"), timing: getMostCommonValue(wins, "entryTiming", "No timing"), setup: getMostCommonValue(wins, "setupQuality", "No setup quality"), session: getMostCommonValue(wins, "session", "No session") };
  const lossProfile = { emotion: getMostCommonValue(losses, "emotion", "No emotion"), timing: getMostCommonValue(losses, "entryTiming", "No timing"), setup: getMostCommonValue(losses, "setupQuality", "No setup quality"), session: getMostCommonValue(losses, "session", "No session") };
  const focusPlan = mainRoot ? buildFocusPlan(mainRoot.key, mainIssue?.title) : ["Log at least 5 losing trades with mistake, emotion and entry quality.", "Review screenshots after every trade.", "Keep the same risk until patterns become clear."];

  return { losses, wins, issues, roots, mainIssue, mainRoot, confidence, affectedPnl, cleanTrades, winProfile, lossProfile, focusPlan, summary: losses.length ? `${issues.length} mistake patterns detected from ${losses.length} losing trade${losses.length === 1 ? "" : "s"}.` : "No losing trades detected yet." };
}

function translateDetectorText(value) {
  const map = {
    "None": "No Mistake",
    "Early Entry": "Early Entry",
    "Late Entry": "Late Entry",
    "No Confirmation": "No Confirmation",
    "Overtrading": "Overtrading",
    "Emotional Trade": "Emotional Trade",
    "Bad Risk Management": "Bad Risk Management",
    "Moved Stop Loss": "Moved Stop Loss",
    "Unclassified mistake": "Unclassified Mistake",
    "Early entry timing": "Early Entry Timing",
    "Late entry timing": "Late Entry Timing",
    "Fearful emotion": "Fearful Emotion",
    "Greedy emotion": "Greedy Emotion",
    "FOMO emotion": "FOMO Emotion",
    "Revenge emotion": "Revenge Trading",
    "Low entry quality": "Low Entry Quality",
    "Low exit quality": "Low Exit Quality",
    "Rules not fully followed": "Rules Not Fully Followed",
    "Risk control problem": "Risk Control Problem",
    "Weak setup quality": "Weak Setup Quality",
    "Execution": "Execution",
    "Psychology": "Psychology",
    "Risk": "Risk",
    "Setup": "Setup Quality",
    "Setup Quality": "Setup Quality",
    "Discipline": "Discipline",
    "Calm": "Calm",
    "Confident": "Confident",
    "Fearful": "Fearful",
    "Greedy": "Greedy",
    "FOMO": "FOMO",
    "Revenge": "Revenge",
    "On Time": "On Time",
    "Early": "Early",
    "Late": "Late",
    "No timing": "No Timing Data",
    "No emotion": "No Emotion Data",
    "No setup quality": "No Setup Quality Data",
    "No session": "No Session Data",
    "Moved SL": "Moved Stop Loss",
    "Overrisk": "Overrisk",
    "No confirmation": "No Confirmation",
    "Chased price": "Chased Price",
    "Revenge trade": "Revenge Trade"
  };
  return map[value] || value || "—";
}

function translateDetectorFix(value) {
  const map = {
    "Tag the exact mistake after each loss so the detector can become more accurate.": "Tag the exact mistake after each loss so the detector can become more accurate.",
    "Stop chasing price. Wait for the next valid retracement or skip the trade.": "Stop chasing price. Wait for the next valid retracement or skip the trade.",
    "Do not enter before full confirmation. Let the setup complete first.": "Do not enter before full confirmation. Let the setup complete first.",
    "Add a 30-second pause before entry and confirm you are not trading from emotion.": "Add a 30-second pause before entry and confirm you are not trading from emotion.",
    "Wait for full confirmation. Do not enter before the setup is complete.": "Wait for full confirmation. Do not enter before the setup is complete.",
    "Pre-plan partials, target and invalidation before entering the trade.": "Pre-plan partials, target and invalidation before entering the trade.",
    "Only take trades that match your checklist. If rules are not met, skip the trade.": "Only take trades that match your checklist. If rules are not met, skip the trade.",
    "Reduce size and never move stop loss after entry. Risk must be decided before execution.": "Reduce size and never move stop loss after entry. Risk must be decided before execution.",
    "Trade only A/B setups and write why the setup deserves execution before entry.": "Trade only A/B setups and write why the setup deserves execution before entry."
  };
  if (map[value]) return map[value];
  if (String(value || "").startsWith("Focus on removing")) return "Focus on removing this mistake before increasing size.";
  return value;
}

function getMostCommonValue(trades = [], key, fallback = "No data") {
  const counts = trades.reduce((output, trade) => {
    const values = ["emotion", "mistake", "ruleBroken"].includes(key) ? splitMultiValues(trade?.[key]) : [trade?.[key] || fallback];
    (values.length ? values : [fallback]).forEach((value) => {
      output[value] = (output[value] || 0) + 1;
    });
    return output;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;
}

function buildFocusPlan(rootType, issueTitle) {
  const translatedIssue = translateDetectorText(issueTitle || "entry timing");
  const plans = {
    Execution: ["Wait for full confirmation before entering.", "If price already moved away, do not chase it — wait for a new setup or skip.", `Main focus: ${translatedIssue}. Check the screenshot before every next trade.`],
    Psychology: ["Take a 30-second pause before clicking Buy/Sell.", "Write your emotion before the entry, not after the result.", "After an emotional loss, skip the next trade."],
    Risk: ["Define max risk before entry and do not change it.", "Never move the stop loss after entry.", "Reduce size until you complete 5 rule-followed trades in a row."],
    Setup: ["Trade only A/B quality setups this week.", "Before entry, write why the setup is valid.", "Skip C/D setups even if they look attractive."],
    Discipline: ["Use the pre-trade checklist before every trade.", "If one rule is missing, skip the trade.", "Review Rule Broken tags at the end of the day."],
  };
  return plans[rootType] || plans.Execution;
}

function exportTradesToCSV(trades) {
  const safeTrades = Array.isArray(trades) ? trades : [];
  const headers = ["date", "pair", "direction", "quantity", "setup", "session", "result", "emotion", "risk", "pnl", "entryTime", "exitTime", "mistake", "ruleBroken", "setupQuality", "tags", "notes"];
  const rows = safeTrades.map((trade) =>
    headers.map((key) => {
      const val = key === "tags" ? normalizeTags(trade).filter((t) => !String(t).toLowerCase().startsWith("result:")).join("; ") : String(trade[key] ?? "");
      return `"${val.replaceAll('"', '""')}"`;
    }).join(",")
  );
  const csv = [headers.join(","), ...rows].join(String.fromCharCode(10));
  downloadTextFile(csv, "critique-trades.csv", "text/csv;charset=utf-8;");
}

function downloadTextFile(content, filename, type = "application/json;charset=utf-8;") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportCritiqueBackup({ trades, account, routine, theme }) {
  const payload = {
    app: BRAND_NAME,
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      trades: Array.isArray(trades) ? trades : [],
      account: account || defaultAccount,
      routine: routine || { date: formatDateKey(new Date()), checked: {}, notes: "" },
      theme: theme || "dark",
    },
  };
  downloadTextFile(JSON.stringify(payload, null, 2), `critique-backup-${formatDateKey(new Date())}.json`);
}

function validateCritiqueBackup(payload) {
  const data = payload?.data || payload;
  const trades = Array.isArray(data?.trades) ? data.trades : null;
  if (!trades) return { ok: false, error: "Backup file-ში trades ვერ მოიძებნა." };
  return {
    ok: true,
    trades: trades.map((trade, index) => ({
      ...trade,
      id: trade.id || Date.now() + index,
      createdAt: trade.createdAt || trade.id || Date.now() + index,
      screenshots: normalizeScreenshots(trade),
      tags: normalizeTags(trade),
    })),
    account: data.account || defaultAccount,
    routine: data.routine || { date: formatDateKey(new Date()), checked: {}, notes: "" },
    theme: data.theme || "dark",
  };
}

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') { current += '"'; index += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === "," && !quoted) { values.push(current); current = ""; continue; }
    current += char;
  }
  values.push(current);
  return values;
}

function normalizeCSVHeader(header) {
  return String(header || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function validateImportedTrade(trade) {
  const errors = [];
  if (!trade.pair) errors.push("Missing symbol/pair");
  if (!trade.date) errors.push("Missing date");
  if (!Number.isFinite(Number(trade.pnl))) errors.push("Invalid P&L");
  if (!Number.isFinite(Number(trade.quantity)) || Number(trade.quantity) <= 0) errors.push("Invalid quantity");
  if (!Number.isFinite(Number(trade.risk)) || Number(trade.risk) < 0) errors.push("Invalid risk");
  return errors;
}

function getTradeDuplicateKey(trade) {
  const amount = (value) => Number(value || 0).toFixed(2);
  return [
    getTradeDateKey(trade),
    String(trade.pair || "").trim().toUpperCase(),
    String(trade.direction || "").trim().toUpperCase(),
    amount(trade.quantity),
    amount(trade.risk),
    amount(trade.pnl),
    String(trade.setup || "").trim().toLowerCase(),
    String(trade.session || "").trim().toLowerCase(),
  ].join("|");
}

function parseTradesCSV(text, account, existingTrades = []) {
  const lines = String(text || "").replaceAll(String.fromCharCode(13) + String.fromCharCode(10), String.fromCharCode(10)).replaceAll(String.fromCharCode(13), String.fromCharCode(10)).split(String.fromCharCode(10)).filter((line) => line.trim());
  if (lines.length < 2) return { trades: [], duplicates: [], invalidRows: [{ row: 1, errors: ["CSV file is empty or missing data rows"] }] };
  const rawHeaders = parseCSVLine(lines[0]).map((header) => header.trim());
  const headers = rawHeaders.map(normalizeCSVHeader);
  const existingKeys = new Set((existingTrades || []).map(getTradeDuplicateKey));
  const trades = [];
  const duplicates = [];
  const invalidRows = [];

  lines.slice(1).forEach((line, index) => {
    const values = parseCSVLine(line);
    const row = headers.reduce((output, header, headerIndex) => ({ ...output, [header]: values[headerIndex] ?? "" }), {});
    const pnl = Number(row.pnl || row.pl || row.profitloss || 0);
    const result = getResultFromPnl(pnl);
    const trade = {
      id: Date.now() + index,
      createdAt: Date.now() + index,
      accountId: account?.id || defaultAccount.id,
      accountName: account?.name || "v",
      accountType: account?.type || "Demo Account",
      accountCurrency: account?.currency || "USD",
      date: getTradeDateKey({ date: row.date || row.tradedate || row.entrydate }) || formatDateKey(new Date()),
      pair: String(row.pair || row.symbol || row.ticker || "").toUpperCase(),
      direction: String(row.direction || row.type || "Buy").toUpperCase() === "SELL" ? "SELL" : "BUY",
      quantity: Number(row.quantity || row.qty || row.shares || 0),
      setup: row.setup || row.strategy || "Imported Trade",
      session: row.session || row.tradingsession || "Unknown",
      result,
      emotion: row.emotion || row.emotions || "Calm",
      risk: Number(row.risk || 0),
      pnl,
      notes: row.notes || row.note || "Imported from CSV",
      mistake: row.mistake || "None",
      ruleBroken: row.rulebroken || row.ruleBroken || "None",
      setupQuality: row.setupquality || row.setupQuality || "",
      entryTime: row.entrytime || row.entryTime || "",
      exitTime: row.exittime || row.exitTime || "",
      screenshots: [],
      tags: normalizeTags({ tags: row.tags || `result:${result.toLowerCase().replaceAll(" ", "-")}` }),
    };
    const errors = validateImportedTrade(trade);
    const rowNumber = index + 2;
    if (errors.length) {
      invalidRows.push({ row: rowNumber, errors });
      return;
    }
    const duplicateKey = getTradeDuplicateKey(trade);
    if (existingKeys.has(duplicateKey)) {
      duplicates.push({ row: rowNumber, trade });
      return;
    }
    existingKeys.add(duplicateKey);
    trades.push(trade);
  });

  return { trades, duplicates, invalidRows };
}

function calculateStatistics(trades = [], startingBalance = 50000) {
  const safeTrades = Array.isArray(trades) ? trades : [];
  const base = summarizeTrades(safeTrades);
  const wins = safeTrades.filter((trade) => getTradeResult(trade) === "Win");
  const losses = safeTrades.filter((trade) => getTradeResult(trade) === "Loss");
  const avgPnl = safeTrades.length ? base.pnl / safeTrades.length : 0;
  const avgWin = wins.length ? wins.reduce((sum, trade) => sum + Number(trade.pnl), 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((sum, trade) => sum + Number(trade.pnl), 0) / losses.length) : 0;
  const resultStats = TRADE_RESULT_OPTIONS.reduce((output, result) => ({ ...output, [result]: { count: 0, pnl: 0 } }), {});
  const strategyStats = {};
  const mistakeStats = {};
  const sessionStats = {};

  safeTrades.forEach((trade) => {
    const pnl = Number(trade.pnl || 0);
    const result = getTradeResult(trade);
    const strategy = trade.setup || "Manual Trade";
    const mistake = trade.mistake || "None";
    const session = trade.session || "Unknown";
    if (!resultStats[result]) resultStats[result] = { count: 0, pnl: 0 };
    resultStats[result].count += 1;
    resultStats[result].pnl += pnl;
    if (!strategyStats[strategy]) strategyStats[strategy] = { count: 0, pnl: 0, wins: 0, losses: 0, breakEvens: 0, partials: 0, rrSum: 0, riskTrades: 0 };
    strategyStats[strategy].count += 1;
    strategyStats[strategy].pnl += pnl;
    if (Number(trade.risk || 0) > 0) { strategyStats[strategy].rrSum += getTradeRR(trade); strategyStats[strategy].riskTrades += 1; }
    if (result === "Win") strategyStats[strategy].wins += 1;
    if (result === "Loss") strategyStats[strategy].losses += 1;
    if (result === "Break Even") strategyStats[strategy].breakEvens += 1;
    if (result === "Partial") strategyStats[strategy].partials += 1;
    if (!mistakeStats[mistake]) mistakeStats[mistake] = { count: 0, pnl: 0, losses: 0 };
    mistakeStats[mistake].count += 1;
    mistakeStats[mistake].pnl += pnl;
    if (pnl < 0) mistakeStats[mistake].losses += 1;
    if (!sessionStats[session]) sessionStats[session] = { count: 0, pnl: 0, wins: 0, losses: 0, breakEvens: 0, partials: 0, rrSum: 0, riskTrades: 0 };
    sessionStats[session].count += 1;
    sessionStats[session].pnl += pnl;
    if (Number(trade.risk || 0) > 0) { sessionStats[session].rrSum += getTradeRR(trade); sessionStats[session].riskTrades += 1; }
    if (result === "Win") sessionStats[session].wins += 1;
    if (result === "Loss") sessionStats[session].losses += 1;
    if (result === "Break Even") sessionStats[session].breakEvens += 1;
    if (result === "Partial") sessionStats[session].partials += 1;
  });

  let equity = 0;
  let peak = 0;
  let maxDrawdown = 0;
  sortTradesChronologically(safeTrades).forEach((trade) => {
    equity += Number(trade.pnl || 0);
    peak = Math.max(peak, equity);
    maxDrawdown = Math.max(maxDrawdown, peak - equity);
  });

  const grossProfit = wins.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0));
  const profitFactor = grossLoss ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
  const avgWinLoss = avgLoss ? avgWin / avgLoss : avgWin > 0 ? 999 : 0;
  const tradesWithRisk = safeTrades.filter((trade) => Number(trade.risk || 0) > 0);
  const avgRR = tradesWithRisk.length ? tradesWithRisk.reduce((sum, trade) => sum + getTradeRR(trade), 0) / tradesWithRisk.length : 0;
  const recoveryFactor = maxDrawdown ? base.pnl / maxDrawdown : base.pnl > 0 ? 999 : 0;
  const maxDrawdownPercent = startingBalance ? (maxDrawdown / Number(startingBalance || 1)) * 100 : 0;

  // Consistency: measures P&L stability trade-to-trade (coefficient of variation)
  // Lower variance relative to average = more consistent = higher score
  const pnlValues = safeTrades.map((t) => Number(t.pnl || 0));
  const meanPnl = pnlValues.length ? pnlValues.reduce((a, b) => a + b, 0) / pnlValues.length : 0;
  const pnlVariance = pnlValues.length ? pnlValues.reduce((sum, v) => sum + (v - meanPnl) ** 2, 0) / pnlValues.length : 0;
  const pnlStddev = Math.sqrt(pnlVariance);
  const refPnl = Math.max(Math.abs(meanPnl), avgLoss, 1);
  const pnlCv = pnlStddev / refPnl; // coefficient of variation (lower = more consistent)
  const rawConsistencyScore = Math.round(Math.min(100, Math.max(0, 100 - pnlCv * 25)));
  // Penalise if too few trades to measure consistency reliably
  const samplePenalty = safeTrades.length < 5 ? 0.75 : safeTrades.length < 10 ? 0.90 : 1;
  const consistencyScore = Math.round(rawConsistencyScore * samplePenalty);
  const consistencyLabel = consistencyScore >= 80 ? "Stable" : consistencyScore >= 60 ? "Moderate" : consistencyScore >= 40 ? "Variable" : "Erratic";

  const metricScores = {
    winRate: Math.min(100, Math.max(0, base.winRate)),
    profitFactor: Math.min(100, profitFactor >= 999 ? 100 : profitFactor * 33.33),
    avgWinLoss: Math.min(100, avgWinLoss >= 999 ? 100 : avgWinLoss * 33.33),
    recoveryFactor: Math.min(100, recoveryFactor >= 999 ? 100 : Math.max(0, recoveryFactor * 35)),
    maxDrawdown: Math.min(100, Math.max(0, 100 - maxDrawdownPercent * 10)),
    consistency: consistencyScore,
  };
  const score = Math.round((metricScores.winRate + metricScores.profitFactor + metricScores.avgWinLoss + metricScores.recoveryFactor + metricScores.maxDrawdown + metricScores.consistency) / 6);
  return {
    totalPnl: base.pnl, trades: base.count, wins: base.wins, losses: base.losses, breakEvens: base.breakEvens, partials: base.partials, decisive: base.decisive, winRate: base.winRate, breakEvenRate: base.breakEvenRate, partialRate: base.partialRate, avgPnl, avgWin, avgLoss, avgRR, score,
    grossProfit, grossLoss, profitFactor, avgWinLoss, maxDrawdown, maxDrawdownPercent, resultStats, strategyStats, mistakeStats, sessionStats,
    metrics: {
      winRate: { label: "Win %", description: "Winning trades divided by win/loss trades. Break-even trades are tracked separately.", actual: `${base.winRate.toFixed(1)}%`, score: metricScores.winRate },
      profitFactor: { label: "Profit factor", description: "Gross profit divided by gross loss. Target ≥ 1.5 (good), ≥ 3.0 (excellent).", actual: profitFactor >= 999 ? "Perfect" : profitFactor.toFixed(2), score: metricScores.profitFactor },
      avgWinLoss: { label: "Avg win/loss", description: "Average win compared to average loss. Target ≥ 1.5 (good), ≥ 3.0 (excellent).", actual: avgWinLoss >= 999 ? "Perfect" : avgWinLoss.toFixed(2), score: metricScores.avgWinLoss },
      recoveryFactor: { label: "Recovery factor", description: "Net profit compared to max drawdown. Higher = better bounce-back from losses.", actual: recoveryFactor >= 999 ? "Perfect" : recoveryFactor.toFixed(2), score: metricScores.recoveryFactor },
      maxDrawdown: { label: "Max drawdown", description: "Largest peak-to-trough decline as % of account. Lower is better.", actual: `${maxDrawdownPercent.toFixed(1)}%`, score: metricScores.maxDrawdown },
      consistency: { label: "Consistency", description: "How stable your P&L is trade-to-trade. Measures variance relative to your average result.", actual: consistencyLabel, score: metricScores.consistency },
    },
  };
}

async function loadTradesFromSupabase(userId) {
  if (!supabase || !userId) return null;
  const fallback = await postSupabaseSync("listTrades");
  const data = fallback?.rows || [];
  return (data || []).map((row) => ({
    ...(row.trade_data || {}),
    id: row.id,
    supabaseId: row.id,
    createdAt: row.trade_data?.createdAt || new Date(row.created_at).getTime(),
    screenshots: normalizeScreenshots(row.trade_data || {}),
    tags: normalizeTags(row.trade_data || {}),
  }));
}

async function saveTradeToSupabase(userId, trade) {
  if (!supabase || !userId) return trade;
  const result = await postSupabaseSync("saveTrade", { trade });
  return result?.trade || trade;
}

async function deleteTradeFromSupabase(userId, trade) {
  if (!supabase || !userId || !trade) return;
  const rowId = trade.supabaseId || trade.id;
  if (!rowId || typeof rowId !== "string") return;
  await postSupabaseSync("deleteTrade", { tradeId: rowId });
}

async function loadAccountFromSupabase(userId) {
  if (!supabase || !userId) return null;
  const result = await postSupabaseSync("loadAccount");
  const accountData = result?.account;
  return accountData && typeof accountData === "object" && Object.keys(accountData).length ? accountData : null;
}

async function saveAccountToSupabase(userId, account) {
  const normalizedAccount = {
    ...defaultAccount,
    ...(account || {}),
    balance: Number(account?.balance || 0),
  };

  if (!supabase || !userId) return normalizedAccount;

  const result = await postSupabaseSync("saveAccount", { account: normalizedAccount });
  return result?.account || normalizedAccount;
}

function getRestoreCacheKey(userId) {
  return `${RESTORE_CACHE_PREFIX}_${userId || "guest"}`;
}

function saveRestoreCache(userId, payload) {
  try {
    const cachePayload = { ...payload, cachedAt: new Date().toISOString() };
    const compactPayload = {
      ...cachePayload,
      trades: Array.isArray(cachePayload.trades) ? cachePayload.trades.map(stripHeavyTradeFields) : cachePayload.trades,
    };
    setJsonStorageItem(getRestoreCacheKey(userId), cachePayload, compactPayload);
  } catch (error) {
    console.warn("Could not cache restored backup:", error?.message || error);
  }
}

function readRestoreCache(userId) {
  try {
    return JSON.parse(localStorage.getItem(getRestoreCacheKey(userId)) || "null");
  } catch {
    return null;
  }
}

function getUserTradesKey(userId) {
  return `${USER_TRADES_KEY_PREFIX}_${userId || "guest"}`;
}

function getUserTradesBackupKey(userId) {
  return `${USER_TRADES_BACKUP_KEY_PREFIX}_${userId || "guest"}`;
}

function getDeletedTradesKey(userId) {
  return `${DELETED_TRADES_KEY_PREFIX}_${userId || "guest"}`;
}

function getTradeDurableId(trade) {
  return trade?.supabaseId || trade?.id || "";
}

function readDeletedTradeIds(userId) {
  try {
    const value = JSON.parse(localStorage.getItem(getDeletedTradesKey(userId)) || "[]");
    return new Set(Array.isArray(value) ? value.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveDeletedTradeIds(userId, ids) {
  try {
    localStorage.setItem(getDeletedTradesKey(userId), JSON.stringify([...ids].map(String)));
  } catch (error) {
    console.warn("Could not save deleted trade markers:", error?.message || error);
  }
}

function markTradeDeleted(userId, trade) {
  const durableId = getTradeDurableId(trade);
  if (!durableId) return;
  const ids = readDeletedTradeIds(userId);
  ids.add(String(durableId));
  saveDeletedTradeIds(userId, ids);
}

function filterDeletedTrades(tradesToFilter, userId) {
  const deletedIds = readDeletedTradeIds(userId);
  if (!deletedIds.size) return tradesToFilter;
  return (tradesToFilter || []).filter((trade) => {
    const durableId = getTradeDurableId(trade);
    return !durableId || !deletedIds.has(String(durableId));
  });
}

function normalizeTradeForStorage(trade) {
  return {
    ...trade,
    screenshots: normalizeScreenshots(trade),
    tags: normalizeTags(trade),
  };
}

function stripHeavyTradeFields(trade) {
  const normalized = normalizeTradeForStorage(trade);
  return {
    ...normalized,
    screenshots: [],
    screenshot: "",
    screenshotUrl: "",
  };
}

function isStorageQuotaError(error) {
  return /quota|exceeded|storage/i.test(String(error?.name || error?.message || error || ""));
}

function setJsonStorageItem(key, value, compactValue = value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (!isStorageQuotaError(error)) throw error;
    try {
      localStorage.setItem(key, JSON.stringify(compactValue));
      return true;
    } catch (compactError) {
      console.warn("Could not save browser backup:", compactError?.message || compactError);
      return false;
    }
  }
}

function readLocalTradesFallback(userId) {
  try {
    const userSaved = JSON.parse(localStorage.getItem(getUserTradesKey(userId)) || "[]");
    if (Array.isArray(userSaved) && userSaved.length) return filterDeletedTrades(userSaved.map(normalizeTradeForStorage), userId);
    const userBackup = JSON.parse(localStorage.getItem(getUserTradesBackupKey(userId)) || "[]");
    if (Array.isArray(userBackup) && userBackup.length) return filterDeletedTrades(userBackup.map(normalizeTradeForStorage), userId);
    if (userId) return [];

    const oldSaved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(oldSaved) ? filterDeletedTrades(oldSaved.map(normalizeTradeForStorage), userId) : [];
  } catch {
    return [];
  }
}

function saveLocalTradesFallback(tradesToSave, userId) {
  try {
    const safeTrades = Array.isArray(tradesToSave) ? tradesToSave.map(normalizeTradeForStorage) : [];
    const compactTrades = safeTrades.map(stripHeavyTradeFields);
    const primaryKey = getUserTradesKey(userId);
    const backupKey = getUserTradesBackupKey(userId);
    if (userId && safeTrades.length) setJsonStorageItem(backupKey, safeTrades, compactTrades);
    if (userId && !safeTrades.length) {
      const previous = JSON.parse(localStorage.getItem(primaryKey) || "[]");
      if (Array.isArray(previous) && previous.length) {
        const previousSafe = previous.map(normalizeTradeForStorage);
        setJsonStorageItem(backupKey, previousSafe, previousSafe.map(stripHeavyTradeFields));
      }
    }
    if (!userId) setJsonStorageItem(STORAGE_KEY, safeTrades, compactTrades);
    if (userId) setJsonStorageItem(primaryKey, safeTrades, compactTrades);
  } catch (error) {
    console.warn("Could not save local trades fallback:", error?.message || error);
  }
}

function mergeTradesUnique(primary = [], secondary = []) {
  const output = [];
  const seen = new Set();
  [...primary, ...secondary].forEach((trade) => {
    const normalized = normalizeTradeForStorage(trade);
    const key = getTradeDuplicateKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    output.push(normalized);
  });
  return output.sort((a, b) => Number(b.createdAt || b.id || 0) - Number(a.createdAt || a.id || 0));
}

async function replaceTradesInSupabase(userId, tradesToRestore) {
  if (!supabase || !userId) throw new Error("Supabase/Auth არ არის მზად. თავიდან შედი ანგარიშში და მერე სცადე Restore.");

  const result = await postSupabaseSync("replaceTrades", { trades: tradesToRestore });

  return (result?.rows || []).map((row) => ({
    ...(row.trade_data || {}),
    id: row.id,
    supabaseId: row.id,
    createdAt: row.trade_data?.createdAt || new Date(row.created_at).getTime(),
    screenshots: normalizeScreenshots(row.trade_data || {}),
    tags: normalizeTags(row.trade_data || {}),
  }));
}

function runHelperTests() {
  console.assert(normalizeTags({ tags: "A, B, C" }).length === 3, "tags split by comma");
  console.assert(getTradeRR({ pnl: 200, risk: 100 }) === 2, "R:R works");
  console.assert(getTradeResult({ result: "partial", pnl: 200 }) === "Partial", "partial result works");
  console.assert(resultToTag("Partial") === "result:partial", "partial result tag works");
  console.assert(getCalendarCells(2026, 4).length === 42, "calendar grid works");
  console.assert(getLastTradingDays(20).length === 20, "trading activity excludes weekends");
  console.assert(formatDateKey(new Date("2026-05-15T00:00:00")) === "2026-05-15", "date key format works");
  console.assert(formatMoney(400) === "$400", "money format removes cents");
  console.assert(getResultFromPnl(0) === "Break Even", "break even result works");
  console.assert(summarizeTrades([{ pnl: 100 }, { pnl: -50 }, { pnl: 0 }]).winRate === 50, "win rate excludes break even");
  console.assert(calculateStatistics([{ pnl: 100, risk: 50 }, { pnl: -50, risk: 50 }, { pnl: 0, risk: 50 }]).breakEvens === 1, "statistics counts break even");
  console.assert(formFromTrade({ pnl: 0, risk: 0, quantity: 1 }).pnl === "0", "break-even edit keeps zero P&L");
}

if (typeof window !== "undefined" && !window.__CRITIQUE_VIDEO_STYLE_TESTS_RAN__) {
  window.__CRITIQUE_VIDEO_STYLE_TESTS_RAN__ = true;
  runHelperTests();
}

export default function TradingJournalDashboard() {
  useEffect(() => {
    document.title = BRAND_NAME;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="bg" x1="8" x2="58" y1="6" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#050007"/><stop offset="0.58" stop-color="#16051f"/><stop offset="1" stop-color="#04150d"/></linearGradient><linearGradient id="bolt" x1="19" x2="46" y1="8" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#d6a0f8"/><stop offset="0.42" stop-color="#b24bf3"/><stop offset="1" stop-color="#22c55e"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#bg)"/><rect x="6" y="6" width="52" height="52" rx="13" fill="none" stroke="#b24bf3" stroke-opacity=".45" stroke-width="2"/><path d="M38 6 14 38h15l-5 20 27-36H34L38 6Z" fill="url(#bolt)"/><path d="M34 14 22 35h10l-3 13 13-22h-9l1-12Z" fill="#050007" fill-opacity=".68"/></svg>`;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, []);
  const [active, setActiveRaw] = useState(() => {
    try { return localStorage.getItem(ACTIVE_PAGE_KEY) || "Dashboard"; } catch { return "Dashboard"; }
  });
  const setActive = (page) => {
    setActiveRaw(page);
    try { localStorage.setItem(ACTIVE_PAGE_KEY, page); } catch {}
  };
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [active]);
  const [tradeViewMode, setTradeViewMode] = useState(null);
  const [trades, setTrades] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.map((trade) => ({ ...trade, screenshots: normalizeScreenshots(trade), tags: normalizeTags(trade) }));
    } catch {
      return [];
    }
  });
  const [accounts, setAccounts] = useState(() => {
    return readStoredAccounts(null);
  });
  const [activeAccountId, setActiveAccountId] = useState(() => {
    return readStoredActiveAccountId(null);
  });
  const [pendingAccountDraft, setPendingAccountDraft] = useState(null);
  const account = useMemo(() => {
    const existing = accounts.find((item) => String(item.id) === String(activeAccountId));
    if (existing) return existing;
    if (pendingAccountDraft && String(pendingAccountDraft.id) === String(activeAccountId)) return pendingAccountDraft;
    return accounts[0] || createAccountPlaceholder;
  }, [accounts, activeAccountId, pendingAccountDraft]);
  const [isStrategiesModalOpen, setIsStrategiesModalOpen] = useState(false);
  const [strategiesObjects, setStrategiesObjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STRATEGIES_OBJ_KEY) || "[]"); } catch { return []; }
  });
  function saveStrategiesObjects(next, renameInfo) {
    setStrategiesObjects(next);
    localStorage.setItem(STRATEGIES_OBJ_KEY, JSON.stringify(next));
    // sync names into CUSTOM_STRATEGIES_KEY so existing strategy dropdown stays in sync
    const names = next.map((s) => s.name);
    localStorage.setItem(CUSTOM_STRATEGIES_KEY, JSON.stringify(names));
    // cloud sync (fire-and-forget)
    if (authUser?.id) {
      postSupabaseSync("saveStrategies", { strategies: next }).catch((err) =>
        console.warn("Could not sync strategies to cloud:", err?.message)
      );
    }
    // If a strategy was renamed, update every trade that referenced the old name
    if (renameInfo?.oldName && renameInfo?.newName && renameInfo.oldName !== renameInfo.newName) {
      setTrades((currentTrades) => {
        const updatedTrades = currentTrades.map((trade) =>
          trade.setup === renameInfo.oldName ? { ...trade, setup: renameInfo.newName } : trade
        );
        const changedTrades = updatedTrades.filter((t, i) => t !== currentTrades[i]);
        if (changedTrades.length > 0) {
          saveLocalTradesFallback(updatedTrades, authUser?.id);
          if (authUser?.id) {
            saveRestoreCache(authUser.id, { trades: updatedTrades, account, routine, theme });
            changedTrades.forEach((trade) => {
              saveTradeToSupabase(authUser.id, trade).catch((err) =>
                console.warn("Could not update trade strategy name in cloud:", err?.message)
              );
            });
          }
        }
        return updatedTrades;
      });
    }
  }
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const [accountDeleteTarget, setAccountDeleteTarget] = useState(null);
  const [isSidebarUserMenuOpen, setIsSidebarUserMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isSidebarCollapsed ? "1" : "0"); } catch {}
  }, [isSidebarCollapsed]);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isTradeSaving, setIsTradeSaving] = useState(false);
  const tradeSavingRef = useRef(false);
  const [tradeModalError, setTradeModalError] = useState("");
  const [isRoutineOpen, setIsRoutineOpen] = useState(false);
  const [routine, setRoutine] = useState(() => {
    try {
      const todayKey = formatDateKey(new Date());
      const saved = JSON.parse(localStorage.getItem(ROUTINE_KEY));
      if (saved?.date === todayKey) return saved;
      return { date: todayKey, checked: {}, notes: "" };
    } catch {
      return { date: formatDateKey(new Date()), checked: {}, notes: "" };
    }
  });
  const [editingTradeId, setEditingTradeId] = useState(null);
  const [tradeDeleteTarget, setTradeDeleteTarget] = useState(null);
  const [form, setForm] = useState(() => createEmptyTradeForm());
  const [viewTrade, setViewTrade] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const importFileRef = useRef(null);
  const backupFileRef = useRef(null);
  const accountStorageUserRef = useRef(null);
  const [filters, setFilters] = useState({ result: "All", direction: "All", strategy: "All", grade: "All", session: "All", dateFrom: "", dateTo: "", minPnl: "", maxPnl: "", emotion: "All", tag: "", mistake: "All", setupQuality: "All", ruleBroken: "All" });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => formatDateKey(new Date()));
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || "dark";
    } catch {
      return "dark";
    }
  });
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(getFullscreenElement()));
  const [authPage, setAuthPageState] = useState(() => getAuthPageFromPath());
  function setAuthPage(nextPage, navigationMode = "push") {
    const page = typeof nextPage === "function" ? nextPage(authPage) : nextPage;
    setAuthPageState(page);
    if (typeof window !== "undefined") {
      const nextPath = getPathForAuthPage(page);
      if (window.location.pathname !== nextPath) {
        const method = navigationMode === "replace" ? "replaceState" : "pushState";
        window.history[method](null, "", nextPath);
      }
    }
  }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("");
  const [passwordRecoverySession, setPasswordRecoverySession] = useState(false);
  const [tradesLoading, setTradesLoading] = useState(false);
  const [hasLoadedRemoteTrades, setHasLoadedRemoteTrades] = useState(false);
  const [billingSubscription, setBillingSubscription] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingChecked, setBillingChecked] = useState(false);
  const [billingGateMessage, setBillingGateMessage] = useState("");
  const [billingRefreshTick, setBillingRefreshTick] = useState(0);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [dataMessage, setDataMessage] = useState("");
  const [economicCalendar, setEconomicCalendar] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(ECONOMIC_CALENDAR_CACHE_KEY) || "null");
      if (cached?.events?.length) return { events: cached.events, updatedAt: cached.updatedAt || null, loading: false, error: "" };
    } catch {}
    return { events: [], updatedAt: null, loading: true, error: "" };
  });
  const [economicCalendarRefresh, setEconomicCalendarRefresh] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState("");
  const profileName = getUserDisplayName(authUser, account?.isPlaceholder ? "User" : account.name || "User");
  const profileInitial = String(profileName || authUser?.email || "U").trim().charAt(0).toUpperCase();
  const canUseAdminTools = hasAdminAccess || isOwnerAdminEmail(authUser?.email);
  const navItems = useMemo(() => canUseAdminTools ? [...nav, [ShieldCheck, "Admin"]] : nav, [canUseAdminTools]);
  const hasBillingAccess = useMemo(() => canUseAdminTools || isSubscriptionAccessActive(billingSubscription), [canUseAdminTools, billingSubscription]);
  const shouldGateForBilling = Boolean(isAuthenticated && billingChecked && !billingLoading && !hasBillingAccess);

  useEffect(() => {
    if (!isAuthenticated || !authUser?.email) {
      setHasAdminAccess(false);
      return undefined;
    }
    let cancelled = false;
    postAdminEntitlements("status")
      .then((data) => {
        if (!cancelled) setHasAdminAccess(Boolean(data.isAdmin));
      })
      .catch(() => {
        if (!cancelled) setHasAdminAccess(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authUser?.email, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || (!authUser?.id && !authUser?.email)) {
      setBillingSubscription(null);
      setBillingLoading(false);
      setBillingChecked(false);
      setBillingGateMessage("");
      return undefined;
    }

    let cancelled = false;
    async function loadBillingStatus() {
      setBillingLoading(true);
      setBillingGateMessage("");
      try {
        let subscription = await fetchBillingSubscription(authUser);
        const params = new URLSearchParams(window.location.search);
        const returnedFromCheckout = params.get("billing") === "success";

        for (let attempt = 0; returnedFromCheckout && !isSubscriptionAccessActive(subscription) && attempt < 4; attempt += 1) {
          await wait(1200 + attempt * 900);
          if (cancelled) return;
          subscription = await fetchBillingSubscription(authUser);
        }

        if (!cancelled) {
          setBillingSubscription(subscription);
          const hasAccess = isSubscriptionAccessActive(subscription);
          try {
            const cacheKey = getBillingCacheKey(authUser?.id);
            if (cacheKey) localStorage.setItem(cacheKey, hasAccess ? "true" : "false");
            localStorage.removeItem("critique_billing_access_v1");
          } catch {}
        }
      } catch (error) {
        if (!cancelled) {
          setBillingSubscription(null);
          setBillingGateMessage(error?.message || "Could not check subscription status.");
        }
      } finally {
        if (!cancelled) {
          setBillingLoading(false);
          setBillingChecked(true);
        }
      }
    }

    loadBillingStatus();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id, authUser?.email, isAuthenticated, billingRefreshTick]);

  useEffect(() => {
    if (!shouldGateForBilling || active === "Billing" || active === "Support" || active === "Admin") return;
    setTradeViewMode(null);
    setActive("Billing");
  }, [active, shouldGateForBilling]);

  useEffect(() => {
    function handleDashboardNavigation() {
      setTradeViewMode(null);
      setActive(shouldGateForBilling ? "Billing" : "Dashboard");
    }
    window.addEventListener(DASHBOARD_NAV_EVENT, handleDashboardNavigation);
    return () => window.removeEventListener(DASHBOARD_NAV_EVENT, handleDashboardNavigation);
  }, [shouldGateForBilling]);

  useEffect(() => {
    function syncAuthPageFromBrowserPath() {
      if (!isAuthenticated) setAuthPageState(getAuthPageFromPath());
    }
    window.addEventListener("popstate", syncAuthPageFromBrowserPath);
    return () => window.removeEventListener("popstate", syncAuthPageFromBrowserPath);
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading || tradesLoading) return;
    if (supabase && isAuthenticated && !hasLoadedRemoteTrades) return;
    saveLocalTradesFallback(trades, authUser?.id);
  }, [trades, authUser?.id, authLoading, tradesLoading, isAuthenticated, hasLoadedRemoteTrades]);

  useEffect(() => {
    if (!supabase || !authUser?.id || !isAuthenticated) return undefined;
    let mounted = true;
    setTradesLoading(true);
    setHasLoadedRemoteTrades(false);
    setDataMessage("");

    // Show cached trades instantly — user sees data immediately, Supabase loads in background
    const cachedTrades = readLocalTradesFallback(authUser.id);
    setTrades(cachedTrades.length ? cachedTrades : []);

    // Single "loadAll" call fetches trades + account together (avoids two separate cold starts)
    postSupabaseSync("loadAll")
      .then(async (result) => {
        if (!mounted) return;
        const rows = result?.rows || [];
        const profileAccount = result?.account || null;

        // Update account if server returned one
        if (profileAccount) {
          // --- Preferences: Supabase → localStorage sync / one-time migration ---
          let accountWithPrefs = profileAccount;
          if (profileAccount.preferences && typeof profileAccount.preferences === "object") {
            // Account already has preferences — sync to localStorage cache so readTradingPreferences() stays current
            try { localStorage.setItem(TRADING_PREFERENCES_KEY, JSON.stringify(profileAccount.preferences)); } catch {}
          } else {
            // No preferences in account yet — attempt one-time migration from localStorage
            try {
              const localRaw = localStorage.getItem(TRADING_PREFERENCES_KEY);
              const localPrefs = localRaw ? JSON.parse(localRaw) : null;
              if (localPrefs && typeof localPrefs === "object" && (localPrefs.defaultRisk || localPrefs.defaultSession || localPrefs.timezone)) {
                const migratedPrefs = {
                  timezone: localPrefs.timezone || "Asia/Tbilisi",
                  defaultSession: localPrefs.defaultSession || "",
                  defaultRisk: localPrefs.defaultRisk || "",
                };
                accountWithPrefs = { ...profileAccount, preferences: migratedPrefs };
                // Save migrated preferences to Supabase silently (non-blocking)
                saveAccountToSupabase(authUser?.id, accountWithPrefs).catch(() => {});
              }
            } catch {}
          }
          // -----------------------------------------------------------------------

          setAccounts((current) => {
            const normalized = { ...defaultAccount, ...accountWithPrefs, id: accountWithPrefs.id || activeAccountId || defaultAccount.id, balance: Number(accountWithPrefs.balance || defaultAccount.balance) };
            const exists = current.some((item) => String(item.id) === String(normalized.id));
            return exists ? current.map((item) => String(item.id) === String(normalized.id) ? normalized : item) : [normalized, ...current];
          });
        }
        // Load strategies from cloud
        if (result?.strategies && Array.isArray(result.strategies) && result.strategies.length > 0) {
          setStrategiesObjects(result.strategies);
          localStorage.setItem(STRATEGIES_OBJ_KEY, JSON.stringify(result.strategies));
          const names = result.strategies.map((s) => s.name);
          localStorage.setItem(CUSTOM_STRATEGIES_KEY, JSON.stringify(names));
        }

        if (rows.length) {
          const serverTrades = mergeTradesUnique(rows.map((row) => ({
            ...(row.trade_data || {}),
            id: row.id,
            supabaseId: row.id,
            createdAt: row.trade_data?.createdAt || new Date(row.created_at).getTime(),
            screenshots: normalizeScreenshots(row.trade_data || {}),
            tags: normalizeTags(row.trade_data || {}),
          })), []);
          setTrades(serverTrades);
          saveLocalTradesFallback(serverTrades, authUser.id);
          saveRestoreCache(authUser.id, { trades: serverTrades, account, routine, theme });
          return;
        }

        if (!cachedTrades.length) {
          setTrades([]);
          setDataMessage("");
        }
      })
      .catch(async (error) => {
        if (!mounted) return;
        // Cached trades already showing — keep them on error
        if (cachedTrades.length) {
          if (!isSupabaseAuthExpiredError(error)) {
            console.warn("Supabase load failed; showing browser backup.", error?.message || error);
          }
          setDataMessage("");
          return;
        }
        if (isSupabaseAuthExpiredError(error)) {
          const refreshed = await refreshCurrentSession().catch(() => null);
          if (!mounted) return;
          if (refreshed?.user) {
            setAuthUser(refreshed.user);
            setIsAuthenticated(true);
            setDataMessage("");
            return;
          }
          setIsAuthenticated(false);
          setAuthUser(null);
          safeLocalSignOut();
          setDataMessage("Login session expired. Sign in again to resume cloud sync.");
        } else {
          console.warn("Supabase load failed and no browser backup available.", error?.message || error);
          setDataMessage("");
        }
      })
      .finally(() => {
        if (mounted) {
          setHasLoadedRemoteTrades(true);
          setTradesLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [authUser?.id, isAuthenticated]);
  useEffect(() => {
    if (authUser?.id && accountStorageUserRef.current !== authUser.id) return;
    const accountsKey = getAccountsKey(authUser?.id);
    const activeKey = getActiveAccountKey(authUser?.id);
    localStorage.setItem(accountsKey, JSON.stringify(accounts));
    if (accounts.length && !account.isPlaceholder) {
      localStorage.setItem(activeKey, account.id);
      if (!authUser?.id) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(activeKey);
      if (!authUser?.id) localStorage.removeItem(ACCOUNT_KEY);
    }
  }, [accounts, account, authUser?.id]);

  useEffect(() => {
    if (!authUser?.id || !isAuthenticated) return;
    accountStorageUserRef.current = authUser.id;
    setAccounts(readStoredAccounts(authUser.id));
    setActiveAccountId(readStoredActiveAccountId(authUser.id));
    setPendingAccountDraft(null);
  }, [authUser?.id, isAuthenticated]);

  useEffect(() => {
    let mounted = true;
    setEconomicCalendar((current) => ({ ...current, loading: !current.events.length, error: "" }));

    fetch("/api/economic-calendar?range=this")
      .then((response) => {
        if (!response.ok) throw new Error(`Economic calendar failed (${response.status})`);
        return response.json();
      })
      .then((data) => {
        if (!mounted) return;
        const events = Array.isArray(data?.events) ? data.events : [];
        const payload = { events, updatedAt: data?.updatedAt || new Date().toISOString() };
        setEconomicCalendar({ ...payload, loading: false, error: "" });
        try {
          localStorage.setItem(ECONOMIC_CALENDAR_CACHE_KEY, JSON.stringify(payload));
        } catch {}
      })
      .catch((error) => {
        if (!mounted) return;
        setEconomicCalendar((current) => ({ ...current, loading: false, error: error?.message || "Economic calendar unavailable" }));
      });

    return () => {
      mounted = false;
    };
  }, [economicCalendarRefresh]);

  // Account loading is now handled inside the combined loadAll effect above
  useEffect(() => { localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine)); }, [routine]);
  useEffect(() => { localStorage.setItem(THEME_KEY, theme); }, [theme]);
  useEffect(() => {
    const updateFullscreenState = () => setIsFullscreen(Boolean(getFullscreenElement()));
    document.addEventListener("fullscreenchange", updateFullscreenState);
    document.addEventListener("webkitfullscreenchange", updateFullscreenState);
    document.addEventListener("MSFullscreenChange", updateFullscreenState);
    updateFullscreenState();
    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreenState);
      document.removeEventListener("webkitfullscreenchange", updateFullscreenState);
      document.removeEventListener("MSFullscreenChange", updateFullscreenState);
    };
  }, []);
  useEffect(() => {
    setProfilePhoto(getStoredProfilePhoto(authUser));
  }, [authUser?.id, authUser?.user_metadata?.profile_photo, authUser?.user_metadata?.avatar_url]);

  useEffect(() => {
    if (!accounts.length || activeAccountId) return;
    setActiveAccountId(accounts[0].id);
  }, [accounts, activeAccountId]);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let mounted = true;
    const isRecoveryUrl = window.location.pathname.includes("/auth/reset-password") || window.location.hash.includes("type=recovery");
    const recoverySearchParams = new URLSearchParams(window.location.search);
    const recoveryCode = recoverySearchParams.get("code");
    const recoveryTokenHash = recoverySearchParams.get("token_hash");
    const recoveryType = recoverySearchParams.get("type") || "recovery";
    const recoveryHashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const recoveryErrorCode = recoveryHashParams.get("error_code") || recoveryHashParams.get("error");
    const recoveryErrorDescription = recoveryHashParams.get("error_description");
    const hasRecoveryTokens = Boolean(recoveryCode || recoveryTokenHash || recoveryHashParams.get("access_token") || recoveryHashParams.get("refresh_token"));

    async function recoverPasswordSessionFromUrl() {
      if (!isRecoveryUrl) return null;

      if (recoveryErrorCode) {
        window.history.replaceState(null, "", "/auth/reset-password");
        throw new Error(
          recoveryErrorCode === "otp_expired"
            ? "Password reset link expired. Send a new reset email and open the latest link."
            : recoveryErrorDescription || "Password reset link is invalid. Send a new reset email."
        );
      }

      if (!hasRecoveryTokens) return null;

      if (recoveryTokenHash) {
        return { resetReady: true, user: null };
      }

      if (recoveryCode) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(recoveryCode);
        if (error) throw error;
        window.history.replaceState(null, "", "/auth/reset-password");
        return data?.session || null;
      }

      const accessToken = recoveryHashParams.get("access_token");
      const refreshToken = recoveryHashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
        window.history.replaceState(null, "", "/auth/reset-password");
        return data?.session || null;
      }

      const { data } = await supabase.auth.getSession();
      return data?.session || null;
    }

    async function initializeAuthSession() {
      const recoverySession = await recoverPasswordSessionFromUrl();
      if (isRecoveryUrl) return recoverySession;
      if (isPublicAuthPath()) return null;
      const { data } = await supabase.auth.getSession();
      const session = data?.session || null;
      const expiresAt = session?.expires_at ? session.expires_at * 1000 : 0;
      if (session?.user && (!expiresAt || expiresAt > Date.now() + 30000)) return session;
      const refreshed = await refreshCurrentSession().catch(() => null);
      return refreshed || session || null;
    }

    initializeAuthSession().then((session) => {
      if (!mounted) return;
      const user = session?.user || null;
      if (isRecoveryUrl) {
        if (!session) {
          setPasswordRecoverySession(false);
          setAuthPage("forgot");
          setAuthUser(null);
          setIsAuthenticated(false);
          setAuthMessage(hasRecoveryTokens ? "Password reset link expired. Send a new reset email and open the latest link." : "");
          setAuthLoading(false);
          return;
        }
        setPasswordRecoverySession(true);
        setAuthPage("updatePassword");
        setAuthUser(user);
        setIsAuthenticated(false);
        setAuthLoading(false);
        return;
      }
      setAuthUser(user);
      setIsAuthenticated(Boolean(user));
      setAuthLoading(false);
    }).catch((error) => {
      if (!mounted) return;
      setAuthMessage(error?.message || "Could not open password reset session. Request a new reset link.");
      setPasswordRecoverySession(false);
      setAuthPage(isRecoveryUrl ? "forgot" : "login");
      setAuthUser(null);
      setIsAuthenticated(false);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;
      const onRecoveryPath = window.location.pathname.includes("/auth/reset-password");
      if (onRecoveryPath && !window.location.hash.includes("type=recovery")) {
        return;
      }

      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecoverySession(true);
        setAuthPage("updatePassword");
        setAuthUser(user);
        setIsAuthenticated(false);
        setAuthLoading(false);
        return;
      }

      if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setIsAuthenticated(false);
        setAuthLoading(false);
        return;
      }

      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") && isPublicAuthPath()) {
        setAuthLoading(false);
        return;
      }

      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") && user) {
        setAuthUser(user);
        setIsAuthenticated(true);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  async function handleAuthSubmit(mode, values) {
    setAuthMessage("");

    if (!supabase) {
      setAuthMessage("Supabase is not connected. Check that .env is in the project root, contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then stop and restart npm run dev.");
      return { ok: false, error: new Error("Supabase is not connected") };
    }

    setAuthLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
        if (error) throw error;
        if (values.remember === false) {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        } else {
          localStorage.setItem(REMEMBER_EMAIL_KEY, String(values.email || ""));
        }
        enterAppRoute();
        setAuthUser(data?.user || null);
        setIsAuthenticated(Boolean(data?.user));
        return { ok: true };
      }

      if (mode === "register") {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: { full_name: values.name },
            emailRedirectTo: getAuthRedirectUrl("/auth/login"),
          },
        });
        if (error) {
          const msg = String(error.message || "").toLowerCase();
          if (msg.includes("already registered") || msg.includes("user already exists") || msg.includes("already been registered")) {
            throw new Error("This email is already registered. Please sign in instead.");
          }
          throw error;
        }
        // Supabase returns identities:[] when email already exists (no error thrown)
        if (signUpData?.user && Array.isArray(signUpData.user.identities) && signUpData.user.identities.length === 0) {
          throw new Error("This email is already registered. Please sign in instead.");
        }
        setAuthPage("signup-pricing");
        return { ok: true, needsConfirmation: true };
      }

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
          redirectTo: getAuthRedirectUrl("/auth/reset-password"),
        });
        if (error) throw error;
        setAuthMessage("Password reset email sent. Open the newest email link only. Older reset links expire automatically.");
        return { ok: true };
      }

      if (mode === "updatePassword") {
        const resetPayload = getPasswordResetPayloadFromUrl();
        if (resetPayload.tokenHash) {
          await updatePasswordWithRetry(values.password, resetPayload);
          window.history.replaceState(null, "", "/auth/login");
          setPasswordRecoverySession(false);
          setAuthMessage("Password updated successfully. You can now sign in with your new password.");
          setAuthPage("login");
          await safeLocalSignOut();
          return { ok: true };
        }

        const { data: sessionData } = await supabase.auth.getSession();
        let passwordSession = sessionData?.session || null;

        if (!passwordSession && window.location.pathname.includes("/auth/reset-password")) {
          const urlSearchParams = new URLSearchParams(window.location.search);
          const urlCode = urlSearchParams.get("code");
          const urlTokenHash = urlSearchParams.get("token_hash");
          const urlRecoveryType = urlSearchParams.get("type") || "recovery";
          const urlHashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const accessToken = urlHashParams.get("access_token");
          const refreshToken = urlHashParams.get("refresh_token");

          if (urlTokenHash) {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: urlTokenHash,
              type: urlRecoveryType,
            });
            if (error) throw error;
            passwordSession = data?.session || null;
            window.history.replaceState(null, "", "/auth/reset-password");
          } else if (urlCode) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(urlCode);
            if (error) throw error;
            passwordSession = data?.session || null;
            window.history.replaceState(null, "", "/auth/reset-password");
          } else if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) throw error;
            passwordSession = data?.session || null;
            window.history.replaceState(null, "", "/auth/reset-password");
          }
        }

        if (!passwordSession) {
          throw new Error("Password reset session expired. Request a new reset link and open the latest email.");
        }
        await updatePasswordWithRetry(values.password, resetPayload);
        setPasswordRecoverySession(false);
        setAuthMessage("Password updated successfully. You can now sign in with your new password.");
        setAuthPage("login");
        await safeLocalSignOut();
        return { ok: true };
      }
    } catch (error) {
      const friendlyError = new Error(getFriendlyAuthError(error));
      setAuthMessage(friendlyError.message);
      return { ok: false, error: friendlyError };
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    await safeLocalSignOut();
    setIsAuthenticated(false);
    setAuthUser(null);
    setProfilePhoto("");
    setIsSidebarUserMenuOpen(false);
    try { localStorage.removeItem(ACTIVE_PAGE_KEY); } catch {}
    setActiveRaw("Dashboard");
  }

  async function handleSaveAccountSettings(nextAccount) {
    const normalizedAccount = {
      ...defaultAccount,
      ...(nextAccount || {}),
      id: nextAccount?.id || account?.id || `acc-${Date.now()}`,
      name: String(nextAccount?.name || "").trim() || `Account ${accounts.length + 1}`,
      balance: Number(nextAccount?.balance || 0),
      isPlaceholder: false,
    };

    try {
      setDataMessage("");
      const savedAccount = await saveAccountToSupabase(authUser?.id, normalizedAccount);
      const finalAccount = { ...normalizedAccount, ...savedAccount, id: savedAccount?.id || normalizedAccount.id, balance: Number(savedAccount?.balance ?? normalizedAccount.balance ?? 0) };
      setAccounts((current) => {
        const exists = current.some((item) => String(item.id) === String(finalAccount.id));
        return exists ? current.map((item) => String(item.id) === String(finalAccount.id) ? finalAccount : item) : [finalAccount, ...current];
      });
      setPendingAccountDraft(null);
      setActiveAccountId(finalAccount.id);
      return { ok: true };
    } catch (error) {
      console.warn("Could not save account settings to Supabase; saved locally instead.", error?.message || error);
      setAccounts((current) => {
        const exists = current.some((item) => String(item.id) === String(normalizedAccount.id));
        return exists ? current.map((item) => String(item.id) === String(normalizedAccount.id) ? normalizedAccount : item) : [normalizedAccount, ...current];
      });
      setPendingAccountDraft(null);
      setActiveAccountId(normalizedAccount.id);
      setDataMessage("");
      return { ok: true, offline: true };
    }
  }

  function createNewAccount() {
    const newAccount = {
      ...defaultAccount,
      id: `acc-${Date.now()}`,
      name: "",
      type: "Demo Account",
      balance: 10000,
      description: "",
    };
    setPendingAccountDraft(newAccount);
    setActiveAccountId(newAccount.id);
    setIsAccountSwitcherOpen(false);
    setIsAccountModalOpen(true);
  }

  function requestDeleteAccount(accountId) {
    const targetAccount = accounts.find((item) => String(item.id) === String(accountId));
    if (!targetAccount) return;
    setAccountDeleteTarget(targetAccount);
  }

  function confirmDeleteAccount() {
    const accountId = accountDeleteTarget?.id;
    if (!accountId) return;
    setAccounts((current) => {
      const next = current.filter((item) => String(item.id) !== String(accountId));
      if (String(activeAccountId) === String(accountId)) {
        setActiveAccountId(next[0]?.id || "");
      }
      return next;
    });
    if (pendingAccountDraft && String(pendingAccountDraft.id) === String(accountId)) {
      setPendingAccountDraft(null);
    }
    setIsAccountSwitcherOpen(false);
    setIsAccountModalOpen(false);
    setAccountDeleteTarget(null);
  }

  function closeAccountModal({ saved = false } = {}) {
    if (!saved && pendingAccountDraft && String(activeAccountId) === String(pendingAccountDraft.id)) {
      setPendingAccountDraft(null);
      setActiveAccountId(accounts[0]?.id || "");
    }
    setIsAccountModalOpen(false);
  }

  useEffect(() => {
    const syncRoutineDate = () => {
      const todayKey = formatDateKey(new Date());
      setRoutine((current) => current?.date === todayKey ? current : { date: todayKey, checked: {}, notes: "" });
    };
    syncRoutineDate();
    const intervalId = window.setInterval(syncRoutineDate, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const activeTrades = useMemo(() => getTradesForAccount(trades, account), [trades, account]);
  const accountBalance = useMemo(() => calculateAccountBalance(account, trades), [account, trades]);
  // Only show loading skeleton when there is genuinely no data yet (no cache).
  // If localStorage cache already populated trades, skip the skeleton entirely.
  const isInitialRemoteDataLoading = Boolean(supabase && isAuthenticated && tradesLoading && !hasLoadedRemoteTrades && activeTrades.length === 0);

  const filteredTrades = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return activeTrades.filter((trade) => {
      const tags = normalizeTags(trade);
      const text = [trade.pair, trade.direction, trade.setup, trade.session, trade.result, trade.mistake, trade.notes, trade.date, tags.join(" ")].join(" ").toLowerCase();
      const dateKey = getTradeDateKey(trade);
      const pnl = Number(trade.pnl || 0);
      return (
        (!query || text.includes(query)) &&
        (filters.result === "All" || getTradeResult(trade) === filters.result) &&
        (filters.direction === "All" || trade.direction === filters.direction.toUpperCase()) &&
        (filters.strategy === "All" || trade.setup === filters.strategy) &&
        (filters.session === "All" || trade.session === filters.session) &&
        (!filters.dateFrom || dateKey >= filters.dateFrom) &&
        (!filters.dateTo || dateKey <= filters.dateTo) &&
        (!filters.minPnl || pnl >= Number(filters.minPnl)) &&
        (!filters.maxPnl || pnl <= Number(filters.maxPnl)) &&
        (filters.emotion === "All" || trade.emotion === filters.emotion) &&
        (!filters.tag || tags.join(" ").toLowerCase().includes(filters.tag.toLowerCase())) &&
        (filters.mistake === "All" || splitMultiValues(trade.mistake).includes(filters.mistake)) &&
        (filters.setupQuality === "All" || trade.setupQuality === filters.setupQuality) &&
        (filters.ruleBroken === "All" || splitMultiValues(trade.ruleBroken).includes(filters.ruleBroken))
      );
    });
  }, [activeTrades, searchQuery, filters]);

  const stats = useMemo(() => calculateStatistics(activeTrades, Number(account.balance || 0)), [activeTrades, account.balance]);

  const curve = useMemo(() => {
    let balance = 0;
    return sortTradesChronologically(activeTrades).map((trade) => {
      balance += Number(trade.pnl || 0);
      return { date: getTradeDateKey(trade), pnl: balance, winRate: stats.winRate };
    });
  }, [activeTrades, stats.winRate]);

  function openAddTrade(dateOverride) {
    if (shouldGateForBilling) {
      setActive("Billing");
      setTradeViewMode(null);
      setDataMessage("");
      return;
    }
    if (!accounts.length) {
      setDataMessage("Create your first trading account before logging trades.");
      createNewAccount();
      return;
    }
    tradeSavingRef.current = false;
    setIsTradeSaving(false);
    setEditingTradeId(null);
    setForm(createEmptyTradeForm(dateOverride));
    setIsTradeModalOpen(true);
  }
  function openEditTrade(trade) {
    if (shouldGateForBilling) {
      setActive("Billing");
      setTradeViewMode(null);
      setDataMessage("");
      return;
    }
    tradeSavingRef.current = false;
    setIsTradeSaving(false);
    setEditingTradeId(trade.id);
    if (trade.accountId && accounts.some((item) => String(item.id) === String(trade.accountId))) {
      setActiveAccountId(trade.accountId);
    }
    setForm(formFromTrade(trade));
    setIsTradeModalOpen(true);
  }
  function closeTradeModal() {
    tradeSavingRef.current = false;
    setIsTradeSaving(false);
    setTradeModalError("");
    setEditingTradeId(null);
    setForm(createEmptyTradeForm());
    setIsTradeModalOpen(false);
  }
  async function saveTrade() {
    if (shouldGateForBilling) {
      setActive("Billing");
      setTradeViewMode(null);
      return;
    }
    if (!accounts.length || account.isPlaceholder) {
      setDataMessage("Create your first trading account before saving trades.");
      createNewAccount();
      return;
    }
    const required = [form.symbol, form.date, form.session, form.strategy];
    const pnl = Number(form.pnl);
    const quantity = Number(form.quantity);
    const risk = Number(form.risk);
    if (required.some((item) => !item || String(item).startsWith("Select")) || Number.isNaN(pnl) || Number.isNaN(quantity) || quantity <= 0 || Number.isNaN(risk) || risk < 0) return;
    if (tradeSavingRef.current) return;
    tradeSavingRef.current = true;
    setIsTradeSaving(true);
    const normalizedResult = normalizeTradeResult(form.result) || getResultFromPnl(pnl);
    const normalizedTags = normalizeTags(form).filter((tag) => !String(tag).toLowerCase().startsWith("result:"));
    const existingTrade = trades.find((item) => item.id === editingTradeId);
    const trade = createTradeFromForm({ ...form, result: normalizedResult, tags: [resultToTag(normalizedResult), ...normalizedTags].join(", "), pnl, quantity, risk }, editingTradeId || existingTrade?.id, account, existingTrade);
    const tradeForSave = existingTrade?.supabaseId ? { ...trade, supabaseId: existingTrade.supabaseId } : trade;

    if (!editingTradeId) {
      const newKey = getTradeDuplicateKey(tradeForSave);
      const isDuplicate = trades.some((t) => getTradeDuplicateKey(t) === newKey);
      if (isDuplicate) {
        setTradeModalError("This trade already exists in your journal.");
        tradeSavingRef.current = false;
        setIsTradeSaving(false);
        return;
      }
    }
    setTradeModalError("");

    try {
      setDataMessage("");
      const savedTrade = await saveTradeToSupabase(authUser?.id, tradeForSave);
      setTrades((current) => {
        const nextTrades = editingTradeId ? current.map((item) => (item.id === editingTradeId ? savedTrade : item)) : [savedTrade, ...current];
        saveLocalTradesFallback(nextTrades, authUser?.id);
        if (authUser?.id) saveRestoreCache(authUser.id, { trades: nextTrades, account, routine, theme });
        return nextTrades;
      });
      closeTradeModal();
    } catch (error) {
      setTrades((current) => {
        const localTrade = { ...tradeForSave, id: editingTradeId || Date.now(), createdAt: tradeForSave.createdAt || Date.now() };
        const nextTrades = editingTradeId ? current.map((item) => (item.id === editingTradeId ? localTrade : item)) : [localTrade, ...current];
        saveLocalTradesFallback(nextTrades, authUser?.id);
        if (authUser?.id) saveRestoreCache(authUser.id, { trades: nextTrades, account, routine, theme });
        return nextTrades;
      });
      closeTradeModal();
      console.warn("Trade saved locally; cloud sync will retry on the next successful session.", error?.message || error);
      setDataMessage("");
    } finally {
      tradeSavingRef.current = false;
      setIsTradeSaving(false);
    }
  }
  async function importTradesFromFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseTradesCSV(text, account, trades);
    setImportPreview({ ...parsed, filename: file.name });
    event.target.value = "";
  }
  async function confirmImportTrades() {
    if (!importPreview?.trades?.length) return;

    try {
      setDataMessage("");
      const savedTrades = [];

      for (const trade of importPreview.trades) {
        const savedTrade = await saveTradeToSupabase(authUser?.id, trade);
        savedTrades.push(savedTrade);
      }

      setTrades((current) => {
        const nextTrades = [...savedTrades, ...current];
        saveLocalTradesFallback(nextTrades, authUser?.id);
        if (authUser?.id) saveRestoreCache(authUser.id, { trades: nextTrades, account, routine, theme });
        return nextTrades;
      });
      setImportPreview(null);
      setDataMessage(`${savedTrades.length} imported trade${savedTrades.length === 1 ? "" : "s"} saved locally + to Supabase ✅`);
    } catch (error) {
      setTrades((current) => {
        const nextTrades = [...importPreview.trades, ...current];
        saveLocalTradesFallback(nextTrades, authUser?.id);
        if (authUser?.id) saveRestoreCache(authUser.id, { trades: nextTrades, account, routine, theme });
        return nextTrades;
      });
      setImportPreview(null);
      setDataMessage(`Trades saved in browser backup ✅ Supabase import failed: ${error?.message || "check RLS policies"}`);
    }
  }
  async function restoreBackupFromFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!supabase || !authUser?.id) {
        throw new Error("Supabase/Auth არ არის მზად. თავიდან შედი ანგარიშში და მერე სცადე Restore.");
      }

      const text = await file.text();
      const parsed = validateCritiqueBackup(JSON.parse(text));
      if (!parsed.ok) {
        window.alert(parsed.error || "Backup file ვერ წაიკითხა.");
        return;
      }

      const currentLocalTrades = readLocalTradesFallback(authUser.id);
      const currentSupabaseTrades = await loadTradesFromSupabase(authUser.id);
      const currentTrades = mergeTradesUnique(trades, mergeTradesUnique(currentSupabaseTrades || [], currentLocalTrades));
      const mergedTrades = mergeTradesUnique(parsed.trades, currentTrades);
      const addedCount = Math.max(0, mergedTrades.length - currentTrades.length);
      const duplicateCount = Math.max(0, parsed.trades.length - addedCount);

      const confirmed = window.confirm(`Backup restore/merge?

Backup trades: ${parsed.trades.length}
Current trades: ${currentTrades.length}
Final trades after merge: ${mergedTrades.length}
Skipped duplicates: ${duplicateCount}

ეს აღარ წაშლის ახალ trades-ს. Backup დაემატება არსებულ trades-ს და დუბლიკატები არ გამეორდება.`);
      if (!confirmed) return;

      setDataMessage("Merging backup with your current trades...");

      const restoredTrades = await replaceTradesInSupabase(authUser.id, mergedTrades);
      const restoredAccount = await saveAccountToSupabase(authUser.id, parsed.account);
      const verifiedTrades = await loadTradesFromSupabase(authUser.id);
      const finalTrades = Array.isArray(verifiedTrades) && verifiedTrades.length === mergedTrades.length ? verifiedTrades : restoredTrades;

      if (finalTrades.length !== mergedTrades.length) {
        throw new Error(`Restore merge verification failed. Expected ${mergedTrades.length} trades, but Supabase returned ${finalTrades.length}.`);
      }

      saveRestoreCache(authUser.id, {
        trades: finalTrades,
        account: restoredAccount,
        routine: parsed.routine,
        theme: parsed.theme,
      });

      saveLocalTradesFallback(finalTrades, authUser.id);
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(restoredAccount));
      localStorage.setItem(ROUTINE_KEY, JSON.stringify(parsed.routine));
      localStorage.setItem(THEME_KEY, parsed.theme);

      setTrades(finalTrades);
      setAccounts((current) => {
        const finalAccount = { ...defaultAccount, ...restoredAccount, id: restoredAccount.id || account.id || defaultAccount.id, balance: Number(restoredAccount.balance || defaultAccount.balance) };
        const exists = current.some((item) => String(item.id) === String(finalAccount.id));
        return exists ? current.map((item) => String(item.id) === String(finalAccount.id) ? finalAccount : item) : [finalAccount, ...current];
      });
      setRoutine(parsed.routine);
      setTheme(parsed.theme);
      setDataMessage(`Backup merged, verified and cached ✅ Final trades: ${finalTrades.length}. Added: ${addedCount}. Skipped duplicates: ${duplicateCount}.`);
      window.alert(`Backup წარმატებით დაემატა არსებულ trades-ს ✅
Final trades: ${finalTrades.length}
Added: ${addedCount}
Skipped duplicates: ${duplicateCount}

ახლა refresh გააკეთე. ახალი trades აღარ უნდა წაიშალოს.`);
    } catch (error) {
      setDataMessage(error?.message || "Backup file არასწორია ან Supabase-ში ვერ ჩაიწერა.");
      window.alert(error?.message || "Backup file არასწორია ან დაზიანებულია.");
    } finally {
      event.target.value = "";
    }
  }
  function openStrategyFilters() {
    setActive("Journal");
    setShowFilters(true);
    setFilters((current) => ({ ...current, strategy: current.strategy || "All" }));
  }
  function requestDeleteTrade(id) {
    const tradeToDelete = trades.find((trade) => trade.id === id);
    if (tradeToDelete) setTradeDeleteTarget(tradeToDelete);
  }
  async function confirmDeleteTrade() {
    const id = tradeDeleteTarget?.id;
    if (!id) return;
    await deleteTrade(id);
    setTradeDeleteTarget(null);
  }
  async function deleteTrade(id) {
    const tradeToDelete = trades.find((trade) => trade.id === id);
    if (!tradeToDelete) return;
    const nextTrades = trades.filter((trade) => trade.id !== id);
    markTradeDeleted(authUser?.id, tradeToDelete);
    setTrades(nextTrades);
    saveLocalTradesFallback(nextTrades, authUser?.id);
    if (authUser?.id) saveRestoreCache(authUser.id, { trades: nextTrades, account, routine, theme });
    setViewTrade(null);
    setTradeViewMode(null);
    try {
      setDataMessage("");
      await deleteTradeFromSupabase(authUser?.id, tradeToDelete);
    } catch (error) {
      console.warn("Trade removed locally; cloud delete will retry on the next sync.", error?.message || error);
      setDataMessage("Trade removed from the site. Cloud sync will finish after the session refreshes.");
    }
  }
  function openTradeDetails(trade) {
    setViewTrade(trade);
    setTradeViewMode("details");
  }

  if (authLoading && !isAuthenticated) {
    return (
      <div className={theme === "light" ? "light-theme flex min-h-screen items-center justify-center bg-black text-white" : "flex min-h-screen items-center justify-center bg-black text-white"}>
        <style>{THEME_STYLE_CSS}</style>
        <div className="rounded-2xl border border-fuchsia-500/25 bg-black p-6 text-center shadow-[0_0_35px_rgba(178,74,242,0.16)]">
          <div className="text-3xl text-fuchsia-400">{BRAND_MARK}</div>
          <div className="mt-3 text-sm font-black text-zinc-300">Loading secure session...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={theme === "light" ? "light-theme min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-950" : "min-h-screen overflow-x-hidden bg-black text-white"}>
        <style>{THEME_STYLE_CSS}</style>
        <AuthPage
          authPage={authPage}
          setAuthPage={setAuthPage}
          onSubmitAuth={handleAuthSubmit}
          authLoading={authLoading}
          authMessage={authMessage}
          isSupabaseReady={isSupabaseReady}
          passwordRecoverySession={passwordRecoverySession}
          theme={theme}
          setTheme={setTheme}
        />
      </div>
    );
  }

  // While billing check is in progress AND no cached access: show minimal loader
  // (Users with cached access skip this and go straight to app)
  if (!billingChecked && !canUseAdminTools) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050308]">
        <div className="flex flex-col items-center gap-4">
          <span className="text-fuchsia-400"><BrandBolt className="h-12 w-12" /></span>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
            <Loader2 size={15} className="animate-spin text-fuchsia-500" />
            Checking subscription...
          </div>
        </div>
      </div>
    );
  }

  // Show billing gate as standalone page (before main app loads)
  if (shouldGateForBilling) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-black text-white">
        <style>{THEME_STYLE_CSS}</style>
        <BillingGatePage
          authUser={authUser}
          billingSubscription={billingSubscription}
          onSignOut={handleSignOut}
          onSubscriptionChange={setBillingSubscription}
          onSubscriptionRefresh={() => setBillingRefreshTick((t) => t + 1)}
        />
      </div>
    );
  }

  // Don't show subscription loading screen — render app directly

  return (
    <div className={`${theme === "light" ? "light-theme " : ""}${isSidebarCollapsed ? "sidebar-collapsed " : ""}min-h-screen overflow-x-hidden bg-black text-white`}>
      <style>{THEME_STYLE_CSS}</style>
      <aside className="app-sidebar fixed left-0 top-0 z-[70] hidden h-full w-64 border-r border-white/10 bg-black p-5 lg:block">
        <div className="sidebar-header flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setTradeViewMode(null);
              setActive(shouldGateForBilling ? "Billing" : "Dashboard");
            }}
            className="flex items-center gap-3 rounded-xl text-left text-xl font-black transition hover:text-fuchsia-200 focus:outline-none focus-visible:outline-none"
            aria-label="Go to dashboard"
          >
            <span className="text-fuchsia-400 drop-shadow-[0_0_6px_rgba(178,74,242,0.2)]">{BRAND_MARK}</span><span className="sidebar-label tracking-tight">{BRAND_NAME}</span>
          </button>
          <button
            onClick={() => { setIsSidebarCollapsed((collapsed) => !collapsed); setIsSidebarUserMenuOpen(false); setIsAccountSwitcherOpen(false); }}
            className="sidebar-collapse-toggle flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:border-fuchsia-500/40 hover:bg-white/10 hover:text-fuchsia-200"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <div className="sidebar-account-section relative mt-10">
          <button onClick={() => accounts.length ? setIsAccountSwitcherOpen((open) => !open) : createNewAccount()} className="account-sidebar-card flex w-full items-center justify-between rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 text-left hover:border-fuchsia-500/40">
            <div>
              <div className="text-sm font-bold">{accounts.length ? `🎯 ${account.name}` : "＋ Create account"}</div>
              <div className="text-xs text-zinc-400">{accounts.length ? `${account.currency} ${accountBalance.currentBalance.toLocaleString()}` : "No trading account yet"}</div>
            </div>
            <span className={isAccountSwitcherOpen ? "rotate-180 text-zinc-500 transition" : "text-zinc-500 transition"}>⌄</span>
          </button>

          {isAccountSwitcherOpen && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="account-switcher-menu absolute left-0 top-14 z-[90] w-80 overflow-hidden rounded-xl border border-white/10 bg-[#070707] p-1 shadow-[0_18px_55px_rgba(0,0,0,0.90)] ring-1 ring-fuchsia-500/15">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
                <div className="text-sm font-black text-white">Trading Accounts</div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white">{accounts.length} Account{accounts.length === 1 ? "" : "s"}</span>
              </div>

              <div className="max-h-72 overflow-y-auto p-1">
                {accounts.map((item) => {
                  const itemBalance = calculateAccountBalance(item, trades);
                  const isActive = String(item.id) === String(account.id);
                  return (
                    <div key={item.id} role="button" tabIndex={0} onClick={() => { setActiveAccountId(item.id); setIsAccountSwitcherOpen(false); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActiveAccountId(item.id); setIsAccountSwitcherOpen(false); } }} className={isActive ? "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/12 px-3 py-3 text-left" : "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-3 text-left hover:border-fuchsia-500/25 hover:bg-white/5"}>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="text-lg">🎯</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-black text-white">{item.name}</span>
                            {isActive && <span className="rounded-full bg-fuchsia-500 px-2 py-0.5 text-[10px] font-black text-black">Active</span>}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="rounded-md bg-blue-500/15 px-2 py-0.5 font-black text-blue-300">{String(item.type || "Demo").replace(" Account", "")}</span>
                            <span className="font-bold text-zinc-400">{item.currency} {Number(itemBalance.currentBalance || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button type="button" onClick={(event) => { event.stopPropagation(); setActiveAccountId(item.id); setIsAccountModalOpen(true); setIsAccountSwitcherOpen(false); }} className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-[10px] font-black text-zinc-400 hover:border-fuchsia-500/50 hover:text-fuchsia-300">Edit</button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); requestDeleteAccount(item.id); }} className="rounded-lg border border-red-500/25 bg-red-500/10 p-1.5 text-red-300 transition hover:border-red-400/70 hover:bg-red-500/20 hover:text-red-200" aria-label={`Delete ${item.name}`}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={createNewAccount} className="account-create-button flex w-full items-center gap-3 border-t border-white/10 px-4 py-4 text-left transition hover:bg-fuchsia-500/10">
                <span className="account-create-icon flex h-9 w-9 items-center justify-center rounded-lg bg-fuchsia-500/15 text-xl font-black text-fuchsia-300">+</span>
                <span>
                  <span className="block text-sm font-black text-[#0f0a1e]">Create New Account</span>
                  <span className="block text-xs font-semibold text-[#0f0a1e]/70">Add another trading account</span>
                </span>
              </button>
            </motion.div>
          )}
        </div>
        <div className="sidebar-nav mt-6 space-y-2">
          {navItems.map(([Icon, label]) => {
            const isActive = active === label && !tradeViewMode;
            return (
              <button key={label} title={label} onClick={() => { setActive(shouldGateForBilling ? "Billing" : label); setTradeViewMode(null); }}
                className={`sidebar-nav-item relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200
                  ${isActive
                    ? "sidebar-nav-item-active bg-fuchsia-500/12 text-fuchsia-200 font-bold"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}>
                {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-fuchsia-500" />}
                <Icon size={17} className={isActive ? "text-fuchsia-400" : "text-zinc-500"} />
                <span className="sidebar-label">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="sidebar-bottom absolute bottom-5 left-5 right-5">
          {isSidebarUserMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="sidebar-user-menu mb-3 overflow-hidden rounded-lg border border-white/10 bg-[#070707] p-3 shadow-[0_18px_55px_rgba(0,0,0,0.85)] ring-1 ring-fuchsia-500/10"
            >
              <button
                onClick={() => {
                  setActive(shouldGateForBilling ? "Billing" : "Settings");
                  setTradeViewMode(null);
                  setIsSidebarUserMenuOpen(false);
                }}
                className="flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left text-sm font-bold text-white transition hover:bg-white/5"
              >
                <Settings size={17} className="text-zinc-400" strokeWidth={2.2} />
                Settings
              </button>
              <button
                onClick={() => {
                  setActive("Billing");
                  setTradeViewMode(null);
                  setIsSidebarUserMenuOpen(false);
                }}
                className="flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left text-sm font-bold text-white transition hover:bg-white/5"
              >
                <CreditCard size={17} className="text-zinc-400" strokeWidth={2.2} />
                Billing
              </button>
              <div className="my-3 h-px bg-white/10" />
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left text-sm font-bold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={17} strokeWidth={2.2} />
                Sign out
              </button>
            </motion.div>
          )}

          <button
            onClick={() => { if (isSidebarCollapsed) { setIsSidebarCollapsed(false); } else { setIsSidebarUserMenuOpen((open) => !open); } }}
            title={isSidebarCollapsed ? profileName : undefined}
            className="account-sidebar-card flex w-full items-center justify-between rounded-lg border border-fuchsia-500/20 bg-fuchsia-950/40 p-3 text-left transition hover:border-fuchsia-400/50 hover:bg-fuchsia-950/55"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fuchsia-500 text-sm font-black text-black">
                {profilePhoto ? <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" /> : profileInitial}
              </div>
              <div className="sidebar-label min-w-0">
                <div className="truncate text-sm font-black text-white">{profileName}</div>
                {(() => { const b = getSubscriptionBadge(billingSubscription); return <div className={`text-xs font-semibold ${b.tone === "emerald" ? "text-emerald-400" : b.tone === "fuchsia" ? "text-fuchsia-400" : "text-zinc-400"}`}>{b.label}{b.detail ? ` · ${b.detail}` : ""}</div>; })()}
              </div>
            </div>
            <span className={`sidebar-label ${isSidebarUserMenuOpen ? "text-zinc-400 transition rotate-180" : "text-zinc-400 transition"}`}>⌄</span>
          </button>
        </div>
      </aside>
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="theme-toggle-button fixed right-4 top-4 z-[85] flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-500/35 text-fuchsia-200 transition duration-200 hover:bg-fuchsia-500/15 hover:text-white lg:right-6 lg:top-6 lg:h-12 lg:w-12"
        title={theme === "dark" ? "Switch to white mode" : "Switch to dark mode"}
        aria-label={theme === "dark" ? "Switch to white mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <main className="app-main min-h-screen overflow-x-hidden pb-24 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-none">

        {dataMessage && (
          <div className="mb-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300">
            {dataMessage}
          </div>
        )}
        {shouldGateForBilling && active !== "Support" && active !== "Admin" ? (
          <BillingPageDodo
            account={account}
            authUser={authUser}
            initialSubscription={billingSubscription}
            gateMessage={billingGateMessage}
            requireActivation
            onSignOut={handleSignOut}
            onSubscriptionChange={setBillingSubscription}
            onSubscriptionRefresh={() => setBillingRefreshTick((tick) => tick + 1)}
          />
        ) : tradeViewMode === "details" && viewTrade ? (
          <TradeDetailsPage
            trade={viewTrade}
            account={account}
            onBack={() => { setTradeViewMode(null); setViewTrade(null); }}
            onEdit={() => openEditTrade(viewTrade)}
            onDelete={() => requestDeleteTrade(viewTrade.id)}
            onExport={() => exportTradesToCSV([viewTrade])}
          />
        ) : active === "Dashboard" ? (
          <Dashboard
            stats={stats}
            account={account}
            accountBalance={accountBalance}
            curve={curve}
            trades={activeTrades}
            recentTrades={getNewestDashboardTrades(activeTrades)}
            onAdd={openAddTrade}
            onView={openTradeDetails}
            onStartDay={() => setIsRoutineOpen(true)}
            routine={routine}
            selectedCalendarDate={selectedCalendarDate}
            onSelectCalendarDate={(dateKey) => { setSelectedCalendarDate(dateKey); setActive("Calendar"); }}
            onViewAllTrades={() => setActive("Journal")}
            onOpenJournal={() => setActive("Journal")}
            onOpenMistakeDetector={() => setActive("Mistake Detector")}
            onOpenAccount={() => accounts.length ? setIsAccountModalOpen(true) : createNewAccount()}
            profileName={profileName}
            economicCalendar={economicCalendar}
            onRefreshEconomicCalendar={() => setEconomicCalendarRefresh((tick) => tick + 1)}
            isLoadingTrades={isInitialRemoteDataLoading}
          />
        ) : active === "Journal" ? (
          <JournalPage
            trades={filteredTrades}
            allTrades={activeTrades}
            stats={stats}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            onAdd={openAddTrade}
            onEdit={openEditTrade}
            onView={openTradeDetails}
            onRemove={requestDeleteTrade}
            onExport={() => exportTradesToCSV(activeTrades)}
            onImport={() => importFileRef.current?.click()}
            onBackup={() => exportCritiqueBackup({ trades: activeTrades, account, routine, theme })}
            onRestore={() => backupFileRef.current?.click()}
            onStrategies={() => setIsStrategiesModalOpen(true)}
            account={account}
          />
        ) : active === "Calendar" ? (
          <CalendarPage
            trades={activeTrades}
            onAdd={() => openAddTrade(selectedCalendarDate)}
            selectedDate={selectedCalendarDate}
            setSelectedDate={setSelectedCalendarDate}
            economicCalendar={economicCalendar}
            onRefreshEconomicCalendar={() => setEconomicCalendarRefresh((tick) => tick + 1)}
          />
        ) : active === "Statistics" ? (
          <SimpleStatisticsPage stats={stats} curve={curve} trades={activeTrades} onExport={() => exportTradesToCSV(activeTrades)} economicCalendar={economicCalendar} onRefreshEconomicCalendar={() => setEconomicCalendarRefresh((tick) => tick + 1)} onDeleteStrategy={(name) => { const next = strategiesObjects.filter((s) => s.name !== name); saveStrategiesObjects(next); }} />
        ) : active === "Mistake Detector" ? (
          <SimpleMistakeDetectorPage trades={activeTrades} />
        ) : active === "Support" ? (
          <SupportCenterPage authUser={authUser} />
        ) : active === "Settings" ? (
          <SettingsPagePro
            account={account}
            accountBalance={accountBalance}
            authUser={authUser}
            theme={theme}
            setTheme={setTheme}
            isSupabaseReady={isSupabaseReady}
            onOpenAccount={() => accounts.length ? setIsAccountModalOpen(true) : createNewAccount()}
            onBackup={() => exportCritiqueBackup({ trades: activeTrades, account, routine, theme })}
            onRestore={() => backupFileRef.current?.click()}
            onSignOut={handleSignOut}
            profilePhoto={profilePhoto}
            setProfilePhoto={setProfilePhoto}
            onSavePreferences={async (prefs) => {
              // Merge preferences into the current account and persist to Supabase
              const updatedAccount = { ...account, preferences: prefs };
              await handleSaveAccountSettings(updatedAccount);
            }}
            onProfileNameChange={(name, nextUser) => {
              if (nextUser) {
                setAuthUser(nextUser);
                return;
              }
              setAuthUser((current) => current ? {
                ...current,
                user_metadata: { ...(current.user_metadata || {}), full_name: name },
              } : current);
            }}
          />
        ) : active === "Admin" && canUseAdminTools ? (
          <AdminAccessPage />
        ) : (
          <BillingPageDodo
            account={account}
            authUser={authUser}
            initialSubscription={billingSubscription}
            onSignOut={handleSignOut}
            onSubscriptionChange={setBillingSubscription}
            onSubscriptionRefresh={() => setBillingRefreshTick((tick) => tick + 1)}
            onActivated={() => setActive("Dashboard")}
          />
        )}
        </div>
      </main>
      <MobileBottomNav active={active} setActive={setActive} onAdd={openAddTrade} setTradeViewMode={setTradeViewMode} lockedToBilling={shouldGateForBilling} />
      <TawkToWidget authUser={authUser} />
      <input ref={importFileRef} type="file" accept=".csv,text/csv" onChange={importTradesFromFile} className="hidden" />
      <input ref={backupFileRef} type="file" accept=".json,application/json" onChange={restoreBackupFromFile} className="hidden" />
      {isTradeModalOpen && <AddTradeModal isEditing={Boolean(editingTradeId)} isSaving={isTradeSaving} form={form} setForm={setForm} onClose={closeTradeModal} onSave={saveTrade} account={account} accounts={accounts} trades={trades} accountBalance={accountBalance} onSelectAccount={setActiveAccountId} onAddAccount={createNewAccount} onOpenStrategies={() => setIsStrategiesModalOpen(true)} strategiesObjects={strategiesObjects} errorMessage={tradeModalError} />}
      {isStrategiesModalOpen && <TradingStrategiesModal strategies={strategiesObjects} onSave={saveStrategiesObjects} onClose={() => setIsStrategiesModalOpen(false)} />}
      {importPreview && <ImportPreviewModal preview={importPreview} onConfirm={confirmImportTrades} onClose={() => setImportPreview(null)} />}
      {isRoutineOpen && <PreTradeRoutineModal routine={routine} setRoutine={setRoutine} onClose={() => setIsRoutineOpen(false)} />}
      {isAccountModalOpen && <AccountModal account={account} isNew={Boolean(pendingAccountDraft)} onSaveAccount={handleSaveAccountSettings} onClose={closeAccountModal} />}
      {tradeDeleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-gradient-to-br from-zinc-950 via-black to-[#140607] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.75)] ring-1 ring-red-500/10">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/35 bg-red-500/10 text-red-300"><Trash2 size={18} /></span>
              <div>
                <div className="text-lg font-black text-white">Delete trade?</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-zinc-400">Are you sure you want to delete <span className="font-black text-white">{tradeDeleteTarget.symbol || "this trade"}</span>?</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setTradeDeleteTarget(null)} className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-black text-zinc-300 transition hover:border-fuchsia-500/40 hover:text-white">No</button>
              <button type="button" onClick={confirmDeleteTrade} className="rounded-xl border border-red-500/45 bg-red-500/15 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500 hover:text-white">Yes, delete</button>
            </div>
          </motion.div>
        </div>
      )}
      {accountDeleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-gradient-to-br from-zinc-950 via-black to-[#140607] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.75)] ring-1 ring-red-500/10">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/35 bg-red-500/10 text-red-300"><Trash2 size={18} /></span>
              <div>
                <div className="text-lg font-black text-white">Delete account?</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-zinc-400">Are you sure you want to delete <span className="font-black text-white">{accountDeleteTarget.name}</span>?</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setAccountDeleteTarget(null)} className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-black text-zinc-300 transition hover:border-fuchsia-500/40 hover:text-white">No</button>
              <button type="button" onClick={confirmDeleteAccount} className="rounded-xl border border-red-500/45 bg-red-500/15 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500 hover:text-white">Yes, delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function MobileHeader({ onAdd }) {
  return (
    <div className="mobile-header-pro mb-6 flex items-center justify-between rounded-2xl border border-fuchsia-500/25 bg-black p-4 lg:hidden">
      <button type="button" onClick={requestDashboardNavigation} className="flex items-center gap-3 rounded-xl text-left text-xl font-black transition hover:text-fuchsia-200 focus:outline-none focus-visible:outline-none" aria-label="Go to dashboard"><span className="text-fuchsia-400 drop-shadow-[0_0_6px_rgba(178,74,242,0.2)]">{BRAND_MARK}</span><span className="tracking-tight">{BRAND_NAME}</span></button>
      <button onClick={onAdd} className="mobile-add-trade-button inline-flex items-center gap-2 rounded-xl bg-fuchsia-500 px-3 py-2 text-sm font-black text-white shadow-[0_0_18px_rgba(178,74,242,0.25)]"><Plus size={15} /> Add</button>
    </div>
  );
}

function MobileBottomNav({ active, setActive, onAdd, setTradeViewMode, lockedToBilling = false }) {
  const items = [
    [LayoutDashboard, "Dashboard"],
    [BookOpen, "Journal"],
    [Calendar, "Calendar"],
    [BarChart3, "Statistics"],
    [Target, "Mistake Detector"],
  ];
  return (
    <div className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-fuchsia-500/25 bg-black/95 px-2 py-2 backdrop-blur lg:hidden">
      {active !== "Calendar" && (
        <button onClick={onAdd} className="mobile-nav-fab absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-2xl bg-fuchsia-500 text-white shadow-[0_0_28px_rgba(178,74,242,.48)]"><Plus size={24} /></button>
      )}
      <div className="grid grid-cols-5 gap-1">
        {items.map(([Icon, label]) => {
          const isAdd = false;
          const selected = active === label;
          return (
            <button
              key={label}
              onClick={() => {
                setTradeViewMode(null);
                setActive(lockedToBilling ? "Billing" : label);
              }}
              className={isAdd ? "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500 text-white shadow-[0_0_22px_rgba(178,74,242,.38)]" : selected ? "flex flex-col items-center justify-center rounded-xl border border-fuchsia-500/35 bg-fuchsia-500/15 px-1 py-2 text-fuchsia-300 transition-all duration-200 hover:scale-110" : `flex flex-col items-center justify-center rounded-xl px-1 py-2 text-zinc-500 transition-all duration-200 ${label === "Statistics" || label === "Mistake Detector" ? "hover:scale-110 hover:bg-fuchsia-500/15 hover:text-fuchsia-200" : "hover:text-zinc-300"}`}
            >
              <Icon size={18} />
              <span className="mt-1 text-[8px] font-black leading-tight">{label === "Mistake Detector" ? "Mistake" : label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TopCrumb({ page, className = "mb-8" }) {
  return (
    <div className={`flex items-center gap-3 text-sm font-semibold ${className}`}>
      <button type="button" onClick={requestDashboardNavigation} className="flex items-center gap-3 rounded-lg transition hover:text-fuchsia-200 focus:outline-none focus-visible:outline-none" aria-label="Go to dashboard">
        <span className="text-fuchsia-400 drop-shadow-[0_0_6px_rgba(178,74,242,0.2)]">{BRAND_MARK}</span>
        <span className="tracking-tight">{BRAND_NAME}</span>
      </button>
      <span className="text-zinc-500">/</span>
      <span>{page}</span>
    </div>
  );
}

function JournalPage({ trades, allTrades, stats, searchQuery, setSearchQuery, filters, setFilters, showFilters, setShowFilters, onAdd, onEdit, onView, onRemove, onExport, onImport, onBackup, onRestore, onStrategies, account }) {
  const [sortBy, setSortBy] = useState("Date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const strategies = ["All", ...Array.from(new Set(allTrades.map((trade) => trade.setup).filter(Boolean)))];
  const sessions = ["All", ...TRADING_SESSIONS, ...Array.from(new Set(allTrades.map((trade) => trade.session).filter(Boolean))).filter((session) => !TRADING_SESSIONS.includes(session))];
  const activeFilters = Object.entries(filters).filter(([key, value]) => value && value !== "All" && key !== "tag").length + (filters.tag ? 1 : 0);
  const isJournalEmpty = allTrades.length === 0;
  const resetJournalFilters = () => {
    setSearchQuery("");
    setFilters({ result: "All", direction: "All", strategy: "All", session: "All", dateFrom: "", dateTo: "", minPnl: "", maxPnl: "", emotion: "All", tag: "", mistake: "All", setupQuality: "All", ruleBroken: "All" });
  };
  const sortedTrades = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...trades].sort((a, b) => {
      if (sortBy === "P&L") return (Number(a.pnl || 0) - Number(b.pnl || 0)) * direction;
      if (sortBy === "Symbol") return String(a.pair || "").localeCompare(String(b.pair || "")) * direction;
      if (sortBy === "Result") return getTradeResult(a).localeCompare(getTradeResult(b)) * direction;
      return String(getTradeDateKey(a)).localeCompare(String(getTradeDateKey(b))) * direction;
    });
  }, [trades, sortBy, sortDirection]);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <TopCrumb page="Journal" />
      <div className="flex flex-col gap-5 pr-14 sm:flex-row sm:items-center sm:justify-between lg:pr-16">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300"><BookOpen size={20} /></div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">Trading Journal</h1>
            <p className="mt-0.5 text-sm text-zinc-500">{account?.name || "Account"} • Track and analyze your trades efficiently</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onStrategies} variant="outline" className="journal-action-btn border-white/15 bg-transparent text-zinc-300 hover:text-white"><ListChecks size={15} /> Strategies</Button>
          <Button onClick={onImport} variant="outline" className="journal-action-btn border-white/15 bg-transparent text-zinc-300 hover:text-white"><Upload size={15} /> Import</Button>
          <Button onClick={onExport} variant="outline" className="journal-action-btn border-white/15 bg-transparent text-zinc-300 hover:text-white"><Download size={15} /> CSV</Button>
          <Button onClick={onAdd} className="journal-add-btn bg-fuchsia-500 font-bold text-black"><Plus size={15} /> Add Trade</Button>
        </div>
      </div>

      {isJournalEmpty ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-white/10 bg-black/20 px-6 py-20 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300">
              <BookOpen size={32} />
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-fuchsia-500/40 bg-fuchsia-500/20 text-fuchsia-300 text-xs"><Plus size={12} /></span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100">Your Trading Journal Awaits</h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium text-zinc-500 leading-relaxed">
            No trades logged yet. Add your first trade to start finding patterns.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button onClick={onAdd} className="bg-fuchsia-500 px-6 py-3 font-bold text-black"><Plus size={16} /> Log Your First Trade</Button>
            <Button onClick={onImport} variant="outline" className="border-white/15 bg-black px-6 py-3 font-bold text-zinc-300 hover:text-white">Import Trades</Button>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { icon: <Plus size={18} />, label: "Quick Entry", sub: "Log trades with ease" },
              { icon: <BookOpen size={18} />, label: "Rich Notes", sub: "Add detailed insights" },
              { icon: <Search size={18} />, label: "Smart Search", sub: "Find trades instantly" },
              { icon: <Filter size={18} />, label: "Advanced Filters", sub: "Organize by strategy" },
            ].map((feature) => (
              <div key={feature.label} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300">{feature.icon}</div>
                <div>
                  <div className="text-sm font-bold text-zinc-200">{feature.label}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">{feature.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="journal-search-panel mt-6 flex items-center gap-0 rounded-xl border border-white/10 bg-black px-4">
            <Search size={16} className="shrink-0 text-zinc-500" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search trades, symbols, strategies..." className="flex-1 border-0 bg-transparent py-3 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-0" />
            <div className="h-5 w-px bg-white/10 mx-3" />
            <button onClick={() => setShowFilters(!showFilters)} className={`flex shrink-0 items-center gap-1.5 py-3 text-sm font-semibold transition ${showFilters ? "text-fuchsia-300" : "text-zinc-400 hover:text-zinc-200"}`}>
              <Filter size={14} /> Filters
              {activeFilters > 0 && <span className="rounded-full bg-fuchsia-500 px-1.5 py-0.5 text-[10px] font-black text-black">{activeFilters}</span>}
              <ChevronDown size={13} className={showFilters ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
          </div>
          <div>
            {showFilters && (
              <div className="journal-filter-panel mt-4 rounded-xl border border-white/10 bg-black p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Field label="Result"><Select value={filters.result} onChange={(e) => setFilters({ ...filters, result: e.target.value })}><option>All</option>{TRADE_RESULT_OPTIONS.map((result) => <option key={result}>{result}</option>)}</Select></Field>
                  <Field label="Type"><Select value={filters.direction} onChange={(e) => setFilters({ ...filters, direction: e.target.value })}><option>All</option><option>Buy</option><option>Sell</option></Select></Field>
                  <Field label="Strategy"><Select value={filters.strategy} onChange={(e) => setFilters({ ...filters, strategy: e.target.value })}>{strategies.map((strategy) => <option key={strategy}>{strategy}</option>)}</Select></Field>
                  <Field label="Session"><Select value={filters.session} onChange={(e) => setFilters({ ...filters, session: e.target.value })}>{sessions.map((session) => <option key={session}>{session}</option>)}</Select></Field>
                  <DateFilterField label="From Date" value={filters.dateFrom} onChange={(value) => setFilters({ ...filters, dateFrom: value })} />
                  <DateFilterField label="To Date" value={filters.dateTo} onChange={(value) => setFilters({ ...filters, dateTo: value })} />
                  <Field label="Min P&L ($)"><MoneyInput value={filters.minPnl} onChange={(e) => setFilters({ ...filters, minPnl: e.target.value })} /></Field>
                  <Field label="Max P&L ($)"><MoneyInput value={filters.maxPnl} onChange={(e) => setFilters({ ...filters, maxPnl: e.target.value })} /></Field>
                  <Field label="Tags"><Input value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })} placeholder="Add tag filter" className="border-white/15 bg-black focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" /></Field>
                  <Field label="Emotion"><Select value={filters.emotion} onChange={(e) => setFilters({ ...filters, emotion: e.target.value })}><option value="All">All</option>{EMOTION_OPTIONS.map(([name]) => <option key={name} value={name}>{name}</option>)}</Select></Field>
                  <Field label="Mistake"><Select value={filters.mistake} onChange={(e) => setFilters({ ...filters, mistake: e.target.value })}><option value="All">All</option>{MISTAKE_OPTIONS.filter((m) => m !== "None").map((m) => <option key={m} value={m}>{m}</option>)}</Select></Field>
                  <Field label="Setup Quality"><Select value={filters.setupQuality} onChange={(e) => setFilters({ ...filters, setupQuality: e.target.value })}><option value="All">All</option>{SETUP_QUALITY_OPTIONS.map((q) => <option key={q} value={q}>{q}</option>)}</Select></Field>
                  <Field label="Rule Broken"><Select value={filters.ruleBroken} onChange={(e) => setFilters({ ...filters, ruleBroken: e.target.value })}><option value="All">All</option>{RULE_BROKEN_OPTIONS.filter((r) => r !== "None").map((r) => <option key={r} value={r}>{r}</option>)}</Select></Field>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <Button variant="outline" onClick={resetJournalFilters} className="border-white/15 bg-black text-zinc-300">Clear All Filters</Button>
                  <span className="text-xs text-zinc-500">{activeFilters} active filter{activeFilters !== 1 ? "s" : ""}</span>
                </div>
              </div>
            )}
          </div>
          <div className="journal-stats-grid mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            <StatCard title="Total Trades" value={stats.trades} />
            <StatCard title="Win Rate" value={`${stats.winRate.toFixed(1)}%`} green />
            <StatCard title="Break Even" value={stats.breakEvens || 0} gold />
            <StatCard title="Avg P&L" value={formatMoney(stats.avgPnl)} green />
            <StatCard title="Avg R:R" value={`1:${stats.avgRR.toFixed(1)}`} gold />
            <StatCard title="Total P&L" value={formatMoney(stats.totalPnl)} green />
          </div>
          <div className="journal-sort-panel mt-5 rounded-xl border border-white/10 bg-black p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <span>Sort by:</span>
                <div className="w-36"><Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option>Date</option><option>P&L</option><option>Symbol</option><option>Result</option></Select></div>
                <button onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")} className="rounded-lg border border-white/15 bg-black px-3 py-2 font-black text-zinc-300 transition hover:border-fuchsia-500/50 hover:bg-fuchsia-500 hover:text-black">{sortDirection === "asc" ? "↑" : "↓"}</button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "rounded-lg border border-fuchsia-500/50 bg-fuchsia-500 px-3 py-2 font-black text-black" : "rounded-lg border border-white/15 bg-black px-3 py-2 text-zinc-400 hover:text-zinc-200"}>▦</button>
                <button onClick={() => setViewMode("list")} className={viewMode === "list" ? "rounded-lg border border-fuchsia-500/50 bg-fuchsia-500 px-3 py-2 font-black text-black" : "rounded-lg border border-white/15 bg-black px-3 py-2 text-zinc-400 hover:text-zinc-200"}>☷</button>
              </div>
            </div>
          </div>
          {viewMode === "grid" ? (
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sortedTrades.map((trade) => <TradeCard key={trade.id} trade={trade} onView={() => onView(trade)} onEdit={() => onEdit(trade)} onRemove={() => onRemove(trade.id)} />)}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {sortedTrades.map((trade) => <TradeListRow key={trade.id} trade={trade} onView={() => onView(trade)} onEdit={() => onEdit(trade)} onRemove={() => onRemove(trade.id)} />)}
            </div>
          )}
          {sortedTrades.length === 0 && (
            <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-10 text-center">
              <Search size={28} className="mx-auto mb-3 text-zinc-600" />
              <div className="text-lg font-bold text-zinc-300">No trades match these filters.</div>
              <p className="mt-1 text-sm text-zinc-500">Clear the current filters or search to see all your trades.</p>
              <div className="mt-5 flex justify-center gap-3">
                <Button variant="outline" onClick={resetJournalFilters} className="border-white/15 bg-black text-zinc-300">Clear Filters</Button>
                <Button onClick={onAdd} className="bg-fuchsia-500 font-bold text-black"><Plus size={16} /> Add Trade</Button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

function DateFilterField({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);
  const pickerId = useRef(`date-picker-${Math.random().toString(36).slice(2)}`);
  const baseDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewDate, setViewDate] = useState(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const cells = getCalendarCells(year, month);

  useEffect(() => {
    function closeOtherDropdowns(event) {
      if (event.detail !== pickerId.current) setIsOpen(false);
    }
    window.addEventListener("critique-dropdown-open", closeOtherDropdowns);
    return () => window.removeEventListener("critique-dropdown-open", closeOtherDropdowns);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function toggleDatePicker() {
    setIsOpen((open) => {
      const next = !open;
      if (next) {
        window.dispatchEvent(new CustomEvent("critique-dropdown-open", { detail: pickerId.current }));
      }
      return next;
    });
  }

  function pickDate(dateKey) {
    setIsOpen(false);
    onChange(dateKey);
  }

  return (
    <Field label={label}>
      <div ref={pickerRef} className="relative">
        <button
          type="button"
          onClick={toggleDatePicker}
          className="date-picker-trigger flex h-10 w-full items-center gap-3 rounded-md border border-white/15 bg-black px-3 text-left text-sm text-white outline-none transition-all hover:border-fuchsia-400 focus:border-fuchsia-400 focus:shadow-[0_0_14px_rgba(178,74,242,0.16)]"
        >
          <Calendar size={15} className="shrink-0 text-fuchsia-300/80" />
          <span className={value ? "date-picker-value text-white" : "date-picker-placeholder text-zinc-500"}>{value || "mm/dd/yyyy"}</span>
        </button>
        {isOpen && (
          <div className="date-picker-popover absolute left-0 top-full z-[999] mt-2 rounded-xl border border-fuchsia-500/40 bg-[#050505] p-3 shadow-[0_18px_55px_rgba(0,0,0,0.95)] ring-1 ring-fuchsia-500/20">
            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="date-picker-nav rounded-lg border border-white/10 bg-zinc-950 p-1.5 text-zinc-300 hover:border-fuchsia-500/50"><ChevronLeft size={15} /></button>
              <div className="date-picker-title text-sm font-black text-white">{monthName}</div>
              <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="date-picker-nav rounded-lg border border-white/10 bg-zinc-950 p-1.5 text-zinc-300 hover:border-fuchsia-500/50"><ChevronRight size={15} /></button>
            </div>
            <div className="date-picker-weekdays grid grid-cols-7 gap-1 text-center text-[10px] font-black text-zinc-500">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <div key={`${day}-${index}`} className="py-1">{day}</div>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((cell) => (
                <button
                  type="button"
                  key={cell.key}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    pickDate(cell.key);
                  }}
                  onClick={(event) => event.stopPropagation()}
                  className={`date-picker-day relative z-10 h-8 rounded-lg text-xs font-bold transition-all hover:bg-fuchsia-500/20 ${value === cell.key ? "date-picker-day-selected bg-fuchsia-500 text-white" : cell.isCurrentMonth ? "date-picker-day-current bg-zinc-950 text-white" : "date-picker-day-muted bg-black text-zinc-600"}`}
                >
                  <span className="date-picker-day-number">
                    {cell.day}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-2">
              <button type="button" onClick={() => { onChange(""); setIsOpen(false); }} className="text-xs font-bold text-zinc-400 hover:text-white">Clear</button>
              <button type="button" onClick={() => setIsOpen(false)} className="text-xs font-bold text-fuchsia-300 hover:text-fuchsia-200">Done</button>
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}

function TradeCard({ trade, onView, onEdit, onRemove }) {
  const screenshots = normalizeScreenshots(trade);
  const pnl = Number(trade.pnl || 0);
  const result = getTradeResult(trade);
  const rr = getTradeRR(trade);
  const resultTone = getResultTone(result);

  // Review completeness — purely display, derived from existing fields only
  const hasMistake = trade.mistake && trade.mistake !== "None" && !String(trade.mistake).startsWith("Select");
  const hasRuleBroken = trade.ruleBroken && trade.ruleBroken !== "None" && !String(trade.ruleBroken).startsWith("Select");
  const hasEmotion = trade.emotion && !String(trade.emotion).startsWith("Select");
  const reviewFilled = [
    screenshots.length > 0,
    String(trade.notes || "").trim().length > 0,
    hasEmotion,
    hasMistake,
    hasRuleBroken,
    Boolean(trade.setupQuality),
    Number(trade.entryQuality || 0) > 0,
    Number(trade.exitQuality || 0) > 0,
  ].filter(Boolean).length;
  const reviewTotal = 8;
  const reviewPct = Math.round((reviewFilled / reviewTotal) * 100);
  const reviewLabel = reviewPct >= 75 ? "Complete" : reviewPct >= 50 ? "Partial" : "Incomplete";
  const reviewColor = reviewPct >= 75 ? "bg-emerald-500" : reviewPct >= 50 ? "bg-amber-500" : "bg-zinc-700";
  const reviewTextColor = reviewPct >= 75 ? "text-emerald-400" : reviewPct >= 50 ? "text-amber-400" : "text-zinc-600";

  // Result badge colors
  const resultBadgeCls =
    resultTone === "emerald" ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" :
    resultTone === "red"     ? "border-red-500/40 bg-red-500/15 text-red-300" :
    resultTone === "fuchsia" ? "border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-300" :
                               "border-amber-500/40 bg-amber-500/15 text-amber-300";

  // Setup quality badge colors
  const setupQualityCls =
    ["A+", "A"].includes(trade.setupQuality) ? "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300" :
    trade.setupQuality === "B"               ? "border-fuchsia-500/30 bg-fuchsia-500/[0.08] text-fuchsia-300" :
                                               "border-amber-500/30 bg-amber-500/[0.08] text-amber-300";

  return (
    <div className="trade-card group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] transition-all duration-200 hover:border-white/20">

      {/* ── Screenshot area ─────────────────────────── */}
      <button onClick={onView} className="trade-screenshot-area relative block h-44 w-full overflow-hidden bg-zinc-900 text-left">
        {screenshots.length ? (
          <>
            <img src={screenshots[0]} alt="Trade screenshot" className="trade-screenshot-image h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-95" />
            <div className="trade-screenshot-overlay absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
          </>
        ) : (
          <div className="trade-no-screenshot flex h-full flex-col items-center justify-center bg-[#0a0a0a]">
            <div className="trade-no-screenshot-icon flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-zinc-600">
              <Camera size={20} />
            </div>
            <span className="trade-no-screenshot-text mt-2 text-xs font-bold text-zinc-600">No screenshot</span>
            <span className="mt-0.5 text-[11px] font-semibold text-zinc-700">Edit trade to add one</span>
          </div>
        )}

        {/* Pair + direction */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full border border-fuchsia-500/30 bg-black/75 px-2.5 py-1 text-xs font-black text-fuchsia-300 backdrop-blur">{trade.pair}</span>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-black backdrop-blur ${getTradeDirectionClass(trade.direction)}`}>{trade.direction}</span>
        </div>

        {/* Result badge */}
        <div className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-black backdrop-blur ${resultBadgeCls}`}>{result}</div>

        {/* P&L */}
        <div className={`absolute bottom-3 right-3 rounded-lg border px-3 py-1.5 text-base font-black backdrop-blur ${getPnlPillClass(pnl)}`}>{getPnlArrow(pnl)} {formatMoney(pnl)}</div>

        {/* Screenshot count badge */}
        {screenshots.length > 1 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full border border-white/20 bg-black/65 px-2 py-1 text-[11px] font-black text-zinc-300 backdrop-blur">
            <Camera size={10} /> {screenshots.length}
          </div>
        )}
      </button>

      {/* ── Card body ────────────────────────────────── */}
      <div className="relative z-10 p-5">

        {/* Strategy + date + setup quality */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-black text-white">{trade.setup || "No strategy"}</div>
            <div className="mt-0.5 text-xs font-semibold text-zinc-500">
              {trade.date}{trade.session ? ` · ${trade.session}` : ""}
            </div>
          </div>
          {trade.setupQuality && (
            <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-black ${setupQualityCls}`}>
              {trade.setupQuality}
            </span>
          )}
        </div>

        {/* Metrics */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <MetricBox label="Risk" value={trade.risk ? formatMoney(trade.risk) : "—"} tone="fuchsia" />
          <MetricBox label="R:R" value={trade.risk ? `${rr.toFixed(2)}R` : "—"} tone="fuchsia" />
          <MetricBox label="Qty" value={trade.quantity || "—"} tone="fuchsia" />
        </div>

        {/* Entry / Exit time */}
        {(trade.entryTime || trade.exitTime) && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {trade.entryTime && (
              <div className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-black/25 px-3 py-1.5 text-xs">
                <span className="font-black text-zinc-600">Entry</span>
                <span className="font-black text-white">{trade.entryTime}</span>
              </div>
            )}
            {trade.exitTime && (
              <div className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-black/25 px-3 py-1.5 text-xs">
                <span className="font-black text-zinc-600">Exit</span>
                <span className="font-black text-white">{trade.exitTime}</span>
              </div>
            )}
          </div>
        )}

        {/* Behavior: emotion + mistake + rule broken */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {hasEmotion ? (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 py-1 text-xs font-semibold text-emerald-300">{trade.emotion}</span>
          ) : null}
          {hasMistake ? (
            <span className="rounded-full border border-red-500/25 bg-red-500/[0.07] px-2.5 py-1 text-xs font-semibold text-red-300">{trade.mistake}</span>
          ) : null}
          {hasRuleBroken ? (
            <span className="rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-2.5 py-1 text-xs font-semibold text-amber-300">Rule: {trade.ruleBroken}</span>
          ) : null}
          {!hasEmotion && !hasMistake && !hasRuleBroken && (
            <span className="text-xs font-semibold text-zinc-700">Not tagged</span>
          )}
        </div>

        {/* Footer: review completeness + actions */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/8">
              <div className={`h-full rounded-full transition-all duration-500 ${reviewColor}`} style={{ width: `${reviewPct}%` }} />
            </div>
            <span className={`text-[11px] font-black ${reviewTextColor}`}>{reviewLabel}</span>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button onClick={onEdit} className="rounded-lg border border-white/10 bg-black p-2 text-zinc-400 transition hover:border-fuchsia-500/50 hover:text-fuchsia-300"><Edit3 size={15} /></button>
            <button onClick={onRemove} className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:border-red-500/60"><Trash2 size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TradeListRow({ trade, onView, onEdit, onRemove }) {
  const pnl = Number(trade.pnl || 0);
  const rr = getTradeRR(trade);
  const result = getTradeResult(trade);
  const resultTone = getResultTone(result);
  const hasMistake = trade.mistake && trade.mistake !== "None" && !String(trade.mistake).startsWith("Select");
  const hasEmotion = trade.emotion && !String(trade.emotion).startsWith("Select");

  const resultDotCls =
    resultTone === "emerald" ? "bg-emerald-400" :
    resultTone === "red"     ? "bg-red-400" :
    resultTone === "fuchsia" ? "bg-fuchsia-400" :
                               "bg-amber-400";

  return (
    <div className="trade-list-row group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-white/8 bg-[#0d0d0d] px-5 py-4 transition-all duration-200 hover:border-white/15 hover:bg-[#0f0f0f] sm:flex-row sm:items-center sm:justify-between sm:gap-5">

      {/* Left — pair + result dot + strategy + meta */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-xs font-black text-zinc-300">
          {trade.pair?.slice(0, 3)}
          <span className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0d0d0d] ${resultDotCls}`} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-black ${getTradeDirectionClass(trade.direction)}`}>{trade.direction}</span>
            <span className="truncate text-sm font-black text-white">{trade.setup || "No strategy"}</span>
            {trade.setupQuality && (
              <span className={`hidden rounded-md border px-1.5 py-0.5 text-[11px] font-black xl:inline ${["A+", "A"].includes(trade.setupQuality) ? "border-emerald-500/30 text-emerald-400" : "border-amber-500/30 text-amber-400"}`}>
                {trade.setupQuality}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-600">
            <span>{trade.date}</span>
            {trade.session && <><span>·</span><span className="text-fuchsia-400/70">{trade.session}</span></>}
            {hasEmotion && <><span>·</span><span className="hidden text-zinc-500 sm:inline">{trade.emotion}</span></>}
            {hasMistake && <><span>·</span><span className="hidden text-red-400/70 lg:inline">{trade.mistake}</span></>}
          </div>
        </div>
      </div>

      {/* Right — metrics + P&L + actions */}
      <div className="flex items-center gap-4 sm:gap-5">
        <span className="hidden text-xs text-zinc-600 sm:block">Qty <span className="font-bold text-zinc-400">{trade.quantity || "—"}</span></span>
        <span className="hidden text-xs text-zinc-600 lg:block">R:R <span className="font-bold text-zinc-400">{trade.risk ? `${rr.toFixed(1)}R` : "—"}</span></span>
        <span className={`min-w-[90px] text-right text-base font-black sm:min-w-[105px] ${getPnlToneClass(pnl)}`}>{getPnlArrow(pnl)} {formatMoney(pnl)}</span>
        <div className="flex shrink-0 gap-1.5">
          <button onClick={onEdit} className="rounded-lg border border-white/8 bg-transparent p-2 text-zinc-500 transition hover:border-fuchsia-500/40 hover:text-fuchsia-300"><Edit3 size={15} /></button>
          <button onClick={onRemove} className="rounded-lg border border-red-500/15 bg-red-500/[0.08] p-2 text-red-500 transition hover:border-red-500/50 hover:text-red-300"><Trash2 size={15} /></button>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, tone }) {
  return (
    <div className="journal-metric-box group relative overflow-hidden rounded-xl border border-white/8 bg-white/3 p-3 transition-all duration-200 hover:border-fuchsia-500/25 hover:bg-fuchsia-500/6">
      <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 rounded-bl-xl bg-fuchsia-500/5" />
      <div className="relative z-10 text-xs font-black uppercase tracking-wider text-fuchsia-300">{label}</div>
      <div className="relative z-10 mt-1 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function TradeDetailsPage({ trade, account, onBack, onEdit, onDelete, onExport }) {
  const screenshots = normalizeScreenshots(trade);
  const [activeIndex, setActiveIndex] = useState(null);
  useEffect(() => {
    if (activeIndex === null) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setActiveIndex(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeIndex]);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
      <TopCrumb page="Journal" />
      <div className="mb-8 flex items-center justify-between"><button onClick={onBack} className="text-sm font-bold text-zinc-300 hover:text-white">← Back</button><div className="flex gap-3"><Button onClick={onExport} variant="outline" className="border-white/15 bg-black text-white"><Download size={16} /> Export</Button><Button onClick={onEdit} variant="outline" className="border-white/15 bg-black text-white"><Edit3 size={16} /> Edit</Button><Button onClick={onDelete} className="bg-red-600 text-white"><Trash2 size={16} /> Delete</Button></div></div>
      {/* Header row */}
      <div className="flex items-center gap-4 mb-2">
        <div className="rounded-xl bg-fuchsia-500/20 p-4 text-fuchsia-300 text-lg font-black">{trade.pair}</div>
        <div>
          <h1 className="text-3xl font-black">{trade.pair} Trade Details</h1>
          <p className="text-zinc-400">{trade.direction} • {trade.quantity} {trade.quantity === 1 ? "share" : "shares"} • {trade.date}</p>
        </div>
      </div>

      {/* P&L banner */}
      <div className={`rounded-xl border p-5 mb-2 flex items-center justify-between ${Number(trade.pnl) > 0 ? "border-emerald-500/30 bg-emerald-950/30" : Number(trade.pnl) < 0 ? "border-red-500/30 bg-red-950/30" : "border-amber-500/30 bg-amber-950/30"}`}>
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Total P&L</div>
          <div className={`mt-1 text-4xl font-black ${getPnlToneClass(trade.pnl)}`}>{getPnlArrow(trade.pnl)} {formatMoney(trade.pnl)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Result</div>
          <div className={`mt-1 text-xl font-black ${getTradeResultClass(getTradeResult(trade))}`}>{getTradeResult(trade)}</div>
        </div>
      </div>

      {/* Main info grid */}
      <div className="rounded-xl border border-white/10 bg-zinc-950 p-6 mb-2">
        <SectionTitle title="Trade Info" icon={<BarChart3 size={18} />} />
        <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
          <Meta label="Direction" value={trade.direction} />
          <Meta label="Quantity" value={trade.quantity} />
          <Meta label="Session" value={trade.session || "—"} />
          <Meta label="Strategy" value={trade.setup || "—"} />
          <Meta label="Date" value={trade.date} />
          <Meta label="Entry Time" value={trade.entryTime || "—"} />
          <Meta label="Exit Time" value={trade.exitTime || "—"} />
          <Meta label="Emotion" value={trade.emotion || "—"} />
          <Meta label="Risk" value={formatMoney(trade.risk)} danger />
          <Meta label="Risk/Reward" value={`${getTradeRR(trade).toFixed(2)}:1`} gold />
          <Meta label="Realized P&L" value={formatMoney(trade.pnl)} green={Number(trade.pnl) > 0} gold={Number(trade.pnl) === 0} danger={Number(trade.pnl) < 0} />
          {trade.setupQuality && <Meta label="Setup Quality" value={trade.setupQuality} gold />}
          <Meta label="Mistake" value={trade.mistake || "None"} />
          {trade.ruleBroken && trade.ruleBroken !== "None" && <Meta label="Rules Broken" value={trade.ruleBroken} danger />}
        </div>

        {/* Tags row */}
        {normalizeTags(trade).filter(t => !String(t).toLowerCase().startsWith("result:")).length > 0 && (
          <div className="mt-6 border-t border-white/8 pt-5">
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Tags</div>
            <div className="flex flex-wrap gap-2">
              {normalizeTags(trade).filter(t => !String(t).toLowerCase().startsWith("result:")).map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-zinc-200">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Notes row */}
        {trade.notes && (
          <div className="mt-5 border-t border-white/8 pt-5">
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Notes</div>
            <p className="text-sm leading-6 text-zinc-300">{trade.notes}</p>
          </div>
        )}
      </div>

      {/* Screenshots */}
      <div className="rounded-xl border border-white/10 bg-zinc-950 p-6">
        <SectionTitle title={`Trade Screenshots (${screenshots.length})`} icon={<Camera size={18} />} />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {screenshots.length ? screenshots.map((img, index) => (
            <button key={index} onClick={() => setActiveIndex(index)}>
              <img src={img} alt="Trade screenshot" className="h-56 w-full rounded-lg object-cover hover:opacity-80" />
            </button>
          )) : (
            <div className="col-span-2 rounded-xl border border-dashed border-white/10 bg-black p-10 text-center text-zinc-500">No screenshots uploaded</div>
          )}
        </div>
      </div>
      {activeIndex !== null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4">
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="fixed right-4 top-4 z-[130] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-zinc-950/90 text-white shadow-[0_0_26px_rgba(178,74,242,0.28)] backdrop-blur transition hover:border-fuchsia-400/70 hover:bg-fuchsia-500 hover:text-black sm:right-8 sm:top-8"
            aria-label="Close screenshot preview"
            title="Close"
          >
            <X size={24} strokeWidth={2.8} />
          </button>
          {screenshots.length > 1 && (
            <button
              type="button"
              onClick={() => setActiveIndex((activeIndex - 1 + screenshots.length) % screenshots.length)}
              className="fixed left-4 top-1/2 z-[125] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/15 bg-zinc-950/80 text-3xl text-white shadow-lg transition hover:border-fuchsia-400/70 hover:text-fuchsia-200 sm:left-8"
              aria-label="Previous screenshot"
            >
              &lt;
            </button>
          )}
          <img src={screenshots[activeIndex]} alt="Fullscreen screenshot" className="max-h-[92vh] max-w-[92vw] rounded-xl border border-white/10 object-contain shadow-[0_24px_80px_rgba(0,0,0,0.75)]" />
          {screenshots.length > 1 && (
            <button
              type="button"
              onClick={() => setActiveIndex((activeIndex + 1) % screenshots.length)}
              className="fixed right-4 top-1/2 z-[125] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/15 bg-zinc-950/80 text-3xl text-white shadow-lg transition hover:border-fuchsia-400/70 hover:text-fuchsia-200 sm:right-8"
              aria-label="Next screenshot"
            >
              &gt;
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ReviewBox({ title, value, tone }) {
  const cls = tone === "emerald" ? "border-emerald-500/25 bg-emerald-500/10" : "border-red-500/25 bg-red-500/10";
  return <div className={`rounded-xl border p-4 ${cls}`}><div className="text-xs font-black uppercase tracking-widest text-zinc-400">{title}</div><div className="mt-2 text-sm font-semibold text-zinc-300">{value}</div></div>;
}

function OnboardingChecklist({ trades, account, onOpenJournal, onOpenAccount, onViewAllTrades, onOpenMistakeDetector }) {
  const tradeCount = trades.length;
  const steps = [
    {
      title: "Account setup",
      detail: account?.isPlaceholder ? "Name your trading account and starting balance." : `${account.name} is ready.`,
      done: !account?.isPlaceholder,
      action: onOpenAccount,
      actionLabel: account?.isPlaceholder ? "Create Account" : "Edit Account",
      icon: <ShieldCheck size={18} />,
    },
    {
      title: "First trade",
      detail: tradeCount ? `${tradeCount} trade${tradeCount === 1 ? "" : "s"} logged. Keep building the sample.` : "Open the journal and add one trade to activate real dashboard data.",
      done: tradeCount > 0,
      action: onOpenJournal,
      actionLabel: tradeCount ? "Open Journal" : "Start Journal",
      icon: <Plus size={18} />,
    },
    {
      title: "Review patterns",
      detail: tradeCount >= 3 ? "Statistics and mistake patterns have enough data to review." : `${Math.max(0, 3 - tradeCount)} more trade${3 - tradeCount === 1 ? "" : "s"} until stronger pattern signals.`,
      done: tradeCount >= 3,
      action: tradeCount >= 3 ? onOpenMistakeDetector : onViewAllTrades,
      actionLabel: tradeCount >= 3 ? "Open Detector" : "Open Journal",
      icon: <Target size={18} />,
    },
  ];
  const completedSteps = steps.filter((step) => step.done).length;
  const progress = Math.round((completedSteps / steps.length) * 100);
  const nextStep = steps.find((step) => !step.done) || steps[steps.length - 1];

  return (
    <section className="onboarding-checklist mt-8 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#05110d] via-black to-[#120719] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-emerald-300">Launch Checklist</div>
          <h2 className="mt-2 text-2xl font-black text-white">Set up the trading workflow</h2>
          <p className="mt-1 max-w-2xl text-sm font-semibold text-zinc-400">These three steps make the calendar, statistics, and mistake detector useful from day one.</p>
        </div>
        <div className="flex flex-col gap-3 sm:min-w-[220px]">
          <div className="rounded-2xl border border-white/10 bg-black/45 p-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-400">
              <span>Setup progress</span>
              <span className="text-emerald-300">{progress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-fuchsia-400 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <Button onClick={nextStep.action} className="bg-fuchsia-500 px-5 py-3 font-black text-white shadow-[0_0_22px_rgba(178,74,242,0.22)]"><BookOpen size={16} /> {nextStep.actionLabel}</Button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="onboarding-step rounded-xl border border-white/10 bg-black/45 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${step.done ? "border-emerald-400/45 bg-emerald-500/15 text-emerald-300" : "border-fuchsia-500/35 bg-fuchsia-500/10 text-fuchsia-300"}`}>{step.done ? <Check size={18} /> : step.icon}</div>
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${step.done ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300" : "border-amber-400/35 bg-amber-500/10 text-amber-200"}`}>{step.done ? "Done" : "Next"}</span>
            </div>
            <div className="mt-4 text-[11px] font-black uppercase tracking-widest text-zinc-600">Step {index + 1}</div>
            <h3 className="mt-4 text-base font-black text-white">{step.title}</h3>
            <p className="mt-1 min-h-[40px] text-sm font-semibold text-zinc-500">{step.detail}</p>
            <button onClick={step.action} className="mt-4 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-black text-zinc-200 transition hover:border-fuchsia-400/60 hover:text-fuchsia-200">{step.actionLabel}</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Dashboard({ stats, account, accountBalance, curve, trades, recentTrades, onAdd, onView, onStartDay, routine, selectedCalendarDate, onSelectCalendarDate, onViewAllTrades, onOpenJournal, onOpenMistakeDetector, onOpenAccount, profileName = "User", economicCalendar, onRefreshEconomicCalendar, isLoadingTrades = false }) {
  const [performanceMode, setPerformanceMode] = useState("EquityCurve");
  const quote = quotes[new Date().getDate() % quotes.length];
  const checkedCount = routineItems.filter((item) => routine.checked?.[item.id]).length;
  const routinePercent = Math.round((checkedCount / routineItems.length) * 100);
  const showEmptyState = !isLoadingTrades && (account?.isPlaceholder || trades.length === 0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <MobileHeader onAdd={onAdd} />

      <div className="mb-4 flex items-center justify-between gap-4">
        <TopCrumb page="Dashboard" className="" />
      </div>

      <div className="dashboard-hero relative overflow-hidden rounded-2xl p-6">
        {/* Background layers */}
        <div className="dashboard-hero-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-fuchsia-600/[0.025] blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white xl:text-3xl">
              Welcome back, <span className="bg-gradient-to-r from-fuchsia-300 to-violet-300 bg-clip-text text-transparent">{getFirstDisplayName(profileName)}</span>! <span className="waving-hand" aria-hidden="true">👋</span>
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-600"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2.5">
            <Button onClick={onOpenJournal} className="dashboard-primary-btn group relative overflow-hidden rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/55 px-5 py-2.5 text-sm font-bold text-fuchsia-100 shadow-[0_12px_28px_rgba(0,0,0,0.32)] hover:-translate-y-0.5 hover:border-fuchsia-400/45 hover:bg-fuchsia-950/75 hover:shadow-[0_16px_32px_rgba(0,0,0,0.40)]">
              <BookOpen size={15} /> Log Trade
            </Button>
            <Button onClick={onStartDay} className="dashboard-start-btn rounded-xl border border-white/10 bg-white/[0.035] px-5 py-2.5 text-sm font-bold text-zinc-300 backdrop-blur hover:border-white/20 hover:bg-white/[0.06] hover:text-white">Start Your Day</Button>
          </div>
        </div>

        {/* Coach Alert */}
        <DashboardCoachAlert trades={trades} onOpen={onOpenMistakeDetector} />
      </div>

      {showEmptyState ? (
        <DashboardEmptyState onAddTrade={onAdd} onOpenJournal={onOpenJournal} />
      ) : (
        <>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashCard title="TOTAL P&L" value={<RotatingPnlValue pnl={stats.totalPnl} balance={accountBalance.startingBalance} />} badge={stats.totalPnl >= 0 ? "↗ Positive P&L" : "↘ Negative P&L"} tone={stats.totalPnl >= 0 ? "emerald" : "amber"} icon="$" isLoading={isLoadingTrades} />
        <DashCard title="WIN RATE" value={`${stats.winRate.toFixed(1)}%`} badge={`↗ ${stats.wins}W / ${stats.losses}L${stats.breakEvens ? ` / ${stats.breakEvens}BE` : ""}${stats.partials ? ` / ${stats.partials}P` : ""}`} tone="fuchsia" icon="🏆" isLoading={isLoadingTrades} />
        <DashCard title="TOTAL TRADES" value={stats.trades} badge={`▣ ${stats.trades} closed`} tone="cyan" icon="⌁" isLoading={isLoadingTrades} />
        <DashCard title="AVG WIN/LOSS" value={`${formatMoney(stats.avgWin)} / ${formatMoney(stats.avgLoss)}`} badge={stats.avgWinLoss >= 999 ? "↗ Positive R:R" : `${stats.avgWinLoss.toFixed(2)} ratio`} tone="amber" icon="↗" isLoading={isLoadingTrades} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="dashboard-performance-card light-card rounded-2xl border border-white/15 bg-[#0a0a0a] p-6">
          <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="dashboard-performance-icon flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0d] text-fuchsia-300"><TrendingUp size={22} /></div>
              <div>
                <h2 className="text-2xl font-black">Performance Overview</h2>
                <p className="text-sm text-zinc-400">Your cumulative P&L over time</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/70 p-1.5">
              {[
                ["EquityCurve", "↗ EquityCurve"],
                ["WinRate", "⌁ WinRate"],
                ["DailyP&L", "▥ DailyP&L"],
              ].map(([mode, label]) => (
                <button key={mode} onClick={() => setPerformanceMode(mode)} className={performanceMode === mode ? "dashboard-performance-tab-active rounded-lg border border-fuchsia-500/30 bg-fuchsia-950/55 px-4 py-2 text-sm font-black text-fuchsia-100" : "dashboard-performance-tab rounded-lg border border-transparent px-4 py-2 text-sm font-black text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"}>{label}</button>
              ))}
            </div>
          </div>
          <PerformanceOverviewChart mode={performanceMode} trades={trades} curve={curve} stats={stats} isLoading={isLoadingTrades} />
        </div>
        <PerformanceScorePanel stats={stats} isLoading={isLoadingTrades} />
      </div>

      <QuickInsights insights={getDashboardInsights(trades, stats)} />

      <div className="mt-8 grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="flex h-full min-h-0 flex-col gap-6">
          <div className="dashboard-recent-card light-card relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a0a] p-6">
            <div className="relative z-10 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="dashboard-recent-icon flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0d] text-fuchsia-300"><TrendingUp size={22} /></div>
                <div>
                  <h2 className="text-2xl font-black">Recent Trades</h2>
                  <p className="text-sm text-zinc-400">Your latest activity</p>
                </div>
              </div>
              <button onClick={onViewAllTrades} className="view-all-button rounded-xl border border-white/10 bg-[#0a0a0d] px-4 py-2 text-sm font-black text-zinc-200 transition hover:-translate-y-0.5 hover:border-fuchsia-500/35 hover:text-fuchsia-200">View All</button>
            </div>
            <div className="dashboard-recent-list light-card-soft relative z-10 flex-1 rounded-2xl border border-white/10 bg-black/45 p-4">
              {recentTrades.map((trade) => {
                const screenshots = normalizeScreenshots(trade);
                const pnl = Number(trade.pnl || 0);
                return (
                  <button key={trade.id} onClick={() => onView(trade)} className="dashboard-recent-row group flex w-full items-center justify-between gap-2 rounded-xl border border-transparent p-3 text-left transition-all hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.035]">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                        {screenshots.length ? <img src={screenshots[0]} alt="Trade" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-zinc-500"><Camera size={18} /></div>}
                      </div>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2"><span className="truncate text-lg font-black">{trade.pair}</span><span className="trade-tag shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-black text-zinc-300">{trade.setup}</span></div>
                        <div className="mt-0.5 truncate text-sm font-semibold text-zinc-400">{trade.quantity ? `${trade.quantity} lots` : ""}{trade.quantity && trade.date ? " • " : ""}{trade.date}</div>
                      </div>
                    </div>
                    <div className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-black ${getPnlPillClass(pnl)}`}>{getPnlArrow(pnl)} {formatMoney(pnl)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={onStartDay} className="dashboard-routine-cta group relative min-h-[220px] w-full overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#080b0a] via-black to-[#050506] p-6 text-left transition-all duration-300 hover:-translate-y-0.5">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-zinc-400">Pre-Trade Routine</div>
                  <div className="mt-4 text-4xl font-black text-white">{checkedCount}/{routineItems.length}</div>
                  <div className="mt-2 text-sm font-bold text-emerald-300">{routinePercent === 100 ? "Ready to Trade" : `${routinePercent}% complete`}</div>
                </div>
                <div className="dashboard-routine-icon flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0d0c] text-2xl text-emerald-300">✅</div>
              </div>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500"><span>Checklist Progress</span><span>{routinePercent}%</span></div>
                <div className="routine-progress-track h-4 overflow-hidden rounded-full bg-zinc-900"><div className="h-full rounded-full bg-emerald-600/80" style={{ width: `${routinePercent}%` }} /></div>
              </div>
            </div>
          </button>
        </div>
        <TradingActivityPanel trades={trades} selectedDate={selectedCalendarDate} onSelectDate={onSelectCalendarDate} />
      </div>

      <TodaysEventsPanel economicCalendar={economicCalendar} onRefresh={onRefreshEconomicCalendar} />
        </>
      )}
    </motion.div>
  );
}

function DashboardMistakeAlert({ trades, onOpen }) {
  const detector = getMistakeDetectorStats(trades);
  if (!detector.mainIssue) return null;
  return (
    <button onClick={onOpen} className="dashboard-mistake-alert mt-8 w-full rounded-2xl border border-white/15 bg-gradient-to-r from-[#0b0809] via-black to-[#070506] p-5 text-left transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-red-300">Main Mistake Warning</div>
          <div className="mt-2 text-2xl font-black text-white">{translateDetectorText(detector.mainIssue.title)}</div>
          <div className="mt-1 text-sm font-bold text-zinc-400">{translateDetectorText(detector.mainRoot?.title || detector.mainIssue.type)} · {detector.confidence}% confidence · {formatMoney(detector.affectedPnl)} lost P&L</div>
        </div>
        <span className="rounded-xl border border-red-500/35 bg-red-500/15 px-4 py-3 text-sm font-black text-red-300">Open Mistake Analysis →</span>
      </div>
    </button>
  );
}

function DashboardCoachAlert({ trades, onOpen }) {
  const safe = Array.isArray(trades) ? trades : [];
  const detector = getMistakeDetectorStats(safe);

  // No trades at all
  if (safe.length === 0) {
    return (
      <div className="relative z-10 mt-5 overflow-hidden rounded-xl border border-white/8 bg-white/[0.02] px-5 py-4 backdrop-blur-sm">
        <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
          <Target size={11} className="shrink-0" /> Coach Alert
        </div>
        <p className="text-sm font-semibold text-zinc-500">Log your first trades to generate a coach alert.</p>
      </div>
    );
  }

  // Trades exist but no losses
  if (detector.losses.length === 0) {
    return (
      <div className="relative z-10 mt-5 overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-5 py-4 backdrop-blur-sm">
        <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
          <Target size={11} className="shrink-0" /> Coach Alert
        </div>
        <p className="text-sm font-black text-emerald-300">No losing trade patterns detected yet.</p>
        <p className="mt-1 text-xs font-semibold text-zinc-500">Keep logging and reviewing trades to track patterns over time.</p>
      </div>
    );
  }

  const { mainIssue, losses, lossProfile, focusPlan } = detector;
  if (!mainIssue) return null;

  const issueTitle = translateDetectorText(mainIssue.title);
  const isSingleLoss = losses.length === 1;
  const isEarlyData = losses.length < 4 || mainIssue.count < 2;

  const headlinePrefix = isSingleLoss
    ? "Early signal — latest losing trade points to"
    : isEarlyData
      ? "Possible pattern"
      : "Your #1 mistake";

  const sessionCtx = lossProfile?.session && lossProfile.session !== "No session" ? lossProfile.session : null;
  const fixText = Array.isArray(focusPlan) && focusPlan.length ? focusPlan[0] : null;

  return (
    <button type="button" onClick={onOpen} className="relative z-10 mt-5 w-full overflow-hidden rounded-xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4 text-left backdrop-blur-sm transition-all duration-200 hover:border-red-500/35 hover:bg-red-500/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500/80">
            <Target size={11} className="shrink-0" /> Coach Alert
          </div>
          <div className="text-sm font-black text-white">
            {headlinePrefix}: <span className="text-red-300">{issueTitle}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-zinc-500">
            <span>{mainIssue.count} losing trade{mainIssue.count === 1 ? "" : "s"}</span>
            {mainIssue.pnl ? <><span>·</span><span className="text-red-400">{formatMoney(mainIssue.pnl)}</span></> : null}
            {sessionCtx ? <><span>·</span><span>Mostly in {sessionCtx}</span></> : null}
          </div>
          {fixText && <p className="mt-2 text-xs font-semibold leading-5 text-zinc-400">{fixText}</p>}
        </div>
        <span className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-black text-red-300 transition hover:bg-red-500/15">
          View Fix Plan →
        </span>
      </div>
    </button>
  );
}

function TodaysEventsPanel({ economicCalendar }) {
  const todayKey = formatDateKey(new Date());
  const impactOptions = ["High", "Medium", "Low", "Holiday"];
  const [impactFilters, setImpactFilters] = useState(impactOptions);
  const [currencyFilters, setCurrencyFilters] = useState(["All"]);
  const baseCurrencyOptions = ["AUD", "CAD", "CHF", "CNY", "EUR", "GBP", "JPY", "NZD", "USD"];
  const currencyOptions = useMemo(() => {
    const todayEvents = getEventsForDate(economicCalendar?.events, todayKey);
    const dynamic = todayEvents.map((event) => String(event.country || "").toUpperCase()).filter((currency) => currency && currency !== "ALL");
    return Array.from(new Set([...baseCurrencyOptions, ...dynamic])).sort();
  }, [economicCalendar?.events, todayKey]);
  const events = useMemo(() => {
    const impactOrder = { High: 0, Medium: 1, Low: 2, Holiday: 3 };
    const selectedCurrencies = new Set(currencyFilters.filter((currency) => currency !== "All"));
    return getEventsForDate(economicCalendar?.events, todayKey)
      .filter((event) => impactFilters.includes(getEventImpactLabel(event.impact)))
      .filter((event) => !selectedCurrencies.size || selectedCurrencies.has(String(event.country || "").toUpperCase()))
      .sort((a, b) => {
        const impactDiff = (impactOrder[getEventImpactLabel(a.impact)] ?? 9) - (impactOrder[getEventImpactLabel(b.impact)] ?? 9);
        if (impactDiff) return impactDiff;
        return String(a.time || "").localeCompare(String(b.time || ""));
      });
  }, [economicCalendar?.events, todayKey, impactFilters, currencyFilters]);

  function toggleImpactFilter(impact) {
    setImpactFilters((current) => {
      const next = current.includes(impact) ? current.filter((item) => item !== impact) : [...current, impact];
      return next.length ? next : current;
    });
  }

  function toggleCurrencyFilter(currency) {
    if (currency === "All") {
      setCurrencyFilters(["All"]);
      return;
    }
    setCurrencyFilters((current) => {
      const active = current.includes("All") ? [] : current;
      const next = active.includes(currency) ? active.filter((item) => item !== currency) : [...active, currency];
      return next.length ? next : ["All"];
    });
  }

  return (
    <section className="dashboard-events-card mt-8 rounded-2xl border border-white/15 bg-gradient-to-br from-[#08070b] via-black to-[#050506] p-5 transition-all duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="dashboard-section-icon flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0d] text-fuchsia-300"><Calendar size={20} /></div>
          <div>
            <h2 className="text-xl font-black text-white">Today's Events</h2>
            <p className="text-sm font-semibold text-zinc-400">Economic news for {todayKey}</p>
          </div>
        </div>
      </div>
      <div className="dashboard-events-filters mt-5 rounded-xl border border-white/10 bg-black/35 p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Expected impact</div>
            <div className="mt-3 flex flex-wrap gap-4">
              {impactOptions.map((impact) => (
                <label key={impact} className="flex cursor-pointer items-center gap-2 text-xs font-black text-zinc-300 transition hover:text-white">
                  <input
                    type="checkbox"
                    checked={impactFilters.includes(impact)}
                    onChange={() => toggleImpactFilter(impact)}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-black accent-fuchsia-500"
                  />
                  <ImpactFolderIcon impact={impact} />
                  <span>{impact}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Currencies</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["All", ...currencyOptions].map((currency) => (
                <button key={currency} onClick={() => toggleCurrencyFilter(currency)} className={currencyFilters.includes(currency) ? "rounded-lg border border-fuchsia-500/30 bg-fuchsia-950/45 px-3 py-2 text-xs font-black text-fuchsia-100" : "rounded-lg border border-white/10 bg-black px-3 py-2 text-xs font-black text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.035] hover:text-white"}>
                  {currency}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {economicCalendar?.loading && !events.length ? (
          <div className="rounded-xl border border-white/10 bg-black/45 p-4 text-sm font-bold text-zinc-400">Loading economic events...</div>
        ) : events.length ? events.map((event) => (
          <EconomicEventRow key={event.id} event={event} compact />
        )) : (
          <div className="rounded-xl border border-white/10 bg-black/45 p-4 text-sm font-bold text-zinc-400">No major events listed for today.</div>
        )}
      </div>
    </section>
  );
}

function QuickInsights({ insights }) {
  const styles = {
    emerald: "border-emerald-500/25 bg-emerald-950/20 text-emerald-300",
    fuchsia: "border-fuchsia-500/25 bg-fuchsia-950/20 text-fuchsia-300",
    amber: "border-amber-500/25 bg-amber-950/20 text-amber-300",
    red: "border-red-500/25 bg-red-950/20 text-red-300",
  };
  return (
    <section className="quick-insights-section mt-8 rounded-2xl border border-white/15 bg-[#0a0a0a] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xl font-black">
          <div className="dashboard-section-icon flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#0a0a0d] text-fuchsia-300"><Target size={18} /></div>
          Quick Insights
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-black text-zinc-400">Auto analysis</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {insights.map((item) => (
          <div key={item.title} className={`quick-insight-card relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_16px_32px_rgba(0,0,0,0.30)] ${styles[item.tone] || styles.fuchsia}`}>
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-3xl bg-white/5" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.title}</div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/50 text-sm font-black">{item.icon}</div>
            </div>
            <div className="relative z-10 mt-4 truncate text-xl font-black text-white">{item.value}</div>
            <div className="relative z-10 mt-1 text-xs font-bold text-zinc-400">{item.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getLastFullWeeks(weeks = 4) {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() + mondayOffset);
  const start = new Date(currentWeekMonday);
  start.setDate(currentWeekMonday.getDate() - (weeks - 1) * 7);
  const days = [];
  for (let week = 0; week < weeks; week++) {
    for (let weekday = 0; weekday < 7; weekday++) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + weekday);
      const dow = date.getDay(); // 0=Sun,1=Mon...6=Sat — JS getDay
      days.push({ key: formatDateKey(date), weekday, isWeekend: dow === 0 || dow === 6 });
    }
  }
  return days;
}

function TradingActivityPanel({ trades, selectedDate, onSelectDate }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const grouped = groupTradesByDate(trades);
  const days = getLastFullWeeks(4).map((day) => ({ ...day, summary: summarizeTrades(grouped[day.key] || []) }));
  const activityTotals = days.reduce(
    (totals, day) => ({
      trades: totals.trades + Number(day.summary.count || 0),
      wins: totals.wins + Number(day.summary.wins || 0),
      losses: totals.losses + Number(day.summary.losses || 0),
      breakEvens: totals.breakEvens + Number(day.summary.breakEvens || 0),
      partials: totals.partials + Number(day.summary.partials || 0),
    }),
    { trades: 0, wins: 0, losses: 0, breakEvens: 0, partials: 0 }
  );

  return (
    <div className="dashboard-activity-card light-card relative flex h-full min-h-0 flex-col overflow-visible rounded-2xl border border-white/15 bg-[#0a0a0a] p-5">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="dashboard-section-icon flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0d] text-fuchsia-300">
            <Calendar size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black">Trading Activity</h2>
            <p className="text-sm text-zinc-400">Click a day to open it in Calendar</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-3 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full border border-white/10 bg-zinc-900" />No trades</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Win</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Loss</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />BE</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-fuchsia-500" />P</span>
        </div>
      </div>

      <div className="dashboard-activity-grid relative z-10 mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="mb-4 grid grid-cols-7 gap-2 text-center text-xs font-black">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
            <div key={day} className={`activity-day-header rounded-xl border py-2 border-white/10 bg-[#090909] text-zinc-400`}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const hasTrade = day.summary.count > 0;
            const isWin = day.summary.pnl > 0;
            const isBreakEven = day.summary.pnl === 0;
            const dayClass = hasTrade ? (isWin ? "activity-day-win" : isBreakEven ? "activity-day-breakeven" : "activity-day-loss") : day.isWeekend ? "activity-day-empty opacity-40" : "activity-day-empty";
            const selectedClass = selectedDate === day.key ? "activity-day-selected ring-1 ring-white/30 ring-offset-2 ring-offset-black" : "";
            const tooltipDate = new Date(`${day.key}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => onSelectDate?.(day.key)}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`activity-day-cell group relative h-14 overflow-visible rounded-xl border transition-all duration-300 hover:scale-[1.04] ${dayClass} ${selectedClass} cursor-pointer`}
              >
                {hoveredDay?.key === day.key && (
                  <div className="light-tooltip pointer-events-none absolute bottom-[4.2rem] left-1/2 z-50 w-48 -translate-x-1/2 rounded-xl border border-white/15 bg-[#070707] p-4 text-left shadow-[0_18px_55px_rgba(0,0,0,0.95)] ring-1 ring-fuchsia-500/20">
                    <div className="flex items-center gap-2 text-sm font-black text-white">
                      <Calendar size={15} className="text-fuchsia-300" />
                      {tooltipDate}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
                      <span className="text-zinc-500">-</span>
                      {day.summary.count} trade{day.summary.count === 1 ? "" : "s"}
                    </div>
                    <div className={`mt-3 w-fit rounded-lg border px-3 py-2 text-sm font-black ${hasTrade ? getPnlPillClass(day.summary.pnl) : "border-fuchsia-500/18 bg-black text-zinc-400"}`}>
                      {hasTrade ? `${getPnlArrow(day.summary.pnl)} ` : ""}{formatMoney(day.summary.pnl)}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/15 bg-[#070707]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mt-auto border-t border-white/10 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <ActivityStat tone="fuchsia" title="ACTIVE" value={activityTotals.trades} subtitle="trades" icon="●" />
          <ActivityStat tone="emerald" title="WINS" value={activityTotals.wins + activityTotals.partials} subtitle="profitable trades" icon="↗" />
          <ActivityStat tone="red" title="LOSSES" value={activityTotals.losses} subtitle="unprofitable trades" icon="↘" />
          <ActivityStat tone="amber" title="BE" value={activityTotals.breakEvens} subtitle="neutral trades" icon="—" />
        </div>
      </div>
    </div>
  );
}

function ActivityStat({ tone, title, value, subtitle, icon }) {
  const styles = {
    fuchsia: { card: "border-fuchsia-500/25 bg-fuchsia-950/15 text-fuchsia-300", icon: "border border-fuchsia-500/20 bg-black/35 text-fuchsia-300", value: "text-fuchsia-300" },
    emerald: { card: "border-emerald-500/25 bg-emerald-950/15 text-emerald-300", icon: "border border-emerald-500/20 bg-black/35 text-emerald-300", value: "text-emerald-300" },
    red: { card: "border-red-500/25 bg-red-950/15 text-red-300", icon: "border border-red-500/20 bg-black/35 text-red-300", value: "text-red-300" },
    amber: { card: "border-amber-500/25 bg-amber-950/15 text-amber-300", icon: "border border-amber-500/20 bg-black/35 text-amber-300", value: "text-amber-300" },
  };
  const s = styles[tone] || styles.fuchsia;
  return (
    <div className={`activity-stat-${tone} group relative min-h-[118px] overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_16px_32px_rgba(0,0,0,0.30)] ${s.card}`}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/5 blur-xl" />
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="min-w-0 text-[11px] font-black uppercase tracking-wider text-zinc-400">{title}</div>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${s.icon}`}>{icon}</div>
      </div>
      <div className={`relative z-10 mt-4 text-4xl font-black leading-none ${s.value}`}>{value}</div>
      <div className="relative z-10 mt-2 text-xs font-bold text-zinc-400">{subtitle}</div>
    </div>
  );
}

function PerformanceOverviewChart({ mode, trades, curve, stats, isLoading = false }) {
  const chartData = useMemo(() => {
    return getDailyPerformanceSeries(trades, mode);
  }, [mode, trades]);

  const latestValue = chartData.length ? chartData[chartData.length - 1].value : 0;
  const isWinRate = mode === "WinRate";
  const isDaily = mode === "DailyP&L";
  const headline = isWinRate ? `${stats.winRate.toFixed(1)}%` : isDaily ? formatMoney(latestValue) : formatMoney(stats.totalPnl);
  const subtitle = isWinRate ? "Current cumulative win rate" : isDaily ? "Daily profit / loss by trading day" : "Current cumulative equity curve";
  const accent = isWinRate ? "text-fuchsia-400" : isDaily ? "text-amber-400" : "text-emerald-400";
  const stroke = isWinRate ? "#b24bf3" : isDaily ? "#f59e0b" : "#22c55e";
  const border = isWinRate ? "border-fuchsia-500/18 bg-fuchsia-950/10" : isDaily ? "border-amber-500/18 bg-amber-950/10" : "border-emerald-500/18 bg-emerald-950/10";

  if (isLoading) {
    return (
      <div className="relative z-10 mt-5">
        <div className={`dashboard-chart-summary relative mb-5 overflow-hidden rounded-2xl border p-5 ${border}`}>
          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-3xl bg-white/5" />
          <div className="relative z-10 text-xs font-black uppercase tracking-widest text-zinc-400">{mode}</div>
          <div className="relative z-10 mt-2 h-12 w-36 animate-pulse rounded-xl bg-white/10" />
          <div className="relative z-10 mt-3 h-4 w-48 animate-pulse rounded-lg bg-white/10" />
        </div>
        <div className="dashboard-chart-area h-80 overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-3">
          <div className="flex h-full flex-col items-center justify-center gap-3 opacity-40">
            <div className="h-2 w-full animate-pulse rounded-full bg-white/20" />
            <div className="h-2 w-5/6 animate-pulse rounded-full bg-white/15" />
            <div className="h-2 w-4/6 animate-pulse rounded-full bg-white/10" />
            <div className="h-2 w-5/6 animate-pulse rounded-full bg-white/15" />
            <div className="h-2 w-3/6 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 mt-5">
      <div className={`dashboard-chart-summary relative mb-5 overflow-hidden rounded-2xl border p-5 ${border}`}>
        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-3xl bg-white/5" />
        <div className="relative z-10 text-xs font-black uppercase tracking-widest text-zinc-400">{mode}</div>
        <div className={`relative z-10 mt-2 text-5xl font-black ${accent}`}>{headline}</div>
        <div className="relative z-10 mt-2 text-sm text-zinc-400">{subtitle}</div>
      </div>
      <div className="dashboard-chart-area h-80 rounded-2xl border border-white/10 bg-black/25 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <SafeResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 16, right: 18, left: 8, bottom: 6 }}>
            <CartesianGrid strokeDasharray="4 6" stroke="rgba(148,163,184,0.16)" vertical={false} />
            <XAxis
              dataKey="chartKey"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={{ stroke: "rgba(178,74,242,0.25)" }}
              tickFormatter={(value, index) => chartData[index]?.date || value}
            />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={{ stroke: "rgba(178,74,242,0.25)" }} tickFormatter={(value) => (isWinRate ? `${value}%` : `$${value}`)} />
            <Tooltip
              contentStyle={{ background: "var(--tooltip-bg, #09090b)", border: "1px solid var(--tooltip-border, #333)", borderRadius: 12, color: "var(--tooltip-text, #ffffff)" }}
              formatter={(value) => [isWinRate ? `${Number(value).toFixed(1)}%` : formatMoney(value), mode]}
              labelFormatter={(_, payload) => {
                const point = payload?.[0]?.payload;
                if (!point) return "";
                if (point.tradeNumber) return `${point.date} - Trade ${point.tradeNumber}`;
                return point.date || "";
              }}
            />
            <Line type="monotone" dataKey="value" name={mode} stroke={stroke} strokeWidth={4} dot={{ r: 5, fill: stroke, stroke: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 8, fill: "#b24bf3", stroke: "#ffffff", strokeWidth: 3 }} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}

function PerformanceScorePanel({ stats, isLoading = false }) {
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const score = Math.min(100, Math.max(0, Number(stats.score || 0)));
  if (isLoading) {
    return (
      <div className="dashboard-performance-card light-card flex flex-col rounded-2xl border border-white/15 bg-[#0a0a0a] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-white/10" />
          <div><div className="h-5 w-32 animate-pulse rounded-lg bg-white/10" /><div className="mt-2 h-3 w-24 animate-pulse rounded-lg bg-white/10" /></div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-52 w-52 animate-pulse rounded-full bg-white/5 border border-white/10" />
        </div>
      </div>
    );
  }
  const center = { x: 165, y: 142 };
  const baseMetrics = stats.metrics || {};
  const metricOrder = [
    { key: "winRate", x: 165, y: 34, anchor: "middle" },
    { key: "profitFactor", x: 255, y: 88, anchor: "start" },
    { key: "avgWinLoss", x: 255, y: 194, anchor: "start" },
    { key: "recoveryFactor", x: 165, y: 248, anchor: "middle" },
    { key: "maxDrawdown", x: 75, y: 194, anchor: "end" },
    { key: "consistency", x: 75, y: 88, anchor: "end" },
  ];

  const chartPoints = metricOrder.map((point) => {
    const metric = baseMetrics[point.key] || { label: point.key, description: "", actual: "—", score: 0 };
    const scale = Math.max(0.22, Number(metric.score || 0) / 100);
    return {
      ...point,
      px: center.x + (point.x - center.x) * scale,
      py: center.y + (point.y - center.y) * scale,
      metric,
    };
  });

  const radarPoints = chartPoints.map((point) => `${point.px},${point.py}`).join(" ");
  const hovered = hoveredMetric ? chartPoints.find((point) => point.key === hoveredMetric) : null;

  return (
    <div className="dashboard-score-card light-card relative overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a0a] p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-[5rem] bg-white/[0.025] blur-3xl" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="dashboard-section-icon flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0d] text-fuchsia-300">
          <span className="text-2xl font-black">ⓘ</span>
        </div>
        <div>
          <h2 className="text-2xl font-black">Performance <span className="text-zinc-300">Score</span></h2>
          <p className="text-sm text-zinc-400">Your trading metrics</p>
        </div>
      </div>

      <div className="dashboard-radar-card light-card-soft relative z-10 mt-5 rounded-2xl border border-white/10 bg-black/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        {hovered && (
          <div className="light-tooltip pointer-events-none absolute left-6 top-7 z-50 w-64 rounded-xl border border-white/20 bg-[#020202] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.95)] ring-1 ring-black">
            <div className="text-lg font-black text-white">{hovered.metric.label}</div>
            <div className="mt-1 text-sm font-medium text-zinc-300">{hovered.metric.description}</div>
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Actual</span>
                <span className="font-black text-white">{hovered.metric.actual}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-zinc-400">Score</span>
                <span className="font-black text-emerald-400">{Number(hovered.metric.score || 0).toFixed(0)} / 100</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <svg width="100%" viewBox="-55 0 420 290" className="overflow-visible" style={{maxWidth: 380}}>
            <defs>
              <filter id="radarGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <polygon points="165,34 255,88 255,194 165,248 75,194 75,88" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.20)" strokeWidth="1.2" />
            <polygon points="165,61 232,101 232,181 165,221 98,181 98,101" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
            <polygon points="165,88 210,115 210,167 165,194 120,167 120,115" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <polygon points="165,115 187,128 187,154 165,167 143,154 143,128" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />

            {metricOrder.map((point) => (
              <line key={point.key} x1={center.x} y1={center.y} x2={point.x} y2={point.y} stroke="rgba(255,255,255,0.16)" />
            ))}

            <circle cx={center.x} cy={center.y} r="4" fill="rgba(34,197,94,0.45)" />
            <polygon points={radarPoints} fill="rgba(34,197,94,0.18)" stroke="#22c55e" strokeWidth="3" />

            {chartPoints.map((point) => (
              <circle
                key={point.key}
                cx={point.px}
                cy={point.py}
                r={hoveredMetric === point.key ? 8 : 5.5}
                fill="#22c55e"
                stroke="#06150c"
                strokeWidth="2.5"
                onMouseEnter={() => setHoveredMetric(point.key)}
                onMouseLeave={() => setHoveredMetric(null)}
                className="cursor-pointer transition-all"
              />
            ))}

            {metricOrder.map((point) => {
              const metric = baseMetrics[point.key] || { label: point.key };
              const labelX = point.key === "profitFactor" || point.key === "avgWinLoss" ? point.x + 12 : point.key === "maxDrawdown" || point.key === "consistency" ? point.x - 12 : point.x;
              const labelY = point.key === "winRate" ? point.y - 14 : point.key === "recoveryFactor" ? point.y + 22 : point.y + 4;
              const labelAnchor = point.key === "maxDrawdown" || point.key === "consistency" ? "end" : point.anchor;
              return (
                <text
                  key={point.key}
                  x={labelX}
                  y={labelY}
                  textAnchor={labelAnchor}
                  fill={hoveredMetric === point.key ? "#22c55e" : "white"}
                  fontSize="12"
                  fontWeight="800"
                  onMouseEnter={() => setHoveredMetric(point.key)}
                  onMouseLeave={() => setHoveredMetric(null)}
                  className="cursor-pointer"
                >
                  {metric.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="dashboard-score-summary light-card-soft relative z-10 mt-5 rounded-2xl border border-white/10 bg-[#070809] p-5">
        <div className="text-sm font-black uppercase tracking-wider text-zinc-400">Your Performance Score</div>
        <div className="mt-4 flex items-center gap-5">
          <div className="text-6xl font-black leading-none text-emerald-500">{score.toFixed(2)}</div>
          <div className="flex-1">
            <div className="h-5 overflow-hidden rounded-full bg-zinc-800 shadow-inner">
              <div className="h-full rounded-full bg-emerald-600/80" style={{ width: `${score}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-xs font-bold text-zinc-400">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCalendarDayVisual(dayStats, isWeekend, selected) {
  const base = "calendar-day calendar-day-simple group relative h-28 rounded-xl border p-3 text-left transition-all duration-200";
  if (dayStats.count > 0 && dayStats.pnl > 0) return `${base} calendar-day-win ${selected ? "calendar-day-selected" : ""}`;
  if (dayStats.count > 0 && dayStats.pnl < 0) return `${base} calendar-day-loss ${selected ? "calendar-day-selected" : ""}`;
  if (dayStats.count > 0 && dayStats.pnl === 0) return `${base} calendar-day-breakeven ${selected ? "calendar-day-selected" : ""}`;
  if (isWeekend) return `${base} calendar-day-weekend ${selected ? "calendar-day-selected" : ""}`;
  return `${base} calendar-day-empty ${selected ? "calendar-day-selected" : ""}`;
}

function CalendarPage({ trades, onAdd, selectedDate, setSelectedDate, economicCalendar, onRefreshEconomicCalendar }) {
  const initialDate = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
  const [calendarMonth, setCalendarMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [dayModalDate, setDayModalDate] = useState(null);
  const [selectedNewsCurrencies, setSelectedNewsCurrencies] = useState(["All"]);

  useEffect(() => {
    if (!selectedDate) return;
    const nextDate = new Date(`${selectedDate}T00:00:00`);
    if (!Number.isNaN(nextDate.getTime())) setCalendarMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
  }, [selectedDate]);

  useEffect(() => {
    const today = new Date();
    if (today.getFullYear() === calendarMonth.getFullYear() && today.getMonth() === calendarMonth.getMonth()) {
      setSelectedDate(formatDateKey(today));
    }
  }, [calendarMonth]);

  const year = calendarMonth.getFullYear();
  const monthIndex = calendarMonth.getMonth();
  const cells = getCalendarCells(year, monthIndex);
  const grouped = groupTradesByDate(trades);
  const calendarEvents = useMemo(() => {
    const selected = new Set(selectedNewsCurrencies.filter((currency) => currency !== "All"));
    const events = economicCalendar?.events || [];
    if (!selected.size) return events;
    return events.filter((event) => selected.has(String(event.country || "").toUpperCase()));
  }, [economicCalendar?.events, selectedNewsCurrencies]);
  const eventsByDate = useMemo(() => groupEconomicEventsByDate(calendarEvents), [calendarEvents]);
  const monthName = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const monthStats = summarizeTrades(trades.filter((trade) => getTradeDateKey(trade).startsWith(monthKey)));
  const weekRows = Array.from({ length: 6 }, (_, weekIndex) => cells.slice(weekIndex * 7, weekIndex * 7 + 7));
  const todayKey = formatDateKey(new Date());
  const todayStats = summarizeTrades(grouped[todayKey] || []);
  const selectedDayTrades = grouped[selectedDate] || [];
  const selectedDayStats = summarizeTrades(selectedDayTrades);
  const activeMonthDays = Object.entries(grouped).filter(([dateKey]) => dateKey.startsWith(monthKey));
  const bestMonthDay = activeMonthDays.map(([dateKey, rows]) => ({ dateKey, ...summarizeTrades(rows) })).sort((a, b) => Number(b.pnl || 0) - Number(a.pnl || 0))[0];
  const worstMonthDay = activeMonthDays.map(([dateKey, rows]) => ({ dateKey, ...summarizeTrades(rows) })).sort((a, b) => Number(a.pnl || 0) - Number(b.pnl || 0))[0];

  function goToday() {
    const today = new Date();
    const todayKey = formatDateKey(today);
    setSelectedDate(todayKey);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setDayModalDate(todayKey);
  }

  function openDayDetails(dateKey) {
    setSelectedDate(dateKey);
    setDayModalDate(dateKey);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <TopCrumb page="Calendar" />
      {/* Header banner */}
      <div className="page-hero-gradient mb-6 relative overflow-hidden rounded-2xl px-5 py-4" style={{ border: "1px solid transparent", background: "linear-gradient(135deg, #14071d 0%, #16081e 48%, #180d17 76%, #21130d 100%) padding-box, linear-gradient(135deg, rgba(178,74,242,.58) 0%, rgba(122,42,170,.48) 58%, rgba(132,76,36,.62) 100%) border-box", boxShadow: "0 18px 48px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.035)" }}>
        <div className="page-hero-gradient-bg pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 10% 0%, rgba(178,74,242,.09), transparent 34%), radial-gradient(circle at 100% 100%, rgba(123,69,31,.20), transparent 42%), linear-gradient(135deg, rgba(18,6,27,.98) 0%, rgba(20,7,27,.98) 52%, rgba(26,13,20,.98) 78%, rgba(31,18,12,.98) 100%)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: nav + month + subtitle */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <button onClick={() => setCalendarMonth(new Date(year, monthIndex - 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:border-fuchsia-500/40 hover:text-white">
                <ChevronLeft size={15} />
              </button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/20 text-fuchsia-300">
                  <Calendar size={15} />
                </div>
                <h1 className="text-xl font-black tracking-tight text-white">{monthName}</h1>
              </div>
              <button onClick={() => setCalendarMonth(new Date(year, monthIndex + 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:border-fuchsia-500/40 hover:text-white">
                <ChevronRight size={15} />
              </button>
            </div>
            <p className="text-xs font-semibold text-zinc-500 pl-1">See which days you trade best and when you should slow down.</p>
          </div>
          {/* Right: stats + today */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-xs font-black text-zinc-400">
              TRADES: <span className="text-white">{monthStats.count}</span>
            </span>
            <span className={`rounded-lg border px-4 py-2 text-xs font-black ${monthStats.pnl >= 0 ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400" : "border-red-500/40 bg-red-500/15 text-red-400"}`}>
              P&L: {formatMoney(monthStats.pnl)}
            </span>
            <span className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-xs font-black text-zinc-400">
              WIN: <span className="text-white">{monthStats.winRate.toFixed(0)}%</span>
            </span>
            <button onClick={goToday} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-xs font-black text-zinc-300 transition hover:border-fuchsia-500/40 hover:text-fuchsia-200">
              <Calendar size={12} /> Today
            </button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="xl:overflow-x-auto">
        <div className="grid min-w-0 grid-cols-7 gap-1.5 xl:min-w-[900px] xl:grid-cols-[repeat(7,minmax(0,1fr))_190px] xl:gap-2">
          {/* Day headers */}
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN", "WEEK"].map((day) => (
            <div key={day} className={`rounded-xl py-2.5 text-center text-[11px] font-black tracking-widest border ${day === "WEEK" ? "hidden xl:block calendar-col-header-week" : "calendar-col-header"} ${day === "WEEK" ? "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400" : "border-white/8 bg-white/4 text-zinc-500"}`}>
              {day}
            </div>
          ))}

          {weekRows.map((week, weekIndex) => {
            const weekStats = week.map((cell) => summarizeTrades(grouped[cell.key] || [])).reduce((s, d) => ({ count: s.count + d.count, pnl: s.pnl + d.pnl }), { count: 0, pnl: 0 });

            return (
              <React.Fragment key={weekIndex}>
                {week.map((cell) => {
                  const dayTrades = grouped[cell.key] || [];
                  const dayStats = summarizeTrades(dayTrades);
                  const dayEvents = eventsByDate[cell.key] || [];
                  const primaryEventImpact = getPrimaryEventImpact(dayEvents);
                  const isWeekend = cell.dayIndex === 0 || cell.dayIndex === 6;
                  const selected = selectedDate === cell.key;
                  const hasTrade = dayTrades.length > 0;
                  const isToday = cell.key === todayKey;

                  return (
                    <button
                      key={cell.key}
                      onClick={() => openDayDetails(cell.key)}
                      className={`cal-grid-cell relative flex h-14 flex-col rounded-xl border p-2 text-left transition-all duration-200 xl:h-[110px] xl:p-3
                        ${hasTrade && dayStats.pnl > 0 ? "cal-grid-cell-win" : hasTrade && dayStats.pnl < 0 ? "cal-grid-cell-loss" : hasTrade ? "cal-grid-cell-breakeven" : isWeekend ? "cal-grid-cell-weekend" : "cal-grid-cell-empty"}
                        ${selected ? "cal-grid-cell-selected border-fuchsia-500/70 shadow-[0_0_0_1px_rgba(178,74,242,0.35)] -translate-y-0.5" : "hover:-translate-y-0.5"}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <span className={`text-xs font-black xl:text-sm ${isToday ? "text-fuchsia-400" : cell.isCurrentMonth ? "text-white" : "text-zinc-600"}`}>
                          {cell.day}
                        </span>
                        <div className="flex items-center gap-1">
                          {dayEvents.length > 0 && (
                            <span className="flex items-center gap-0.5 text-[9px] font-black text-zinc-500">
                              <ImpactFolderIcon impact={primaryEventImpact} />{dayEvents.length}
                            </span>
                          )}
                          {selected && <span className="h-2 w-2 rounded-full bg-fuchsia-400" />}
                        </div>
                      </div>

                      {hasTrade ? (
                        <div className="hidden xl:flex flex-col gap-1.5 w-full mt-2">
                          <div className={`w-full rounded-lg px-1.5 py-1.5 text-center text-xs font-black ${dayStats.pnl > 0 ? "bg-emerald-500/15 text-emerald-400" : dayStats.pnl < 0 ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                            {formatMoney(dayStats.pnl)}
                          </div>
                          <div className="cal-trade-count w-full rounded-lg bg-white/6 py-1 text-center text-[11px] font-bold text-zinc-500">
                            {dayStats.count} trade{dayStats.count === 1 ? "" : "s"}
                          </div>
                        </div>
                      ) : (
                        <div className="hidden xl:flex items-center justify-center flex-1 text-zinc-700 text-lg">—</div>
                      )}

                      {/* Mobile */}
                      {hasTrade && (
                        <div className={`xl:hidden mt-auto w-full rounded-md px-1 text-center text-[10px] font-black ${dayStats.pnl > 0 ? "bg-emerald-500/15 text-emerald-400" : dayStats.pnl < 0 ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                          {formatMoney(dayStats.pnl)}
                        </div>
                      )}
                      {!hasTrade && (
                        <div className="xl:hidden flex items-center justify-center flex-1 text-zinc-700">—</div>
                      )}
                    </button>
                  );
                })}

                {/* WEEK column */}
                <div className="cal-grid-week-col hidden xl:flex h-[110px] flex-col items-center justify-center rounded-xl border border-fuchsia-500/15 bg-fuchsia-500/8 p-3">
                  {weekStats.count ? (
                    <>
                      <div className={`text-sm font-black ${weekStats.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatMoney(weekStats.pnl)}</div>
                      <div className="mt-1.5 rounded-lg bg-white/8 px-2 py-0.5 text-[11px] font-bold text-zinc-400">{weekStats.count} trade{weekStats.count === 1 ? "" : "s"}</div>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-zinc-600">No activity</span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {trades.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-white/10 bg-black/20 px-5 py-6 text-center">
          <Calendar size={22} className="mx-auto mb-2 text-zinc-600" />
          <p className="text-sm font-semibold text-zinc-500">Log trades to see your trading activity on the calendar.</p>
        </div>
      )}

      <EconomicCalendarPanel economicCalendar={economicCalendar} trades={trades} selectedCurrencies={selectedNewsCurrencies} onSelectedCurrenciesChange={setSelectedNewsCurrencies} onRefresh={onRefreshEconomicCalendar} />

      {dayModalDate && (
        <CalendarDayDetailsModal
          dateKey={dayModalDate}
          trades={grouped[dayModalDate] || []}
          events={eventsByDate[dayModalDate] || []}
          onClose={() => setDayModalDate(null)}
          onAdd={() => onAdd(dayModalDate)}
        />
      )}
    </motion.div>
  );
}

function CalendarDayDetailsModal({ dateKey, trades = [], events = [], onClose, onAdd }) {
  const stats = summarizeTrades(trades);
  const date = new Date(`${dateKey}T00:00:00`);
  const dayNumber = Number.isNaN(date.getTime()) ? "—" : date.getDate();
  const title = Number.isNaN(date.getTime()) ? dateKey : date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const sortedTrades = [...trades].sort((a, b) => Number(b.createdAt || b.id || 0) - Number(a.createdAt || a.id || 0));
  const resultTone = stats.pnl > 0 ? "win" : stats.pnl < 0 ? "loss" : stats.count ? "be" : "empty";
  const resultLabel = stats.pnl > 0 ? "High Performer" : stats.pnl < 0 ? "Review Needed" : stats.count ? "Break Even Day" : "No Activity";

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:items-center">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="calendar-day-modal-pro my-4 max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#050505] shadow-[0_26px_90px_rgba(0,0,0,0.80)]">
        <div className="calendar-day-modal-head flex items-center justify-between gap-4 border-b border-white/10 p-5">
          <div className="flex items-center gap-4">
            <div className={resultTone === "win" ? "calendar-modal-day-badge calendar-modal-day-win" : resultTone === "loss" ? "calendar-modal-day-badge calendar-modal-day-loss" : resultTone === "be" ? "calendar-modal-day-badge calendar-modal-day-be" : "calendar-modal-day-badge calendar-modal-day-empty"}>{dayNumber}</div>
            <div>
              <h2 className="text-2xl font-black text-white">{title}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-400">
                <span>{stats.count} trade{stats.count === 1 ? "" : "s"}</span>
                <span>•</span>
                <span>{stats.winRate.toFixed(1)}% win</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl border border-white/10 bg-black px-3 py-2 text-xl font-black text-zinc-400 transition hover:border-fuchsia-500/50 hover:text-white">×</button>
        </div>

        <div className={resultTone === "win" ? "calendar-day-modal-summary calendar-day-modal-summary-win" : resultTone === "loss" ? "calendar-day-modal-summary calendar-day-modal-summary-loss" : resultTone === "be" ? "calendar-day-modal-summary calendar-day-modal-summary-be" : "calendar-day-modal-summary calendar-day-modal-summary-empty"}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <CalendarModalMetric value={stats.wins} label="Wins" tone="win" />
            <CalendarModalMetric value={stats.breakEvens || 0} label="Break Even" tone="be" />
            <CalendarModalMetric value={stats.losses} label="Losses" tone="loss" />
            <CalendarModalMetric value={`${getPnlArrow(stats.pnl)} ${formatMoney(stats.pnl)}`} label="Total P&L" tone={resultTone} />
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-black text-white"><span>Win Rate</span><span>{stats.winRate.toFixed(1)}%</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800"><div className={resultTone === "loss" ? "h-full rounded-full bg-gradient-to-r from-red-500 to-red-300" : "h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"} style={{ width: `${Math.max(0, Math.min(100, stats.winRate))}%` }} /></div>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-5 rounded-2xl border border-fuchsia-500/25 bg-black/35 p-4 shadow-[0_0_18px_rgba(178,74,242,0.08)]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">Economic Events</div>
                <div className="mt-1 text-sm font-semibold text-zinc-500">News context for this trading day.</div>
              </div>
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-black text-zinc-300">
                {events.length} event{events.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="space-y-2">
              {events.length ? (
                events.slice(0, 6).map((event) => <EconomicEventRow key={event.id} event={event} compact />)
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-zinc-500">
                  No economic events found for this period.
                </div>
              )}
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-fuchsia-500/45 bg-black px-4 py-2 text-sm font-black text-white">All Trades</span>
          </div>

          <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
            {sortedTrades.length ? sortedTrades.map((trade) => <CalendarModalTradeRow key={trade.id} trade={trade} />) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/35 p-8 text-center">
                <div className="text-lg font-black text-white">No trades on this day</div>
                <div className="mt-2 text-sm font-semibold text-zinc-500">No trades logged for this date.</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CalendarModalMetric({ value, label, tone }) {
  const cls = tone === "win" ? "text-emerald-400" : tone === "loss" ? "text-red-400" : tone === "be" ? "text-amber-400" : "text-fuchsia-300";
  return <div className="text-center"><div className={`text-3xl font-black ${cls}`}>{value}</div><div className="mt-1 text-sm font-bold text-zinc-400">{label}</div></div>;
}

function CalendarModalTradeRow({ trade }) {
  const pnl = Number(trade.pnl || 0);
  const isWin = pnl > 0;
  const tag = normalizeTags(trade)[0] || `result:${getResultFromPnl(pnl).toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div className={isWin ? "calendar-modal-trade-row calendar-modal-trade-win" : pnl < 0 ? "calendar-modal-trade-row calendar-modal-trade-loss" : "calendar-modal-trade-row calendar-modal-trade-be"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className={trade.direction === "SELL" ? "rounded-full border border-red-500/40 bg-red-500/20 px-3 py-1 text-xs font-black text-red-200" : "rounded-full border border-fuchsia-500/40 bg-fuchsia-500 px-3 py-1 text-xs font-black text-black"}>{trade.direction} {trade.pair}</span>
          <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-black text-white">{trade.setup || "Manual Trade"}</span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-zinc-300">{trade.session || "—"}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-zinc-400">◷ {trade.createdAt ? new Date(Number(trade.createdAt)).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—"}</span>
          <span className={pnl > 0 ? "text-3xl font-black text-emerald-400" : pnl < 0 ? "text-3xl font-black text-red-400" : "text-3xl font-black text-amber-400"}>{getPnlArrow(pnl)} {formatMoney(pnl)}</span>
        </div>
      </div>
      {tag && !tag.startsWith("result:") && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <span className="rounded-full border border-white/12 bg-black/35 px-3 py-1 text-xs font-black text-zinc-300">◇ {tag}</span>
        </div>
      )}
    </div>
  );
}

function CalendarMonthSummary({ monthStats, selectedDate, selectedDayStats, bestMonthDay, worstMonthDay }) {
  const selectedLabel = selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "No date";
  return (
    <section className="calendar-summary-pro mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <CalendarSummaryCard title="Month Result" value={formatMoney(monthStats.pnl)} text={`${monthStats.count} trades this month`} tone={monthStats.pnl >= 0 ? "emerald" : "red"} />
      <CalendarSummaryCard title="Today" value={formatMoney(selectedDayStats.pnl)} text={`${selectedLabel} · ${selectedDayStats.count} trade${selectedDayStats.count === 1 ? "" : "s"}`} tone={selectedDayStats.pnl > 0 ? "emerald" : selectedDayStats.pnl < 0 ? "red" : "amber"} />
      <CalendarSummaryCard title="Best Day" value={bestMonthDay ? formatMoney(bestMonthDay.pnl) : "$0"} text={bestMonthDay ? bestMonthDay.dateKey : "No profitable day yet"} tone="emerald" />
      <CalendarSummaryCard title="Worst Day" value={worstMonthDay ? formatMoney(worstMonthDay.pnl) : "$0"} text={worstMonthDay ? worstMonthDay.dateKey : "No losing day yet"} tone="red" />
    </section>
  );
}

function EconomicCalendarPanel({ economicCalendar, trades = [], selectedCurrencies = ["All"], onSelectedCurrenciesChange, onRefresh }) {
  const [weekFilter, setWeekFilter] = useState("this");
  const [impactFilters, setImpactFilters] = useState(["High", "Medium", "Low", "Holiday"]);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const events = Array.isArray(economicCalendar?.events) ? economicCalendar.events : [];
  const impactOptions = ["High", "Medium", "Low", "Holiday"];
  const baseCurrencyOptions = ["AUD", "CAD", "CHF", "CNY", "EUR", "GBP", "JPY", "NZD", "USD"];
  const normalizedSelectedCurrencies = selectedCurrencies.includes("All") || !selectedCurrencies.length ? ["All"] : selectedCurrencies;
  const currencies = useMemo(() => {
    const dynamic = events.map((event) => String(event.country || "").toUpperCase()).filter((country) => country && country !== "ALL");
    return Array.from(new Set([...baseCurrencyOptions, ...dynamic])).sort();
  }, [events]);
  const visibleEvents = useMemo(() => {
    const selectedCurrencySet = new Set(normalizedSelectedCurrencies.filter((currency) => currency !== "All"));
    return events.filter((event) => {
      if (weekFilter !== "all" && event.week !== weekFilter) return false;
      if (!impactFilters.includes(getEventImpactLabel(event.impact))) return false;
      if (selectedCurrencySet.size && !selectedCurrencySet.has(String(event.country || "").toUpperCase())) return false;
      return true;
    });
  }, [events, weekFilter, impactFilters, normalizedSelectedCurrencies]);
  const grouped = visibleEvents.reduce((map, event) => {
    const key = getEconomicEventDateKey(event) || "Unknown";
    if (!map[key]) map[key] = [];
    map[key].push(event);
    return map;
  }, {});
  const dayKeys = Object.keys(grouped).sort();
  const newsStats = getNewsPerformanceStats(trades, visibleEvents);
  const activeFilterCount = (normalizedSelectedCurrencies.includes("All") ? 0 : normalizedSelectedCurrencies.length) + (impactFilters.length !== impactOptions.length ? 1 : 0);
  const weekRanges = useMemo(() => ({
    this: getEconomicCalendarWeekRangeLabel("this") || getEconomicWeekRange(events, "this"),
  }), [events]);

  function toggleImpactFilter(impact) {
    setImpactFilters((current) => {
      const next = current.includes(impact) ? current.filter((item) => item !== impact) : [...current, impact];
      return next.length ? next : current;
    });
  }

  function toggleCurrencyFilter(currency) {
    if (currency === "All") {
      onSelectedCurrenciesChange?.(["All"]);
      return;
    }
    const current = normalizedSelectedCurrencies.includes("All") ? [] : normalizedSelectedCurrencies;
    const next = current.includes(currency) ? current.filter((item) => item !== currency) : [...current, currency];
    onSelectedCurrenciesChange?.(next.length ? next : ["All"]);
  }

  return (
    <section className="economic-calendar-panel mt-8 rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-[#100719] via-black to-[#050307] p-5 shadow-[0_20px_55px_rgba(178,74,242,0.10)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-500/35 bg-fuchsia-500/15 text-fuchsia-300"><TrendingUp size={22} /></div>
          <div>
            <h2 className="text-2xl font-black text-white">Economic Calendar</h2>
            <p className="mt-1 text-sm font-semibold text-zinc-400">See how news days affect your trading.</p>
            <p className="mt-0.5 text-xs font-semibold text-zinc-600">
              {visibleEvents.length} events loaded{economicCalendar?.updatedAt ? ` · updated ${new Date(economicCalendar.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg border border-fuchsia-400/70 bg-fuchsia-500/18 px-3 py-2 text-sm font-black text-fuchsia-100">
            This Week{weekRanges["this"] ? `: ${weekRanges["this"]}` : ""}
          </span>
          <button onClick={() => setFiltersOpen((open) => !open)} className={filtersOpen ? "rounded-lg border border-fuchsia-400/70 bg-fuchsia-500/18 px-3 py-2 text-sm font-black text-fuchsia-100" : "rounded-lg border border-white/10 bg-black px-3 py-2 text-sm font-black text-zinc-300 hover:border-fuchsia-500/45"}>
            Filters {activeFilterCount ? <span className="ml-1 rounded-full bg-fuchsia-500 px-1.5 py-0.5 text-[10px] text-black">{activeFilterCount}</span> : null}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_1fr_1fr]">
        <EconomicMiniMetric label="Best News Day" value={newsStats.best ? formatMoney(newsStats.best.pnl) : "—"} detail={newsStats.best ? `${newsStats.best.event.country} · ${newsStats.best.event.title}` : "Log trades on economic event days to see news impact."} />
        <EconomicMiniMetric label="Worst News Day" value={newsStats.worst ? formatMoney(newsStats.worst.pnl) : "—"} detail={newsStats.worst ? `${newsStats.worst.event.country} · ${newsStats.worst.event.title}` : "Log trades on economic event days to see news impact."} tone="amber" />
        <EconomicMiniMetric label="Event Days Traded" value={newsStats.rows.length || "—"} detail={newsStats.rows.length ? `${newsStats.rows.length} event day${newsStats.rows.length === 1 ? "" : "s"} with trades` : "Log trades on event days to track patterns."} tone="fuchsia" />
      </div>

      {filtersOpen && (
      <div className="mt-5 rounded-xl border border-white/10 bg-black/35 p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Expected impact</div>
            <div className="mt-3 flex flex-wrap gap-4">
              {impactOptions.map((impact) => (
                <label key={impact} className="flex cursor-pointer items-center gap-2 text-xs font-black text-zinc-300 transition hover:text-white">
                  <input
                    type="checkbox"
                    checked={impactFilters.includes(impact)}
                    onChange={() => toggleImpactFilter(impact)}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-black accent-fuchsia-500"
                  />
                  <ImpactFolderIcon impact={impact} />
                  <span>{impact}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Currencies</div>
            <div className="mt-3 flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1">
              {["All", ...currencies].map((currency) => (
                <button key={currency} onClick={() => toggleCurrencyFilter(currency)} className={normalizedSelectedCurrencies.includes(currency) ? "rounded-lg border border-fuchsia-400/60 bg-fuchsia-500/18 px-3 py-2 text-xs font-black text-fuchsia-100" : "rounded-lg border border-white/10 bg-black px-3 py-2 text-xs font-black text-zinc-400 hover:border-fuchsia-500/35 hover:text-fuchsia-200"}>{currency}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="mt-5 space-y-5">
        {economicCalendar?.loading && !visibleEvents.length ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-5 text-sm font-bold text-zinc-400">Loading economic calendar...</div>
        ) : dayKeys.length ? dayKeys.slice(0, 10).map((dateKey) => (
          <div key={dateKey}>
            <div className="mb-2 text-xs font-black uppercase tracking-widest text-zinc-500">{new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
            <div className="space-y-2">
              {grouped[dateKey].slice(0, 14).map((event) => <EconomicEventRow key={event.id} event={event} />)}
            </div>
          </div>
        )) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-black/25 p-5 text-center">
            <TrendingUp size={20} className="mx-auto mb-2 text-zinc-600" />
            <div className="text-sm font-bold text-zinc-400">No economic events found for this period.</div>
            <p className="mt-1 text-xs font-semibold text-zinc-600">Try changing the impact filter or currency selection.</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-5 rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-xs font-semibold leading-5 text-zinc-600">
        News data is for review context only. TryCritique does not provide trading signals or investment advice.
      </div>
    </section>
  );
}

function EconomicMiniMetric({ label, value, detail, tone = "emerald" }) {
  const valueClass = tone === "amber" ? "text-amber-400" : tone === "fuchsia" ? "text-fuchsia-300" : "text-emerald-400";
  return (
    <div className="rounded-xl border border-white/10 bg-black/45 p-4">
      <div className="text-xs font-black uppercase tracking-widest text-zinc-500">{label}</div>
      <div className={`mt-2 text-2xl font-black ${valueClass}`}>{value}</div>
      <div className="mt-1 truncate text-xs font-semibold text-zinc-400">{detail}</div>
    </div>
  );
}

function ImpactFolderIcon({ impact }) {
  return (
    <span className="relative inline-flex h-3.5 w-4 shrink-0 items-end">
      <span className={`absolute left-0 top-0 h-1.5 w-2 rounded-t-sm ${getEventImpactFolderClass(impact)}`} />
      <span className={`relative h-3 w-4 rounded-[2px] ${getEventImpactFolderClass(impact)}`} />
    </span>
  );
}

function EconomicEventRow({ event, compact = false }) {
  const impactLabel = getEventImpactLabel(event.impact);
  return (
    <div className={compact ? "rounded-xl border border-white/10 bg-black/45 p-3" : "grid gap-3 rounded-xl border border-white/10 bg-black/35 px-4 py-3 sm:grid-cols-[72px_72px_1fr_auto] sm:items-center"}>
      <div className="text-sm font-black text-zinc-400">{event.time || "All day"}</div>
      <div className="text-sm font-black text-white">{event.country}</div>
      <div className="min-w-0">
        <div className="truncate text-sm font-black text-white">{event.title}</div>
        {(event.forecast || event.previous || event.actual) && (
          <div className="mt-1 text-xs font-semibold text-zinc-500">
            {event.actual ? `A: ${event.actual} · ` : ""}{event.forecast ? `F: ${event.forecast} · ` : ""}{event.previous ? `P: ${event.previous}` : ""}
          </div>
        )}
      </div>
      <span className={`flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-black ${getEventImpactClass(event.impact)}`}>
        <ImpactFolderIcon impact={impactLabel} />
        {impactLabel}
      </span>
    </div>
  );
}

function CalendarSummaryCard({ title, value, text, tone }) {
  const cls = tone === "emerald" ? "calendar-summary-card-pro calendar-summary-good" : tone === "red" ? "calendar-summary-card-pro calendar-summary-bad" : "calendar-summary-card-pro calendar-summary-warn";
  return (
    <div className={cls}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{title}</div>
        <span className="calendar-summary-dot-pro" />
      </div>
      <div className="mt-3 text-3xl font-black text-white"><AnimatedValue value={value} /></div>
      <div className="mt-2 text-xs font-bold leading-5 text-zinc-400">{text}</div>
    </div>
  );
}

function CalendarGuide() {
  return (
    <section className="calendar-guide-pro mt-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-fuchsia-300">How to read the calendar</div>
          <h3 className="mt-2 text-2xl font-black text-white">Each day shows your result at a glance.</h3>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-zinc-400">Green days are profitable, red days are losing, amber days are break-even. Click any day to review trades and see economic events for that date.</p>
        </div>
        <div className="calendar-legend-pro">
          <span><i className="bg-emerald-400" /> Win day</span>
          <span><i className="bg-red-400" /> Loss day</span>
          <span><i className="bg-amber-400" /> Break-even</span>
          <span><i className="bg-fuchsia-400" /> Selected</span>
        </div>
      </div>
    </section>
  );
}

function MultiSelectDropdown({ value, options = [], onChange, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = splitMultiValues(value).filter((v) => v && v !== "None");

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(option) {
    const next = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    onChange(next.length === 0 ? "None" : next.join(", "));
  }

  const displayText = selected.length === 0 ? placeholder : selected.join(", ");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="multi-select-trigger flex w-full items-center justify-between rounded-xl border border-white/15 bg-black px-4 py-2.5 text-left text-sm transition hover:border-white/25 focus:outline-none"
      >
        <span className={selected.length === 0 ? "text-zinc-600" : "text-zinc-200 truncate"}>{displayText}</span>
        <ChevronDown size={15} className={`ml-2 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="multi-select-menu absolute z-50 mt-1 w-full rounded-xl border border-white/15 bg-[#0d0d0d] py-1 shadow-xl">
          {options.filter((o) => o !== "None").map((option) => {
            const checked = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-white/5"
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${checked ? "border-fuchsia-500 bg-fuchsia-500" : "border-white/20 bg-transparent"}`}>
                  {checked && <Check size={10} className="text-black font-black" />}
                </span>
                <span className={checked ? "text-zinc-200" : "text-zinc-400"}>{option}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TagInput({ value, onChange }) {
  const [inputVal, setInputVal] = useState("");
  const tags = normalizeTags({ tags: value }).filter((t) => !String(t).toLowerCase().startsWith("result:"));

  function addTag(text) {
    const tag = text.trim().replace(/^#/, "");
    if (!tag || tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())) return;
    onChange([...tags, tag].join(", "));
    setInputVal("");
  }
  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag).join(", "));
  }
  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === "Backspace" && !inputVal && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="flex min-h-[44px] flex-wrap items-center gap-2 rounded-xl border border-white/15 bg-black px-3 py-2 transition focus-within:border-fuchsia-500/60 focus-within:ring-1 focus-within:ring-fuchsia-500/20">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/12 px-2.5 py-1 text-xs font-semibold text-fuchsia-300">
          #{tag}
          <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 text-fuchsia-400 hover:text-white transition">
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputVal.trim()) addTag(inputVal); }}
        placeholder={tags.length === 0 ? "Type a tag and press Enter... (e.g. FVG, Breakout)" : ""}
        className="min-w-[160px] flex-1 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
      />
    </div>
  );
}

function AddTradeModal({ isEditing, isSaving = false, form, setForm, onClose, onSave, account, accounts = [], trades = [], accountBalance, onSelectAccount, onAddAccount, onOpenStrategies, strategiesObjects = [], errorMessage = "" }) {
  const rr = Number(form.risk) ? (Number(form.pnl || 0) / Number(form.risk)).toFixed(2) : "—";
  const screenshots = normalizeScreenshots(form);
  const riskWarnings = getRiskWarnings(form, accountBalance);
  const formErrors = getTradeFormErrors(form);
  const hasFormErrors = Object.keys(formErrors).length > 0;
  const [customStrategies, setCustomStrategies] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOM_STRATEGIES_KEY) || "[]");
      return Array.isArray(saved) ? saved.filter((item) => item && !LEGACY_DEFAULT_STRATEGIES.includes(item)) : [];
    } catch {
      return [];
    }
  });
  // Keep customStrategies in sync when strategiesObjects is updated externally
  // (e.g. after renaming a strategy in TradingStrategiesModal while this modal is open)
  useEffect(() => {
    if (strategiesObjects.length > 0) {
      setCustomStrategies(strategiesObjects.map((s) => s.name).filter((n) => n && !LEGACY_DEFAULT_STRATEGIES.includes(n)));
    }
  }, [strategiesObjects]);
  const [newStrategyName, setNewStrategyName] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  // Merge strategiesObjects names + customStrategies (legacy) + form.strategy
  const strategyObjNames = strategiesObjects.map((s) => s.name);
  const strategyOptions = [...new Set([...strategyObjNames, ...customStrategies, form.strategy].filter(Boolean).filter((item) => !String(item).startsWith("Select")))];
  const currencyOptions = ["%", "USD"];
  const accountBalanceNum = Number(accountBalance?.currentBalance || accountBalance?.startingBalance || 0);
  const isPercentRisk = form.currency === "%";
  // If % mode: risk entered as % of balance → convert to $
  const riskInDollars = isPercentRisk
    ? (Number(form.risk || 0) / 100) * accountBalanceNum
    : Number(form.risk || 0);
  const rrRatio = riskInDollars ? (Number(form.pnl || 0) / riskInDollars).toFixed(2) : null;
  const rrPercent = accountBalanceNum && riskInDollars ? ((Number(form.pnl || 0) / accountBalanceNum) * 100).toFixed(2) : null;
  const activeResult = normalizeTradeResult(form.result) || getResultFromPnl(form.pnl);
  const shownErrors = showErrors ? formErrors : {};
  function handleSaveClick() {
    if (hasFormErrors) {
      setShowErrors(true);
      setTimeout(() => {
        const shell = document.querySelector(".trade-modal-shell");
        const firstError = document.querySelector(".trade-field-error");
        if (firstError && shell) {
          const errorTop = firstError.getBoundingClientRect().top;
          const shellTop = shell.getBoundingClientRect().top;
          shell.scrollBy({ top: errorTop - shellTop - 120, behavior: "smooth" });
          const input = firstError.previousElementSibling || firstError.closest("[data-field]")?.querySelector("input, select, textarea");
          if (input) input.focus({ preventScroll: true });
        }
      }, 50);
      return;
    }
    onSave();
  }

  function updateField(key, value) {
    if (key === "pnl") {
      const previousAutoResult = getResultFromPnl(form.pnl);
      const currentResult = normalizeTradeResult(form.result);
      const nextResult = !currentResult || currentResult === previousAutoResult ? getResultFromPnl(value) : currentResult;
      setForm({ ...form, pnl: value, result: nextResult });
      return;
    }
    if (key === "result") {
      const nextResult = normalizeTradeResult(value) || getResultFromPnl(form.pnl);
      setForm({ ...form, result: nextResult });
      return;
    }
    if (key === "tags") {
      setForm({ ...form, tags: value });
      return;
    }
    setForm({ ...form, [key]: value });
  }

  function addCustomStrategy() {
    const name = newStrategyName.trim();
    if (!name) return;
    const next = [...new Set([...customStrategies, name])];
    setCustomStrategies(next);
    localStorage.setItem(CUSTOM_STRATEGIES_KEY, JSON.stringify(next));
    setNewStrategyName("");
    updateField("strategy", name);
  }

  function deleteCustomStrategy(name) {
    const shouldDelete = window.confirm(`Delete strategy "${name}"?`);
    if (!shouldDelete) return;
    const next = customStrategies.filter((strategy) => strategy !== name);
    setCustomStrategies(next);
    localStorage.setItem(CUSTOM_STRATEGIES_KEY, JSON.stringify(next));
    if (form.strategy === name) {
      updateField("strategy", "");
    }
  }

  return (
    <div className="trade-modal-shell fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/80 px-3 py-8 backdrop-blur-md sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="trade-modal-panel w-full max-w-[820px] rounded-xl border border-white/15 bg-zinc-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black">
              <TrendingUp className="text-fuchsia-400" size={18} />
              {isEditing ? "Edit Trade" : "Add New Trade"}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">Record a new trade to track your performance and analyze your strategy.</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X /></button>
        </div>

        <Section title="Trade Basics" icon={<TrendingUp size={17} />}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Symbol">
              <Input autoFocus value={form.symbol} onChange={(e) => updateField("symbol", e.target.value.toUpperCase())} placeholder="E.g., MNQ, MES" className={inputPurpleClass("uppercase")} />
              <FieldError text={shownErrors.symbol} />
            </Field>
            <Field label="Trade Type">
              <Select value={form.direction} onChange={(e) => updateField("direction", e.target.value)}><option>Buy</option><option>Sell</option></Select>
            </Field>
            <Field label="Quantity">
              <Input value={form.quantity} onChange={(e) => updateField("quantity", e.target.value)} className={inputPurpleClass()} />
              <FieldError text={shownErrors.quantity} />
            </Field>
            <Field label="P&L">
              <MoneyInput value={form.pnl} onChange={(e) => updateField("pnl", e.target.value)} />
              <FieldError text={shownErrors.pnl} />
            </Field>
            <Field label="Risk">
              <div className="flex gap-2">
                <div className="flex-1">
                  {isPercentRisk ? (
                    <div className="relative">
                      <Input value={form.risk} onChange={(e) => updateField("risk", e.target.value)} placeholder="0" className={inputPurpleClass("pr-7")} />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">%</span>
                    </div>
                  ) : (
                    <MoneyInput value={form.risk} onChange={(e) => updateField("risk", e.target.value)} />
                  )}
                </div>
                <div className="w-24"><Select value={form.currency} onChange={(e) => updateField("currency", e.target.value)}>{currencyOptions.map((currencyOption) => <option key={currencyOption}>{currencyOption}</option>)}</Select></div>
              </div>
              <FieldError text={shownErrors.risk} />
              <p className="mt-1.5 text-xs font-semibold text-zinc-500">
                {isPercentRisk && accountBalanceNum > 0
                  ? `≈ $${riskInDollars.toLocaleString(undefined, { maximumFractionDigits: 2 })} of $${accountBalanceNum.toLocaleString()}`
                  : `Risk amount in ${form.currency || "USD"}`}
              </p>
            </Field>
            <Field label="R:R Ratio">
              <Input disabled value={rrRatio ? `${rrRatio}R` : "—"} className="border-white/10 bg-zinc-900" />
              <p className="mt-1.5 text-xs font-semibold text-zinc-500">
                {rrRatio && rrPercent
                  ? `$${Number(form.pnl || 0).toLocaleString()} P&L · ${rrPercent}% of balance`
                  : "Auto-calculated from P&L and Risk"}
              </p>
            </Field>
            <div>
              <DateFilterField label="Trade Date" value={form.date} onChange={(value) => updateField("date", value)} />
              <FieldError text={shownErrors.date} />
            </div>
            <Field label="Entry Time">
              <Input value={form.entryTime} onChange={(e) => updateField("entryTime", formatTimeInput(e.target.value))} placeholder="09:30" className={inputPurpleClass()} />
            </Field>
            <Field label="Exit Time">
              <Input value={form.exitTime} onChange={(e) => updateField("exitTime", formatTimeInput(e.target.value))} placeholder="16:00" className={inputPurpleClass()} />
            </Field>
            <Field label="Trading Session">
              <Select value={form.session} onChange={(e) => updateField("session", e.target.value)}>
                <option>Select trading session</option>
                {TRADING_SESSIONS.map((sessionOption) => <option key={sessionOption}>{sessionOption}</option>)}
              </Select>
              <FieldError text={shownErrors.session} />
            </Field>
          </div>
          {riskWarnings.some((w) => w.tone !== "emerald") && (
            <div className="mt-5 space-y-2">
              {riskWarnings.filter((w) => w.tone !== "emerald").map((warning) => (
                <div key={warning.title} className={warning.tone === "red" ? "rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300" : "rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-300"}>
                  <span className="font-black">{warning.title}:</span> {warning.text}
                </div>
              ))}
            </div>
          )}
        </Section>

        <div className="trade-context-modern trade-form-section mt-6 overflow-visible rounded-xl border border-white/10 bg-[#0a0a0a] p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-500/35 bg-fuchsia-500/12 text-fuchsia-300 shadow-[0_0_16px_rgba(178,74,242,0.18)]"><Target size={18} /></span>
            <h3 className="text-xl font-black text-white">Strategy &amp; Trade Context</h3>
          </div>

          <div className="space-y-5">
            <Field label="Strategy">
              <StrategyDropdown
                value={form.strategy || ""}
                options={strategyOptions}
                onChange={(value) => updateField("strategy", value)}
                onAddNew={onOpenStrategies}
              />
              <FieldError text={shownErrors.strategy} />
            </Field>

            <Field label="Account">
              <AccountDropdown
                account={account}
                accounts={accounts}
                trades={trades}
                accountBalance={accountBalance}
                onChange={onSelectAccount}
                onAddNew={onAddAccount}
              />
            </Field>

            <Field label="Result">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Win", value: "Win", dot: "bg-emerald-400" },
                  { label: "Loss", value: "Loss", dot: "bg-red-400" },
                  { label: "Breakeven", value: "Break Even", dot: "bg-amber-400" },
                  { label: "Partial", value: "Partial", dot: "bg-orange-400" },
                ].map((resultOption) => {
                  const selected = activeResult === resultOption.value;
                  return (
                    <button
                      key={resultOption.value}
                      type="button"
                      onClick={() => updateField("result", form.result === resultOption.value ? "" : resultOption.value)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-black transition ${
                        selected
                          ? "border-fuchsia-500/60 bg-fuchsia-500/15 text-fuchsia-200 shadow-[0_0_14px_rgba(178,74,242,.15)]"
                          : "border-white/10 bg-black/40 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${resultOption.dot}`} /> {resultOption.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs font-semibold text-zinc-500">Auto follows P&L unless you choose Partial.</p>
            </Field>

            <Field label="Tags">
              <TagInput value={form.tags} onChange={(v) => updateField("tags", v)} />
            </Field>

            <Field label="Emotions">
              <Select value={form.emotion || ""} onChange={(e) => updateField("emotion", e.target.value)}>
                <option value="">How did you feel?</option>
                {EMOTION_OPTIONS.map((emotionOption) => <option key={emotionOption[0]} value={emotionOption[0]}>{emotionOption[0]}</option>)}
              </Select>
            </Field>

            <Field label="Mistakes">
              <MultiSelectDropdown
                value={form.mistake}
                options={MISTAKE_OPTIONS}
                onChange={(v) => updateField("mistake", v)}
                placeholder="Select mistakes..."
              />
            </Field>

            <Field label="Rules Broken">
              <MultiSelectDropdown
                value={form.ruleBroken}
                options={RULE_BROKEN_OPTIONS}
                onChange={(v) => updateField("ruleBroken", v)}
                placeholder="Select rules broken..."
              />
            </Field>

            <Field label="Setup Quality">
              <Select value={form.setupQuality || ""} onChange={(e) => updateField("setupQuality", e.target.value)}>
                <option value="">Select quality...</option>
                {SETUP_QUALITY_OPTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
              </Select>
            </Field>
          </div>
        </div>

        <Section title={`Screenshots (${screenshots.length}/${MAX_SCREENSHOTS})`} icon={<Camera size={17} />}>
          <Input type="file" accept="image/*" multiple disabled={screenshots.length >= MAX_SCREENSHOTS} onChange={(event) => uploadScreenshotsForTrade(event, form, setForm)} className="cursor-pointer border-white/15 bg-black text-white file:mr-4 file:rounded-md file:border-0 file:bg-fuchsia-500 file:px-4 file:py-2 file:text-black" />
          <p className="mt-2 text-xs font-semibold text-zinc-500">⬆ Upload chart screenshots or paste from clipboard (max {MAX_SCREENSHOTS} images, 5MB each)</p>
          <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-black p-5 text-center">
            {screenshots.length ? (
              <div className="grid grid-cols-2 gap-2">
                {screenshots.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt="Uploaded screenshot" className="h-32 w-full rounded object-cover" />
                    <button type="button" onClick={() => updateField("screenshots", screenshots.filter((_, i) => i !== index))} className="absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white">X</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-zinc-400"><Camera className="mx-auto mb-3" /><div className="font-bold">No screenshots uploaded yet</div><div className="mt-1 text-xs">Click above to add chart screenshots or press Ctrl+V to paste</div></div>
            )}
          </div>
        </Section>

        <Section title="Notes" icon={<BookOpen size={17} />}>
          <Textarea rows={5} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Market conditions, rationale, lessons learned..." className="border-white/15 bg-black focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" />
          <p className="mt-2 text-xs font-semibold text-zinc-500">Record your thoughts, market analysis, and key learnings from this trade</p>
        </Section>


        {errorMessage && (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300">
            {errorMessage}
          </div>
        )}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/10">Cancel</Button>
          <Button onClick={handleSaveClick} disabled={isSaving} className="bg-fuchsia-500 text-black hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-40">{isSaving ? <RefreshCwIcon /> : <Plus size={16} />} {isSaving ? "Saving..." : isEditing ? "Update Trade" : "Save Trade"}</Button>
        </div>
      </motion.div>
    </div>
  );
}

function AccountDropdown({ account, accounts = [], trades = [], accountBalance, onChange, onAddNew }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selectedType = getAccountTypeOption(account?.type);
  const selectedBalance = Number(accountBalance?.currentBalance ?? account?.balance ?? 0);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`account-dropdown-trigger flex h-10 w-full items-center justify-between rounded-md border bg-black px-3 text-left transition ${open ? "border-white/20" : "border-white/15 hover:border-white/25"}`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="shrink-0 text-sm">{selectedType.emoji}</span>
          <span className="truncate text-sm font-black text-white">{account?.name || "Account"}</span>
          <span className="truncate text-xs font-semibold text-zinc-400">
            {account?.currency || "USD"} {selectedBalance.toLocaleString()} <span className="text-fuchsia-400">•</span> {getAccountTypeLabel(account?.type)}
          </span>
        </span>
        <ChevronDown size={15} className={`ml-3 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="listbox"
          className="account-dropdown-menu absolute left-0 top-[44px] z-[100] w-full overflow-hidden rounded-md border border-white/15 bg-[#09090b] py-1 shadow-[0_18px_55px_rgba(0,0,0,0.9)]"
        >
          {accounts.map((item) => {
            const isSelected = String(item.id) === String(account?.id);
            const itemBalance = calculateAccountBalance(item, trades);
            const typeOption = getAccountTypeOption(item.type);
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange?.(item.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/[0.04]"
              >
                <span className="flex w-4 shrink-0 items-center justify-center text-white">{isSelected ? <Check size={16} strokeWidth={2} /> : null}</span>
                <span className="shrink-0 text-sm">{typeOption.emoji}</span>
                <span className="truncate text-sm font-black text-zinc-200">{item.name || "Account"}</span>
                <span className="truncate text-xs font-semibold text-zinc-500">
                  {item.currency || "USD"} {Number(itemBalance.currentBalance || 0).toLocaleString()} <span className="text-zinc-600">•</span> {getAccountTypeLabel(item.type)}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onAddNew?.();
            }}
            className="flex w-full items-center gap-3 px-9 py-2.5 text-left text-sm font-semibold text-fuchsia-400 transition hover:bg-fuchsia-500/[0.06] hover:text-fuchsia-300"
          >
            <Plus size={15} /> Add New Account
          </button>
        </motion.div>
      )}
    </div>
  );
}

function StrategyDropdown({ value, options = [], onChange, onAddNew }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const selected = value || "";
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="strategy-dropdown-trigger flex h-10 w-full items-center justify-between rounded-md border border-white/15 bg-black px-3 text-left text-sm text-zinc-200 outline-none transition hover:border-fuchsia-400/50">
        <span className="font-semibold">{selected || "Select strategy"}</span>
        <ChevronDown size={15} className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="strategy-dropdown-menu absolute left-0 top-11 z-[9999] w-full overflow-hidden rounded-xl border border-white/10 bg-[#0e0e0e] shadow-[0_18px_55px_rgba(0,0,0,0.9)]">
          {options.length === 0 && (
            <div className="px-4 py-3 text-sm text-zinc-500">No strategies yet</div>
          )}
          {options.map((opt) => (
            <button key={opt} type="button" onMouseDown={(e) => { e.preventDefault(); onChange(opt); setOpen(false); }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:text-white ${value === opt ? "font-bold text-white" : "text-zinc-300"}`}>
              <span className="w-4 shrink-0 text-xs text-fuchsia-400">{value === opt ? "✓" : ""}</span>
              {opt}
            </button>
          ))}
          <div className="border-t border-white/8">
            <button type="button" onMouseDown={(e) => { e.preventDefault(); setOpen(false); onAddNew?.(); }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-fuchsia-400 transition hover:text-fuchsia-300">
              <ListChecks size={14} /> Add New Strategy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TradingStrategiesModal({ strategies = [], onSave, onClose }) {
  const [list, setList] = useState(strategies);
  const [selected, setSelected] = useState(null); // index or "new"
  const [draft, setDraft] = useState({ name: "", description: "", items: [] });
  const [newItem, setNewItem] = useState("");

  function startNew() {
    setSelected("new");
    setDraft({ name: "", description: "", items: [] });
  }
  function selectStrategy(idx) {
    setSelected(idx);
    setDraft({ ...list[idx] });
  }
  function addChecklistItem() {
    const text = newItem.trim();
    if (!text) return;
    setDraft((d) => ({ ...d, items: [...(d.items || []), { id: Date.now(), text, checked: false }] }));
    setNewItem("");
  }
  function removeItem(id) {
    setDraft((d) => ({ ...d, items: d.items.filter((item) => item.id !== id) }));
  }
  function save() {
    if (!draft.name.trim()) return;
    let next;
    let renameInfo = null;
    if (selected === "new") {
      next = [...list, { id: Date.now(), name: draft.name.trim(), description: draft.description, items: draft.items || [] }];
    } else {
      const oldName = list[selected]?.name || "";
      const newName = draft.name.trim();
      if (oldName && oldName !== newName) {
        renameInfo = { oldName, newName };
      }
      next = list.map((s, i) => i === selected ? { ...s, ...draft, name: newName } : s);
    }
    setList(next);
    onSave(next, renameInfo);
    onClose();
  }
  function deleteStrategy(idx) {
    if (!window.confirm(`Delete strategy "${list[idx].name}"?`)) return;
    const next = list.filter((_, i) => i !== idx);
    setList(next);
    onSave(next);
    setSelected(null);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:items-center">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="strategies-modal-panel w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300"><ListChecks size={18} /></span>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Trading Strategies</h2>
              <p className="mt-0.5 text-sm text-zinc-500">Manage your trading strategies and their pre-trade checklists</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="flex" style={{ minHeight: "660px" }}>
          {/* Left panel */}
          <div className="w-72 shrink-0 border-r border-white/8 p-4">
            <button onClick={startNew} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-bold text-zinc-200 transition hover:border-fuchsia-500/40 hover:text-fuchsia-200">
              <Plus size={15} /> New Strategy
            </button>
            <div className="mt-3 space-y-2">
              {list.map((s, i) => (
                <button key={s.id || i} onClick={() => selectStrategy(i)}
                  className={`w-full rounded-xl border p-3 text-left transition ${selected === i ? "border-fuchsia-500/40 bg-fuchsia-500/8" : "border-white/8 bg-black/40 hover:border-white/15"}`}>
                  <div className="text-sm font-bold text-zinc-200">{s.name}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                    <ListChecks size={11} /> {(s.items || []).length} items
                  </div>
                </button>
              ))}
              {list.length === 0 && <p className="mt-4 text-xs text-zinc-600">No strategies yet. Create your first one!</p>}
            </div>
          </div>
          {/* Right panel */}
          <div className="flex-1 p-6">
            {selected === null ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-500"><ListChecks size={28} /></div>
                <p className="mt-4 text-sm font-semibold text-zinc-500">Select a strategy to edit</p>
                <p className="mt-1 text-xs text-zinc-600">or create a new one to get started</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300">Strategy Name <span className="text-red-400">*</span></label>
                  <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    placeholder="e.g., Scalping, Trend Following, Breakout..." className="mt-2 border-white/15 bg-black focus-visible:border-fuchsia-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-300">Description <span className="text-xs font-normal text-zinc-500">(Optional)</span></label>
                  <Textarea value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    placeholder="Describe your trading strategy, entry/exit rules, timeframes, etc..." rows={4}
                    className="mt-2 border-white/15 bg-black focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300"><ListChecks size={15} className="text-fuchsia-400" /> Pre-Trade Checklist</div>
                    <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-zinc-400">{(draft.items || []).length} items</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input value={newItem} onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChecklistItem(); } }}
                      placeholder="Add a checklist item and press Enter..." className="border-white/15 bg-black focus-visible:border-fuchsia-400" />
                    <button type="button" onClick={addChecklistItem}
                      className="shrink-0 rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-fuchsia-400">+ Add</button>
                  </div>
                  {(draft.items || []).length === 0 ? (
                    <div className="mt-3 rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-600">No checklist items yet. Add your first one above!</div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {draft.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/40 px-4 py-2.5">
                          <span className="text-sm text-zinc-300">{item.text}</span>
                          <button type="button" onClick={() => removeItem(item.id)} className="ml-3 text-zinc-600 hover:text-red-400"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-white/8 pt-5">
                  {selected !== "new" && (
                    <button type="button" onClick={() => deleteStrategy(selected)}
                      className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500 hover:text-white">
                      <Trash2 size={14} /> Delete Strategy
                    </button>
                  )}
                  <div className="ml-auto flex gap-3">
                    <button type="button" onClick={() => setSelected(null)} className="rounded-xl border border-white/15 bg-black px-5 py-2.5 text-sm font-bold text-zinc-300 hover:text-white">Cancel</button>
                    <button type="button" onClick={save} disabled={!draft.name.trim()}
                      className="flex items-center gap-2 rounded-xl bg-fuchsia-500 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-fuchsia-400 disabled:opacity-40">
                      <BookOpen size={14} /> {selected === "new" ? "Create" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StrategyChoice({ value, options = [], customOptions = [], onChange, onDelete }) {
  const customSet = new Set(customOptions);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = String(value || "") === String(option);
        const isCustom = customSet.has(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange?.(option)}
            className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition-all duration-200 hover:scale-[1.02] ${selected ? "strategy-choice-active border-emerald-400/60 bg-emerald-500/15 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,.12)]" : "border-white/10 bg-black/35 text-zinc-400 hover:border-emerald-500/35 hover:text-emerald-200"}`}
          >
            <span>{option}</span>
            {isCustom && (
              <span
                role="button"
                tabIndex={0}
                aria-label={`Delete ${option}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(option);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onDelete?.(option);
                  }
                }}
                className="ml-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] text-zinc-500 transition hover:border-red-400/60 hover:bg-red-500/15 hover:text-red-300 group-hover:text-zinc-300"
              >
                x
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SegmentedChoice({ value, options = [], onChange, tone = "strategy" }) {
  const base = "rounded-xl border px-3 py-2 text-xs font-black transition-all duration-200 hover:scale-[1.02]";
  const toneClass = {
    session: {
      active: "border-fuchsia-400/70 bg-gradient-to-r from-fuchsia-500/25 to-emerald-500/15 text-fuchsia-100 shadow-[0_0_18px_rgba(178,74,242,.18)]",
      idle: "border-white/10 bg-black/35 text-zinc-400 hover:border-fuchsia-500/35 hover:text-fuchsia-200",
    },
    strategy: {
      active: "border-emerald-400/60 bg-emerald-500/15 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,.12)]",
      idle: "border-white/10 bg-black/35 text-zinc-400 hover:border-emerald-500/35 hover:text-emerald-200",
    },
    quality: {
      active: "border-fuchsia-400/70 bg-gradient-to-r from-fuchsia-500/25 to-purple-500/20 text-fuchsia-100 shadow-[0_0_18px_rgba(178,74,242,.16)]",
      idle: "border-white/10 bg-black/35 text-zinc-400 hover:border-fuchsia-500/35 hover:text-fuchsia-200",
    },
  }[tone] || {
    active: "border-fuchsia-400/70 bg-fuchsia-500/20 text-fuchsia-100",
    idle: "border-white/10 bg-black/35 text-zinc-400 hover:border-fuchsia-500/35",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = String(value || "") === String(option);
        return (
          <button key={option} type="button" onClick={() => onChange?.(option)} className={`${base} ${selected ? `segmented-choice-active ${toneClass.active}` : `segmented-choice-idle ${toneClass.idle}`}`}>
            {option}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoice({ value, options = [], onChange, tone = "emotion", allowNone = false }) {
  const selectedValues = splitMultiValues(value);
  const selectedSet = new Set(selectedValues);
  const normalizedOptions = options.map((option) => Array.isArray(option) ? option : [option, "", ""]);
  const toneClass = {
    emotion: {
      active: "border-emerald-400/60 bg-emerald-500/15 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,.12)]",
      idle: "border-white/10 bg-black/35 text-zinc-400 hover:border-emerald-500/35 hover:text-emerald-200",
      icon: "bg-emerald-500/12 text-emerald-200",
    },
    mistake: {
      active: "border-red-400/55 bg-red-500/14 text-red-100 shadow-[0_0_18px_rgba(239,68,68,.10)]",
      idle: "border-white/10 bg-black/35 text-zinc-400 hover:border-red-500/35 hover:text-red-200",
      icon: "bg-red-500/12 text-red-200",
    },
    rule: {
      active: "border-amber-400/60 bg-amber-500/14 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,.10)]",
      idle: "border-white/10 bg-black/35 text-zinc-400 hover:border-amber-500/35 hover:text-amber-200",
      icon: "bg-amber-500/12 text-amber-200",
    },
  }[tone] || {
    active: "border-fuchsia-400/70 bg-fuchsia-500/18 text-fuchsia-100",
    idle: "border-white/10 bg-black/35 text-zinc-400 hover:border-fuchsia-500/35",
    icon: "bg-fuchsia-500/15 text-fuchsia-200",
  };

  function toggle(option) {
    if (option === "None" && allowNone) {
      onChange?.("None");
      return;
    }
    const next = selectedValues.filter((item) => item !== "None");
    const exists = next.includes(option);
    const finalValues = exists ? next.filter((item) => item !== option) : [...next, option];
    onChange?.(finalValues.length ? joinMultiValues(finalValues) : allowNone ? "None" : "");
  }

  return (
    <div className="flex flex-wrap gap-2">
      {normalizedOptions.map(([label, detail, icon]) => {
        const selected = selectedSet.has(label) || (allowNone && selectedValues.length === 0 && label === "None");
        return (
          <button key={label} type="button" onClick={() => toggle(label)} className={`rounded-xl border px-3 py-2 text-left text-xs font-black transition-all duration-200 hover:scale-[1.02] ${selected ? `multi-choice-active ${toneClass.active}` : toneClass.idle}`}>
            <span className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${toneClass.icon}`}>{icon || (selected ? "✓" : "+")}</span>
              <span>
                <span className="block">{label}</span>
                {detail && <span className="mt-0.5 block text-[10px] font-bold opacity-70">{detail}</span>}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function getTradeFormErrors(form) {
  const errors = {};
  if (!String(form.symbol || "").trim()) errors.symbol = "Symbol is required.";
  if (!form.date) errors.date = "Trade date is required.";
  if (!form.session || String(form.session).startsWith("Select")) errors.session = "Choose a trading session.";
  if (!form.strategy || String(form.strategy).startsWith("Select")) errors.strategy = "Choose or add a strategy.";
  if (!form.quantity || Number.isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) errors.quantity = "Quantity must be greater than 0.";
  if (form.pnl === "" || Number.isNaN(Number(form.pnl))) errors.pnl = "Enter a valid P&L.";
  if (form.risk === "" || Number.isNaN(Number(form.risk)) || Number(form.risk) < 0) errors.risk = "Risk cannot be negative.";
  return errors;
}

function FieldError({ text }) {
  if (!text) return null;
  return <div className="trade-field-error mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300">⚠ {text}</div>;
}

function ImportPreviewModal({ preview, onConfirm, onClose }) {
  const validCount = preview?.trades?.length || 0;
  const duplicateCount = preview?.duplicates?.length || 0;
  const invalidCount = preview?.invalidRows?.length || 0;
  const totalPnl = (preview?.trades || []).reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-h-[90vh] w-full max-w-[860px] overflow-y-auto rounded-2xl border border-fuchsia-500/35 bg-black p-6 shadow-[0_22px_70px_rgba(0,0,0,0.75)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-black"><Upload className="text-fuchsia-400" size={22} /> Import Preview</h2>
            <p className="mt-2 text-sm text-zinc-400">{preview.filename} · Review trades before adding them to your journal.</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X /></button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Valid Trades" value={validCount} green />
          <StatCard title="Total P&L" value={formatMoney(totalPnl)} green={totalPnl >= 0} gold={totalPnl === 0} />
          <StatCard title="Duplicates" value={duplicateCount} gold />
          <StatCard title="Invalid Rows" value={invalidCount} gold />
        </div>

        <div className="mt-6 rounded-2xl border border-fuchsia-500/20 bg-zinc-950/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-black text-white">Trades to import</h3>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300">{validCount} ready</span>
          </div>
          {validCount ? (
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {preview.trades.map((trade) => (
                <div key={trade.id} className="grid grid-cols-[90px_90px_1fr_90px_110px] items-center gap-3 rounded-xl border border-white/10 bg-black p-3 text-sm">
                  <span className="font-black text-white">{trade.pair}</span>
                  <span className={`w-fit rounded-full border px-2 py-1 text-xs font-black ${getTradeDirectionClass(trade.direction)}`}>{trade.direction}</span>
                  <span className="truncate text-zinc-400">{trade.date} · {trade.session} · {trade.setup}</span>
                  <span className="text-zinc-400">Qty {trade.quantity}</span>
                  <span className={`text-right font-black ${getPnlToneClass(trade.pnl)}`}>{getPnlArrow(trade.pnl)} {formatMoney(trade.pnl)}</span>
                </div>
              ))}
            </div>
          ) : <div className="rounded-xl border border-dashed border-white/10 bg-black p-8 text-center text-zinc-500">No valid trades found in this CSV.</div>}
        </div>

        {(duplicateCount > 0 || invalidCount > 0) && (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
              <div className="font-black text-amber-300">Skipped duplicates</div>
              <div className="mt-2 text-sm text-zinc-400">{duplicateCount ? preview.duplicates.map((item) => `Row ${item.row}`).join(", ") : "None"}</div>
            </div>
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4">
              <div className="font-black text-red-300">Invalid rows</div>
              <div className="mt-2 max-h-28 overflow-y-auto text-sm text-zinc-400">
                {invalidCount ? preview.invalidRows.map((item) => <div key={item.row}>Row {item.row}: {item.errors.join(", ")}</div>) : "None"}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <Button variant="outline" onClick={onClose} className="border-white/15 bg-black text-white">Cancel</Button>
          <Button onClick={onConfirm} disabled={!validCount} className="bg-fuchsia-500 text-black hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-40"><Upload size={16} /> Import {validCount} Trades</Button>
        </div>
      </motion.div>
    </div>
  );
}

function PreTradeRoutineModal({ routine, setRoutine, onClose }) {
  const checkedCount = routineItems.filter((item) => routine.checked?.[item.id]).length;
  const percent = Math.round((checkedCount / routineItems.length) * 100);
  const ready = percent === 100;

  function toggleItem(id) {
    setRoutine({ ...routine, checked: { ...routine.checked, [id]: !routine.checked?.[id] } });
  }

  function resetRoutine() {
    setRoutine({ date: formatDateKey(new Date()), checked: {}, notes: "" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="pretrade-modal-panel max-h-[90vh] w-full max-w-[860px] overflow-y-auto rounded-2xl border border-white/15 bg-black p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-300">✅</div>
            <div>
              <h2 className="text-2xl font-black">Start Your Day</h2>
              <p className="text-sm text-zinc-400">Pre-trade routine checklist before taking any trade.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X /></button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <DashCard title="ROUTINE STATUS" value={ready ? "READY" : "WAIT"} badge={ready ? "✓ All checked" : "Finish checklist"} tone={ready ? "emerald" : "amber"} icon={ready ? "✓" : "!"} />
          <DashCard title="COMPLETED" value={`${percent}%`} badge={`${checkedCount}/${routineItems.length} items`} tone="fuchsia" icon="%" />
          <DashCard title="TRADE MODE" value={ready ? "ACTIVE" : "LOCKED"} badge={ready ? "Trade with plan" : "No impulse trades"} tone="cyan" icon="⌁" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {routineItems.map((item) => {
            const checked = Boolean(routine.checked?.[item.id]);
            return (
              <button key={item.id} onClick={() => toggleItem(item.id)} className={`pretrade-routine-item ${checked ? "pretrade-routine-item-checked" : ""} group relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-2xl ${checked ? "border-emerald-500/60 from-emerald-950/45 via-emerald-950/10 to-black shadow-emerald-500/10" : "border-white/10 from-zinc-950 via-black to-black hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/10"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={checked ? "flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300" : "flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-zinc-300"}>{item.icon}</div>
                    <div>
                      <div className="font-black text-white">{item.label}</div>
                      <div className="mt-1 text-xs text-zinc-400">{item.detail}</div>
                    </div>
                  </div>
                  <div className={checked ? "flex h-7 w-7 items-center justify-center rounded-full border border-emerald-500 bg-emerald-500 text-xs font-black text-black" : "flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-xs font-black text-zinc-500"}>
                    {checked ? "✓" : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950 p-5">
          <div className="mb-2 text-sm font-black uppercase tracking-wider text-zinc-400">Daily Notes</div>
          <Textarea value={routine.notes} onChange={(e) => setRoutine({ ...routine, notes: e.target.value })} placeholder="Market bias, important levels, news, mental state..." className="min-h-28 border-white/15 bg-black" />
        </div>

        <div className={ready ? "pretrade-status-card mt-6 rounded-xl border border-emerald-500/40 bg-emerald-950/25 p-5" : "pretrade-status-card mt-6 rounded-xl border border-amber-500/40 bg-amber-950/20 p-5"}>
          <div className={ready ? "text-2xl font-black text-emerald-400" : "text-2xl font-black text-amber-400"}>{ready ? "Ready to Trade" : "Not Ready Yet"}</div>
          <p className="mt-1 text-sm text-zinc-400">{ready ? "Checklist complete. Follow your plan and risk limits." : "Finish the checklist before opening a position."}</p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <Button variant="outline" onClick={resetRoutine} className="border-white/15 bg-black text-white">Reset</Button>
          <Button onClick={onClose} className="bg-fuchsia-500 text-black">Save Routine</Button>
        </div>
      </motion.div>
    </div>
  );
}

function summarizeGroupedTrades(trades, getKey) {
  return trades.reduce((groups, trade) => {
    const dateKey = getTradeDateKey(trade);
    const rawKey = getKey(dateKey);
    const [sortKey, label = sortKey] = String(rawKey).split("|");
    if (!groups[sortKey]) groups[sortKey] = { label, trades: [] };
    groups[sortKey].trades.push(trade);
    return groups;
  }, {});
}

function bestGroupSummary(groups, fallbackLabel = "No data") {
  const rows = Object.entries(groups).map(([sortKey, group]) => ({ sortKey, label: group.label, ...summarizeTrades(group.trades) }));
  return rows.sort((a, b) => Number(b.pnl || 0) - Number(a.pnl || 0))[0] || { label: fallbackLabel, count: 0, pnl: 0, wins: 0, losses: 0, breakEvens: 0, decisive: 0, winRate: 0, breakEvenRate: 0 };
}

function getBestPerformanceStats(trades = []) {
  const dayGroups = summarizeGroupedTrades(trades, (dateKey) => {
    const date = new Date(`${dateKey}T00:00:00`);
    const label = Number.isNaN(date.getTime()) ? dateKey : date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    return `${dateKey}|${label}`;
  });
  return {
    day: bestGroupSummary(dayGroups, "No day"),
    week: bestGroupSummary(summarizeGroupedTrades(trades, getWeekGroupKey), "No week"),
    month: bestGroupSummary(summarizeGroupedTrades(trades, getMonthGroupKey), "No month"),
    year: bestGroupSummary(summarizeGroupedTrades(trades, getYearGroupKey), "No year"),
  };
}

function SettingsToggle({ checked, onClick }) {
  return (
    <button type="button" onClick={onClick} className={checked ? "relative h-7 w-12 shrink-0 rounded-full bg-fuchsia-500" : "relative h-7 w-12 shrink-0 rounded-full bg-zinc-800"}>
      <span className={checked ? "absolute right-1 top-1 h-5 w-5 rounded-full bg-black" : "absolute left-1 top-1 h-5 w-5 rounded-full bg-black ring-1 ring-zinc-700"} />
    </button>
  );
}

function SettingsPanel({ icon, title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-white/12 bg-[#070707] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)] ${className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-white">{icon}</div>
        <div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-sm font-semibold text-zinc-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

const FALLBACK_TIMEZONE_OPTIONS = [
  "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Cairo", "Africa/Casablanca", "Africa/Johannesburg", "Africa/Lagos", "Africa/Nairobi",
  "America/Anchorage", "America/Argentina/Buenos_Aires", "America/Bogota", "America/Caracas", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Mexico_City", "America/New_York", "America/Panama", "America/Santiago", "America/Sao_Paulo", "America/Toronto", "America/Vancouver",
  "Asia/Almaty", "Asia/Amman", "Asia/Ashgabat", "Asia/Baghdad", "Asia/Baku", "Asia/Bangkok", "Asia/Beirut", "Asia/Dhaka", "Asia/Dubai", "Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Jakarta", "Asia/Jerusalem", "Asia/Karachi", "Asia/Kathmandu", "Asia/Kolkata", "Asia/Kuala_Lumpur", "Asia/Kuwait", "Asia/Manila", "Asia/Riyadh", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran", "Asia/Tokyo", "Asia/Yerevan",
  "Australia/Adelaide", "Australia/Brisbane", "Australia/Melbourne", "Australia/Perth", "Australia/Sydney",
  "Europe/Amsterdam", "Europe/Athens", "Europe/Berlin", "Europe/Brussels", "Europe/Bucharest", "Europe/Budapest", "Europe/Istanbul", "Europe/Kyiv", "Europe/Lisbon", "Europe/London", "Europe/Madrid", "Europe/Moscow", "Europe/Paris", "Europe/Prague", "Europe/Rome", "Europe/Stockholm", "Europe/Vienna", "Europe/Warsaw", "Europe/Zurich",
  "Pacific/Auckland", "Pacific/Honolulu",
];

function getTimezoneOffsetLabel(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" }).formatToParts(new Date());
    return parts.find((part) => part.type === "timeZoneName")?.value || "";
  } catch {
    return "";
  }
}

function normalizeTimezoneValue(value) {
  if (!value) return "Asia/Tbilisi";
  if (String(value).includes("(")) {
    if (String(value).includes("Tbilisi")) return "Asia/Tbilisi";
    if (String(value).includes("Eastern")) return "America/New_York";
    if (String(value).includes("London")) return "Europe/London";
    if (String(value).includes("Central Europe")) return "Europe/Berlin";
  }
  return String(value);
}

function getTimezoneOptions() {
  const supported = typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : FALLBACK_TIMEZONE_OPTIONS;
  const preferred = ["Asia/Tbilisi", "America/New_York", "Europe/London", "Europe/Berlin", "Asia/Dubai", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney"];
  return Array.from(new Set([...preferred, ...supported]))
    .filter(Boolean)
    .map((value) => {
      const city = value.split("/").pop().replace(/_/g, " ");
      const region = value.split("/")[0].replace(/_/g, " ");
      const offset = getTimezoneOffsetLabel(value);
      return { value, label: `${city} (${region}${offset ? `, ${offset}` : ""})` };
    });
}

function SettingsPasswordInput({ visible, onToggle, className = "", ...props }) {
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} {...props} className={`pr-12 ${className}`} />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-fuchsia-200"
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

function SettingsPagePro({ account, accountBalance, authUser, theme, setTheme, isSupabaseReady, onOpenAccount, onBackup, onRestore, onSignOut, profilePhoto, setProfilePhoto, onProfileNameChange, onSavePreferences }) {
  const profileName = getUserDisplayName(authUser, account?.isPlaceholder ? "User" : account?.name || "User");
  const profileInitials = profileName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "U";
  const currentBalance = Number(accountBalance?.currentBalance || account?.balance || 0);
  const tradePnl = Number(accountBalance?.tradePnl || 0);
  const profilePhotoInputRef = useRef(null);
  const [fullName, setFullName] = useState(profileName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({ current: false, new: false, confirm: false });
  const [preferences, setPreferences] = useState(() => {
    // Prefer account.preferences (Supabase SoT) over localStorage fallback
    const fromAccount = account?.preferences && typeof account.preferences === "object" ? account.preferences : null;
    const fromStorage = readTradingPreferences();
    return fromAccount ? { ...fromStorage, ...fromAccount } : fromStorage;
  });
  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);
  // Keep localStorage cache in sync (read-only cache — Supabase is source of truth)
  useEffect(() => { try { localStorage.setItem(TRADING_PREFERENCES_KEY, JSON.stringify(preferences)); } catch {} }, [preferences]);
  useEffect(() => { setFullName(profileName); }, [profileName]);

  async function uploadProfilePhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMessage("Profile photo must be under 8MB.");
      return;
    }
    try {
      const photo = await resizeImageToDataUrl(file);
      localStorage.setItem(PROFILE_PHOTO_KEY, photo);
      localStorage.setItem(getProfilePhotoKey(authUser?.id), photo);
      setProfilePhoto?.(photo);
      if (supabase && authUser?.id) {
        const { data, error } = await supabase.auth.updateUser({ data: { profile_photo: photo, avatar_url: photo } });
        if (error) throw error;
        if (data?.user) setProfilePhoto?.(getStoredProfilePhoto(data.user));
      }
      setMessage("Profile photo updated.");
    } catch (error) {
      setMessage(`Profile photo saved locally, but cloud sync failed: ${error?.message || "try a smaller image"}`);
    }
  }

  async function removeProfilePhoto() {
    localStorage.removeItem(PROFILE_PHOTO_KEY);
    localStorage.removeItem(getProfilePhotoKey(authUser?.id));
    setProfilePhoto?.("");
    try {
      if (supabase && authUser?.id) {
        await supabase.auth.updateUser({ data: { profile_photo: null, avatar_url: null } });
      }
      setMessage("Profile photo removed.");
    } catch (error) {
      setMessage(`Photo removed locally, but cloud sync failed: ${error?.message || "try again"}`);
    }
  }

  async function saveName() {
    setMessage("");
    const nextName = fullName.trim();
    if (!nextName) {
      setMessage("Name cannot be empty.");
      return;
    }
    try {
      localStorage.setItem(getProfileNameKey(authUser?.id), nextName);
    } catch {
      // The in-memory profile still updates when browser storage is unavailable.
    }
    onProfileNameChange?.(nextName);
    if (supabase && authUser?.id) {
      try {
        const { data, error } = await supabase.auth.updateUser({ data: { full_name: nextName } });
        if (error) throw error;
        if (data?.user) onProfileNameChange?.(nextName, data.user);
      } catch (error) {
        console.warn("Profile name saved locally; cloud sync is temporarily unavailable.", error?.message || error);
        setMessage("Profile name saved. Cloud sync will retry after your connection is restored.");
        return;
      }
    }
    setMessage("Profile name saved.");
  }

  async function changePassword() {
    setMessage("");
    setPasswordMessage("");
    setPasswordStatus("");
    if (!currentPassword) {
      setPasswordStatus("error");
      setPasswordMessage("Current password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus("error");
      setPasswordMessage("New password must be at least 6 characters.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordStatus("error");
      setPasswordMessage("New password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordStatus("error");
      setPasswordMessage("New password must contain at least one number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("error");
      setPasswordMessage("Repeat password is not written correctly.");
      return;
    }
    if (!supabase) {
      setPasswordStatus("error");
      setPasswordMessage("Supabase is not connected.");
      return;
    }
    if (!authUser?.email) {
      setPasswordStatus("error");
      setPasswordMessage("Sign in again before changing password.");
      return;
    }
    try {
      await postPasswordUpdate({ email: authUser.email, currentPassword, password: newPassword });
    } catch (apiError) {
      const message = String(apiError?.message || apiError || "");
      if (!/failed to fetch|networkerror|load failed|fetch/i.test(message)) {
        setPasswordStatus("error");
        setPasswordMessage(message || "Could not change password.");
        return;
      }
      const { error: currentPasswordError } = await supabase.auth.signInWithPassword({ email: authUser.email, password: currentPassword });
      if (currentPasswordError) {
        setPasswordStatus("error");
        setPasswordMessage("Current password is not correct.");
        return;
      }
      try {
        await updatePasswordWithRetry(newPassword);
      } catch (fallbackError) {
        setPasswordStatus("error");
        setPasswordMessage(getFriendlyAuthError(fallbackError, "Could not change password."));
        return;
      }
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStatus("success");
    setPasswordMessage("Password changed successfully. You can sign in with the new password now.");
  }

  function savePreferences() {
    const risk = Number(preferences.defaultRisk);
    if (!Number.isFinite(risk) || risk < 0) {
      setMessage("Default risk must be zero or greater.");
      return;
    }
    const next = {
      timezone: normalizeTimezoneValue(preferences.timezone),
      defaultSession: TRADING_SESSIONS.includes(preferences.defaultSession) ? preferences.defaultSession : "",
      defaultRisk: String(risk),
    };
    setPreferences(next);
    // localStorage = cache only; Supabase is source of truth
    try { localStorage.setItem(TRADING_PREFERENCES_KEY, JSON.stringify(next)); } catch {}
    // Persist to Supabase via account object
    if (onSavePreferences) {
      onSavePreferences(next).catch(() => {});
    }
    setMessage("Trading preferences saved.");
  }

  const canChangePassword = Boolean(currentPassword) && newPassword.length >= 6 && newPassword === confirmPassword;
  const passwordMessageClass = passwordStatus === "success"
    ? "rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-300"
    : "rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <TopCrumb page="Settings" />
      <div className="mb-7">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Settings</h1>
          <p className="mt-2 text-base font-semibold text-zinc-400">Personalize your profile, configure trading defaults, and manage your data.</p>
        </div>
      </div>
      {message && <div className="mb-5 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-3 text-sm font-bold text-fuchsia-200">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <SettingsPanel icon={<User size={25} />} title="Profile Information" subtitle="Update your personal information and account details">
          <div className="mt-8">
            <div className="text-sm font-black text-white">Profile Photo</div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-900 text-2xl font-black text-white">
                {profilePhoto ? <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" /> : profileInitials}
              </div>
              <div>
                <input ref={profilePhotoInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadProfilePhoto} className="hidden" />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => profilePhotoInputRef.current?.click()} variant="outline" className="border-white/15 bg-black text-white"><Camera size={16} /> Change Photo</Button>
                  {profilePhoto && <Button type="button" onClick={removeProfilePhoto} variant="outline" className="border-red-500/35 bg-red-500/10 text-red-300"><Trash2 size={16} /> Remove</Button>}
                </div>
                <p className="mt-2 text-xs font-semibold text-zinc-400">JPG, PNG or WebP. Max 10MB.</p>
              </div>
            </div>
          </div>
          <div className="my-8 h-px bg-white/10" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name"><Input value={fullName} onChange={(event) => setFullName(event.target.value)} className="border-white/15 bg-black text-white focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" /></Field>
            <Field label="Email Address"><Input value={authUser?.email || ""} disabled className="border-white/10 bg-zinc-800 text-zinc-400 disabled:opacity-100" /><p className="mt-2 text-xs font-semibold text-zinc-400">Email cannot be changed after registration</p></Field>
          </div>
          <div className="mt-4 flex justify-end"><Button onClick={saveName} className="bg-fuchsia-500 text-black"><Save size={16} /> Save Name</Button></div>
          <div className="my-8 h-px bg-white/10" />
          <h3 className="text-lg font-black text-white">Change Password</h3>
          <div className="mt-5 grid gap-4">
            <Field label="Current Password"><SettingsPasswordInput visible={visiblePasswords.current} onToggle={() => setVisiblePasswords((current) => ({ ...current, current: !current.current }))} autoComplete="current-password" value={currentPassword} onChange={(event) => { setCurrentPassword(event.target.value); setPasswordMessage(""); setPasswordStatus(""); }} placeholder="Enter your current password" className="border-white/15 bg-black text-white focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" /></Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="New Password"><SettingsPasswordInput visible={visiblePasswords.new} onToggle={() => setVisiblePasswords((current) => ({ ...current, new: !current.new }))} autoComplete="new-password" value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setPasswordMessage(""); setPasswordStatus(""); }} className="border-white/15 bg-black text-white focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" /></Field>
              <Field label="Confirm Password"><SettingsPasswordInput visible={visiblePasswords.confirm} onToggle={() => setVisiblePasswords((current) => ({ ...current, confirm: !current.confirm }))} autoComplete="new-password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setPasswordMessage(""); setPasswordStatus(""); }} className="border-white/15 bg-black text-white focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" /></Field>
            </div>
          </div>
          {passwordMessage && <div className={`mt-4 ${passwordMessageClass}`}>{passwordMessage}</div>}
          <div className="mt-4 flex justify-end"><Button onClick={changePassword} variant="outline" className={canChangePassword ? "border-fuchsia-500/55 bg-fuchsia-500/10 text-fuchsia-100" : "border-white/15 bg-black text-white"}><Save size={16} /> Change Password</Button></div>
        </SettingsPanel>

        <div className="space-y-6">
          <SettingsPanel icon={<Sparkles size={25} />} title="Appearance" subtitle="Customize how TryCritique looks.">
            <div className="mt-8 flex items-center justify-between"><div className="font-black text-white">Dark Mode</div><SettingsToggle checked={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} /></div>
          </SettingsPanel>
          <SettingsPanel icon={<Target size={25} />} title="Trading Preferences" subtitle="These defaults pre-fill when you add a new trade. You can override them per trade at any time.">
            <div className="mt-7 space-y-5">
              <Field label="Timezone">
                <Select value={normalizeTimezoneValue(preferences.timezone)} onChange={(event) => setPreferences((current) => ({ ...current, timezone: event.target.value }))}>{timezoneOptions.map((zone) => <option key={zone.value} value={zone.value}>{zone.label}</option>)}</Select>
                <p className="mt-1.5 text-xs font-semibold text-zinc-500">Used to display trade times and calendar sessions in your local time.</p>
              </Field>
              <Field label="Default Trading Session">
                <Select value={preferences.defaultSession} onChange={(event) => setPreferences((current) => ({ ...current, defaultSession: event.target.value }))}>
                  <option value="">Choose per trade</option>
                  {TRADING_SESSIONS.map((session) => <option key={session} value={session}>{session}</option>)}
                </Select>
                <p className="mt-1.5 text-xs font-semibold text-zinc-500">Pre-selects the session when you log a new trade. Helps with session-based analysis.</p>
              </Field>
              <Field label={`Default Risk (${account?.currency || "USD"})`}>
                <Input type="number" min="0" step="1" inputMode="decimal" value={preferences.defaultRisk} onChange={(event) => setPreferences((current) => ({ ...current, defaultRisk: event.target.value }))} className="border-white/15 bg-black text-white focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" />
                <p className="mt-1.5 text-xs font-semibold text-zinc-500">Your standard risk amount per trade. Used to calculate R:R ratios and risk stats.</p>
              </Field>
            </div>
            <div className="mt-5 flex justify-end"><Button onClick={savePreferences} className="bg-fuchsia-500 text-black"><Save size={16} /> Save Preferences</Button></div>
          </SettingsPanel>
        </div>
      </div>

      <SettingsPanel icon={<Database size={25} />} title="Trading Accounts" subtitle="Manage your trading accounts and view account statistics. Each account keeps its trades separate." className="mt-6">
        <button onClick={onOpenAccount} className="mt-7 flex w-full items-center justify-between rounded-lg border border-fuchsia-500 bg-fuchsia-950/20 px-5 py-4 text-left">
          <div><div className="flex items-center gap-2"><span className="font-black text-white">{account?.name || "Trading Account"}</span><span className="rounded-full bg-white/10 px-2 py-1 text-xs font-black text-white">Default</span><span className="rounded-full bg-fuchsia-500 px-2 py-1 text-xs font-black text-black">Active</span></div><div className="mt-2 text-sm font-semibold text-zinc-400">{account?.type || "Demo Account"} - {account?.currency || "USD"} {currentBalance.toLocaleString()} - <span className={tradePnl >= 0 ? "text-emerald-400" : "text-red-400"}>{formatMoney(tradePnl)}</span></div></div>
          <Edit3 size={18} className="text-zinc-400" />
        </button>
        <div className="mt-5 rounded-lg bg-white/[0.05] p-4"><div className="font-black text-white">Account Tips</div><div className="mt-3 space-y-2 text-sm font-semibold text-zinc-400"><div>- New accounts are created from the account menu.</div><div>- Click an account to make it active and filter your trades.</div><div>- Your default account is used for new trades unless you change it.</div></div></div>
      </SettingsPanel>

      <SettingsPanel icon={<ShieldCheck size={25} />} title="Data & Privacy" subtitle="Your data belongs to you. Export or restore at any time." className="mt-6 max-w-xl">
        <Button onClick={onBackup} variant="outline" className="mt-6 w-full border-white/15 bg-black text-white"><Download size={16} /> Export My Data</Button>
        <p className="mt-1.5 text-xs font-semibold text-zinc-500">Downloads a CSV of all your trades for use in spreadsheets or external tools.</p>
        <Button onClick={onRestore} variant="outline" className="mt-4 w-full border-amber-500/35 bg-amber-500/10 text-amber-300"><Upload size={16} /> Restore Backup</Button>
        <p className="mt-1.5 text-xs font-semibold text-zinc-500">Restores your journal from a previously exported JSON backup file.</p>
        <Button onClick={onSignOut} className="mt-5 w-full bg-red-800 text-white hover:bg-red-700"><LogOut size={16} /> Delete Account</Button>
      </SettingsPanel>

      <div className="mt-8 rounded-xl border border-white/8 bg-black/20 px-5 py-4 text-xs font-semibold leading-5 text-zinc-600">
        TryCritique is a trading journal and self-review tool. It does not provide trading signals, investment advice, brokerage services, or guaranteed returns.
      </div>
    </motion.div>
  );
}

function SettingsPage({ account, accountBalance, authUser, theme, setTheme, isSupabaseReady, onOpenAccount, onBackup, onRestore, onSignOut }) {
  const currentBalance = Number(accountBalance?.currentBalance || account?.balance || 0);
  const tradePnl = Number(accountBalance?.tradePnl || 0);
  const statusCards = [
    ["Account", account?.name || "Trading Account", account?.type || "Demo Account"],
    ["Balance", `${account?.currency || "USD"} ${currentBalance.toLocaleString()}`, `${tradePnl >= 0 ? "+" : ""}${formatMoney(tradePnl)} from trades`],
    ["Cloud Sync", isSupabaseReady ? "Supabase Connected" : "Local Mode", isSupabaseReady ? "Trades can sync after login" : "Add Supabase keys in .env"],
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <TopCrumb page="Settings" />
      <div className="light-card rounded-3xl border border-fuchsia-500/25 bg-gradient-to-br from-[#12081b] via-black to-[#050307] p-6 shadow-[0_18px_45px_rgba(178,74,242,0.10)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-fuchsia-500/35 bg-fuchsia-500/15 p-3 text-fuchsia-300"><Settings /></div>
              <div>
                <h1 className="text-3xl font-black">Settings</h1>
                <p className="text-sm font-semibold text-zinc-400">Manage your account, theme, backup, and security.</p>
              </div>
            </div>
          </div>
          <Button onClick={onOpenAccount} className="bg-fuchsia-500 text-black"><Edit3 size={16} /> Edit Account</Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {statusCards.map(([title, value, detail]) => (
            <Card key={title} className="light-card-soft border-white/10 bg-black/45">
              <CardContent className="p-5">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{title}</div>
                <div className="mt-2 text-xl font-black text-white">{value}</div>
                <div className="mt-1 text-xs font-bold text-zinc-400">{detail}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="light-card border-white/10 bg-black">
          <CardContent className="p-6">
            <h2 className="text-xl font-black">Profile</h2>
            <p className="mt-1 text-sm font-semibold text-zinc-400">Signed in user and account details.</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Email</div>
                <div className="mt-1 font-black text-white">{authUser?.email || "No email found"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Active Account</div>
                <div className="mt-1 font-black text-white">{account?.name || "Trading Account"}</div>
                <div className="mt-1 text-xs font-bold text-zinc-400">{account?.type || "Demo Account"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="light-card border-white/10 bg-black">
          <CardContent className="p-6">
            <h2 className="text-xl font-black">Appearance</h2>
            <p className="mt-1 text-sm font-semibold text-zinc-400">Switch between dark and light mode.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setTheme("dark")} className={theme === "dark" ? "rounded-2xl border border-fuchsia-500 bg-fuchsia-500 p-4 text-left font-black text-black" : "rounded-2xl border border-white/10 bg-zinc-950 p-4 text-left font-black text-white hover:border-fuchsia-500/40"}>🌙 Dark</button>
              <button onClick={() => setTheme("light")} className={theme === "light" ? "rounded-2xl border border-fuchsia-500 bg-fuchsia-500 p-4 text-left font-black text-black" : "rounded-2xl border border-white/10 bg-zinc-950 p-4 text-left font-black text-white hover:border-fuchsia-500/40"}>☀ Light</button>
            </div>
          </CardContent>
        </Card>

        <Card className="light-card border-white/10 bg-black">
          <CardContent className="p-6">
            <h2 className="text-xl font-black">Data</h2>
            <p className="mt-1 text-sm font-semibold text-zinc-400">Export a backup or restore your saved journal data.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={onBackup} variant="outline" className="border-emerald-500/35 bg-emerald-500/10 text-emerald-300"><Download size={16} /> Backup</Button>
              <Button onClick={onRestore} variant="outline" className="border-amber-500/35 bg-amber-500/10 text-amber-300"><Upload size={16} /> Restore</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="light-card border-white/10 bg-black">
          <CardContent className="p-6">
            <h2 className="text-xl font-black">Security</h2>
            <p className="mt-1 text-sm font-semibold text-zinc-400">Leave this device safely when you are done.</p>
            <Button onClick={onSignOut} variant="outline" className="mt-5 border-red-500/35 bg-red-500/10 text-red-300"><LogOut size={16} /> Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function TawkToWidget({ authUser }) {
  useEffect(() => {
    if (!TAWK_TO_PROPERTY_ID || !TAWK_TO_WIDGET_ID || typeof window === "undefined") return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = window.Tawk_LoadStart || new Date();

    // On mobile hide the TawkTo bubble entirely — users can reach Support via the app's Support page
    window.Tawk_API.onLoad = function () {
      if (window.innerWidth <= 1024 && typeof window.Tawk_API.hideWidget === "function") {
        window.Tawk_API.hideWidget();
      }
    };

    if (document.getElementById("tawk-to-widget-script")) return;

    const script = document.createElement("script");
    const firstScript = document.getElementsByTagName("script")[0];
    script.id = "tawk-to-widget-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${TAWK_TO_PROPERTY_ID}/${TAWK_TO_WIDGET_ID}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    firstScript?.parentNode?.insertBefore(script, firstScript);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !authUser) return;

    const visitor = {
      name: authUser.user_metadata?.full_name || authUser.email || BRAND_NAME,
      email: authUser.email || undefined,
    };

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.visitor = visitor;

    if (typeof window.Tawk_API.setAttributes === "function" && visitor.email) {
      window.Tawk_API.setAttributes(visitor, () => {});
    }
  }, [authUser?.id, authUser?.email, authUser?.user_metadata?.full_name]);

  return null;
}

function FloatingSupportWidget({ authUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [activeReportId, setActiveReportId] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supportEmail = authUser?.email || "";
  const activeReport = reports.find((report) => report.id === activeReportId) || reports[0] || null;
  const supportMessages = activeReport ? getSupportMessages(activeReport) : [];
  const unreadCount = reports.reduce((total, report) => total + Number(report.user_unread_count || 0), 0);

  async function loadSupportThread({ markRead = false } = {}) {
    try {
      const data = await postSupportReports("mine", { email: supportEmail });
      const nextReports = Array.isArray(data.reports) ? data.reports : [];
      setReports(nextReports);
      setActiveReportId((current) => current || nextReports[0]?.id || "");
      if (markRead) {
        nextReports.filter((report) => Number(report.user_unread_count || 0) > 0).forEach((report) => {
          postSupportReports("mark_read", { id: report.id, email: supportEmail }).catch(() => {});
        });
        setReports((current) => current.map((report) => ({ ...report, user_unread_count: 0 })));
      }
    } catch (loadError) {
      console.warn("Could not load support chat:", loadError?.message || loadError);
    }
  }

  useEffect(() => {
    loadSupportThread();
  }, [supportEmail]);

  useEffect(() => {
    const interval = window.setInterval(() => loadSupportThread(), 45000);
    return () => window.clearInterval(interval);
  }, [supportEmail]);

  function openWidget() {
    setIsOpen(true);
    loadSupportThread({ markRead: true });
  }

  async function sendChatMessage(textOverride = "") {
    const text = String(textOverride || draft).trim();
    if (!text) return;
    setLoading(true);
    setError("");
    try {
      let data;
      if (activeReport) {
        data = await postSupportReports("send_message", {
          id: activeReport.id,
          text,
          name: getUserDisplayName(authUser, ""),
          email: supportEmail || activeReport.email || "",
        });
      } else {
        data = await postSupportReports("create", {
          type: "Question",
          priority: "Medium",
          title: text.length > 70 ? `${text.slice(0, 67)}...` : text,
          message: text.length < 10 ? `${text} - support question` : text,
          name: getUserDisplayName(authUser, ""),
          email: supportEmail,
          page: typeof window !== "undefined" ? window.location.href : "",
          browser: typeof navigator !== "undefined" ? navigator.userAgent : "",
        });
      }
      const saved = data.report;
      if (saved?.id) {
        setReports((current) => {
          const exists = current.some((report) => report.id === saved.id);
          return exists ? current.map((report) => report.id === saved.id ? { ...report, ...saved, user_unread_count: 0 } : report) : [{ ...saved, user_unread_count: 0 }, ...current];
        });
        setActiveReportId(saved.id);
      }
      setDraft("");
    } catch (chatError) {
      setError(chatError?.message || "Could not send message.");
    } finally {
      setLoading(false);
    }
  }

  function handleChatKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-[90] sm:bottom-6 sm:right-6">
      {!isOpen && (
        <div className="flex flex-col items-end gap-3">
          <div className="hidden flex-col items-end gap-2 sm:flex">
            <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">Hi! How can we help?</div>
            <button type="button" onClick={() => { openWidget(); sendChatMessage("I have a question"); }} className="rounded-xl border border-violet-400/30 bg-white px-4 py-2 text-sm font-semibold text-violet-600 shadow-lg transition hover:-translate-y-0.5 hover:border-violet-500">
              I have a question
            </button>
            <button type="button" onClick={() => { openWidget(); sendChatMessage("Tell me more about TryCritique"); }} className="rounded-xl border border-violet-400/30 bg-white px-4 py-2 text-sm font-semibold text-violet-600 shadow-lg transition hover:-translate-y-0.5 hover:border-violet-500">
              Tell me more
            </button>
          </div>
          <button
            type="button"
            onClick={openWidget}
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_18px_45px_rgba(139,92,246,0.45)] transition hover:scale-105"
            aria-label="Open customer support chat"
          >
            <MessageSquare size={30} fill="currentColor" className="drop-shadow" />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-black text-white">{unreadCount}</span>}
          </button>
        </div>
      )}

      {isOpen && (
        <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-3xl border border-violet-500/25 bg-white text-zinc-900 shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-4 text-white">
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-full p-1 transition hover:bg-white/15" aria-label="Close support chat">
              <ChevronLeft size={22} />
            </button>
            <div className="text-lg font-black">Customer Support</div>
            <button type="button" onClick={() => loadSupportThread({ markRead: true })} className="rounded-full p-1 transition hover:bg-white/15" aria-label="Refresh support chat">
              <ListChecks size={21} />
            </button>
          </div>

          <div className="h-[430px] overflow-y-auto bg-zinc-50 px-5 py-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xl">👋</div>
              <div>
                <div className="mb-1 text-xs font-semibold text-zinc-500">Customer Support</div>
                <div className="rounded-2xl bg-violet-500 px-4 py-3 text-sm font-bold text-white shadow-md">Hi! How can we help?</div>
              </div>
            </div>

            {!supportMessages.length && (
              <div className="mb-5 flex flex-col items-end gap-2">
                {["I have a question", "Report a problem", "Billing help"].map((quickText) => (
                  <button key={quickText} type="button" onClick={() => sendChatMessage(quickText)} disabled={loading} className="rounded-xl border border-violet-400/40 bg-white px-4 py-2 text-sm font-semibold text-violet-600 shadow-sm transition hover:bg-violet-50 disabled:opacity-60">
                    {quickText}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {supportMessages.map((message) => {
                const isAdminMessage = String(message.sender || "user").toLowerCase() === "admin";
                return (
                  <div key={message.id || `${message.sender}-${message.created_at}`} className={isAdminMessage ? "flex justify-start" : "flex justify-end"}>
                    <div className={isAdminMessage ? "max-w-[82%] rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-md" : "max-w-[82%] rounded-2xl border border-violet-300 bg-white px-4 py-3 text-sm font-semibold leading-6 text-violet-700 shadow-sm"}>
                      {message.text}
                      {message.created_at && <div className={isAdminMessage ? "mt-1 text-[10px] text-violet-100/80" : "mt-1 text-[10px] text-violet-400"}>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">{error}</div>}
          </div>

          <div className="border-t border-zinc-200 bg-white p-4">
            <div className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Type here and press enter..."
                className="min-h-[44px] resize-none border-0 bg-transparent text-sm text-zinc-900 shadow-none outline-none focus-visible:ring-0"
              />
              <button type="button" onClick={() => sendChatMessage()} disabled={loading || !draft.trim()} className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white transition hover:bg-violet-600 disabled:bg-zinc-300">
                <Send size={18} />
              </button>
            </div>
            <div className="mt-2 text-center text-[11px] font-semibold text-zinc-400">Powered by TryCritique</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SupportCenterPage({ authUser }) {
  const reportTypes = ["Bug", "Feature Request", "Billing", "Account", "Design", "Performance", "Other"];
  const priorities = ["Low", "Medium", "High", "Urgent"];
  const [form, setForm] = useState({
    type: "Bug",
    priority: "Medium",
    title: "",
    message: "",
  });
  const [reports, setReports] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadMine() {
    try {
      const data = await postSupportReports("mine", { email: authUser?.email || "" });
      setReports(Array.isArray(data.reports) ? data.reports : []);
    } catch (loadError) {
      setReports([]);
      console.warn("Could not load support reports:", loadError?.message || loadError);
    }
  }

  useEffect(() => {
    loadMine();
  }, [authUser?.id, authUser?.email]);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitReport(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        ...form,
        name: getUserDisplayName(authUser, ""),
        email: authUser?.email || "",
        page: typeof window !== "undefined" ? window.location.href : "",
        browser: typeof navigator !== "undefined" ? navigator.userAgent : "",
      };
      const data = await postSupportReports("create", payload);
      setReports((current) => [data.report, ...current].filter(Boolean));
      setForm({ type: "Bug", priority: "Medium", title: "", message: "" });
      setMessage("Report sent. Thank you, this is exactly how the product gets sharper.");
    } catch (submitError) {
      setError(submitError?.message || "Could not send report.");
    } finally {
      setLoading(false);
    }
  }

  async function sendUserReply(report) {
    const text = String(replyDrafts[report.id] || "").trim();
    if (!text) return;
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const data = await postSupportReports("send_message", {
        id: report.id,
        text,
        name: getUserDisplayName(authUser, ""),
        email: authUser?.email || report.email || "",
      });
      const saved = data.report;
      setReports((current) => current.map((item) => item.id === report.id ? { ...item, ...saved } : item));
      setReplyDrafts((current) => ({ ...current, [report.id]: "" }));
      setMessage("Reply sent.");
    } catch (replyError) {
      setError(replyError?.message || "Could not send reply.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
      <TopCrumb page="Support" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-fuchsia-200">
              <LifeBuoy size={14} /> Product feedback
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">Support Center</h1>
            <p className="mt-2 max-w-2xl text-lg font-semibold leading-7 text-zinc-400">
              Tell us what is broken, confusing, missing, or worth improving. Every report is saved and reviewed.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Fast triage", "Bug reports"],
              ["Roadmap", "Feature ideas"],
              ["Account help", "Billing & access"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/50 p-4">
                <div className="text-sm font-black text-white">{title}</div>
                <div className="mt-1 text-xs font-semibold text-zinc-500">{text}</div>
              </div>
            ))}
          </div>
        </div>

        {message && <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">{message}</div>}
        {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{error}</div>}

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <form onSubmit={submitReport} className="rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-[#12061a] via-black to-[#04100c] p-6 shadow-[0_20px_60px_rgba(178,74,242,0.12)]">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-500/35 bg-fuchsia-500/10 text-fuchsia-300"><MessageSquare size={24} /></span>
              <div>
                <h2 className="text-2xl font-black text-white">Send a report</h2>
                <p className="mt-1 text-sm font-semibold text-zinc-400">Add enough detail so we can reproduce or understand it.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-zinc-300">Type</span>
                <select value={form.type} onChange={(event) => updateForm("type", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-black text-white outline-none transition focus:border-fuchsia-400">
                  {reportTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-black text-zinc-300">Priority</span>
                <select value={form.priority} onChange={(event) => updateForm("priority", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-black text-white outline-none transition focus:border-fuchsia-400">
                  {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </label>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-black text-zinc-300">Short title</span>
              <Input value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Example: Calendar next week shows wrong news" className="mt-2 border-white/10 bg-black text-white" />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-black text-zinc-300">Details</span>
              <Textarea value={form.message} onChange={(event) => updateForm("message", event.target.value)} placeholder="What happened? What did you expect? Which page were you on?" className="mt-2 min-h-[180px] border-white/10 bg-black text-white" />
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-zinc-500">Your email and current page are attached automatically.</p>
              <Button type="submit" disabled={loading} className="bg-fuchsia-500 text-black hover:bg-fuchsia-400">
                <Send size={16} /> {loading ? "Sending..." : "Send Report"}
              </Button>
            </div>
          </form>

          <section className="rounded-2xl border border-white/10 bg-[#070707] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-white">Your reports</h2>
                <p className="mt-1 text-sm font-semibold text-zinc-400">Recent feedback from this account.</p>
              </div>
              <Button type="button" onClick={loadMine} variant="outline" className="border-white/10 bg-white/[0.04] text-white">Refresh</Button>
            </div>
            <div className="mt-5 space-y-3">
              {reports.length ? reports.slice(0, 8).map((report) => (
                <SupportReportCard
                  key={report.id}
                  report={report}
                  compact
                  unreadCount={Number(report.user_unread_count || 0)}
                  replyValue={replyDrafts[report.id] || ""}
                  onReplyChange={(value) => setReplyDrafts((current) => ({ ...current, [report.id]: value }))}
                  onReplySend={() => sendUserReply(report)}
                  replyButtonLabel="Send Reply"
                  loading={loading}
                />
              )) : (
                <div className="rounded-xl border border-white/10 bg-black/40 p-5 text-sm font-bold text-zinc-500">No reports yet.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function getSupportMessages(report) {
  const savedMessages = Array.isArray(report?.messages) ? report.messages : [];
  if (savedMessages.length) return savedMessages;
  return report?.message ? [{
    id: `${report.id || "report"}_initial`,
    sender: "user",
    text: report.message,
    name: report.name || "",
    email: report.email || "",
    created_at: report.created_at,
  }] : [];
}

function SupportReportCard({
  report,
  compact = false,
  onStatusChange,
  loading = false,
  unreadCount = 0,
  replyValue = "",
  onReplyChange,
  onReplySend,
  replyButtonLabel = "Send Reply",
}) {
  const status = String(report?.status || "open").toLowerCase();
  const messages = getSupportMessages(report);
  const statusClass = status === "resolved"
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
    : status === "in_progress"
      ? "border-sky-500/30 bg-sky-500/10 text-sky-200"
      : status === "closed"
        ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
        : "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200";
  return (
    <div className="rounded-xl border border-white/10 bg-black/45 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-black uppercase tracking-wider text-zinc-400">{report?.type || "Report"}</span>
            <span className={`rounded-lg border px-2 py-1 text-[11px] font-black uppercase tracking-wider ${statusClass}`}>{String(report?.status || "open").replaceAll("_", " ")}</span>
            <span className="text-[11px] font-bold text-zinc-500">{report?.priority || "Medium"}</span>
            {unreadCount > 0 && <span className="rounded-full bg-fuchsia-500 px-2 py-1 text-[11px] font-black text-black">{unreadCount} new</span>}
          </div>
          <h3 className="mt-3 truncate text-lg font-black text-white">{report?.title}</h3>
          <p className={`${compact ? "line-clamp-2" : ""} mt-2 text-sm font-semibold leading-6 text-zinc-400`}>{report?.message}</p>
          <div className="mt-4 space-y-2">
            {messages.slice(compact ? -4 : 0).map((supportMessage) => {
              const sender = String(supportMessage.sender || "user").toLowerCase();
              const isAdminMessage = sender === "admin";
              return (
                <div key={supportMessage.id || `${sender}-${supportMessage.created_at}`} className={`rounded-xl border p-3 ${isAdminMessage ? "border-emerald-500/20 bg-emerald-500/10" : "border-white/10 bg-white/[0.03]"}`}>
                  <div className={`text-[11px] font-black uppercase tracking-[0.14em] ${isAdminMessage ? "text-emerald-300" : "text-fuchsia-200"}`}>
                    {isAdminMessage ? "Admin" : "You"} {supportMessage.created_at ? `- ${new Date(supportMessage.created_at).toLocaleString()}` : ""}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-6 text-zinc-100">{supportMessage.text}</p>
                </div>
              );
            })}
          </div>
          {onReplySend && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <Textarea
                value={replyValue}
                onChange={(event) => onReplyChange?.(event.target.value)}
                placeholder="Write a reply..."
                className="min-h-[82px] border-white/10 bg-black text-white"
              />
              <div className="mt-3 flex justify-end">
                <Button type="button" onClick={onReplySend} disabled={loading || !String(replyValue || "").trim()} className="bg-fuchsia-500 text-black hover:bg-fuchsia-400">
                  <Send size={16} /> {loading ? "Sending..." : replyButtonLabel}
                </Button>
              </div>
            </div>
          )}
          <div className="mt-3 text-xs font-semibold text-zinc-600">{report?.email || "unknown"} - {report?.created_at ? new Date(report.created_at).toLocaleString() : ""}</div>
        </div>
        {onStatusChange && (
          <select value={status} disabled={loading} onChange={(event) => onStatusChange(report, event.target.value)} className="rounded-lg border border-white/10 bg-black px-3 py-2 text-xs font-black text-white outline-none">
            <option value="open">open</option>
            <option value="in_progress">in progress</option>
            <option value="resolved">resolved</option>
            <option value="closed">closed</option>
          </select>
        )}
      </div>
    </div>
  );
}

function AdminAccessPage() {
  const [email, setEmail] = useState("");
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadGrants() {
    setLoading(true);
    setError("");
    try {
      const data = await postAdminEntitlements("list");
      setGrants(Array.isArray(data.grants) ? data.grants : []);
    } catch (loadError) {
      setError(loadError?.message || "Could not load admin access list.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGrants();
  }, []);

  async function grantEmailAccess(targetEmail, { clearInput = false } = {}) {
    const normalizedEmail = String(targetEmail || "").trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Enter a valid user email.");
      return;
    }
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const grantResult = await postAdminEntitlements("grant", { email: normalizedEmail });
      if (clearInput) setEmail("");
      setMessage(`${normalizedEmail} now has free Pro access.`);
      const data = await postAdminEntitlements("list");
      const nextGrants = Array.isArray(data.grants) ? data.grants : [];
      const savedGrant = grantResult?.grant;
      setGrants(nextGrants.some((grant) => String(grant.email).toLowerCase() === normalizedEmail) || !savedGrant ? nextGrants : [savedGrant, ...nextGrants]);
    } catch (grantError) {
      setError(grantError?.message || "Could not grant free Pro access.");
    } finally {
      setLoading(false);
    }
  }

  async function grantAccess(event) {
    event.preventDefault();
    await grantEmailAccess(email, { clearInput: true });
  }

  async function revokeAccess(targetEmail) {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await postAdminEntitlements("revoke", { email: targetEmail });
      setMessage(`${targetEmail} free Pro access was revoked.`);
      await loadGrants();
    } catch (revokeError) {
      setError(revokeError?.message || "Could not revoke free Pro access.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
      <TopCrumb page="Admin" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-white">Admin Access</h1>
          <p className="mt-2 text-lg font-semibold text-zinc-400">Give trusted users free Pro access without Dodo checkout.</p>
        </div>

        {message && <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">{message}</div>}
        {error && <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{error}</div>}

        <section className="rounded-lg border border-fuchsia-500/25 bg-gradient-to-br from-[#12061a] via-black to-[#04100c] p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-500/35 bg-fuchsia-500/10 text-fuchsia-300"><ShieldCheck size={24} /></span>
            <div>
              <h2 className="text-2xl font-black text-white">Grant Free Pro</h2>
              <p className="mt-1 text-sm font-semibold text-zinc-400">The email gets an admin subscription until Dec 31, 2099.</p>
            </div>
          </div>
          <form onSubmit={grantAccess} className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="friend@example.com" className="border-white/10 bg-black text-white" />
            <Button type="submit" disabled={loading} className="bg-fuchsia-500 text-black hover:bg-fuchsia-400"><UserPlus size={16} /> {loading ? "Saving..." : "Grant Access"}</Button>
          </form>
        </section>

        <section className="mt-8 rounded-lg border border-white/10 bg-[#070707] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white">Free Access List</h2>
              <p className="mt-1 text-sm font-semibold text-zinc-400">Admin-created Pro access rows.</p>
            </div>
            <Button type="button" onClick={loadGrants} disabled={loading} variant="outline" className="border-white/10 bg-white/[0.04] text-white">{loading ? "Loading..." : "Refresh"}</Button>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
            <div className="grid grid-cols-[1fr_130px_150px_120px] gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-500">
              <div>Email</div>
              <div>Status</div>
              <div>Access Until</div>
              <div className="text-right">Action</div>
            </div>
            {grants.length ? grants.map((grant) => {
              const isActiveGrant = String(grant.status).toLowerCase() === "active";
              return (
              <div key={grant.id || grant.email} className="grid grid-cols-[1fr_130px_150px_120px] items-center gap-3 border-b border-white/10 px-4 py-4 text-sm last:border-b-0">
                <div className="truncate font-black text-white">{grant.email}</div>
                <div className={isActiveGrant ? "font-black text-emerald-300" : "font-black text-red-300"}>{grant.status || "unknown"}</div>
                <div className="font-semibold text-zinc-400">{isActiveGrant && grant.current_period_end ? new Date(grant.current_period_end).toLocaleDateString() : "-"}</div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => isActiveGrant ? revokeAccess(grant.email) : grantEmailAccess(grant.email)}
                    disabled={loading}
                    className={isActiveGrant
                      ? "rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-45"
                      : "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-45"}
                  >
                    {isActiveGrant ? "Revoke" : "Restore"}
                  </button>
                </div>
              </div>
              );
            }) : (
              <div className="px-4 py-10 text-center text-sm font-bold text-zinc-500">No free access grants yet.</div>
            )}
          </div>
        </section>

      </div>
    </motion.div>
  );
}

function BillingPageDodo({ account, authUser, initialSubscription = null, gateMessage = "", requireActivation = false, onSignOut, onSubscriptionChange, onSubscriptionRefresh, onActivated }) {
  const [billingStatus, setBillingStatus] = useState("");
  const [billingError, setBillingError] = useState("");
  const [loadingPlan, setLoadingPlan] = useState("");
  const [subscription, setSubscription] = useState(initialSubscription);
  const [statusLoading, setStatusLoading] = useState(false);

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "$10",
      cadence: "/month",
      daily: "$0.33/day",
      detail: "Flexible monthly access after a 7-day free trial.",
      badge: "Most flexible",
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "$86",
      cadence: "/year",
      daily: "$0.24/day",
      detail: "Best value for traders who journal every week.",
      badge: "Save 28%",
      featured: true,
    },
  ];

  const features = [
    "Unlimited trade logging",
    "Advanced performance statistics",
    "Calendar and economic calendar",
    "Mistake detector reports",
    "Screenshot uploads",
    "Custom strategies and tags",
    "CSV import, export, and backup",
    "Multiple trading accounts",
    "Priority product updates",
  ];


  const subscriptionStatus = String(subscription?.status || "").replaceAll("_", " ");
  const isAdminGrantedPlan = String(subscription?.provider || "").toLowerCase() === "admin";
  const subscriptionDate = subscription?.trial_end || subscription?.current_period_end || "";
  const subscriptionDateText = subscriptionDate
    ? new Date(subscriptionDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "";

  useEffect(() => {
    setSubscription(initialSubscription || null);
  }, [initialSubscription]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billingResult = params.get("billing");
    if (billingResult === "success") {
      setBillingStatus("Subscription activated! Redirecting to your dashboard...");
      onSubscriptionRefresh?.();
      // Redirect to Dashboard after short delay so user sees the confirmation
      setTimeout(() => { onActivated?.(); }, 2200);
    }
    if (billingResult === "cancelled") setBillingStatus("Checkout was cancelled. You can choose a plan whenever you are ready.");
    if (billingResult === "portal-return") { setBillingStatus("Returned from the billing portal."); onSubscriptionRefresh?.(); }
    if (billingResult) {
      params.delete("billing");
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  useEffect(() => {
    if (!authUser?.id && !authUser?.email) return undefined;
    // Admin users: skip the internal re-check — their subscription comes from the main
    // app billing check (which has the owner-email fallback). Running a second check only
    // risks overwriting the correct Admin Pro state with a network error.
    if (String(initialSubscription?.provider || "").toLowerCase() === "admin") return undefined;
    let cancelled = false;

    async function loadBillingStatus() {
      setStatusLoading(true);
      try {
        const accessToken = await getCurrentAccessToken();
        if (!accessToken && !authUser?.email) return;
        const response = await fetch("/api/billing-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, email: authUser?.email }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) throw new Error(data.error || "Could not load billing status.");
        if (!cancelled) {
          setSubscription(data.subscription || null);
          onSubscriptionChange?.(data.subscription || null);
        }
      } catch (error) {
        if (!cancelled) {
          setSubscription(null);
          onSubscriptionChange?.(null);
          setBillingError(error?.message || "Could not load billing status.");
        }
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    }

    loadBillingStatus();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id, authUser?.email]);

  async function postBilling(path, body) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Billing request failed");
    }
    return data;
  }

  async function startCheckout(plan) {
    setBillingError("");
    setBillingStatus("");
    setLoadingPlan(plan);
    try {
      const accessToken = await getCurrentAccessToken();
      const data = await postBilling("/api/create-checkout-session", {
        plan,
        accessToken,
        email: authUser?.email,
        userId: authUser?.id,
      });
      window.location.href = data.url;
    } catch (error) {
      setBillingError(error?.message || "Could not open checkout.");
    } finally {
      setLoadingPlan("");
    }
  }

  async function openBillingPortal() {
    setBillingError("");
    setBillingStatus("");
    setLoadingPlan("portal");
    try {
      const data = await postBilling("/api/create-customer-portal", {
        email: authUser?.email,
      });
      window.location.href = data.url;
    } catch (error) {
      setBillingError(error?.message || "Could not open billing portal.");
    } finally {
      setLoadingPlan("");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
      {requireActivation && !statusLoading && (
        <AccessSuspendedOverlay
          subscription={subscription}
          loadingPlan={loadingPlan}
          onStartCheckout={startCheckout}
          onSignOut={onSignOut}
        />
      )}
      <TopCrumb page="Billing" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Billing & Subscription</h1>
            <p className="mt-2 text-lg font-semibold text-zinc-400">One plan. Everything included. Cancel anytime.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/70 px-4 py-2 text-sm font-black text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            {account?.name || "Trading Account"}
            <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs">{account?.currency || "USD"}</span>
          </div>
        </div>

        {billingStatus && (
          <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
            {billingStatus}
          </div>
        )}
        {requireActivation && (
          <div className="mb-5 rounded-lg border border-fuchsia-500/35 bg-fuchsia-500/10 px-4 py-3 text-sm font-bold text-fuchsia-100">
            Activate a Pro subscription to unlock the dashboard, journal, calendar, statistics, and mistake detector. You can start with the 7-day trial.
          </div>
        )}
        {gateMessage && (
          <div className="mb-5 rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-200">
            {gateMessage}
          </div>
        )}
        {isAdminGrantedPlan && (
          <div className="mb-5 overflow-hidden rounded-xl border border-emerald-400/35 bg-gradient-to-r from-emerald-500/15 via-fuchsia-500/10 to-black px-5 py-4 shadow-[0_0_34px_rgba(16,185,129,0.14)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/35 bg-emerald-400/10 text-emerald-300">
                  <ShieldCheck size={24} />
                </span>
                <div>
                  <div className="text-lg font-black text-white">Admin Pro Active</div>
                  <div className="text-sm font-semibold text-emerald-100/80">Free access granted by TryCritique. No payment required for this account.</div>
                </div>
              </div>
              <span className="rounded-full border border-emerald-400/35 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
                Free Pro
              </span>
            </div>
          </div>
        )}
        {billingError && (
          <div className="mb-5 rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-200">
            {billingError}
          </div>
        )}

        <section className="rounded-lg border border-fuchsia-500/25 bg-gradient-to-br from-[#13071e] via-black to-[#04100c] p-6 shadow-[0_18px_70px_rgba(178,74,242,0.10)]">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">
                <Sparkles size={14} /> TryCritique Pro
              </div>
              <h2 className="mt-5 text-4xl font-black leading-tight text-white">Simple billing for serious trading review.</h2>
              <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-zinc-400">
                A 7-day free trial, then $10/month or $86/year. Cancel anytime. No hidden fees. Your data stays exportable.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => startCheckout("monthly")}
                  disabled={Boolean(loadingPlan) || isAdminGrantedPlan}
                  className="rounded-lg bg-fuchsia-500 px-5 py-3 text-sm font-black text-black shadow-[0_16px_36px_rgba(178,74,242,0.28)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingPlan === "monthly" ? "Opening..." : "Start Monthly"}
                </button>
                <button
                  onClick={() => startCheckout("yearly")}
                  disabled={Boolean(loadingPlan) || isAdminGrantedPlan}
                  className="rounded-lg border border-fuchsia-500/35 bg-fuchsia-500/10 px-5 py-3 text-sm font-black text-fuchsia-100 transition hover:border-fuchsia-300 hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingPlan === "yearly" ? "Opening..." : "Start Yearly"}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-5 ${
                    plan.featured
                      ? "border-fuchsia-400/45 bg-fuchsia-500/10 shadow-[0_16px_40px_rgba(178,74,242,0.15)]"
                      : "border-white/10 bg-black/45"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-white">{plan.name}</div>
                      <div className="mt-1 text-xs font-bold text-zinc-400">{plan.detail}</div>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-fuchsia-200">{plan.badge}</span>
                  </div>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="pb-2 text-sm font-bold text-zinc-400">{plan.cadence}</span>
                  </div>
                  <div className="mt-2 text-sm font-bold text-emerald-300">{plan.daily}</div>
                  <button
                    onClick={() => startCheckout(plan.id)}
                    disabled={Boolean(loadingPlan) || isAdminGrantedPlan}
                    className={`mt-6 w-full rounded-lg px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      plan.featured ? "bg-fuchsia-500 text-black hover:scale-[1.01]" : "border border-white/12 bg-black text-white hover:border-fuchsia-400/50"
                    }`}
                  >
                    {loadingPlan === plan.id ? "Opening Checkout..." : `Choose ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 rounded-xl border border-white/8 bg-black/30 px-5 py-4">
          {[
            { icon: <ShieldCheck size={15} />, text: "Cancel anytime" },
            { icon: <CreditCard size={15} />, text: "No hidden fees" },
            { icon: <Download size={15} />, text: "Data stays exportable" },
            { icon: <Sparkles size={15} />, text: "7-day free trial" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-bold text-zinc-400">
              <span className="text-emerald-400">{icon}</span>
              {text}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-lg border border-white/10 bg-[#070707] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-300" size={28} />
              <div>
                <h2 className="text-2xl font-black text-white">What Pro Includes</h2>
                <p className="mt-1 text-sm font-semibold text-zinc-400">Everything needed for the full trading review workflow.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="pro-feature-item rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-zinc-100">
                  {feature}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#070707] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <Settings className="text-fuchsia-300" size={26} />
              <div>
                <h2 className="text-2xl font-black text-white">Manage Billing</h2>
                <p className="mt-1 text-sm font-semibold text-zinc-400">Manage your subscription, update payment details, or cancel anytime.</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-black/45 p-5">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Billing Email</div>
              <div className="mt-2 truncate text-lg font-black text-white">{authUser?.email || "No email found"}</div>
              <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Current Plan</div>
                {(() => {
                  if (statusLoading) return <div className="text-lg font-black text-zinc-400">Checking...</div>;
                  const b = getSubscriptionBadge(subscription);
                  const statusNorm = String(subscription?.status || "").toLowerCase();
                  const isTrialing = ["trialing", "on_trial"].includes(statusNorm);
                  const trialEndMs = subscription?.trial_end ? new Date(subscription.trial_end).getTime() : 0;
                  const daysLeft = isTrialing && trialEndMs ? Math.max(1, Math.ceil((trialEndMs - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
                  return (
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xl font-black ${b.tone === "emerald" ? "text-emerald-300" : b.tone === "fuchsia" ? "text-fuchsia-300" : "text-white"}`}>{b.label}</span>
                        {isTrialing && daysLeft > 0 && (
                          <span className="rounded-full border border-fuchsia-500/35 bg-fuchsia-500/15 px-3 py-1 text-xs font-black text-fuchsia-200">{daysLeft} day{daysLeft === 1 ? "" : "s"} remaining</span>
                        )}
                        {isAdminGrantedPlan && <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-black text-emerald-200">Free admin access</span>}
                        {subscription?.cancel_at_period_end && <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-black text-amber-200">Cancels soon</span>}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-zinc-400">
                        {isAdminGrantedPlan
                          ? `Access granted until ${subscriptionDateText || "admin removes it"}`
                          : isTrialing && subscriptionDateText
                            ? `Free trial ends on ${subscriptionDateText}`
                            : subscriptionDateText
                              ? `Current period ends ${subscriptionDateText}`
                              : "Start a plan to unlock saved subscription details."}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <button
                onClick={openBillingPortal}
                disabled={Boolean(loadingPlan) || isAdminGrantedPlan}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-black text-white transition hover:border-fuchsia-400/50 hover:bg-fuchsia-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CreditCard size={16} />
                {isAdminGrantedPlan ? "Billing portal not needed" : loadingPlan === "portal" ? "Opening..." : "Open Billing Portal"}
              </button>
            </div>

          </section>
        </div>

        <div className="mt-8 rounded-xl border border-white/8 bg-black/20 px-5 py-4 text-xs font-semibold leading-5 text-zinc-600">
          TryCritique is a trading journal and self-review tool. It does not provide trading signals, investment advice, brokerage services, or guaranteed returns. Subscription billing is processed securely. You may cancel at any time from your billing portal.
        </div>
      </div>
    </motion.div>
  );
}

function getAccessSuspendedCopy(subscription) {
  const status = String(subscription?.status || "").toLowerCase();
  const now = Date.now();
  const trialEndMs = subscription?.trial_end ? new Date(subscription.trial_end).getTime() : 0;
  const trialExpired = Boolean(trialEndMs && trialEndMs <= now);
  const expiredDate = subscription?.trial_end || subscription?.current_period_end || subscription?.canceled_at || "";
  const expiredText = expiredDate
    ? new Date(expiredDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "";

  if (!subscription) {
    return {
      title: "Activate Pro",
      detail: "Start a subscription to unlock your trading workspace.",
      badge: "Subscription required",
      isNewUser: true,
    };
  }

  // Trial ended — status may be "trialing" (just expired), "on_trial", "past_due", "expired", or "canceled"
  if (["trialing", "on_trial"].includes(status) || trialExpired) {
    return {
      title: "Trial Expired",
      detail: expiredText ? `Your 7-day trial ended on ${expiredText}. Subscribe to keep your data and regain full access.` : "Your 7-day trial has ended. Subscribe to continue.",
      badge: "Trial ended",
      isNewUser: false,
    };
  }

  return {
    title: "Access Suspended",
    detail: expiredText ? `Your subscription expired on ${expiredText}. Reactivate to continue.` : "Reactivate your subscription to continue.",
    badge: "Payment required",
    isNewUser: false,
  };
}

function BillingGatePage({ authUser, billingSubscription, onSignOut, onSubscriptionChange, onSubscriptionRefresh }) {
  const [loadingPlan, setLoadingPlan] = useState("");
  const [billingError, setBillingError] = useState("");
  const [selected, setSelected] = useState("yearly");
  // Returning user = had a subscription before (cancelled or expired). No second trial.
  const isReturningUser = Boolean(billingSubscription);

  const plans = [
    { id: "monthly", name: "Monthly", daily: "$0.33", price: "$10", cadence: "billed monthly", badge: null },
    { id: "yearly", name: "Yearly", daily: "$0.24", price: "$86", cadence: "billed annually", badge: "Save 28%", featured: true },
  ];

  const features = [
    ...(isReturningUser ? [] : ["7-day free trial — No charge today"]),
    "Unlimited trade logging & journaling",
    "Advanced analytics & calendar",
    "Mistake detector & psychology tools",
    "Screenshot uploads",
    "CSV import, export & backup",
    "Up to 20 trading accounts",
    "Cancel anytime",
  ];

  async function startCheckout(planId) {
    setLoadingPlan(planId);
    setBillingError("");
    try {
      const accessToken = await getCurrentAccessToken();
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, accessToken, email: authUser?.email, userId: authUser?.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not start checkout.");
      window.location.href = data.url;
    } catch (error) {
      setBillingError(error?.message || "Could not open checkout.");
    } finally {
      setLoadingPlan("");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050308] px-4 py-12">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-fuchsia-600/8 blur-3xl" />
        <div className="absolute -right-40 bottom-1/4 h-[500px] w-[500px] rounded-full bg-violet-700/6 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo + header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/8 text-fuchsia-400">
              <BrandBolt className="h-9 w-9" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">{isReturningUser ? "Reactivate Pro" : "Start Your Free Trial"}</h1>
          <p className="mt-2 text-base text-zinc-500">{isReturningUser ? "Reactivate your subscription to continue." : "Choose your plan. You won't be charged today."}</p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-fuchsia-500/15 bg-[#060410] shadow-[0_40px_100px_rgba(0,0,0,0.92)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent" />
          <div className="px-8 pb-8 pt-8">

            {billingError && (
              <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{billingError}</div>
            )}

            {/* Plan cards */}
            <div className="mb-5 grid grid-cols-2 gap-4">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={`relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all duration-200
                    ${selected === plan.id
                      ? "border-fuchsia-500/40 bg-fuchsia-500/8 shadow-[0_0_0_1px_rgba(178,74,242,0.12)]"
                      : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"}`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-fuchsia-500 px-3.5 py-1 text-[11px] font-black text-black">⭐ Most Popular</span>
                  )}
                  <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-zinc-500">{plan.name}</div>
                  <div className="text-4xl font-black text-fuchsia-400">{plan.daily}<span className="text-base font-semibold text-zinc-600">/day</span></div>
                  <div className="mt-1 text-sm text-zinc-600">{plan.price} {plan.cadence}</div>
                  {plan.badge && <span className="mt-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-black text-emerald-500">{plan.badge}</span>}
                  <div className={`mt-4 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${selected === plan.id ? "border-fuchsia-500 bg-fuchsia-500" : "border-white/20"}`}>
                    {selected === plan.id && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="mb-5 rounded-2xl border border-white/8 bg-white/3 p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck size={14} className="text-fuchsia-400" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">What's Included</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <CheckCircle size={14} className="shrink-0 text-emerald-600" />{f}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => startCheckout(selected)}
              disabled={Boolean(loadingPlan)}
              className="w-full rounded-2xl bg-fuchsia-600 py-4 text-base font-black text-white shadow-[0_4px_20px_rgba(178,74,242,0.25)] transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPlan ? "Opening checkout..." : isReturningUser ? `Subscribe — ${selected === "monthly" ? "$10/month" : "$86/year"}` : `Start Free Trial — ${selected === "monthly" ? "$10/month" : "$86/year"}`}
            </button>

            <button type="button" onClick={onSignOut} className="mt-4 w-full text-sm font-medium text-zinc-700 transition hover:text-zinc-400">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccessSuspendedOverlay({ subscription, loadingPlan, onStartCheckout, onSignOut }) {
  const copy = getAccessSuspendedCopy(subscription);
  const isNew = copy.isNewUser;
  const [selected, setSelected] = useState("monthly");

  const plans = [
    { id: "monthly", name: "Monthly", daily: "$0.33", price: "$10", cadence: "billed monthly", badge: null },
    { id: "yearly", name: "Yearly", daily: "$0.24", price: "$86", cadence: "billed annually", badge: "Save 28%", featured: true },
  ];

  const features = [
    "7-day free trial — No charge today",
    "Unlimited trade logging & journaling",
    "Advanced analytics & calendar",
    "Mistake detector & psychology tools",
    "CSV import, export & backup",
    "Up to 20 trading accounts",
    "Cancel anytime",
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/92 p-4 backdrop-blur-lg">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute -right-40 bottom-1/4 h-[500px] w-[500px] rounded-full bg-violet-700/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-900/15 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-xl overflow-y-auto rounded-3xl border border-fuchsia-500/15 bg-[#060410] shadow-[0_40px_100px_rgba(0,0,0,0.92),0_0_40px_rgba(178,74,242,0.05)]"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        {/* Top accent line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent" />

        <div className="px-8 pb-8 pt-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/8 text-fuchsia-400">
                <BrandBolt className="h-9 w-9" />
              </div>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">{isNew ? "Start Your Free Trial" : "Reactivate Pro"}</h2>
            <p className="mt-2 text-base text-zinc-500">Choose your plan. You won't be charged today.</p>
          </div>

          {/* Plan cards */}
          <div className="mb-5 grid grid-cols-2 gap-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all duration-200
                  ${selected === plan.id
                    ? "border-fuchsia-500/40 bg-fuchsia-500/8 shadow-[0_0_0_1px_rgba(178,74,242,0.12)]"
                    : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"}`}
              >
                {plan.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-fuchsia-500 px-3.5 py-1 text-[11px] font-black text-black">⭐ Most Popular</span>
                )}
                <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-zinc-500">{plan.name}</div>
                <div className="text-4xl font-black text-fuchsia-400">{plan.daily}<span className="text-base font-semibold text-zinc-600">/day</span></div>
                <div className="mt-1 text-sm text-zinc-600">{plan.price} {plan.cadence}</div>
                {plan.badge && <span className="mt-2 rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-0.5 text-[11px] font-black text-emerald-400">{plan.badge}</span>}
                <div className={`mt-4 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${selected === plan.id ? "border-fuchsia-500 bg-fuchsia-500" : "border-white/20"}`}>
                  {selected === plan.id && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="mb-5 rounded-2xl border border-white/8 bg-white/3 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck size={14} className="text-fuchsia-400" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">What's Included</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <CheckCircle size={14} className="shrink-0 text-emerald-600" />{f}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => onStartCheckout?.(selected)}
            disabled={Boolean(loadingPlan)}
            className="w-full rounded-2xl bg-fuchsia-600 py-4 text-base font-black text-white shadow-[0_4px_20px_rgba(178,74,242,0.25)] transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingPlan ? "Opening checkout..." : isNew ? `Start Free Trial — ${selected === "monthly" ? "$10/month" : "$86/year"}` : `Subscribe — ${selected === "monthly" ? "$10/month" : "$86/year"}`}
          </button>

          <button type="button" onClick={onSignOut} className="mt-4 w-full text-sm font-medium text-zinc-700 transition hover:text-zinc-400">
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function BillingPagePro({ account, authUser }) {
  const features = [
    "Unlimited trade imports & logging",
    "Comprehensive trading journal",
    "Advanced performance analytics",
    "Image & screenshot uploads",
    "Advanced tagging & filtering",
    "Up to 20 trading accounts",
    "Mistake detector insights",
    "Mood & emotion tracking",
    "Win/loss streak analysis",
    "Start your day intentions",
    "Beautiful trading dashboard",
    "CSV export & import",
    "Custom strategies & tags",
    "Priority support",
  ];
  const nextBillingDate = "May 25th, 2026";
  const subscriptionId = "sub_crtq_pro_trial";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
      <TopCrumb page="Billing" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Billing & Subscription</h1>
            <p className="mt-2 text-lg font-semibold text-zinc-400">Manage your Critique Pro subscription</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-sm font-black text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            {account?.name || "Trading Account"}
            <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs">{account?.currency || "USD"}</span>
          </div>
        </div>

        <section className="overflow-hidden rounded-lg border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-950/35 via-[#13071e] to-black p-6 shadow-[0_18px_70px_rgba(178,74,242,0.12)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-300"><Sparkles size={26} /></div>
              <div>
                <h2 className="text-2xl font-black text-white">Free Trial Active</h2>
                <p className="text-sm font-semibold text-zinc-400">Expires on May 25, 2026</p>
              </div>
            </div>
            <span className="rounded-full bg-fuchsia-500 px-6 py-3 text-lg font-black text-black shadow-[0_14px_30px_rgba(178,74,242,0.28)]">2 days left</span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[74%] rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-600" />
          </div>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-lg border border-white/12 bg-[#070707] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles size={28} className="text-fuchsia-400" />
                <div>
                  <h2 className="text-2xl font-black text-white">Current Plan</h2>
                  <p className="mt-2 text-sm font-semibold text-zinc-400">7-day free trial with Critique Pro</p>
                </div>
              </div>
              <span className="rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-black text-blue-300">TRIALING</span>
            </div>

            <div className="mt-8 grid gap-4 rounded-lg bg-white/[0.06] p-5 sm:grid-cols-2">
              <div>
                <div className="text-sm font-bold text-zinc-400">Plan Type</div>
                <div className="mt-3 text-3xl font-black text-white">Critique Pro</div>
                <div className="mt-2 text-sm font-semibold text-zinc-400">Monthly billing</div>
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-400">Price</div>
                <div className="mt-3 text-3xl font-black text-fuchsia-400">$10/month</div>
                <div className="mt-2 text-sm font-semibold text-zinc-400">After trial ends</div>
              </div>
            </div>

            <h3 className="mt-9 text-2xl font-black text-white">What's Included</h3>
            <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-base font-bold text-white">
                  <span className="text-xl font-black text-emerald-400">✓</span>
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-9 rounded-lg border border-amber-500/30 bg-amber-500/10 p-5">
              <div className="flex gap-3">
                <span className="text-xl text-amber-400">!</span>
                <div>
                  <div className="font-black text-amber-400">Subscription Ending</div>
                  <p className="mt-2 text-sm font-semibold text-amber-200">Your subscription will end on May 25, 2026</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/12 bg-[#070707] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <Settings size={24} className="text-white" />
              <h2 className="text-xl font-black text-white">Manage Subscription</h2>
            </div>
            <h3 className="mt-7 text-2xl font-black text-white">Subscription Management</h3>
            <p className="mt-2 text-sm font-semibold text-zinc-400">Manage your Critique Pro subscription and billing</p>

            <div className="mt-6 inline-flex rounded-lg bg-white/10 p-1">
              <button className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-black text-white"><CreditCard size={15} /> Overview</button>
              <button className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-black text-zinc-400">Payment History</button>
            </div>

            <div className="mt-6 rounded-lg border border-white/12 bg-black/35 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <Sparkles size={24} className="text-fuchsia-400" />
                  <div>
                    <h4 className="text-xl font-black text-white">Current Plan</h4>
                    <p className="text-sm font-semibold text-zinc-400">Your subscription details and status</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">Trial</span>
              </div>

              <div className="mt-7 flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-zinc-400">Plan</div>
                  <div className="mt-2 text-3xl font-black text-white">Critique Pro</div>
                </div>
                <span className="rounded-full border border-white/15 px-4 py-2 text-sm font-black text-white">Monthly</span>
              </div>

              <div className="my-7 h-px bg-white/10" />
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-bold text-zinc-400">Next Billing Date</div>
                  <div className="mt-2 text-2xl font-black text-white">{nextBillingDate}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-400">Billing Email</div>
                  <div className="mt-2 truncate rounded-md bg-white/10 px-3 py-2 text-sm font-bold text-zinc-200">{authUser?.email || "No email found"}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-400">Subscription ID</div>
                  <div className="mt-2 inline-block rounded-md bg-white/10 px-3 py-2 font-mono text-xs text-zinc-300">{subscriptionId}</div>
                </div>
              </div>

              <div className="mt-7 rounded-lg border border-orange-300/40 bg-orange-50 p-4 text-sm font-semibold leading-6 text-orange-700">
                Your subscription is set to cancel at the end of your current billing period ({nextBillingDate}). You'll retain access to Pro features until then.
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-white/12 bg-black p-5 text-center">
                  <div className="font-black text-white">Monthly</div>
                  <div className="mt-5 text-4xl font-black text-white">$0.33</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-400">/day</div>
                  <div className="mt-3 text-sm font-semibold text-zinc-400">$10 billed monthly</div>
                  <Button variant="outline" className="mt-5 border-white/15 bg-black text-white">Reactivate Monthly</Button>
                </div>
                <div className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-950/12 p-5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-black text-white">Yearly</span>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-black text-emerald-400">Save 28%</span>
                  </div>
                  <div className="mt-5 text-4xl font-black text-white">$0.24</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-400">/day</div>
                  <div className="mt-3 text-sm font-semibold text-zinc-400">$86 billed annually</div>
                  <Button className="mt-5 bg-fuchsia-500 text-black">Switch to Yearly</Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function BillingPage({ account, authUser }) {
  const features = ["Unlimited journal entries", "Calendar and statistics views", "Mistake detector", "CSV backup / restore", "Supabase account sync"];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <TopCrumb page="Billing" />
      <div className="light-card rounded-3xl border border-fuchsia-500/25 bg-gradient-to-br from-[#12081b] via-black to-[#050307] p-6 shadow-[0_18px_45px_rgba(178,74,242,0.10)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-fuchsia-500/35 bg-fuchsia-500/15 p-3 text-fuchsia-300"><CreditCard /></div>
            <div>
              <h1 className="text-3xl font-black">Billing</h1>
              <p className="text-sm font-semibold text-zinc-400">Plan overview and billing details for your trading journal.</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-300">Active Trial</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="light-card border-fuchsia-500/25 bg-black">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.18em] text-fuchsia-300">Current Plan</div>
                <h2 className="mt-2 text-3xl font-black text-white">Critique Pro Trial</h2>
                <p className="mt-2 text-sm font-semibold text-zinc-400">Your account is ready for journaling, analytics, and backups.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4 text-right">
                <div className="text-3xl font-black text-white">$0</div>
                <div className="text-xs font-bold text-zinc-500">trial / testing mode</div>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-bold text-zinc-200">✓ {feature}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="light-card border-white/10 bg-black">
          <CardContent className="p-6">
            <h2 className="text-xl font-black">Billing Info</h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Email</div>
                <div className="mt-1 font-black text-white">{authUser?.email || "No email found"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Account</div>
                <div className="mt-1 font-black text-white">{account?.name || "Trading Account"}</div>
              </div>
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm font-bold text-amber-200">
                Dodo / real payment connection is not connected yet. This is a clean billing UI placeholder, ready for payment logic later.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function AccountModal({ account, isNew = false, onSaveAccount, onClose }) {
  const [draft, setDraft] = useState(account);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function saveAccount() {
    setSaving(true);
    setSaveError("");
    const result = await onSaveAccount?.({ ...draft, balance: Number(draft.balance || 0) });
    setSaving(false);

    if (result?.ok === false) {
      setSaveError(result.error?.message || "Could not save account settings.");
      return;
    }

    onClose({ saved: true });
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-5 backdrop-blur-md sm:py-7">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="account-modal-panel account-modal-scroll w-full max-w-[500px] overflow-y-auto rounded-lg px-6 py-5 sm:max-h-[calc(100vh-56px)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-[21px] font-black text-white">
              <CreditCard size={20} className="text-fuchsia-400" />
              {isNew ? "Create New Account" : "Edit Account"}
            </h2>
            <p className="mt-2 max-w-[410px] text-[15px] leading-[22px] text-zinc-400">
              Set up a new trading account to organize and track your trades across different platforms or strategies.
            </p>
          </div>
          <button type="button" onClick={() => onClose()} className="mt-1 shrink-0 text-zinc-500 transition hover:text-white" aria-label="Close account modal"><X size={17} /></button>
        </div>

        <div className="mt-5">
          <div className="text-sm font-bold text-white">Account Type</div>
          <div className="mt-3 space-y-2">
            {ACCOUNT_TYPE_OPTIONS.map(({ emoji, type, description }) => {
              const selected = draft.type === type;
              return (
              <button
                key={type}
                type="button"
                onClick={() => setDraft({ ...draft, type })}
                className={`account-type-card flex min-h-[64px] w-full items-center gap-4 rounded-lg border px-4 py-3 text-left transition ${selected ? "border-fuchsia-500 bg-fuchsia-950/[0.10] shadow-[0_0_0_1px_rgba(178,75,243,0.15)]" : "border-[#292b31] bg-[#09090b] hover:border-fuchsia-500/45"}`}
              >
                <span className="w-7 shrink-0 text-[22px]">{emoji}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-white">
                    {type}
                    {selected && <span className="rounded-full bg-fuchsia-500 px-2.5 py-0.5 text-[11px] font-black text-black">Selected</span>}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-400">{description}</div>
                </div>
              </button>
              );
            })}
          </div>
        </div>

        <div className="my-6 h-px bg-white/10" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Account Name">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g., My Live Account" className="h-10 border-[#292b31] bg-black text-white placeholder:text-zinc-500 focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" />
          </Field>
          <Field label="Currency">
            <Select value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })}>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </Select>
          </Field>
        </div>

        <div className="mt-5">
          <Field label={<span className="flex items-center gap-2"><span className="text-lg font-normal">$</span> Starting Balance</span>}>
            <Input type="number" min="0" value={draft.balance} onChange={(e) => setDraft({ ...draft, balance: e.target.value })} placeholder="10000" className="h-10 border-[#292b31] bg-black text-white focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" />
          </Field>
        </div>

        <div className="mt-5">
          <Field label={<span className="flex items-center gap-2"><BookOpen size={15} /> Description (Optional)</span>}>
            <Textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Add notes about this account, trading strategy, or purpose..." className="min-h-[86px] resize-none border-[#292b31] bg-[#09090b] text-white placeholder:text-zinc-500 focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" />
          </Field>
        </div>

        {saveError && <div className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{saveError}</div>}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-5">
          <Button variant="outline" onClick={() => onClose()} className="border-white/15 bg-black px-5 text-white">Cancel</Button>
          <Button onClick={saveAccount} disabled={saving} className="bg-fuchsia-500 px-5 text-black hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} /> {saving ? "Saving..." : isNew ? "Create Account" : "Save Changes"}</Button>
        </div>
      </motion.div>
    </div>
  );
}

function SimplePageShell({ crumb, title, subtitle, action, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
      <TopCrumb page={crumb} />
      {/* Hero header — same gradient as dashboard */}
      <div
        className="page-hero-gradient mb-7 relative overflow-hidden rounded-2xl px-6 py-5"
        style={{
          border: "1px solid transparent",
          background: "linear-gradient(135deg, #14071d 0%, #16081e 48%, #180d17 76%, #21130d 100%) padding-box, linear-gradient(135deg, rgba(178,74,242,.58) 0%, rgba(122,42,170,.48) 58%, rgba(132,76,36,.62) 100%) border-box",
          boxShadow: "0 18px 48px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.035)",
        }}
      >
        <div className="page-hero-gradient-bg pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 10% 0%, rgba(178,74,242,.09), transparent 34%), radial-gradient(circle at 100% 100%, rgba(123,69,31,.20), transparent 42%), linear-gradient(135deg, rgba(18,6,27,.98) 0%, rgba(20,7,27,.98) 52%, rgba(26,13,20,.98) 78%, rgba(31,18,12,.98) 100%)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="page-hero-title text-4xl font-black tracking-tight text-white">{title}</h1>
            <p className="page-hero-subtitle mt-2 max-w-3xl text-base font-semibold leading-7 text-zinc-400">{subtitle}</p>
          </div>
          {action}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function SimpleStatCard({ label, value, detail, tone = "fuchsia", icon }) {
  const toneKey = tone === "green" ? "green" : tone === "red" ? "red" : tone === "amber" ? "amber" : "purple";
  const iconCls = toneKey === "green" ? "border-emerald-500/25 bg-emerald-500/[0.12] text-emerald-300" : toneKey === "red" ? "border-red-500/25 bg-red-500/[0.12] text-red-300" : toneKey === "amber" ? "border-amber-500/25 bg-amber-500/[0.12] text-amber-300" : "border-fuchsia-500/25 bg-fuchsia-500/[0.12] text-fuchsia-300";
  const valueCls = toneKey === "green" ? "text-emerald-400" : toneKey === "red" ? "text-red-400" : toneKey === "amber" ? "text-amber-300" : "text-zinc-100";
  const detailCls = toneKey === "green" ? "text-emerald-300/70" : toneKey === "red" ? "text-red-300/70" : toneKey === "amber" ? "text-amber-300/70" : "text-zinc-500";
  const glowCls = toneKey === "green" ? "bg-emerald-500/[0.09]" : toneKey === "red" ? "bg-red-500/[0.09]" : toneKey === "amber" ? "bg-amber-500/[0.09]" : "bg-fuchsia-500/[0.08]";
  const lineCls = toneKey === "green" ? "text-emerald-500" : toneKey === "red" ? "text-red-500" : toneKey === "amber" ? "text-amber-500" : "text-violet-500";
  return (
    <div className={`stat-tile-${toneKey} group relative min-w-0 overflow-hidden rounded-xl border p-5 shadow-[0_16px_36px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_20px_42px_rgba(0,0,0,0.34)]`}>
      <div className={`stat-tile-glow absolute right-0 top-0 h-20 w-20 rounded-bl-3xl ${glowCls}`} />
      <div className="relative z-10 flex items-start justify-between">
        <div className="min-w-0">
          <div className={`stat-tile-label text-xs font-black uppercase tracking-[0.18em] text-zinc-500`}>{label}</div>
          <div className={`stat-tile-value mt-4 text-3xl font-black ${valueCls}`}>{value}</div>
        </div>
        {icon && <div className={`stat-tile-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${iconCls}`}>{icon}</div>}
      </div>
      <div className="relative z-10 mt-3 flex items-end justify-between">
        <div className={`truncate text-sm font-semibold leading-6 ${detailCls}`}>{detail}</div>
        <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className={`stat-tile-line ${lineCls} ml-2 shrink-0 opacity-50 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-75`}>
          <path d="M2 19 C5 21, 9 9, 13 13 S19 19, 24 11 S32 8, 37 13 S44 6, 50 8 S54 3, 58 2" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function SimplePanel({ title, subtitle, children, icon }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-white/12 bg-[#070707] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-fuchsia-500/25 hover:shadow-[0_24px_70px_rgba(178,74,242,0.08)]">
      <div className="mb-5 flex min-w-0 items-start gap-3">
        {icon && <div className="shrink-0 text-fuchsia-400">{icon}</div>}
        <div className="min-w-0">
          <h2 className="text-2xl font-black text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-sm font-semibold leading-6 text-zinc-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function SimpleStatisticsPage({ trades = [], onExport, economicCalendar, onRefreshEconomicCalendar, onDeleteStrategy }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [deletedStrategyNames, setDeletedStrategyNames] = useState(() => new Set());
  function handleDeleteStrategy(name) {
    setDeletedStrategyNames((prev) => new Set([...prev, name]));
    onDeleteStrategy?.(name);
  }
  const allTrades = Array.isArray(trades) ? trades : [];
  const visibleTrades = allTrades;

  const stats = useMemo(() => calculateStatistics(visibleTrades), [visibleTrades]);
  const curve = useMemo(() => {
    let balance = 0;
    return sortTradesChronologically(visibleTrades).map((trade) => {
      balance += Number(trade.pnl || 0);
      return { date: getTradeDateKey(trade), value: balance };
    });
  }, [visibleTrades]);
  const profitFactor = Number(stats.profitFactor || 0);
  const expectancy = stats.trades ? stats.totalPnl / stats.trades : 0;
  const strategyRows = Object.entries(stats.strategyStats || {}).sort((a, b) => Number(b[1].pnl || 0) - Number(a[1].pnl || 0));
  const bestStrategy = strategyRows[0];
  const sessionRows = Object.entries(stats.sessionStats || {}).sort((a, b) => Number(b[1].pnl || 0) - Number(a[1].pnl || 0));
  const mistakeRows = Object.entries(stats.mistakeStats || {}).filter(([name]) => name && name !== "None").sort((a, b) => Number(a[1].pnl || 0) - Number(b[1].pnl || 0));
  const bestPerformance = useMemo(() => getBestPerformanceStats(visibleTrades), [visibleTrades]);
  const wins = visibleTrades.filter((trade) => Number(trade.pnl || 0) > 0);
  const bestTradeItem = [...visibleTrades].sort((a, b) => Number(b.pnl || 0) - Number(a.pnl || 0))[0];
  const smallestWinItem = [...wins].sort((a, b) => Number(a.pnl || 0) - Number(b.pnl || 0))[0];
  const weekdayRows = getWeekdayStatsRows(visibleTrades);
  const newsStats = useMemo(() => getNewsPerformanceStats(visibleTrades, economicCalendar?.events || []), [visibleTrades, economicCalendar?.events]);
  const tabs = [
    ["Overview", BarChart3],
    ["Patterns", Calendar],
    ["Strategies", ListChecks],
    ["News", BookOpen],
  ];

  return (
    <SimplePageShell
      crumb="Statistics"
      title="Performance Review"
      subtitle="See what is working, what is costing money, and where your edge is strongest."
    >
      <div className="mt-2 h-px bg-white/10" />
      <div className="statistics-tabs mt-6 inline-flex max-w-full flex-wrap gap-2 rounded-xl border border-white/10 bg-[#111113] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        {tabs.map(([tab, Icon]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "statistics-tab statistics-tab-active flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.38)]" : "statistics-tab flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-black text-zinc-400 transition hover:bg-white/5 hover:text-white"}
          >
            <Icon size={16} />
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <>
          {stats.trades === 0 && (
            <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-black/20 px-5 py-8 text-center">
              <BarChart3 size={24} className="mx-auto mb-3 text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-500">Log trades to unlock performance analytics.</p>
            </div>
          )}
          <StatsSectionTitle title="Performance Overview" icon={<BarChart3 size={20} />} className="mt-10" />
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <DashboardStatTile label="Total P&L" value={formatMoney(stats.totalPnl)} badge={stats.totalPnl >= 0 ? "Profit" : "Loss"} tone={stats.totalPnl >= 0 ? "green" : "red"} />
            <DashboardStatTile label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} badge={`${stats.wins}W/${stats.losses}L${stats.breakEvens ? `/${stats.breakEvens}BE` : ""}`} tone="green" />
            <DashboardStatTile label="Trades" value={stats.trades} badge={`${stats.trades} closed`} />
            <DashboardStatTile label="Avg Win" value={formatMoney(stats.avgWin)} tone="green" />
            <DashboardStatTile label="Avg Loss" value={formatMoney(stats.avgLoss)} tone={stats.avgLoss > 0 ? "red" : "neutral"} />
            <DashboardStatTile label="Profit Factor" value={profitFactor >= 999 ? "999.00" : profitFactor.toFixed(2)} badge={profitFactor >= 999 ? "Perfect" : profitFactor >= 1 ? "Good" : "Needs work"} tone="green" />
          </div>

          <StatsSectionTitle title="Advanced Analytics" icon={<span className="text-lg font-black">%</span>} className="mt-12" />
          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <AdvancedAnalyticsTile label="Expectancy" value={formatMoney(expectancy)} badge="Per trade" active />
            <AdvancedAnalyticsTile label="Risk-Adjusted" value={stats.trades > 1 ? Math.max(0, expectancy / Math.max(1, stats.maxDrawdown || 1)).toFixed(2) : "0.00"} badge="Sharpe ratio" />
            <AdvancedAnalyticsTile label="Best Trade" value={formatMoney(bestTradeItem?.pnl || 0)} badge={bestTradeItem?.pair || "No trade"} tone="green" />
            <AdvancedAnalyticsTile label="Smallest Win" value={formatMoney(smallestWinItem?.pnl || 0)} badge={smallestWinItem?.pair || "No win"} tone="amber" />
          </div>

          <StatsSectionTitle title="Best Performance" icon={<span className="text-lg font-black">🏆</span>} className="mt-12" />
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <BestPerfTile label="Best Day" value={formatMoney(bestPerformance.day.pnl)} detail={bestPerformance.day.label} badge={`${bestPerformance.day.count} trades`} />
            <BestPerfTile label="Best Week" value={formatMoney(bestPerformance.week.pnl)} detail={bestPerformance.week.label} badge={`${bestPerformance.week.count} trades`} />
            <BestPerfTile label="Best Month" value={formatMoney(bestPerformance.month.pnl)} detail={bestPerformance.month.label} badge={`${bestPerformance.month.count} trades`} />
            <BestPerfTile label="Best Year" value={formatMoney(bestPerformance.year.pnl)} detail={bestPerformance.year.label} badge={`${bestPerformance.year.count} trades`} />
            <BestPerfTile label="Best Session" value={formatMoney(sessionRows[0]?.[1]?.pnl || 0)} detail={sessionRows[0]?.[0] || "No session"} badge={`${sessionRows[0]?.[1]?.count || 0} trades`} />
          </div>

        </>
      )}

      {activeTab === "Patterns" && (
        <div className="mt-10">
          <p className="mb-6 text-sm font-semibold text-zinc-500">Find the habits and conditions that repeat across your trades.</p>
          <StatsSectionTitle title="Weekday Performance (Monday - Friday)" icon={<Calendar size={20} />} />
          <div className="mt-5 grid gap-4 xl:grid-cols-5">
            {weekdayRows.map((day) => <WeekdayTile key={day.short} day={day} />)}
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <SimplePanel title="Best Sessions" subtitle="Sessions where your performance is strongest." icon={<Target size={24} />}>
              <SimpleStatsRows rows={sessionRows.slice(0, 5)} empty="Add session tags to trades to see which sessions perform best." />
            </SimplePanel>
            <SimplePanel title="Costly Mistakes" subtitle="Mistakes that cost the most money." icon={<ShieldCheck size={24} />}>
              <SimpleStatsRows rows={mistakeRows.slice(0, 5)} empty="Tag mistakes on losing trades to see what is costing the most." negative />
            </SimplePanel>
          </div>
        </div>
      )}

      {activeTab === "Strategies" && (
        <div className="mt-10">
          <p className="mb-6 text-sm font-semibold text-zinc-500">See which setups deserve more size — and which ones need review.</p>
          <StatsSectionTitle title="Strategy Performance" icon={<Sparkles size={20} />} />
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {strategyRows.filter(([name]) => !deletedStrategyNames.has(name)).length ? strategyRows.filter(([name]) => !deletedStrategyNames.has(name)).map(([name, item]) => {
              const decisive = Number(item.wins || 0) + Number(item.losses || 0);
              const winRate = decisive ? (Number(item.wins || 0) / decisive) * 100 : 0;
              const avgRR = item.riskTrades ? Number(item.rrSum || 0) / item.riskTrades : 0;
              const pnl = Number(item.pnl || 0);
              return (
                <StrategyStatsCard key={name} name={name} item={item} winRate={winRate} avgRR={avgRR} pnl={pnl} onDelete={() => handleDeleteStrategy(name)} />
              );
            }) : (
              <div className="col-span-full rounded-xl border border-dashed border-white/10 bg-black/20 px-5 py-8 text-center">
                <ListChecks size={22} className="mx-auto mb-2 text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-500">Log at least 10 trades with strategy tags to compare setups reliably.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "News" && (
        <div className="mt-10">
          <div>
            <StatsSectionTitle title="News-Day Performance" icon={<BookOpen size={20} />} />
            <p className="mt-2 text-sm font-semibold text-zinc-500">Review how economic events affect your trading results.</p>
          </div>
          <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <SimpleStatCard label="Best News Day" value={newsStats.best ? formatMoney(newsStats.best.pnl) : "—"} detail={newsStats.best ? `${newsStats.best.event.country} · ${newsStats.best.event.title}` : "Log trades on economic event days to see news impact."} tone="green" />
            <SimpleStatCard label="Worst News Day" value={newsStats.worst ? formatMoney(newsStats.worst.pnl) : "—"} detail={newsStats.worst ? `${newsStats.worst.event.country} · ${newsStats.worst.event.title}` : "Log trades on economic event days to see news impact."} tone="amber" />
            <SimpleStatCard label="Event Days Traded" value={newsStats.rows.length || "—"} detail={newsStats.rows.length ? `${newsStats.totalNewsTrades || 0} trades on ${newsStats.totalEventCount || 0} loaded events` : "Log trades on event days to start tracking."} tone="fuchsia" />
            <SimpleStatCard label="Top Currency" value={newsStats.currencyRows[0]?.name || "—"} detail={newsStats.currencyRows[0] ? `${formatMoney(newsStats.currencyRows[0].pnl)} across ${newsStats.currencyRows[0].trades} trades` : "Log trades on event days to measure currency impact."} tone="green" />
          </div>

          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
            <SimplePanel title="Best News Events" subtitle="Event names that matched your strongest trading days." icon={<TrendingUp size={24} />}>
              {newsStats.eventRows.length ? newsStats.eventRows.slice(0, 6).map((row) => (
                <div key={`${row.country}-${row.name}`} className="mb-2 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/35 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-black text-white">{row.country} · {row.name}</div>
                    <div className="text-xs font-semibold text-zinc-500">{row.trades} trades · {row.count} event match{row.count === 1 ? "" : "es"}</div>
                  </div>
                  <div className={`shrink-0 whitespace-nowrap ${row.pnl >= 0 ? "font-black text-emerald-400" : "font-black text-red-400"}`}>{formatMoney(row.pnl)}</div>
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center">
                  <p className="text-sm font-semibold text-zinc-500">Log trades on economic event days to see news impact.</p>
                </div>
              )}
            </SimplePanel>
            <SimplePanel title="Currency Impact" subtitle="Which economic currencies line up with your best or worst days." icon={<Target size={24} />}>
              {newsStats.currencyRows.length ? newsStats.currencyRows.slice(0, 8).map((row) => (
                <div key={row.name} className="currency-impact-item mb-3 rounded-xl border border-white/10 bg-black/35 px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-black text-white">{row.name}</div>
                      <div className="text-xs font-semibold text-zinc-500">{row.trades} trades on matching event days</div>
                    </div>
                    <div className={`shrink-0 whitespace-nowrap ${row.pnl >= 0 ? "font-black text-emerald-400" : "font-black text-red-400"}`}>{formatMoney(row.pnl)}</div>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs font-black sm:grid-cols-3">
                    <div className="currency-pill-win rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-200">Won {formatMoney(row.grossWin || 0)}</div>
                    <div className="currency-pill-loss rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-red-200">Lost {formatMoney(Math.abs(row.grossLoss || 0))}</div>
                    <div className="currency-pill-neutral rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-zinc-300">{row.wins || 0}W / {row.losses || 0}L / {row.breakEvens || 0}BE</div>
                  </div>
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center">
                  <p className="text-sm font-semibold text-zinc-500">Log trades on economic event days to see news impact.</p>
                </div>
              )}
            </SimplePanel>
          </div>
        </div>
      )}

      {activeTab === "Risk" && (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <SimpleStatCard label="Max Drawdown" value={formatMoney(stats.maxDrawdown)} detail={`${stats.maxDrawdownPercent.toFixed(1)}% account drawdown.`} tone={stats.maxDrawdownPercent <= 3 ? "green" : stats.maxDrawdownPercent <= 6 ? "amber" : "red"} />
          <SimpleStatCard label="Avg R:R" value={Number(stats.avgRR || 0).toFixed(2)} detail="Average reward compared to risk." tone={stats.avgRR >= 1 ? "green" : "amber"} />
          <SimpleStatCard label="Avg Win/Loss" value={stats.avgWinLoss >= 999 ? "Perfect" : stats.avgWinLoss.toFixed(2)} detail="Winner size compared to loser size." tone={stats.avgWinLoss >= 1.2 ? "green" : stats.avgWinLoss >= 1 ? "amber" : "red"} />
          <SimpleStatCard label="Recovery Factor" value={stats.recoveryFactor >= 999 ? "Perfect" : Number(stats.recoveryFactor || 0).toFixed(2)} detail="Profit compared to drawdown." tone={stats.recoveryFactor >= 1 ? "green" : "amber"} />
        </div>
      )}
    </SimplePageShell>
  );
}

function RefreshCwIcon() {
  return <Loader2 size={16} className="animate-spin" />;
}

function StatsSectionTitle({ title, icon, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-fuchsia-500/15 text-fuchsia-300">{icon}</span>
      <h2 className="text-2xl font-black text-white">{title}</h2>
    </div>
  );
}

function DashboardStatTile({ label, value, badge, tone = "neutral" }) {
  const toneKey = tone === "green" ? "green" : tone === "red" ? "red" : tone === "amber" ? "amber" : "purple";
  const iconCls = toneKey === "green" ? "border-emerald-500/25 bg-emerald-500/[0.12] text-emerald-300" : toneKey === "red" ? "border-red-500/25 bg-red-500/[0.12] text-red-300" : toneKey === "amber" ? "border-amber-500/25 bg-amber-500/[0.12] text-amber-300" : "border-fuchsia-500/25 bg-fuchsia-500/[0.12] text-fuchsia-300";
  const valueCls = toneKey === "green" ? "text-emerald-400" : toneKey === "red" ? "text-red-400" : toneKey === "amber" ? "text-amber-300" : "text-zinc-100";
  const badgeCls = toneKey === "green" ? "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300" : toneKey === "red" ? "border-red-500/25 bg-red-500/[0.08] text-red-300" : toneKey === "amber" ? "border-amber-500/25 bg-amber-500/[0.08] text-amber-300" : "border-fuchsia-500/25 bg-fuchsia-500/[0.08] text-fuchsia-200";
  const glowCls = toneKey === "green" ? "bg-emerald-500/[0.09]" : toneKey === "red" ? "bg-red-500/[0.09]" : toneKey === "amber" ? "bg-amber-500/[0.09]" : "bg-fuchsia-500/[0.08]";
  const lineCls = toneKey === "green" ? "text-emerald-500" : toneKey === "red" ? "text-red-500" : toneKey === "amber" ? "text-amber-500" : "text-violet-500";
  return (
    <div className={`stat-tile-${toneKey} group relative overflow-hidden rounded-xl border p-5 shadow-[0_16px_36px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_20px_42px_rgba(0,0,0,0.34)]`}>
      <div className={`stat-tile-glow absolute right-0 top-0 h-20 w-20 rounded-bl-3xl ${glowCls}`} />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className={`stat-tile-label text-xs font-black uppercase tracking-wider text-zinc-500`}>{label}</div>
          <div className={`stat-tile-value mt-4 text-3xl font-black ${valueCls}`}>{value}</div>
        </div>
        <div className={`stat-tile-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${iconCls}`}>$</div>
      </div>
      <div className="relative z-10 mt-3 flex items-end justify-between">
        {badge && <span className={`stat-tile-badge rounded-md border px-2 py-1 text-[10px] font-black ${badgeCls}`}>{badge}</span>}
        <svg width="70" height="28" viewBox="0 0 70 28" fill="none" className={`stat-tile-line ${lineCls} opacity-55 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-80`}>
          <path d="M2 22 C7 24, 10 10, 15 15 S22 22, 27 13 S37 10, 42 15 S50 7, 56 9 S62 4, 68 2" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function AdvancedAnalyticsTile({ label, value, badge, active, tone = "green" }) {
  const toneKey = active ? "purple" : tone === "amber" ? "amber" : tone === "fuchsia" ? "purple" : "green";
  const valueCls = toneKey === "green" ? "text-emerald-400" : toneKey === "amber" ? "text-amber-300" : "text-zinc-100";
  const badgeCls = toneKey === "green" ? "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300" : toneKey === "amber" ? "border-amber-500/25 bg-amber-500/[0.08] text-amber-300" : "border-fuchsia-500/25 bg-fuchsia-500/[0.08] text-fuchsia-200";
  const glowCls = toneKey === "green" ? "bg-emerald-500/[0.09]" : toneKey === "amber" ? "bg-amber-500/[0.09]" : "bg-fuchsia-500/[0.08]";
  const lineCls = toneKey === "green" ? "text-emerald-500" : toneKey === "amber" ? "text-amber-500" : "text-violet-500";
  return (
    <div className={`stat-tile-${toneKey} group relative overflow-hidden rounded-xl border p-5 shadow-[0_16px_36px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_20px_42px_rgba(0,0,0,0.34)]`}>
      <div className={`stat-tile-glow absolute right-0 top-0 h-20 w-20 rounded-bl-3xl ${glowCls}`} />
      <div className="relative z-10">
        <div className={`stat-tile-label text-xs font-black uppercase tracking-wider text-zinc-500`}>{label}</div>
        <div className={`stat-tile-value mt-4 text-3xl font-black ${valueCls}`}>{value}</div>
      </div>
      <div className="relative z-10 mt-3 flex items-end justify-between">
        {badge && <span className={`stat-tile-badge rounded-md border px-2 py-1 text-[10px] font-black ${badgeCls}`}>{badge}</span>}
        <svg width="70" height="28" viewBox="0 0 70 28" fill="none" className={`stat-tile-line ${lineCls} opacity-55 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-80`}>
          <path d="M2 22 C7 24, 10 10, 15 15 S22 22, 27 13 S37 10, 42 15 S50 7, 56 9 S62 4, 68 2" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function BestPerfTile({ label, value, detail, badge }) {
  return (
    <div className="stats-interactive-card stats-card-purple rounded-lg border border-white/10 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.22)]">
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-zinc-400"><Calendar size={15} /></span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-500/15 text-fuchsia-300">★</span>
      </div>
      <div className="text-xs font-black uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-3 text-3xl font-black text-emerald-400">{value}</div>
      <div className="mt-2 font-bold text-white">{detail}</div>
      {badge && <div className="mt-4 inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-black text-white">{badge}</div>}
    </div>
  );
}

function getWeekdayStatsRows(trades = []) {
  const labels = [
    ["Mon", "Monday", 1],
    ["Tue", "Tuesday", 2],
    ["Wed", "Wednesday", 3],
    ["Thu", "Thursday", 4],
    ["Fri", "Friday", 5],
  ];
  return labels.map(([short, name, day]) => {
    const dayTrades = trades.filter((trade) => {
      const date = new Date(`${getTradeDateKey(trade)}T00:00:00`);
      return !Number.isNaN(date.getTime()) && date.getDay() === day;
    });
    const summary = summarizeTrades(dayTrades);
    const riskTrades = dayTrades.filter((trade) => Number(trade.risk || 0) > 0);
    const avgRR = riskTrades.length ? riskTrades.reduce((sum, trade) => sum + getTradeRR(trade), 0) / riskTrades.length : 0;
    return { short, name, ...summary, avgRR };
  });
}

function WeekdayTile({ day }) {
  const hasTrades = day.count > 0;
  const tone = !hasTrades ? "border-white/10 from-black via-black to-zinc-950/40" : day.pnl >= 0 ? "border-emerald-500/25 from-emerald-950/30 via-black to-fuchsia-950/10" : "border-red-500/25 from-red-950/25 via-black to-fuchsia-950/10";
  return (
    <button type="button" className={`group relative min-h-[230px] overflow-hidden rounded-xl border bg-gradient-to-br p-5 text-left shadow-[0_16px_45px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-fuchsia-400/70 hover:shadow-[0_0_28px_rgba(178,74,242,0.18)] ${tone}`}>
      <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-3xl bg-fuchsia-500/10 transition group-hover:bg-fuchsia-500/16" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="text-2xl font-black text-white">{day.short}</div>
          <div className="mt-1 text-sm font-semibold text-zinc-400">{day.name}</div>
        </div>
        <span className={hasTrades ? "rounded-full border border-fuchsia-500/30 bg-fuchsia-500/12 px-3 py-1 text-xs font-black text-fuchsia-200" : "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-zinc-500"}>
          {hasTrades ? "Active" : "No trades"}
        </span>
      </div>
      <div className="relative z-10 mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between"><span className="font-bold text-zinc-300">Trades</span><b className="text-white">{day.count}</b></div>
        {hasTrades ? (
          <>
            <div className="flex items-center justify-between"><span className="font-bold text-zinc-300">Win Rate</span><b className="text-emerald-300">{day.winRate.toFixed(1)}%</b></div>
            <div className="flex items-center justify-between"><span className="font-bold text-zinc-300">Avg RR</span><b className="text-amber-300">{day.avgRR.toFixed(2)}</b></div>
            <div className="border-t border-white/10 pt-3 text-center"><span className="text-zinc-400">Total P&L</span><div className={day.pnl >= 0 ? "font-black text-emerald-300" : "font-black text-red-300"}>{formatMoney(day.pnl)}</div></div>
          </>
        ) : <div className="py-8 text-center text-sm font-semibold text-zinc-500">No trades</div>}
      </div>
    </button>
  );
}

function StrategyStatsCard({ name, item, winRate, avgRR, pnl, onDelete }) {
  const wins = Number(item.wins || 0);
  const losses = Number(item.losses || 0);
  const breakEvens = Number(item.breakEvens || 0);
  return (
    <div className={`group relative min-h-[220px] overflow-hidden rounded-xl border bg-gradient-to-br p-5 shadow-[0_16px_45px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-fuchsia-400/70 hover:shadow-[0_0_28px_rgba(178,74,242,0.18)] ${pnl >= 0 ? "border-emerald-500/25 from-emerald-950/25 via-black to-fuchsia-950/10" : "border-red-500/25 from-red-950/25 via-black to-fuchsia-950/10"}`}>
      <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-3xl bg-fuchsia-500/10 transition group-hover:bg-fuchsia-500/16" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-xl font-black text-white">{name}</div>
          <div className="mt-1 text-xs font-bold text-zinc-500">{item.count || 0} trades</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={pnl >= 0 ? "rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300" : "rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs font-black text-red-300"}>
            {pnl >= 0 ? "Profit" : "Loss"}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete strategy "${name}"?`)) onDelete(); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400 opacity-0 transition hover:bg-red-500/25 group-hover:opacity-100"
              title="Delete strategy"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <div className={pnl >= 0 ? "relative z-10 mt-5 text-3xl font-black text-emerald-400" : "relative z-10 mt-5 text-3xl font-black text-red-400"}>{formatMoney(pnl)}</div>
      <div className="relative z-10 mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-white/10 bg-black/25 p-2"><div className="text-[10px] font-black uppercase text-zinc-500">Win</div><div className="font-black text-emerald-300">{winRate.toFixed(1)}%</div></div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-2"><div className="text-[10px] font-black uppercase text-zinc-500">Avg RR</div><div className="font-black text-amber-300">{avgRR.toFixed(2)}</div></div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-2"><div className="text-[10px] font-black uppercase text-zinc-500">W/L/BE</div><div className="font-black text-zinc-200">{wins}/{losses}/{breakEvens}</div></div>
      </div>
    </div>
  );
}

function SimpleStatsRows({ rows, empty, negative = false }) {
  if (!rows?.length) return <div className="rounded-lg border border-dashed border-white/10 bg-black/25 p-5 text-sm font-semibold text-zinc-500">{empty}</div>;
  return (
    <div className="space-y-3">
      {rows.map(([name, item]) => {
        const pnl = Number(item?.pnl || 0);
        const tone = pnl >= 0 && !negative ? "text-emerald-300" : pnl < 0 ? "text-red-300" : "text-zinc-300";
        const winRate = item?.wins || item?.losses ? (Number(item.wins || 0) / Math.max(1, Number(item.wins || 0) + Number(item.losses || 0))) * 100 : null;
        return (
          <div key={name} className="rounded-lg border border-white/10 bg-black/35 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-black text-white">{name}</div>
                <div className="mt-1 text-xs font-bold text-zinc-500">{item?.count || 0} trades{winRate !== null ? ` · ${winRate.toFixed(1)}% win rate` : ""}</div>
              </div>
              <div className={`text-lg font-black ${tone}`}>{formatMoney(pnl)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SimpleMistakeDetectorPage({ trades = [] }) {
  const allTrades = Array.isArray(trades) ? trades : [];
  const visibleTrades = allTrades;
  const detector = useMemo(() => getMistakeDetectorStats(visibleTrades), [visibleTrades]);
  const extra = useMemo(() => getDetectorEnhancements(visibleTrades, detector), [visibleTrades, detector]);
  const losses = visibleTrades.filter((trade) => Number(trade.pnl || 0) < 0);
  const mainIssue = detector.mainIssue;
  const root = detector.mainRoot;
  const focusPlan = detector.focusPlan || [];
  const topIssues = detector.issues.slice(0, 5);
  const worstSetup = extra.lossGroupsBySetup[0];
  const worstSession = extra.lossGroupsBySession[0];
  const lossSession = detector.lossProfile?.session && detector.lossProfile.session !== "No session" ? detector.lossProfile.session : null;

  // Data state flags
  const noTrades = visibleTrades.length === 0;
  const noLosses = !noTrades && losses.length === 0;
  const isSingleLoss = losses.length === 1;
  const isEarlyData = losses.length > 0 && (losses.length < 4 || (mainIssue && mainIssue.count < 2));
  const isLowConfidence = mainIssue && (detector.confidence || 0) < 50;
  const hasEnoughData = losses.length >= 3 && mainIssue && !isLowConfidence;

  // Headline wording — no invented certainty
  let headline, headlineAccent, confidenceNote;
  if (noTrades) {
    headline = "Log your first trades to generate your coach report.";
    headlineAccent = "text-zinc-500";
    confidenceNote = null;
  } else if (noLosses) {
    headline = "No losing trade patterns detected yet.";
    headlineAccent = "text-emerald-300";
    confidenceNote = "Keep logging and reviewing trades to track patterns over time.";
  } else if (!mainIssue) {
    headline = "Add more tagged losing trades for a full report.";
    headlineAccent = "text-zinc-400";
    confidenceNote = null;
  } else if (isSingleLoss) {
    headline = "Early signal: " + translateDetectorText(mainIssue.title);
    headlineAccent = "text-amber-300";
    confidenceNote = "Based on 1 losing trade. Add more tagged trades to build a stronger pattern.";
  } else if (isEarlyData || isLowConfidence) {
    headline = "Possible pattern: " + translateDetectorText(mainIssue.title);
    headlineAccent = "text-amber-200";
    confidenceNote = isLowConfidence
      ? "Low confidence — add more losing trades for a stronger pattern."
      : "Early data — add more tagged losing trades to confirm this pattern.";
  } else {
    headline = "Your #1 Costly Mistake: " + translateDetectorText(mainIssue.title);
    headlineAccent = "text-red-300";
    confidenceNote = null;
  }

  return (
    <SimplePageShell
      crumb="Mistake Detector"
      title="Your AI Coach Report"
      subtitle="A data-driven review of your losing trade patterns — what's going wrong, where it happens, what it costs, and what to do before your next session."
    >
      {/* ── Report headline ─────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-950/30 via-black to-red-950/10 px-6 py-5">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-fuchsia-400/70">
          <Target size={11} className="shrink-0" /> AI Coach Report
        </div>
        <div className={`text-2xl font-black leading-snug ${headlineAccent}`}>{headline}</div>
        {confidenceNote && (
          <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">{confidenceNote}</p>
        )}
        {mainIssue && !noLosses && (
          <p className="mt-2 text-sm font-semibold leading-6 text-zinc-400">
            {mainIssue.count} losing trade{mainIssue.count === 1 ? "" : "s"} match this pattern.
            {detector.affectedPnl ? ` Estimated cost: ${formatMoney(Math.abs(detector.affectedPnl))}.` : ""}
          </p>
        )}
      </div>

      {/* ── Summary cards ─────────────────────────────────────────── */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SimpleStatCard
          label="Affected P&L"
          value={mainIssue ? formatMoney(Math.abs(detector.affectedPnl || 0)) : "—"}
          detail={mainIssue ? "Total loss tied to this pattern" : "No pattern data yet"}
          tone="red"
        />
        <SimpleStatCard
          label="Losses Analyzed"
          value={losses.length}
          detail="Only losing trades are analyzed"
          tone="red"
        />
        <SimpleStatCard
          label="Confidence"
          value={mainIssue ? `${detector.confidence || 0}%` : "—"}
          detail={
            !mainIssue ? "Need more data" :
            (detector.confidence || 0) >= 70 ? "Strong pattern signal" :
            (detector.confidence || 0) >= 50 ? "Moderate — add more trades" :
            "Low — needs more tagged losses"
          }
          tone={(detector.confidence || 0) >= 70 ? "green" : (detector.confidence || 0) >= 50 ? "fuchsia" : "amber"}
        />
        <SimpleStatCard
          label="Root Cause"
          value={root ? translateDetectorText(root.title) : "Unknown"}
          detail="Main category behind the mistake"
          tone="amber"
        />
        <SimpleStatCard
          label="Data Quality"
          value={`${extra.dataQuality || 0}%`}
          detail="More filled fields = better analysis"
          tone={(extra.dataQuality || 0) >= 70 ? "green" : "amber"}
        />
      </div>

      {/* ── Low-data notice ───────────────────────────────────────── */}
      {losses.length > 0 && losses.length < 3 && (
        <div className="mt-5 flex gap-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/12 font-black text-amber-300">!</div>
          <div>
            <div className="font-black text-white">More data will strengthen this report.</div>
            <div className="mt-1 text-sm font-semibold leading-6 text-zinc-400">
              For best accuracy, log at least 3 losing trades and fill in: Mistake, Emotion, Entry Timing, Rule Broken, Setup Quality, Notes, and Screenshot.
            </div>
          </div>
        </div>
      )}

      {/* ── What Went Wrong + Fix Plan ────────────────────────────── */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SimplePanel title="What Went Wrong" subtitle="The main mistake pattern behind your losing trades." icon={<Target size={20} />}>
          {mainIssue ? (
            <>
              <div className="rounded-xl border border-red-500/25 bg-red-500/[0.08] p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-red-400">Main Mistake</div>
                <div className="mt-2 text-2xl font-black text-white">{translateDetectorText(mainIssue.title)}</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/8 bg-black/25 p-3">
                    <div className="text-[10px] font-black uppercase text-zinc-600">Occurrences</div>
                    <div className="mt-1 font-black text-white">{mainIssue.count} loss{mainIssue.count === 1 ? "" : "es"}</div>
                  </div>
                  <div className="rounded-lg border border-white/8 bg-black/25 p-3">
                    <div className="text-[10px] font-black uppercase text-zinc-600">Cost</div>
                    <div className="mt-1 font-black text-red-300">{formatMoney(Math.abs(mainIssue.pnl || 0))}</div>
                  </div>
                </div>
                {mainIssue.fix && (
                  <div className="mt-3 text-sm font-semibold leading-6 text-zinc-400">{translateDetectorFix(mainIssue.fix)}</div>
                )}
              </div>

              {topIssues.length > 1 && (
                <div className="mt-4 space-y-2">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">All Ranked Mistakes</div>
                  {topIssues.map((issue, index) => {
                    const pct = losses.length ? Math.round((issue.count / losses.length) * 100) : 0;
                    return (
                      <div key={issue.key} className="flex items-center gap-3 rounded-lg border border-white/8 bg-black/20 px-4 py-3">
                        <span className="w-5 shrink-0 text-xs font-black text-zinc-600">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-black text-white">{translateDetectorText(issue.title)}</div>
                          <div className="mt-0.5 text-xs font-bold text-zinc-500">
                            {issue.count} loss{issue.count === 1 ? "" : "es"} · {formatMoney(Math.abs(issue.pnl || 0))}
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[11px] font-black text-red-300">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <EmptyDetectorText
              text={
                noTrades
                  ? "Log your first trades to detect mistake patterns."
                  : noLosses
                    ? "No losing trades yet — patterns appear once you have a loss."
                    : "Add losing trades with mistake, emotion, timing, and notes to build a pattern."
              }
            />
          )}
        </SimplePanel>

        <SimplePanel title="Fix Plan" subtitle="Use these rules before, during, and after your next trade." icon={<ListChecks size={20} />}>
          {focusPlan.length ? (
            <div className="space-y-3">
              {focusPlan.slice(0, 3).map((step, index) => (
                <div key={step} className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-black">{index + 1}</div>
                  <div className="text-sm font-semibold leading-6 text-zinc-200">{step}</div>
                </div>
              ))}
              <div className="rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-xs font-semibold leading-5 text-zinc-500">
                These steps are generated from your tagged mistake and root cause data. They update as you log more trades.
              </div>
            </div>
          ) : (
            <EmptyDetectorText
              text={
                noTrades
                  ? "Log your first trades to generate a fix plan."
                  : noLosses
                    ? "A fix plan will appear once you have losing trades."
                    : "Tag mistakes and root causes on losing trades to unlock a personalized fix plan."
              }
            />
          )}
        </SimplePanel>
      </div>

      {/* ── Where It Happens ──────────────────────────────────────── */}
      <div className="mt-6">
        <SimplePanel title="Where It Happens" subtitle="Session and setup context for your losing trades.">
          {worstSetup || worstSession || lossSession ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">Worst Setup</div>
                <div className="mt-2 text-lg font-black text-white">
                  {worstSetup ? translateDetectorText(worstSetup.name) : "No setup data"}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-500">
                  {worstSetup
                    ? `${worstSetup.count} loss${worstSetup.count === 1 ? "" : "es"} · ${formatMoney(worstSetup.pnl)}`
                    : "Add setup tags to losing trades"}
                </div>
              </div>
              <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/[0.06] p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Worst Session</div>
                <div className="mt-2 text-lg font-black text-white">
                  {worstSession ? translateDetectorText(worstSession.name) : "No session data"}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-500">
                  {worstSession
                    ? `${worstSession.count} loss${worstSession.count === 1 ? "" : "es"} · ${formatMoney(worstSession.pnl)}`
                    : "Add session tags to losing trades"}
                </div>
              </div>
              {lossSession && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-red-400">Most Common Loss Session</div>
                  <div className="mt-2 text-lg font-black text-white">{lossSession}</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-500">Session that appears most in losing trades</div>
                </div>
              )}
            </div>
          ) : (
            <EmptyDetectorText text="Add more tagged trades to see where this pattern appears." />
          )}
        </SimplePanel>
      </div>

      {/* ── Improve Accuracy ──────────────────────────────────────── */}
      <div className="mt-6">
        <SimplePanel title="Improve Accuracy" subtitle="Tag these fields on losing trades to improve future reports.">
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-black text-zinc-400">Data Quality</span>
              <span className={`font-black ${(extra.dataQuality || 0) >= 70 ? "text-emerald-300" : "text-amber-300"}`}>
                {extra.dataQuality || 0}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${extra.dataQuality || 0}%` }}
              />
            </div>
          </div>
          {extra.missingTop?.length ? (
            <div className="space-y-2">
              {extra.missingTop.slice(0, 5).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-white/8 bg-black/25 px-4 py-2.5 text-sm"
                >
                  <span className="font-semibold text-zinc-300">{item.label}</span>
                  <span className="font-black text-amber-300">missing {item.count}</span>
                </div>
              ))}
              <div className="mt-2 rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-xs font-semibold leading-5 text-zinc-500">
                Tag mistakes, emotions, rule breaks, setup quality, and screenshots to improve future reports.
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] p-4 text-sm font-black text-emerald-300">
              Your important fields are filled. Keep tagging trades to maintain report accuracy.
            </div>
          )}
        </SimplePanel>
      </div>
    </SimplePageShell>
  );
}

function StatisticsPage({ stats: initialStats, curve: initialCurve, trades = [], onExport }) {
  const [statisticsTab, setStatisticsTab] = useState("Overview");
  const [strategyFilter, setStrategyFilter] = useState("All");
  const [rangeFilter, setRangeFilter] = useState("30 days");
  const allTrades = Array.isArray(trades) ? trades : [];
  const strategyOptions = ["All", ...Array.from(new Set(allTrades.map((trade) => trade.setup).filter(Boolean)))];
  const closedTrades = useMemo(() => {
    const today = new Date();
    const days = rangeFilter === "Today" ? 1 : rangeFilter === "7 days" ? 7 : rangeFilter === "30 days" ? 30 : rangeFilter === "90 days" ? 90 : null;
    return allTrades.filter((trade) => {
      const strategyMatch = strategyFilter === "All" || trade.setup === strategyFilter;
      if (!strategyMatch) return false;
      if (!days) return true;
      const date = new Date(`${getTradeDateKey(trade)}T00:00:00`);
      if (Number.isNaN(date.getTime())) return false;
      const start = new Date(today);
      start.setDate(today.getDate() - days + 1);
      start.setHours(0, 0, 0, 0);
      return date >= start && date <= today;
    });
  }, [allTrades, strategyFilter, rangeFilter]);

  const stats = useMemo(() => calculateStatistics(closedTrades), [closedTrades]);
  const curve = useMemo(() => {
    let balance = 0;
    return sortTradesChronologically(closedTrades).map((trade) => {
      balance += Number(trade.pnl || 0);
      return { date: getTradeDateKey(trade), pnl: balance, winRate: stats.winRate };
    });
  }, [closedTrades, stats.winRate]);

  const profitFactor = Number(stats.profitFactor || 0);
  const expectancy = stats.trades ? stats.totalPnl / stats.trades : 0;
  const wins = closedTrades.filter((trade) => Number(trade.pnl || 0) > 0);
  const bestTradeItem = [...closedTrades].sort((a, b) => Number(b.pnl || 0) - Number(a.pnl || 0))[0];
  const smallestWinItem = [...wins].sort((a, b) => Number(a.pnl || 0) - Number(b.pnl || 0))[0];
  const bestTrade = Number(bestTradeItem?.pnl || 0);
  const smallestWin = Number(smallestWinItem?.pnl || 0);
  const bestSession = Object.entries(stats.sessionStats || {}).sort((a, b) => Number(b[1].pnl || 0) - Number(a[1].pnl || 0))[0];
  const bestPerformance = useMemo(() => getBestPerformanceStats(closedTrades), [closedTrades]);
  const pnlValues = closedTrades.map((trade) => Number(trade.pnl || 0));
  const pnlMean = pnlValues.length ? pnlValues.reduce((sum, value) => sum + value, 0) / pnlValues.length : 0;
  const pnlStd = pnlValues.length > 1 ? Math.sqrt(pnlValues.reduce((sum, value) => sum + Math.pow(value - pnlMean, 2), 0) / (pnlValues.length - 1)) : 0;
  const riskAdjusted = pnlStd ? expectancy / pnlStd : expectancy > 0 ? 999 : 0;
  const tabs = ["Overview", "Patterns", "Strategies", "Charts", "Risk"];
  const edgeStatus = stats.trades < 5 ? "Need more data" : stats.totalPnl > 0 && profitFactor >= 1.2 && expectancy > 0 ? "Edge forming" : stats.totalPnl > 0 ? "Profitable, keep refining" : "Needs improvement";
  const edgeTone = edgeStatus === "Edge forming" || edgeStatus === "Profitable, keep refining" ? "emerald" : stats.trades < 5 ? "amber" : "red";
  const riskStatus = stats.maxDrawdownPercent <= 3 ? "Controlled" : stats.maxDrawdownPercent <= 6 ? "Moderate" : "High drawdown";
  const consistencyText = stats.trades < 5 ? "Add more trades before judging performance." : stats.winRate >= 55 && profitFactor >= 1.2 ? "Your stats are showing a positive trading profile." : profitFactor >= 1 ? "You are close. Improve win quality and reduce avoidable losses." : "Focus on reducing loss size and improving setup quality.";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="statistics-page-pro">
      <TopCrumb page="Statistics" />

      <div className="statistics-hero-pro">
        <div className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_.85fr] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-fuchsia-300">
              <span className="h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(178,74,242,.85)]" /> Performance Intelligence
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white xl:text-5xl">Statistics that actually explain your trading.</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-zinc-400">
              A clean analytics report for P&L, win rate, consistency, strategy performance, risk control and the next area to improve.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatsFlowStep number="1" title="Measure" text="Track the numbers that matter" />
              <StatsFlowStep number="2" title="Compare" text="Find your best days, sessions and setups" />
              <StatsFlowStep number="3" title="Improve" text="Use the report to trade with more discipline" />
            </div>
          </div>

          <div className="statistics-filter-pro">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Report Filters</div>
                <div className="mt-1 text-lg font-black text-white">Customize the analysis</div>
              </div>
              <span className="rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1 text-xs font-black text-fuchsia-300">Live</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Select value={strategyFilter} onChange={(e) => setStrategyFilter(e.target.value)}>{strategyOptions.map((strategy) => <option key={strategy} value={strategy}>{strategy === "All" ? "All Strategies" : strategy}</option>)}</Select>
              <Select value={rangeFilter} onChange={(e) => setRangeFilter(e.target.value)}><option>Today</option><option>7 days</option><option>30 days</option><option>90 days</option></Select>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => { setStrategyFilter("All"); setRangeFilter("30 days"); }} className="statistics-filter-btn-pro">Clear</button>
              <button onClick={() => exportTradesToCSV(closedTrades)} className="statistics-filter-btn-pro"><Download size={14} className="inline" /> CSV</button>
            </div>
          </div>
        </div>
      </div>

      <div className="statistics-status-strip-pro">
        <div><span>Strategy</span><b>{strategyFilter === "All" ? "All Strategies" : strategyFilter}</b></div>
        <div><span>Range</span><b>{rangeFilter}</b></div>
        <div><span>Trades Used</span><b>{closedTrades.length}</b></div>
        <div><span>Health</span><b>{edgeStatus}</b></div>
      </div>

      <section className="statistics-command-center-pro mt-7">
        <div className="statistics-command-main-pro">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Analytics Summary</div>
              <h2 className="mt-2 text-3xl font-black text-white">Your trading score is {Math.round(stats.score || 0)}/100</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-zinc-400">{consistencyText}</p>
            </div>
            <div className={edgeTone === "emerald" ? "stats-edge-badge stats-edge-good" : edgeTone === "amber" ? "stats-edge-badge stats-edge-warn" : "stats-edge-badge stats-edge-bad"}>{edgeStatus}</div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsHeroMetric label="Net P&L" value={formatMoney(stats.totalPnl)} detail="How much money you made or lost from the selected trades." tone={stats.totalPnl >= 0 ? "emerald" : "red"} />
            <StatsHeroMetric label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} detail="How many trades closed in profit compared to losing trades." tone="fuchsia" />
            <StatsHeroMetric label="Profit Factor" value={profitFactor >= 999 ? "Perfect" : profitFactor.toFixed(2)} detail="Above 1.00 means your winners are bigger than your losses overall." tone={profitFactor >= 1.2 ? "emerald" : profitFactor >= 1 ? "amber" : "red"} />
            <StatsHeroMetric label="Expectancy" value={formatMoney(expectancy)} detail="The average amount you can expect to make or lose per trade." tone={expectancy >= 0 ? "emerald" : "red"} />
          </div>
        </div>

        <div className="statistics-command-side-pro">
          <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Plain-English Result</div>
          <div className="mt-4 space-y-3">
            <StatsInsightCard title="System Edge" value={edgeStatus} text="This tells the user whether the strategy is currently working or needs improvement." tone={edgeTone} />
            <StatsInsightCard title="Risk Control" value={riskStatus} text={`Max drawdown is ${stats.maxDrawdownPercent.toFixed(1)}%. Smaller drawdown means the account is more stable.`} tone={riskStatus === "Controlled" ? "emerald" : riskStatus === "Moderate" ? "amber" : "red"} />
            <StatsInsightCard title="Best Session" value={bestSession?.[0] || "No session"} text={`${formatMoney(bestSession?.[1]?.pnl || 0)} net P&L from this session. This shows where performance is strongest.`} tone="fuchsia" />
          </div>
        </div>
      </section>

      <StatsBeginnerGuide />

      <div className="statistics-tabs-pro mt-7">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setStatisticsTab(tab)} className={statisticsTab === tab ? "statistics-tab-pro statistics-tab-pro-active" : "statistics-tab-pro"}>
            <span className="statistics-tab-icon-pro">{tab === "Overview" ? "▥" : tab === "Patterns" ? "◷" : tab === "Strategies" ? "◈" : tab === "Charts" ? "⌁" : "$"}</span>
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {statisticsTab === "Overview" && (
        <>
          <section className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-black/25 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <SectionTitle title="Core Performance" icon={<BarChart3 size={20} />} />
              <span className="rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1 text-xs font-black text-fuchsia-300">Main numbers</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatisticsMetricCard title="TOTAL P&L" value={formatMoney(stats.totalPnl)} sub="Net result" icon="$" tone={stats.totalPnl >= 0 ? "green" : "red"} />
              <StatisticsMetricCard title="WIN RATE" value={`${stats.winRate.toFixed(1)}%`} sub={`${stats.wins}W/${stats.losses}L${stats.breakEvens ? `/${stats.breakEvens}BE` : ""}`} icon="◎" tone="green" />
              <StatisticsMetricCard title="BREAK EVEN" value={stats.breakEvens || 0} sub={`${(stats.breakEvenRate || 0).toFixed(1)}% BE`} icon="—" tone="amber" />
              <StatisticsMetricCard title="TRADES" value={stats.trades} sub={`${stats.trades} closed`} icon="⌁" tone="white" />
              <StatisticsMetricCard title="AVG WIN" value={formatMoney(stats.avgWin)} sub="Average winner" icon="↗" tone="green" active />
              <StatisticsMetricCard title="AVG LOSS" value={formatMoney(stats.avgLoss)} sub="Average loser" icon="↘" tone="red" />
              <StatisticsMetricCard title="PROFIT FACTOR" value={profitFactor >= 999 ? "999.00" : profitFactor.toFixed(2)} sub={profitFactor >= 999 ? "Perfect" : "Gross P/L"} icon="▣" tone={profitFactor >= 1 ? "green" : "red"} />
              <StatisticsMetricCard title="MAX DRAWDOWN" value={formatMoney(stats.maxDrawdown)} sub={`${stats.maxDrawdownPercent.toFixed(1)}% DD`} icon="↓" tone={stats.maxDrawdownPercent <= 3 ? "green" : stats.maxDrawdownPercent <= 6 ? "amber" : "red"} />
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-black/25 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <SectionTitle title="Advanced Analytics" icon={<span className="text-xl">%</span>} />
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300">Quality metrics</span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <AdvancedStatCard title="EXPECTANCY" value={formatMoney(expectancy)} sub="Per trade" tone={expectancy >= 0 ? "green" : "red"} />
              <AdvancedStatCard title="RISK-ADJUSTED" value={riskAdjusted >= 999 ? "Perfect" : riskAdjusted.toFixed(2)} sub="P&L stability" tone="fuchsia" muted />
              <AdvancedStatCard title="BEST TRADE" value={formatMoney(bestTrade)} sub={bestTradeItem?.pair || "No trade"} tone="green" />
              <AdvancedStatCard title="SMALLEST WIN" value={formatMoney(smallestWin)} sub={smallestWinItem?.pair || "No win"} tone="red" />
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-black/25 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <SectionTitle title="Best Performance" gold icon={<span className="text-xl">🏆</span>} />
              <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-300">Best results</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
              <BestPerformanceCard title="BEST DAY" value={formatMoney(bestPerformance.day.pnl)} detail={bestPerformance.day.label} badge={`${bestPerformance.day.count} trades`} icon="▣" accent="amber" />
              <BestPerformanceCard title="BEST WEEK" value={formatMoney(bestPerformance.week.pnl)} detail={bestPerformance.week.label} badge={`${bestPerformance.week.count} trades`} icon="♛" accent="fuchsia" />
              <BestPerformanceCard title="BEST MONTH" value={formatMoney(bestPerformance.month.pnl)} detail={bestPerformance.month.label} badge={`${bestPerformance.month.count} trades`} icon="↗" accent="blue" />
              <BestPerformanceCard title="BEST YEAR" value={formatMoney(bestPerformance.year.pnl)} detail={bestPerformance.year.label} badge={`${bestPerformance.year.count} trades`} icon="♙" accent="green" />
              <BestPerformanceCard title="BEST SESSION" value={formatMoney(bestSession?.[1]?.pnl || 0)} detail={bestSession?.[0] || "No session"} badge={`${bestSession?.[1]?.count || 0} trades`} icon="☀" accent="cyan" />
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
            <StatisticsPerformanceTimeline curve={curve} stats={stats} />
            <StatisticsWinLossPanel stats={stats} />
          </section>
        </>
      )}

      {statisticsTab === "Patterns" && <StatisticsPatternsView stats={stats} trades={closedTrades} />}
      {statisticsTab === "Strategies" && <StatisticsStrategiesView stats={stats} />}
      {statisticsTab === "Charts" && <StatisticsChartsView stats={stats} curve={curve} trades={closedTrades} />}
      {statisticsTab === "Risk" && <StatisticsRiskView stats={stats} trades={closedTrades} />}
    </motion.div>
  );
}

function StatsFlowStep({ number, title, text }) {
  return (
    <div className="stats-flow-step-pro">
      <div className="stats-flow-number-pro">{number}</div>
      <div>
        <div className="font-black text-white">{title}</div>
        <div className="mt-1 text-xs font-semibold leading-5 text-zinc-400">{text}</div>
      </div>
    </div>
  );
}

function StatsHeroMetric({ label, value, detail, tone }) {
  const cls = tone === "emerald" ? "stats-hero-metric stats-hero-good" : tone === "red" ? "stats-hero-metric stats-hero-bad" : tone === "amber" ? "stats-hero-metric stats-hero-warn" : "stats-hero-metric stats-hero-main";
  return <div className={cls}><div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</div><div className="mt-2 text-2xl font-black text-white"><AnimatedValue value={value} /></div><div className="mt-2 text-xs font-semibold leading-5 text-zinc-400">{detail}</div></div>;
}

function StatsInsightCard({ title, value, text, tone }) {
  const cls = tone === "emerald" ? "stats-insight-card stats-insight-good" : tone === "red" ? "stats-insight-card stats-insight-bad" : tone === "amber" ? "stats-insight-card stats-insight-warn" : "stats-insight-card stats-insight-main";
  return <div className={cls}><div className="flex items-center justify-between gap-3"><div className="text-xs font-black uppercase tracking-widest text-zinc-500">{title}</div><div className="font-black text-white">{value}</div></div><div className="mt-2 text-xs font-semibold leading-5 text-zinc-400">{text}</div></div>;
}

function StatsBeginnerGuide() {
  return (
    <section className="stats-beginner-guide-pro mt-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-fuchsia-300">How to read this page</div>
          <h3 className="mt-2 text-2xl font-black text-white">Start with these 4 numbers. Everything else is deeper detail.</h3>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-zinc-400">The Statistics page is designed like a trading health report: first it shows if you are profitable, then if the system has edge, then where the performance is coming from.</p>
        </div>
        <div className="stats-reading-order-pro">
          <span>1. Net P&L</span>
          <span>2. Win Rate</span>
          <span>3. Profit Factor</span>
          <span>4. Expectancy</span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatDefinitionCard title="Net P&L" meaning="Your total money result." good="Green means profitable." bad="Red means losing." />
        <StatDefinitionCard title="Win Rate" meaning="How often your trades win." good="Higher is better." bad="But it still needs good risk/reward." />
        <StatDefinitionCard title="Profit Factor" meaning="Gross wins divided by gross losses." good="Above 1.20 is strong." bad="Below 1.00 means losses are bigger." />
        <StatDefinitionCard title="Expectancy" meaning="Average result per trade." good="Positive means each trade has value." bad="Negative means the system needs fixing." />
      </div>
    </section>
  );
}

function StatDefinitionCard({ title, meaning, good, bad }) {
  return (
    <div className="stat-definition-card-pro">
      <div className="flex items-center justify-between gap-3">
        <div className="text-lg font-black text-white">{title}</div>
        <span className="stats-help-dot-pro">?</span>
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-zinc-400">{meaning}</div>
      <div className="mt-4 grid grid-cols-1 gap-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-300">✓ {good}</div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300">! {bad}</div>
      </div>
    </div>
  );
}

function MistakeDetectorPage({ trades = [] }) {
  const [strategyFilter, setStrategyFilter] = useState("All");
  const [rangeFilter, setRangeFilter] = useState("30 days");
  const allTrades = Array.isArray(trades) ? trades : [];
  const strategyOptions = ["All", ...Array.from(new Set(allTrades.map((trade) => trade.setup).filter(Boolean)))];
  const filteredTrades = useMemo(() => {
    const today = new Date();
    const days = rangeFilter === "Today" ? 1 : rangeFilter === "7 days" ? 7 : rangeFilter === "30 days" ? 30 : rangeFilter === "90 days" ? 90 : null;
    return allTrades.filter((trade) => {
      const strategyMatch = strategyFilter === "All" || trade.setup === strategyFilter;
      if (!strategyMatch) return false;
      if (!days) return true;
      const date = new Date(`${getTradeDateKey(trade)}T00:00:00`);
      if (Number.isNaN(date.getTime())) return false;
      const start = new Date(today);
      start.setDate(today.getDate() - days + 1);
      start.setHours(0, 0, 0, 0);
      return date >= start && date <= today;
    });
  }, [allTrades, strategyFilter, rangeFilter]);

  const analyzedLosses = filteredTrades.filter((trade) => Number(trade.pnl || 0) < 0).length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mistake-page-pro">
      <TopCrumb page="Mistake Detector" />

      <div className="mistake-page-header-pro">
        <div>
          <div className="flex items-center gap-3">
            <span className="mistake-page-icon-pro"><Target size={22} /></span>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white">Mistake Detector</h1>
              <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-zinc-400">A clean trading coach report that shows your biggest mistake, the reason behind it, and the rule to follow on your next trade.</p>
            </div>
          </div>
        </div>

        <div className="mistake-filter-card-pro">
          <div className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">Report Filters</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Select value={strategyFilter} onChange={(e) => setStrategyFilter(e.target.value)}>{strategyOptions.map((strategy) => <option key={strategy} value={strategy}>{strategy === "All" ? "All Strategies" : strategy}</option>)}</Select>
            <Select value={rangeFilter} onChange={(e) => setRangeFilter(e.target.value)}><option>Today</option><option>7 days</option><option>30 days</option><option>90 days</option></Select>
            <button onClick={() => { setStrategyFilter("All"); setRangeFilter("30 days"); }} className="mistake-clear-btn-pro">Clear</button>
          </div>
        </div>
      </div>

      <div className="mistake-status-strip-pro">
        <div>
          <span className="text-zinc-500">Strategy</span>
          <b>{strategyFilter === "All" ? "All Strategies" : strategyFilter}</b>
        </div>
        <div>
          <span className="text-zinc-500">Range</span>
          <b>{rangeFilter}</b>
        </div>
        <div>
          <span className="text-zinc-500">Analyzed Losses</span>
          <b>{analyzedLosses}</b>
        </div>
        <div>
          <span className="text-zinc-500">Purpose</span>
          <b>Find → Understand → Fix</b>
        </div>
      </div>

      <MistakeDetector trades={filteredTrades} />
    </motion.div>
  );
}

function MistakeDetector({ trades = [] }) {
  const detector = getMistakeDetectorStats(trades);
  const extra = getDetectorEnhancements(trades, detector);
  const [selectedIssueKey, setSelectedIssueKey] = useState(null);
  const selectedIssue = detector.issues.find((issue) => issue.key === selectedIssueKey);
  const main = selectedIssue || detector.mainIssue;
  const selectedRoot = detector.roots.find((root) => root.issues.includes(main?.title)) || detector.mainRoot;
  const selectedFocusPlan = selectedRoot ? buildFocusPlan(selectedRoot.key, main?.title) : detector.focusPlan;
  const selectedAffectedPnl = main ? main.pnl : detector.affectedPnl;
  const topIssues = detector.issues.slice(0, 5);
  const worstSetup = extra.lossGroupsBySetup[0];
  const worstSession = extra.lossGroupsBySession[0];
  const mainProblem = main ? translateDetectorText(main.title) : "No clear mistake yet";
  const rootCause = translateDetectorText(selectedRoot?.title || main?.type || "Not enough data");
  const hasEnoughData = detector.losses.length >= 3;
  const nextRule = selectedFocusPlan[0] || "Log more losing trades with mistake, emotion, timing and notes.";

  return (
    <section className="mistake-detector-clean mt-8 space-y-6">
      <div className="mistake-coach-hero">
        <div className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_.85fr] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-fuchsia-300">
              <span className="h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(178,74,242,.85)]" /> AI Trading Coach
            </div>
            <h2 className="mt-4 text-3xl font-black text-white xl:text-5xl">Your mistake report, simplified.</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-zinc-400">
              This page explains what is going wrong, why it is happening, how much it costs, and exactly what to do before the next trade.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <CoachFlowStep number="1" title="Find" text="Your biggest losing pattern" />
              <CoachFlowStep number="2" title="Understand" text="The root cause and cost" />
              <CoachFlowStep number="3" title="Fix" text="Clear rules for the next trade" />
            </div>
          </div>
          <div className="coach-summary-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Coach Summary</div>
                <div className="mt-2 text-2xl font-black text-white">{mainProblem}</div>
              </div>
              <span className={extra.severity >= 75 ? "coach-risk-badge coach-risk-high" : extra.severity >= 45 ? "coach-risk-badge coach-risk-medium" : "coach-risk-badge coach-risk-low"}>{extra.severityLabel}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniCoachMetric label="Root Cause" value={rootCause} />
              <MiniCoachMetric label="Lost P&L" value={formatMoney(selectedAffectedPnl)} danger />
              <MiniCoachMetric label="Confidence" value={`${detector.confidence}%`} />
              <MiniCoachMetric label="Data Quality" value={`${extra.dataQuality}%`} />
            </div>
            <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-emerald-300">Next Trade Rule</div>
              <div className="mt-2 text-sm font-semibold leading-6 text-zinc-300">{nextRule}</div>
            </div>
          </div>
        </div>
      </div>

      {!hasEnoughData && (
        <div className="mistake-help-banner">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xl text-amber-300">!</div>
          <div>
            <div className="font-black text-white">Detector will become stronger with more losing trades.</div>
            <div className="mt-1 text-sm font-semibold leading-6 text-zinc-400">For best accuracy, add at least 3 losing trades and fill these fields: Mistake, Emotion, Entry Timing, Rule Broken, Setup Quality, Notes, and Screenshot.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReasonCard label="Main Problem" value={mainProblem} detail={main ? `${main.count} losing trade${main.count === 1 ? "" : "s"} affected` : "Add losing trades to detect patterns"} tone="red" />
        <ReasonCard label="Root Cause" value={rootCause} detail="The main category behind the mistake" tone="amber" />
        <ReasonCard label="Lost P&L" value={formatMoney(selectedAffectedPnl)} detail="Money connected to the selected pattern" tone="red" />
        <ReasonCard label="Most Expensive" value={extra.mostExpensive ? translateDetectorText(extra.mostExpensive.title) : "No data yet"} detail={extra.mostExpensive ? formatMoney(extra.mostExpensive.pnl) : "Needs more history"} tone="fuchsia" />
      </div>

      <div className="mistake-page-divider-pro"><span>Start here</span></div>

      <div className="mistake-guide-panel">
        <div className="mistake-guide-head">
          <div>
            <div className="mistake-eyebrow text-fuchsia-300">How to use this page</div>
            <h3 className="mt-1 text-xl font-black text-white">Read it from left to right: diagnose the problem, then follow the fix plan.</h3>
          </div>
          <span className="mistake-badge-cyan">Simple Guide</span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <GuideMiniCard title="Confidence" text="Shows how often this mistake appears inside your losing trades." />
          <GuideMiniCard title="Risk Level" text="Combines frequency, lost P&L, and how dangerous the mistake is." />
          <GuideMiniCard title="Data Quality" text="Shows how complete your journal data is. More detail means better analysis." />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[.95fr_1.05fr]">
        <div className="mistake-panel-clean">
          <div className="mistake-panel-head">
            <div>
              <div className="mistake-eyebrow text-red-300">Step 1 · Diagnosis</div>
              <h3 className="mt-1 text-2xl font-black text-white">What went wrong?</h3>
              <p className="mt-1 text-sm font-semibold text-zinc-500">Click a mistake below to update the coach plan on the right.</p>
            </div>
            <span className="mistake-badge-red">Problem Map</span>
          </div>

          <div className="mt-5 space-y-3">
            {topIssues.length ? topIssues.map((issue, index) => (
              <IssueSelectorCard
                key={issue.key}
                index={index + 1}
                issue={issue}
                active={main?.key === issue.key}
                losses={detector.losses.length}
                onClick={() => setSelectedIssueKey(issue.key)}
              />
            )) : <EmptyDetectorText text="No losing pattern yet. Add losing trades with mistake, emotion, timing, rule broken and notes." />}
          </div>
        </div>

        <div className="mistake-panel-clean mistake-fix-panel">
          <div className="mistake-panel-head">
            <div>
              <div className="mistake-eyebrow text-emerald-300">Step 2 · Correction</div>
              <h3 className="mt-1 text-2xl font-black text-white">How to fix it?</h3>
              <p className="mt-1 text-sm font-semibold text-zinc-500">Use these as rules before, during and after your next trade.</p>
            </div>
            <span className="mistake-badge-green">Action Plan</span>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-black/25 to-fuchsia-500/5 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Active focus</div>
                <div className="mt-1 text-xl font-black text-white">{mainProblem}</div>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-300">{extra.severityLabel}</div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <FixStepCard index="Before" text={selectedFocusPlan[0] || "Wait for a complete setup before entry."} />
              <FixStepCard index="During" text={selectedFocusPlan[1] || "Do not change risk after entry."} />
              <FixStepCard index="After" text={selectedFocusPlan[2] || "Review the trade before taking the next setup."} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormulaBox title="Best Conditions" text={extra.winningFormula} tone="emerald" />
            <FormulaBox title="Worst Conditions" text={extra.losingFormula} tone="red" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="mistake-panel-clean">
          <div className="mistake-panel-head">
            <div>
              <div className="mistake-eyebrow text-amber-300">Step 3 · Location</div>
              <h3 className="mt-1 text-lg font-black text-white">Where you lose most</h3>
              <p className="mt-1 text-xs font-semibold text-zinc-500">Shows the setup and session with the highest loss impact.</p>
            </div>
            <span className="mistake-badge-amber">Map</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-amber-300">Worst Setup</div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="font-black text-white">{worstSetup ? translateDetectorText(worstSetup.name) : "No setup pattern"}</span>
                <span className="font-black text-amber-300">{worstSetup ? formatMoney(worstSetup.pnl) : formatMoney(0)}</span>
              </div>
              <div className="mt-2 text-xs font-bold text-zinc-500">{worstSetup ? `${worstSetup.count} losing trade${worstSetup.count === 1 ? "" : "s"}` : "Needs more data"}</div>
            </div>
            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-cyan-300">Worst Session</div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="font-black text-white">{worstSession ? translateDetectorText(worstSession.name) : "No session pattern"}</span>
                <span className="font-black text-cyan-300">{worstSession ? formatMoney(worstSession.pnl) : formatMoney(0)}</span>
              </div>
              <div className="mt-2 text-xs font-bold text-zinc-500">{worstSession ? `${worstSession.count} losing trade${worstSession.count === 1 ? "" : "s"}` : "Needs more data"}</div>
            </div>
          </div>
        </div>

        <div className="mistake-panel-clean">
          <div className="mistake-panel-head">
            <div>
              <div className="mistake-eyebrow text-red-300">Step 4 · Behavior</div>
              <h3 className="mt-1 text-lg font-black text-white">Danger Habits</h3>
              <p className="mt-1 text-xs font-semibold text-zinc-500">Warns you about revenge trading, overtrading and loss streaks.</p>
            </div>
            <span className="mistake-badge-red">Risk</span>
          </div>
          <div className="mt-4 space-y-3">
            {extra.antiPatterns.length ? extra.antiPatterns.slice(0, 3).map((warning) => <WarningCleanCard key={warning.title} warning={warning} />) : <EmptyDetectorText text="No dangerous habit detected yet. Keep logging trades to monitor behavior." />}
          </div>
        </div>

        <div className="mistake-panel-clean">
          <div className="mistake-panel-head">
            <div>
              <div className="mistake-eyebrow text-cyan-300">Step 5 · Accuracy</div>
              <h3 className="mt-1 text-lg font-black text-white">Detector Accuracy</h3>
              <p className="mt-1 text-xs font-semibold text-zinc-500">Shows whether your trade data is complete enough for a reliable report.</p>
            </div>
            <span className="mistake-badge-cyan">Quality</span>
          </div>
          <div className="mt-4 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-widest text-cyan-300">Data Quality</span><span className="text-2xl font-black text-cyan-300">{extra.dataQuality}%</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-900"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-300" style={{ width: `${extra.dataQuality}%` }} /></div>
          </div>
          <div className="mt-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-semibold leading-6 text-zinc-300">{extra.timelineText}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {extra.missingTop.length ? extra.missingTop.slice(0, 3).map((item) => <span key={item.key} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-black text-cyan-200">{item.label}: missing {item.count}</span>) : <span className="text-sm font-bold text-emerald-300">All important fields are filled.</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

function CoachFlowStep({ number, title, text }) {
  return (
    <div className="coach-flow-step">
      <div className="coach-flow-number">{number}</div>
      <div>
        <div className="font-black text-white">{title}</div>
        <div className="mt-1 text-xs font-semibold leading-5 text-zinc-400">{text}</div>
      </div>
    </div>
  );
}

function MiniCoachMetric({ label, value, danger }) {
  return (
    <div className={danger ? "mini-coach-metric mini-coach-danger" : "mini-coach-metric"}>
      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
    </div>
  );
}

function GuideMiniCard({ title, text }) {
  return <div className="guide-mini-card"><div className="font-black text-white">{title}</div><div className="mt-1 text-xs font-semibold leading-5 text-zinc-400">{text}</div></div>;
}

function DetectorCleanStat({ label, value, tone }) {
  const color = tone === "red" ? "text-red-300 border-red-500/25 bg-red-500/10" : tone === "amber" ? "text-amber-300 border-amber-500/25 bg-amber-500/10" : tone === "cyan" ? "text-cyan-300 border-cyan-500/25 bg-cyan-500/10" : "text-fuchsia-300 border-fuchsia-500/25 bg-fuchsia-500/10";
  return <div className={`rounded-2xl border px-4 py-3 text-center ${color}`}><div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</div><div className="mt-1 text-xl font-black">{value}</div></div>;
}

function ReasonCard({ label, value, detail, tone }) {
  const color = tone === "red" ? "border-red-500/25 bg-red-500/10 text-red-300" : tone === "amber" ? "border-amber-500/25 bg-amber-500/10 text-amber-300" : "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300";
  return <div className={`rounded-2xl border p-4 ${color}`}><div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</div><div className="mt-2 line-clamp-2 text-xl font-black text-white">{value}</div><div className="mt-2 text-xs font-bold text-zinc-400">{detail}</div></div>;
}

function IssueSelectorCard({ index, issue, active, losses, onClick }) {
  const percent = losses ? Math.round((issue.count / losses) * 100) : 0;
  return (
    <button type="button" onClick={onClick} className={active ? "issue-clean-card issue-clean-card-active" : "issue-clean-card"}>
      <div className="flex items-start gap-3">
        <div className="issue-clean-number">{index}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-black text-white">{translateDetectorText(issue.title)}</div>
              <div className="mt-1 text-xs font-bold text-zinc-400">{translateDetectorText(issue.type)} · {issue.count} loss · {formatMoney(issue.pnl)}</div>
            </div>
            <span className="rounded-full border border-red-400/25 bg-red-500/10 px-2.5 py-1 text-[11px] font-black text-red-300">{percent}%</span>
          </div>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs font-semibold leading-5 text-zinc-300"><b className="text-emerald-300">Fix:</b> {translateDetectorFix(issue.fix)}</div>
        </div>
      </div>
    </button>
  );
}

function FixStepCard({ index, text }) {
  return <div className="fix-step-card"><div className="fix-step-number">{index}</div><div className="text-sm font-semibold leading-6 text-zinc-300">{text}</div></div>;
}

function WarningCleanCard({ warning }) {
  return <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4"><div className="font-black text-red-300">{warning.title}</div><div className="mt-1 text-sm font-semibold leading-6 text-zinc-300">{warning.text}</div></div>;
}

function getDetectorPillExplanation(label) {
  const map = {
    Losses: "How many losing trades the detector analyzed.",
    Confidence: "How often the main mistake appears in your losing trades. A higher percentage means the pattern is more obvious.",
    Severity: "How dangerous the mistake is from 0 to 100. It considers frequency, lost P&L, and risk/discipline/psychology impact.",
    Data: "How complete your trade journal data is. Higher data quality means more reliable analysis.",
  };
  return map[label] || "Detector metric.";
}

function DetectorPill({ label, value, tone }) {
  const styles = {
    red: "border-red-500/25 bg-red-500/10 text-red-300",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    fuchsia: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300",
    cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
  };
  const labelMap = { Losses: "Losses", Confidence: "Confidence", Severity: "Severity", Data: "Data" };
  return (
    <div className={`group relative rounded-2xl border px-4 py-3 ${styles[tone] || styles.fuchsia}`}>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {labelMap[label] || label}
        {label !== "Losses" && <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/15 bg-black/35 text-[10px] text-zinc-300">?</span>}
      </div>
      <div className="mt-1 text-lg font-black">{value}</div>
      <div className="pointer-events-none absolute right-0 top-full z-50 mt-2 hidden w-72 rounded-xl border border-white/15 bg-[#050005] p-3 text-left text-xs font-semibold leading-5 text-zinc-300 shadow-[0_18px_45px_rgba(0,0,0,0.9)] group-hover:block">
        <div className="mb-1 font-black text-white">{labelMap[label] || label} რას ნიშნავს?</div>
        {getDetectorPillExplanation(label)}
      </div>
    </div>
  );
}

function DetectorMetricGuide() {
  return (
    <details className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm">
      <summary className="cursor-pointer select-none text-xs font-black uppercase tracking-widest text-fuchsia-300">Metric guide · click to learn what each metric means</summary>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3"><b className="text-amber-300">Confidence</b><p className="mt-1 text-xs font-semibold leading-5 text-zinc-400">How often the main mistake appears in losing trades.</p></div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3"><b className="text-red-300">Severity</b><p className="mt-1 text-xs font-semibold leading-5 text-zinc-400">Mistake danger based on frequency, lost P&L, risk, discipline and psychology.</p></div>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3"><b className="text-cyan-300">Data</b><p className="mt-1 text-xs font-semibold leading-5 text-zinc-400">How complete your trade journal fields are.</p></div>
      </div>
    </details>
  );
}

function DetectorStepCard({ number, title, value, detail, explanation, tone }) {
  const color = tone === "red" ? "border-red-400/25 bg-gradient-to-br from-red-500/14 to-black/35 text-red-300" : tone === "amber" ? "border-amber-400/25 bg-gradient-to-br from-amber-500/14 to-black/35 text-amber-300" : "border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-500/14 to-black/35 text-fuchsia-300";
  return (
    <div className={`group relative overflow-hidden rounded-2xl border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-red-300/55 ${color}`}>
      <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-bl-3xl bg-white/5" />
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{number} · {title}</div>
        {explanation && <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/35 text-[11px] font-black text-zinc-300">?</span>}
      </div>
      <div className="relative z-10 mt-2 line-clamp-2 text-xl font-black text-white">{value}</div>
      <div className="relative z-10 mt-2 line-clamp-2 text-xs font-bold text-zinc-400">{detail}</div>
      {explanation && <div className="relative z-10 mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs font-semibold leading-5 text-zinc-300"><span className="font-black text-red-200">Meaning: </span>{explanation}</div>}
    </div>
  );
}

function CompactPanel({ title, badge, children }) {
  const toneMap = {
    "Top შეცდომები": "red",
    "Anti-Pattern Warning": "red",
    "Winning vs Losing Formula": "mixed",
    "Setup / Session Map": "amber",
    "Data Quality & Timeline": "cyan",
  };
  const tone = toneMap[title] || "fuchsia";
  const styles = {
    red: {
      panel: "relative overflow-hidden rounded-[2rem] border border-red-500/45 bg-gradient-to-br from-[#1a0505] via-black to-[#160202] p-5 shadow-[0_0_42px_rgba(239,68,68,0.20),0_20px_65px_rgba(239,68,68,0.12)]",
      glow: "bg-red-500/18",
      line: "via-red-300/80",
      badge: "rounded-full border border-red-400/45 bg-red-500/14 px-3 py-1 text-[11px] font-black text-red-100 shadow-[0_0_18px_rgba(239,68,68,0.18)]",
    },
    mixed: {
      panel: "relative overflow-hidden rounded-[2rem] border border-emerald-500/30 bg-gradient-to-br from-[#06150d] via-black to-[#180505] p-5 shadow-[0_0_34px_rgba(16,185,129,0.10),0_20px_55px_rgba(239,68,68,0.08)]",
      glow: "bg-emerald-500/14",
      line: "via-emerald-300/70",
      badge: "rounded-full border border-emerald-400/35 bg-emerald-500/12 px-3 py-1 text-[11px] font-black text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.12)]",
    },
    amber: {
      panel: "relative overflow-hidden rounded-[2rem] border border-amber-500/35 bg-gradient-to-br from-[#180f04] via-black to-[#041015] p-5 shadow-[0_0_34px_rgba(245,158,11,0.12),0_20px_55px_rgba(6,182,212,0.08)]",
      glow: "bg-amber-500/14",
      line: "via-amber-300/70",
      badge: "rounded-full border border-amber-400/35 bg-amber-500/12 px-3 py-1 text-[11px] font-black text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.12)]",
    },
    cyan: {
      panel: "relative overflow-hidden rounded-[2rem] border border-cyan-500/35 bg-gradient-to-br from-[#041015] via-black to-[#04150d] p-5 shadow-[0_0_34px_rgba(6,182,212,0.12),0_20px_55px_rgba(16,185,129,0.08)]",
      glow: "bg-cyan-500/14",
      line: "via-cyan-300/70",
      badge: "rounded-full border border-cyan-400/35 bg-cyan-500/12 px-3 py-1 text-[11px] font-black text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.12)]",
    },
    fuchsia: {
      panel: "relative overflow-hidden rounded-[2rem] border border-fuchsia-500/25 bg-gradient-to-br from-[#0a0310] via-black to-[#180723] p-5 shadow-[0_20px_65px_rgba(178,74,242,0.10)]",
      glow: "bg-fuchsia-500/14",
      line: "via-fuchsia-300/70",
      badge: "rounded-full border border-fuchsia-400/30 bg-fuchsia-500/12 px-3 py-1 text-[11px] font-black text-fuchsia-200 shadow-[0_0_14px_rgba(178,74,242,0.12)]",
    },
  };
  const s = styles[tone] || styles.fuchsia;
  return <div className={s.panel}><div className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full ${s.glow} blur-3xl`} /><div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${s.line} to-transparent`} /><div className="relative z-10 mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-black text-white">{title}</h3><span className={s.badge}>{badge}</span></div><div className="relative z-10 space-y-3">{children}</div></div>;
}

function CompactIssueRow({ index, title, meta, fix, percent, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "group relative w-full overflow-hidden rounded-[1.4rem] border border-red-300/80 bg-gradient-to-br from-red-500/28 via-red-950/35 to-black p-4 text-left shadow-[0_0_36px_rgba(239,68,68,0.28)] transition hover:-translate-y-0.5 hover:border-red-200" : "group relative w-full overflow-hidden rounded-[1.4rem] border border-red-500/25 bg-gradient-to-br from-red-950/22 via-black/70 to-red-950/10 p-4 text-left transition hover:-translate-y-0.5 hover:border-red-400/70 hover:bg-red-500/10 hover:shadow-[0_0_28px_rgba(239,68,68,0.18)]"}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-[2rem] bg-red-500/10" />
      <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-red-500/10 blur-2xl" />
      {active && <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-200 to-transparent" />}
      <div className="relative z-10 flex items-start gap-3">
        <div className={active ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-200/70 bg-gradient-to-br from-red-400 to-red-700 text-sm font-black text-white shadow-[0_0_24px_rgba(239,68,68,0.42)]" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-400/35 bg-red-500/12 text-sm font-black text-red-200 transition group-hover:border-red-300/80 group-hover:bg-red-500/22"}>{index}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-black text-white">{title}</div>
              <div className="mt-1 text-xs font-bold text-red-200/60">{meta}</div>
            </div>
            <span className={active ? "rounded-full border border-red-200/45 bg-red-500/25 px-2.5 py-1 text-[11px] font-black text-red-50" : "rounded-full border border-red-400/30 bg-red-500/12 px-2.5 py-1 text-[11px] font-black text-red-200"}>{percent}%</span>
          </div>
          <div className="mt-3 rounded-xl border border-red-400/20 bg-red-500/[0.08] p-3 text-xs font-semibold leading-5 text-zinc-300"><span className="font-black text-red-300">Fix: </span>{fix}</div>
          <div className={active ? "mt-3 rounded-xl border border-red-300/45 bg-gradient-to-r from-red-500/22 to-red-950/20 px-3 py-2 text-center text-[11px] font-black uppercase tracking-wider text-red-50" : "mt-3 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-center text-[11px] font-black uppercase tracking-wider text-red-200 transition group-hover:bg-red-500/18"}>
            {active ? "✓ Selected — analysis is focused on this mistake" : "Click to focus this mistake →"}
          </div>
        </div>
      </div>
    </button>
  );
}

function FormulaBox({ title, text, tone }) {
  const isWinning = tone === "emerald";
  const cls = isWinning
    ? "border-emerald-400/35 bg-gradient-to-br from-emerald-500/16 via-black/35 to-emerald-950/25 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.14)]"
    : "border-red-500/35 bg-gradient-to-br from-red-500/16 via-black/35 to-red-950/25 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.14)]";
  const dotClass = isWinning ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" : "bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]";
  return <div className={`w-full rounded-xl border p-4 ${cls}`}><div className="flex items-center gap-2 font-black"><span className={`h-2 w-2 rounded-full ${dotClass}`} />{title}</div><div className="mt-2 text-sm font-semibold leading-6 text-zinc-300">{text}</div></div>;
}

function MiniGroupList({ title, rows }) {
  const isSetup = title === "Setup";
  const panelClass = isSetup
    ? "rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/12 via-black/35 to-red-950/15 p-4 shadow-[0_0_18px_rgba(245,158,11,0.10)]"
    : "rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/12 via-black/35 to-red-950/15 p-4 shadow-[0_0_18px_rgba(6,182,212,0.10)]";
  const titleClass = isSetup ? "text-amber-300" : "text-cyan-300";
  const valueClass = isSetup ? "text-amber-300" : "text-cyan-300";
  const rowBorder = isSetup ? "border-amber-400/20" : "border-cyan-400/20";
  return <div className={panelClass}><div className={`mb-3 text-xs font-black uppercase tracking-widest ${titleClass}`}>{title}</div>{rows.length ? rows.map((row) => <div key={`${title}-${row.name}`} className={`mb-2 flex w-full items-center justify-between gap-3 rounded-lg border ${rowBorder} bg-black/25 px-3 py-2 text-left text-sm`}><span className="font-bold text-white">{translateDetectorText(row.name)}</span><span className={`font-black ${valueClass}`}>{formatMoney(row.pnl)}</span></div>) : <div className="text-sm text-zinc-500">No pattern yet.</div>}</div>;
}

function EmptyDetectorText({ text }) {
  return <div className="rounded-xl border border-dashed border-white/10 bg-black/25 p-5 text-center text-sm font-semibold text-zinc-500">{text}</div>;
}

function DetectorProfile({ title, profile, tone }) {
  const cls = tone === "emerald" ? "border-emerald-500/25 bg-emerald-500/10" : "border-red-500/25 bg-red-500/10";
  return <div className={`rounded-xl border p-4 ${cls}`}><div className="font-black text-white">{title}</div><div className="mt-3 space-y-2 text-sm text-zinc-300"><div>Emotion: <b>{translateDetectorText(profile.emotion)}</b></div><div>Timing: <b>{translateDetectorText(profile.timing)}</b></div><div>Setup: <b>{translateDetectorText(profile.setup)}</b></div><div>Session: <b>{translateDetectorText(profile.session)}</b></div></div></div>;
}

function getDetectorEnhancements(trades = [], detector = {}) {
  const safe = Array.isArray(trades) ? trades : [];
  const losses = safe.filter((trade) => Number(trade.pnl || 0) < 0);
  const ordered = sortTradesChronologically(safe);
  const requiredFields = ["mistake", "emotion", "entryTiming", "confirmation", "ruleBroken", "marketCondition", "setupQuality", "ruleFollowed", "entryQuality", "exitQuality"];
  const totalChecks = Math.max(1, safe.length * requiredFields.length);
  let filledChecks = 0;
  const missingMap = {};

  safe.forEach((trade) => {
    requiredFields.forEach((field) => {
      const value = trade?.[field];
      const missing = value === undefined || value === null || value === "" || String(value).startsWith("Select");
      if (missing) missingMap[field] = (missingMap[field] || 0) + 1;
      else filledChecks += 1;
    });
    if (!normalizeScreenshots(trade).length) missingMap.screenshots = (missingMap.screenshots || 0) + 1;
    if (!String(trade.notes || "").trim()) missingMap.notes = (missingMap.notes || 0) + 1;
  });

  const dataQuality = Math.round((filledChecks / totalChecks) * 100);
  const mostExpensive = [...(detector.issues || [])].sort((a, b) => Number(a.pnl || 0) - Number(b.pnl || 0))[0] || null;
  const totalLossAbs = Math.max(1, Math.abs(losses.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0)));
  const severity = detector.mainIssue ? Math.min(100, Math.round((detector.confidence || 0) * 0.45 + (Math.abs(detector.affectedPnl || 0) / totalLossAbs) * 35 + (["Risk", "Discipline", "Psychology"].includes(detector.mainRoot?.key) ? 20 : 8))) : 0;
  const severityLabel = severity >= 75 ? "High Risk" : severity >= 45 ? "Medium Risk" : "Low Risk";

  const winningFormula = `Session: ${translateDetectorText(detector.winProfile?.session)} • Timing: ${translateDetectorText(detector.winProfile?.timing)} • Emotion: ${translateDetectorText(detector.winProfile?.emotion)} • Setup: ${translateDetectorText(detector.winProfile?.setup)}`;
  const losingFormula = `Session: ${translateDetectorText(detector.lossProfile?.session)} • Timing: ${translateDetectorText(detector.lossProfile?.timing)} • Emotion: ${translateDetectorText(detector.lossProfile?.emotion)} • Setup: ${translateDetectorText(detector.lossProfile?.setup)}`;

  const lossGroupsBySetup = groupLossesByKey(losses, "setup").slice(0, 4);
  const lossGroupsBySession = groupLossesByKey(losses, "session").slice(0, 4);
  const last10 = ordered.slice(-10);
  const previous10 = ordered.slice(-20, -10);
  const lastLossRate = last10.length ? (last10.filter((trade) => Number(trade.pnl || 0) < 0).length / last10.length) * 100 : 0;
  const previousLossRate = previous10.length ? (previous10.filter((trade) => Number(trade.pnl || 0) < 0).length / previous10.length) * 100 : 0;
  const timelineChange = previous10.length ? Math.round(previousLossRate - lastLossRate) : 0;
  const timelineText = previous10.length ? (timelineChange > 0 ? `Loss rate improved by ${timelineChange}% in the last 10 trades.` : timelineChange < 0 ? `Loss rate worsened by ${Math.abs(timelineChange)}% in the last 10 trades.` : "Loss rate is unchanged in the last 10 trades.") : "At least 20 trades are needed to calculate a trend.";

  const antiPatterns = detectAntiPatterns(ordered);
  const missingTop = Object.entries(missingMap).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([key, count]) => ({ key, label: translateDataField(key), count }));

  return { dataQuality, missingTop, mostExpensive, severity, severityLabel, winningFormula, losingFormula, lossGroupsBySetup, lossGroupsBySession, timelineText, timelineChange, antiPatterns };
}

function groupLossesByKey(losses = [], key) {
  const groups = losses.reduce((output, trade) => {
    const name = trade?.[key] || "Unknown";
    if (!output[name]) output[name] = [];
    output[name].push(trade);
    return output;
  }, {});
  return Object.entries(groups).map(([name, rows]) => {
    const stats = getMistakeDetectorStats(rows);
    return { name, count: rows.length, pnl: rows.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0), top: stats.mainIssue?.title || "No issue detected" };
  }).sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
}

function detectAntiPatterns(ordered = []) {
  const warnings = [];
  let currentLossStreak = 0;
  let maxLossStreak = 0;
  ordered.forEach((trade) => {
    const pnl = Number(trade.pnl || 0);
    if (pnl < 0) currentLossStreak += 1;
    else if (pnl > 0) currentLossStreak = 0;
    maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
  });
  if (maxLossStreak >= 2) warnings.push({ title: "Loss streak pattern", text: `Detected ${maxLossStreak} losses in a row. Use a pause rule after 2 losses.` });

  const grouped = groupTradesByDate(ordered);
  Object.entries(grouped).forEach(([date, rows]) => {
    const dayLosses = rows.filter((trade) => Number(trade.pnl || 0) < 0).length;
    if (rows.length >= 4 && dayLosses >= 2) warnings.push({ title: "Overtrading risk", text: `${date} had ${rows.length} trades and ${dayLosses} losses. Execution quality may be dropping later in the day.` });
  });

  ordered.forEach((trade, index) => {
    const previous = ordered[index - 1];
    if (!previous) return;
    const previousLoss = Number(previous.pnl || 0) < 0;
    const sameDay = getTradeDateKey(previous) === getTradeDateKey(trade);
    const riskIncreased = Number(trade.risk || 0) > Number(previous.risk || 0);
    if (previousLoss && sameDay && riskIncreased) warnings.push({ title: "Possible revenge risk", text: "Risk increased on the same day after a loss. This looks like a revenge/overrisk pattern." });
  });

  const emotional = ordered.filter((trade) => ["FOMO", "Revenge", "Greedy"].includes(trade.emotion) && Number(trade.pnl || 0) < 0).length;
  if (emotional >= 2) warnings.push({ title: "Emotional loss pattern", text: `${emotional} losses are connected to FOMO/Revenge/Greedy emotions.` });
  return warnings.slice(0, 4);
}

function translateDataField(key) {
  const map = { mistake: "Mistake", emotion: "Emotion", entryTiming: "Entry Timing", confirmation: "Confirmation", ruleBroken: "Rule Broken", marketCondition: "Market Condition", setupQuality: "Setup Quality", ruleFollowed: "Rule Followed", entryQuality: "Entry Quality", exitQuality: "Exit Quality", screenshots: "Screenshots", notes: "Notes" };
  return map[key] || key;
}

function DetectorEnhancementPanel({ trades, detector }) {
  const extra = getDetectorEnhancements(trades, detector);
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
      <div className="rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/10 p-5">
        <SectionTitle title="Weekly Focus / Next Trade Rules" icon={<Target size={18} />} />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {detector.focusPlan.map((rule, index) => (
            <div key={rule} className="rounded-xl border border-white/10 bg-black/35 p-4">
              <div className="text-xs font-black text-fuchsia-300">Rule {index + 1}</div>
              <div className="mt-2 text-sm font-semibold text-zinc-300">{rule}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-5">
        <SectionTitle title="Severity & Most Expensive Mistake" icon={<span className="text-lg">!</span>} />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/35 p-4">
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Severity</div>
            <div className="mt-2 text-3xl font-black text-red-300">{extra.severity}/100</div>
            <div className="mt-1 text-sm font-bold text-zinc-400">{extra.severityLabel}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-4">
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Most expensive mistake</div>
            <div className="mt-2 text-xl font-black text-white">{extra.mostExpensive ? translateDetectorText(extra.mostExpensive.title) : "ჯერ არ ჩანს"}</div>
            <div className="mt-1 text-sm font-bold text-red-300">{extra.mostExpensive ? formatMoney(extra.mostExpensive.pnl) : formatMoney(0)}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
        <SectionTitle title="Winning Formula vs Losing Formula" icon={<BarChart3 size={18} />} />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/20 bg-black/35 p-4"><div className="font-black text-emerald-300">Winning Formula</div><div className="mt-2 text-sm font-semibold text-zinc-300">{extra.winningFormula}</div></div>
          <div className="rounded-xl border border-red-500/20 bg-black/35 p-4"><div className="font-black text-red-300">Losing Formula</div><div className="mt-2 text-sm font-semibold text-zinc-300">{extra.losingFormula}</div></div>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-5">
        <SectionTitle title="Data Quality Score" icon={<ListChecks size={18} />} />
        <div className="mt-4 flex items-center gap-5">
          <div className="text-5xl font-black text-cyan-300">{extra.dataQuality}%</div>
          <div className="flex-1"><div className="h-4 overflow-hidden rounded-full bg-zinc-900"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-400 to-emerald-400" style={{ width: `${extra.dataQuality}%` }} /></div><div className="mt-2 text-xs font-bold text-zinc-400">Detector accuracy depends on how completely trade fields are filled.</div></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{extra.missingTop.length ? extra.missingTop.map((item) => <span key={item.key} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-black text-zinc-300">{item.label}: missing {item.count}</span>) : <span className="text-sm font-bold text-emerald-300">All important fields are filled.</span>}</div>
      </div>

      <DetectorGroupPanel title="Setup-Specific Mistakes" rows={extra.lossGroupsBySetup} empty="No setup loss pattern yet." />
      <DetectorGroupPanel title="Session Mistake Map" rows={extra.lossGroupsBySession} empty="No session loss pattern yet." />

      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
        <SectionTitle title="Mistake Timeline" icon={<TrendingUp size={18} />} />
        <div className="mt-4 rounded-xl border border-white/10 bg-black/35 p-4 text-sm font-semibold text-zinc-300">{extra.timelineText}</div>
      </div>

      <div className="rounded-2xl border border-orange-500/25 bg-orange-500/10 p-5">
        <SectionTitle title="Anti-Pattern Warning" icon={<span className="text-lg">⚠</span>} />
        <div className="mt-4 space-y-3">
          {extra.antiPatterns.length ? extra.antiPatterns.map((warning) => <div key={warning.title} className="rounded-xl border border-white/10 bg-black/35 p-4"><div className="font-black text-orange-300">{warning.title}</div><div className="mt-1 text-sm font-semibold text-zinc-300">{warning.text}</div></div>) : <div className="rounded-xl border border-white/10 bg-black/35 p-4 text-sm font-semibold text-zinc-400">No dangerous anti-pattern detected yet.</div>}
        </div>
      </div>
    </div>
  );
}

function DetectorGroupPanel({ title, rows, empty }) {
  return (
    <div className="rounded-2xl border border-fuchsia-500/20 bg-black/35 p-5">
      <SectionTitle title={title} icon={<ListChecks size={18} />} />
      <div className="mt-4 space-y-3">
        {rows.length ? rows.map((row) => (
          <div key={row.name} className="rounded-xl border border-white/10 bg-black/35 p-4">
            <div className="flex items-center justify-between gap-4"><div className="font-black text-white">{translateDetectorText(row.name)}</div><div className="font-black text-red-300">{formatMoney(row.pnl)}</div></div>
            <div className="mt-1 text-xs font-bold text-zinc-400">{row.count} loss · Main issue: {translateDetectorText(row.top)}</div>
          </div>
        )) : <div className="rounded-xl border border-dashed border-white/10 bg-black/25 p-5 text-center text-zinc-500">{empty}</div>}
      </div>
    </div>
  );
}

function StatisticsMetricCard({ title, value, sub, icon, tone = "white", active }) {
  const upperTitle = String(title || "").toUpperCase();
  const rawTone = upperTitle.includes("WIN") ? "green" : upperTitle.includes("LOSS") || upperTitle.includes("DRAWDOWN") ? "red" : tone;
  const toneKey = rawTone === "green" ? "green" : rawTone === "red" ? "red" : rawTone === "amber" ? "amber" : "purple";
  const iconCls = toneKey === "green" ? "border-emerald-500/25 bg-emerald-500/[0.12] text-emerald-300" : toneKey === "red" ? "border-red-500/25 bg-red-500/[0.12] text-red-300" : toneKey === "amber" ? "border-amber-500/25 bg-amber-500/[0.12] text-amber-300" : "border-fuchsia-500/25 bg-fuchsia-500/[0.12] text-fuchsia-300";
  const valueCls = toneKey === "green" ? "text-emerald-400" : toneKey === "red" ? "text-red-400" : toneKey === "amber" ? "text-amber-300" : "text-zinc-100";
  const badgeCls = toneKey === "green" ? "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300" : toneKey === "red" ? "border-red-500/25 bg-red-500/[0.08] text-red-300" : toneKey === "amber" ? "border-amber-500/25 bg-amber-500/[0.08] text-amber-300" : "border-fuchsia-500/25 bg-fuchsia-500/[0.08] text-fuchsia-200";
  const glowCls = toneKey === "green" ? "bg-emerald-500/[0.09]" : toneKey === "red" ? "bg-red-500/[0.09]" : toneKey === "amber" ? "bg-amber-500/[0.09]" : "bg-fuchsia-500/[0.08]";
  const lineCls = toneKey === "green" ? "text-emerald-500" : toneKey === "red" ? "text-red-500" : toneKey === "amber" ? "text-amber-500" : "text-violet-500";

  return (
    <div className={`statistics-metric-card stat-tile-${toneKey} group relative overflow-hidden rounded-xl border p-5 shadow-[0_16px_36px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_20px_42px_rgba(0,0,0,0.34)]`}>
      <div className={`stat-tile-glow absolute right-0 top-0 h-20 w-20 rounded-bl-3xl ${glowCls}`} />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className={`stat-tile-label text-xs font-black uppercase tracking-wider text-zinc-500`}>{title}</div>
          <div className={`stat-tile-value mt-4 text-3xl font-black ${valueCls}`}><AnimatedValue value={value} /></div>
        </div>
        <div className={`stat-tile-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base font-black ${iconCls}`}>{icon}</div>
      </div>
      <div className="relative z-10 mt-3 flex items-end justify-between">
        {sub && <span className={`stat-tile-badge rounded-md border px-2 py-1 text-[10px] font-black ${badgeCls}`}>{sub}</span>}
        <svg width="70" height="28" viewBox="0 0 70 28" fill="none" className={`stat-tile-line ${lineCls} opacity-55 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-80`}>
          <path d="M2 22 C7 24, 10 10, 15 15 S22 22, 27 13 S37 10, 42 15 S50 7, 56 9 S62 4, 68 2" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function AdvancedStatCard({ title, value, sub, tone, muted }) {
  const toneKey = tone === "green" ? "green" : tone === "red" ? "red" : tone === "amber" ? "amber" : "purple";
  const valueCls = toneKey === "green" ? "text-emerald-400" : toneKey === "red" ? "text-red-400" : toneKey === "amber" ? "text-amber-300" : (muted ? "text-fuchsia-300" : "text-zinc-100");
  const badgeCls = toneKey === "green" ? "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300" : toneKey === "red" ? "border-red-500/25 bg-red-500/[0.08] text-red-300" : toneKey === "amber" ? "border-amber-500/25 bg-amber-500/[0.08] text-amber-300" : "border-fuchsia-500/25 bg-fuchsia-500/[0.08] text-fuchsia-200";
  const glowCls = toneKey === "green" ? "bg-emerald-500/[0.09]" : toneKey === "red" ? "bg-red-500/[0.09]" : toneKey === "amber" ? "bg-amber-500/[0.09]" : "bg-fuchsia-500/[0.08]";
  const lineCls = toneKey === "green" ? "text-emerald-500" : toneKey === "red" ? "text-red-500" : toneKey === "amber" ? "text-amber-500" : "text-violet-500";
  return (
    <div className={`stat-tile-${toneKey} group relative overflow-hidden rounded-xl border p-5 shadow-[0_16px_36px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_20px_42px_rgba(0,0,0,0.34)]`}>
      <div className={`stat-tile-glow absolute right-0 top-0 h-20 w-20 rounded-bl-3xl ${glowCls}`} />
      <div className="relative z-10">
        <div className={`stat-tile-label text-xs font-black uppercase tracking-wider text-zinc-500`}>{title}</div>
        <div className={`stat-tile-value mt-4 text-3xl font-black ${valueCls}`}>{value}</div>
      </div>
      <div className="relative z-10 mt-3 flex items-end justify-between">
        {sub && <span className={`stat-tile-badge rounded-md border px-2 py-1 text-[10px] font-black ${badgeCls}`}>{sub}</span>}
        <svg width="70" height="28" viewBox="0 0 70 28" fill="none" className={`stat-tile-line ${lineCls} opacity-55 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-80`}>
          <path d="M2 22 C7 24, 10 10, 15 15 S22 22, 27 13 S37 10, 42 15 S50 7, 56 9 S62 4, 68 2" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function BestPerformanceCard({ title, value, detail, badge, icon, accent }) {
  const accentMap = {
    amber: "text-amber-400 bg-amber-500/10",
    fuchsia: "text-fuchsia-400 bg-fuchsia-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-emerald-400 bg-emerald-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
  };
  return (
    <button className="best-performance-card group relative overflow-hidden rounded-xl border border-fuchsia-500/18 bg-gradient-to-br from-[#160b1f] via-[#09060d] to-black p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-fuchsia-400/80 hover:shadow-[0_0_30px_rgba(178,74,242,0.28)]">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/18 via-transparent to-fuchsia-900/20" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent" />
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-fuchsia-500/20 blur-2xl" />
      </div>
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-zinc-400">▣</div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${accentMap[accent] || accentMap.fuchsia}`}>{icon}</div>
      </div>
      <div className="relative z-10 mt-4 text-xs font-black uppercase tracking-wider text-zinc-400">{title}</div>
      <div className="relative z-10 mt-4 text-3xl font-black text-emerald-500">{value}</div>
      <div className="relative z-10 mt-2 text-sm font-bold text-white">{detail}</div>
      <div className="relative z-10 mt-5 w-fit rounded-full bg-zinc-800 px-3 py-1 text-[10px] font-black text-white">{badge}</div>
    </button>
  );
}

function StatisticsPerformanceTimeline({ curve, stats }) {
  const chartData = curve.length ? curve : [{ date: "No data", pnl: 0 }];
  const lastPoint = chartData[chartData.length - 1];
  const change = Number(stats.totalPnl || lastPoint?.pnl || 0);
  return (
    <div className="statistics-chart-panel statistics-timeline-card group relative overflow-hidden rounded-xl border border-fuchsia-500/20 bg-gradient-to-br from-[#13081d] via-black to-[#030104] p-6 transition-all duration-300 hover:border-fuchsia-400/70 hover:shadow-[0_0_36px_rgba(178,74,242,0.20)]">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-[4rem] bg-fuchsia-500/10 blur-xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/70 to-transparent" />
      <div className="relative z-10 flex items-start justify-between">
        <SectionTitle title="Performance Timeline" icon={<TrendingUp size={18} />} />
        <div className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-2 text-right">
          <div className="text-[10px] font-black uppercase tracking-widest text-fuchsia-300">Net P&L</div>
          <div className={stats.totalPnl >= 0 ? "text-lg font-black text-emerald-400" : "text-lg font-black text-red-400"}>{formatMoney(stats.totalPnl)}</div>
        </div>
      </div>
      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <div className="text-[10px] font-black uppercase text-zinc-400">Wins</div>
          <div className="mt-1 text-xl font-black text-emerald-400">{stats.wins}</div>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
          <div className="text-[10px] font-black uppercase text-zinc-400">Losses</div>
          <div className="mt-1 text-xl font-black text-red-400">{stats.losses}</div>
        </div>
        <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-3">
          <div className="text-[10px] font-black uppercase text-zinc-400">Change</div>
          <div className={change >= 0 ? "mt-1 text-xl font-black text-emerald-400" : "mt-1 text-xl font-black text-red-400"}>{formatMoney(change)}</div>
        </div>
      </div>
      <div className="relative z-10 mt-6 h-72 rounded-xl border border-white/10 bg-black/30 p-3">
        <SafeResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 18, right: 20, left: 8, bottom: 6 }}>
            <CartesianGrid strokeDasharray="4 6" stroke="rgba(178,74,242,0.24)" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={{ stroke: "rgba(178,74,242,0.28)" }} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={{ stroke: "rgba(178,74,242,0.28)" }} tickFormatter={(value) => `$${value}`} />
            <Tooltip contentStyle={{ background: "var(--tooltip-bg, #09090b)", border: "1px solid var(--tooltip-border, #333)", borderRadius: 12, color: "var(--tooltip-text, #ffffff)" }} formatter={(value) => [formatMoney(value), "Equity"]} />
            <Line type="monotone" dataKey="pnl" stroke="#b24bf3" strokeWidth={4} dot={{ r: 5, fill: "#22c55e", stroke: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 8, fill: "#b24bf3", stroke: "#ffffff", strokeWidth: 3 }} />
            <Line type="monotone" dataKey="pnl" stroke="#22c55e" strokeWidth={2} dot={false} opacity={0.45} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}

function StatisticsWinLossPanel({ stats }) {
  const total = Math.max(1, Number(stats.wins || 0) + Number(stats.losses || 0));
  const winPercent = Math.max(0, Math.min(100, Number(stats.winRate || 0)));
  const lossPercent = Math.max(0, 100 - winPercent);
  return (
    <div className="statistics-chart-panel statistics-winloss-card group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-[#06150d] via-black to-[#110313] p-6 transition-all duration-300 hover:border-emerald-400/65 hover:shadow-[0_0_36px_rgba(16,185,129,0.18)]">
      <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-emerald-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

      <div className="relative z-10 flex items-start justify-between">
        <SectionTitle title="Win/Loss Analysis" icon={<Target size={18} />} />
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-right">
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Accuracy</div>
          <div className="text-lg font-black text-emerald-400">{winPercent.toFixed(1)}%</div>
        </div>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-[1fr_220px] items-center gap-6">
        <div className="space-y-4">
          <WinLossMiniCard label="Wins" value={stats.wins} percent={winPercent} tone="green" />
          <WinLossMiniCard label="Losses" value={stats.losses} percent={lossPercent} tone="red" />
          <WinLossMiniCard label="Break Even" value={stats.breakEvens || 0} percent={stats.trades ? ((stats.breakEvens || 0) / stats.trades) * 100 : 0} tone="amber" />
          <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-400">
              <span>Win/Loss/BE Balance</span>
              <span className="text-fuchsia-300">{stats.wins}:{stats.losses}:{stats.breakEvens || 0}</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-zinc-900">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: `${stats.trades ? (stats.wins / stats.trades) * 100 : 0}%` }} />
              <div className="bg-gradient-to-r from-red-500 to-red-400" style={{ width: `${stats.trades ? (stats.losses / stats.trades) * 100 : 0}%` }} />
              <div className="bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${stats.trades ? ((stats.breakEvens || 0) / stats.trades) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        <StatisticsWinLossCircle stats={stats} />
      </div>
    </div>
  );
}

function WinLossMiniCard({ label, value, percent, tone }) {
  const isGreen = tone === "green";
  const isAmber = tone === "amber";
  return (
    <div className={isGreen ? "rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4" : isAmber ? "rounded-xl border border-amber-500/25 bg-amber-500/10 p-4" : "rounded-xl border border-red-500/25 bg-red-500/10 p-4"}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-zinc-400">{label}</div>
          <div className={isGreen ? "mt-1 text-3xl font-black text-emerald-400" : isAmber ? "mt-1 text-3xl font-black text-amber-400" : "mt-1 text-3xl font-black text-red-400"}>{value}</div>
        </div>
        <div className={isGreen ? "rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300" : isAmber ? "rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-300" : "rounded-full bg-red-500/15 px-3 py-1 text-xs font-black text-red-300"}>{percent.toFixed(1)}%</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-900">
        <div className={isGreen ? "h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" : isAmber ? "h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" : "h-full rounded-full bg-gradient-to-r from-red-500 to-red-400"} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function StatisticsWinLossCircle({ stats }) {
  const winRate = Math.max(0, Math.min(100, Number(stats.winRate || 0)));
  const lossRate = Math.max(0, Math.min(100, 100 - winRate));
  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const winOffset = circumference - (winRate / 100) * circumference;
  const lossOffset = circumference - (lossRate / 100) * circumference;
  const hasWins = Number(stats.wins || 0) > 0;
  const hasLosses = Number(stats.losses || 0) > 0;

  return (
    <div className="flex h-72 items-center justify-center">
      <div className="statistics-winloss-circle group relative flex h-60 w-60 items-center justify-center rounded-[2rem] border border-fuchsia-500/25 bg-gradient-to-br from-[#050005] via-black to-[#08020b] shadow-[0_0_45px_rgba(178,74,242,0.12)] transition-all duration-300 hover:border-fuchsia-400/65 hover:shadow-[0_0_55px_rgba(178,74,242,0.22)]">
        <div className="pointer-events-none absolute -inset-4 rounded-[2.4rem] bg-gradient-to-br from-emerald-500/12 via-transparent to-red-500/12 blur-2xl opacity-80" />
        <div className="pointer-events-none absolute inset-4 rounded-[1.6rem] border border-white/10 bg-black/35" />
        <div className="pointer-events-none absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-fuchsia-400/70 to-transparent" />

        <svg className="absolute inset-0 h-full w-full -rotate-90 p-4" viewBox="0 0 220 220">
          <defs>
            <linearGradient id="winNeonGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="55%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <linearGradient id="lossNeonGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="55%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
          <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(239,68,68,0.22)" strokeWidth="14" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={lossOffset} filter="url(#softGlow)" />
          <circle cx="110" cy="110" r={radius} fill="none" stroke="url(#winNeonGradient)" strokeWidth="14" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={winOffset} filter="url(#softGlow)" />
          {!hasWins && hasLosses && <circle cx="110" cy="110" r={radius} fill="none" stroke="url(#lossNeonGradient)" strokeWidth="14" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset="0" filter="url(#softGlow)" />}
        </svg>

        <div className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-white/10 bg-black shadow-[inset_0_0_28px_rgba(178,74,242,0.08),0_0_24px_rgba(0,0,0,0.7)]">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Win Rate</div>
          <div className={hasWins ? "mt-2 text-5xl font-black leading-none text-emerald-400 drop-shadow-[0_0_16px_rgba(16,185,129,0.75)]" : hasLosses ? "mt-2 text-5xl font-black leading-none text-red-400 drop-shadow-[0_0_16px_rgba(239,68,68,0.75)]" : "mt-2 text-5xl font-black leading-none text-fuchsia-200 drop-shadow-[0_0_14px_rgba(178,74,242,0.55)]"}>
            {winRate.toFixed(1)}<span className="text-xl">%</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-black text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.95)]" /> {stats.wins}W
            <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.95)]" /> {stats.losses}L
          </div>
        </div>

        <div className="absolute -bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black px-3 py-2 text-[11px] font-black text-zinc-300 shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
          <span className="text-emerald-300">{stats.wins} wins</span>
          <span className="text-zinc-600">/</span>
          <span className="text-red-300">{stats.losses} losses</span>
          <span className="text-zinc-600">/</span>
          <span className="text-amber-300">{stats.breakEvens || 0} BE</span>
        </div>
      </div>
    </div>
  );
}

function StatisticsPatternsView({ stats, trades = [] }) {
  const weekdays = [
    { short: "Mon", full: "Monday", tone: "fuchsia", index: 1 },
    { short: "Tue", full: "Tuesday", tone: "blue", index: 2 },
    { short: "Wed", full: "Wednesday", tone: "violet", index: 3 },
    { short: "Thu", full: "Thursday", tone: "cyan", index: 4 },
    { short: "Fri", full: "Friday", tone: "emerald", index: 5 },
  ];
  const weekdayStats = weekdays.reduce((output, day) => {
    const dayTrades = trades.filter((trade) => {
      const date = new Date(`${getTradeDateKey(trade)}T00:00:00`);
      return !Number.isNaN(date.getTime()) && date.getDay() === day.index;
    });
    const summary = summarizeTrades(dayTrades);
    const riskTrades = dayTrades.filter((trade) => Number(trade.risk || 0) > 0);
    output[day.short] = {
      ...summary,
      riskTrades: riskTrades.length,
      avgRR: riskTrades.length ? riskTrades.reduce((sum, trade) => sum + getTradeRR(trade), 0) / riskTrades.length : 0,
    };
    return output;
  }, {});
  const weekdaySummary = Object.values(weekdayStats).reduce((summary, day) => ({
    count: summary.count + Number(day.count || 0),
    wins: summary.wins + Number(day.wins || 0),
    losses: summary.losses + Number(day.losses || 0),
    breakEvens: summary.breakEvens + Number(day.breakEvens || 0),
    pnl: summary.pnl + Number(day.pnl || 0),
    riskTrades: summary.riskTrades + Number(day.riskTrades || 0),
    rrSum: summary.rrSum + Number(day.avgRR || 0) * Number(day.riskTrades || 0),
  }), { count: 0, wins: 0, losses: 0, breakEvens: 0, pnl: 0, riskTrades: 0, rrSum: 0 });
  const weekdayDecisive = weekdaySummary.wins + weekdaySummary.losses;
  const totalTrades = weekdaySummary.count;
  const totalPnl = weekdaySummary.pnl;
  const avgRR = weekdaySummary.riskTrades ? weekdaySummary.rrSum / weekdaySummary.riskTrades : 0;
  const weekdayWinRate = weekdayDecisive ? (weekdaySummary.wins / weekdayDecisive) * 100 : 0;
  const activeDay = weekdays.map((day) => ({ ...day, summary: weekdayStats[day.short] })).filter((day) => day.summary.count > 0).sort((a, b) => Number(b.summary.pnl || 0) - Number(a.summary.pnl || 0))[0]?.short || "Mon";
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between">
        <SectionTitle title="Weekday Performance" icon={<Calendar size={18} />} />
        <div className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-fuchsia-300">
          Monday - Friday
        </div>
      </div>

      <div className="statistics-pattern-panel statistics-pattern-pro mt-7 rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-black via-[#050307] to-[#12091b] p-6">
        <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-bl-[5rem] bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute left-0 bottom-0 h-52 w-52 rounded-tr-[5rem] bg-emerald-500/5 blur-3xl" />

        <div className="relative z-10 mb-6 grid grid-cols-4 gap-4">
          <PatternSummaryCard title="Total Trades" value={totalTrades} subtitle="Monday - Friday" tone="fuchsia" />
          <PatternSummaryCard title="Best Day" value={activeDay} subtitle={totalTrades ? formatMoney(weekdayStats[activeDay]?.pnl || 0) : "No trades"} tone="emerald" />
          <PatternSummaryCard title="Win Rate" value={`${weekdayWinRate.toFixed(1)}%`} subtitle="Monday - Friday" tone="green" />
          <PatternSummaryCard title="Avg RR" value={avgRR.toFixed(2)} subtitle="Risk reward" tone="amber" />
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {weekdays.map((day) => {
            const isActive = day.short === activeDay && totalTrades > 0;
            return (
              <PatternDayCard
                key={day.short}
                day={day}
                isActive={isActive}
                dayStats={weekdayStats[day.short]}
              />
            );
          })}
        </div>

        <div className="relative z-10 mt-7 overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-5">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/70 to-transparent" />
          <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-2 xl:grid-cols-4">
            <PatternBottomMetric label="Total Trades" value={totalTrades} tone="fuchsia" />
            <PatternBottomMetric label="Weekday Win Rate" value={`${weekdayWinRate.toFixed(1)}%`} tone="emerald" />
            <PatternBottomMetric label="Weekday Avg RR" value={avgRR.toFixed(2)} tone="amber" />
            <PatternBottomMetric label="Total P&L" value={formatMoney(totalPnl)} tone="emerald" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PatternSummaryCard({ title, value, subtitle, tone }) {
  const styles = {
    fuchsia: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    green: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  };
  return (
    <div className={`rounded-xl border p-4 ${styles[tone] || styles.fuchsia}`}>
      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
      <div className="mt-1 text-xs font-bold text-zinc-400">{subtitle}</div>
    </div>
  );
}

function PatternDayCard({ day, isActive, dayStats }) {
  const totalTrades = dayStats?.count || 0;
  const wins = dayStats?.wins || 0;
  const losses = dayStats?.losses || 0;
  const breakEvens = dayStats?.breakEvens || 0;
  const winRate = dayStats?.winRate || 0;
  const avgRR = dayStats?.avgRR || 0;
  const totalPnl = dayStats?.pnl || 0;
  const avgPnl = totalTrades ? totalPnl / totalTrades : 0;
  const dayScore = totalTrades ? Math.round((Math.max(0, Math.min(100, winRate)) * 0.45) + (Math.max(0, Math.min(100, avgRR * 25)) * 0.30) + (totalPnl > 0 ? 25 : 0)) : 0;
  const hasTrades = totalTrades > 0;
  const toneClass = {
    fuchsia: "from-fuchsia-950/30 to-fuchsia-950/10 border-fuchsia-500/25",
    blue: "from-blue-950/25 to-blue-950/10 border-blue-500/20",
    violet: "from-violet-950/25 to-violet-950/10 border-violet-500/20",
    cyan: "from-cyan-950/25 to-cyan-950/10 border-cyan-500/20",
    emerald: "from-emerald-950/40 to-emerald-950/10 border-emerald-500/35",
  };
  return (
    <button className={`weekday-card weekday-card-pro group relative min-h-[245px] overflow-hidden rounded-2xl border bg-gradient-to-br via-black p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-fuchsia-400/80 hover:shadow-[0_0_30px_rgba(178,74,242,0.20)] ${toneClass[day.tone]} ${isActive ? "weekday-card-active" : ""}`}>
      <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-[2rem] bg-white/5" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="text-2xl font-black text-white">{day.short}</div>
          <div className="mt-1 text-xs font-bold text-zinc-400">{day.full}</div>
        </div>
        <div className={isActive ? "rounded-full border border-emerald-500/35 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300" : hasTrades ? "rounded-full border border-fuchsia-500/35 bg-fuchsia-500/15 px-3 py-1 text-xs font-black text-fuchsia-300" : "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-zinc-500"}>
          {isActive ? "Best" : hasTrades ? "Active" : "No trades"}
        </div>
      </div>

      <div className="relative z-10 mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-black/25 p-3 text-sm">
        <span className="font-bold text-zinc-300"><span className="mr-2 text-fuchsia-400">▥</span>Trades</span>
        <span className="font-black text-white">{totalTrades}</span>
      </div>

      {hasTrades ? (
        <div className="relative z-10 mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2"><div className="text-[10px] font-black uppercase text-zinc-500">Wins</div><div className="text-lg font-black text-emerald-400">{wins}</div></div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2"><div className="text-[10px] font-black uppercase text-zinc-500">Losses</div><div className="text-lg font-black text-red-400">{losses}</div></div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2"><div className="text-[10px] font-black uppercase text-zinc-500">BE</div><div className="text-lg font-black text-amber-400">{breakEvens}</div></div>
          </div>
          <div className="flex justify-between text-sm"><span className="text-emerald-400">◎ Win Rate</span><span className="font-black text-emerald-400">{winRate.toFixed(1)}%</span></div>
          <div className="flex justify-between text-sm"><span className="text-amber-400">⌁ Avg RR</span><span className="font-black text-amber-400">{avgRR.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-fuchsia-300">Avg P&L</span><span className={avgPnl >= 0 ? "font-black text-emerald-400" : "font-black text-red-400"}>{formatMoney(avgPnl)}</span></div>
          <div className={totalPnl >= 0 ? "rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center text-xs text-zinc-400" : "rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-zinc-400"}>Total P&L<div className={totalPnl >= 0 ? "mt-1 text-xl font-black text-emerald-400" : "mt-1 text-xl font-black text-red-400"}>{formatMoney(totalPnl)}</div></div>
          <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-3">
            <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500"><span>Day Score</span><span className="text-fuchsia-300">{dayScore}/100</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-900"><div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-emerald-400 to-emerald-300" style={{ width: `${dayScore}%` }} /></div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 mt-7 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 p-5 text-sm text-zinc-500">
          <span className="text-2xl text-fuchsia-400/40">—</span>
          <span className="mt-2">No trades recorded</span>
        </div>
      )}
    </button>
  );
}

function PatternBottomMetric({ label, value, tone }) {
  const color = tone === "amber" ? "text-amber-400" : tone === "fuchsia" ? "text-fuchsia-400" : "text-emerald-400";
  return <div><div className={`text-3xl font-black ${color}`}>{value}</div><div className="mt-1 text-sm text-zinc-400">{label}</div></div>;
}

function StatisticsStrategiesView({ stats }) {
  const rows = Object.entries(stats.strategyStats || {});
  const fallback = [["Liquidity Sweep", { count: stats.trades, wins: stats.wins, losses: stats.losses, breakEvens: stats.breakEvens || 0, pnl: stats.totalPnl }]];
  const strategyRows = rows.length ? rows : fallback;
  const best = [...strategyRows].sort((a, b) => Number(b[1].pnl || 0) - Number(a[1].pnl || 0))[0];
  const bestName = best?.[0] || "Liquidity Sweep";
  const bestStats = best?.[1] || { count: stats.trades, wins: stats.wins, losses: stats.losses, pnl: stats.totalPnl };
  const bestDecisive = Number(bestStats.wins || 0) + Number(bestStats.losses || 0);
  const winRate = bestDecisive ? ((bestStats.wins || 0) / bestDecisive) * 100 : 0;
  const avgPnl = bestStats.count ? bestStats.pnl / bestStats.count : 0;
  const bestAvgRR = bestStats.riskTrades ? bestStats.rrSum / bestStats.riskTrades : 0;
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between">
        <SectionTitle title="Strategy Performance" icon={<span className="text-xl">ϟ</span>} />
        <div className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-fuchsia-300">
          {strategyRows.length} active strategies
        </div>
      </div>

      <div className="statistics-strategy-panel mt-7 overflow-hidden rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-black via-[#05030a] to-[#13091c] p-6">
        <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-bl-[5rem] bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-52 w-52 rounded-tr-[5rem] bg-emerald-500/5 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StrategySummaryCard label="Best Strategy" value={bestName} subtitle="Highest P&L" tone="fuchsia" />
          <StrategySummaryCard label="Win Rate" value={`${winRate.toFixed(1)}%`} subtitle={`${bestStats.wins || 0}W / ${bestStats.losses || 0}L / ${bestStats.breakEvens || 0}BE`} tone="emerald" />
          <StrategySummaryCard label="Total P&L" value={formatMoney(bestStats.pnl)} subtitle="Net result" tone={bestStats.pnl >= 0 ? "emerald" : "red"} />
          <StrategySummaryCard label="Avg RR" value={bestAvgRR.toFixed(2)} subtitle="Risk reward" tone="amber" />
        </div>

        <div className="relative z-10 mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-2xl border border-fuchsia-500/20 bg-black/35 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Strategy Leaderboard</h3>
              <span className="rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1 text-xs font-black text-fuchsia-300">Ranked by P&L</span>
            </div>
            <div className="space-y-3">
              {strategyRows.map(([name, item], index) => {
                const itemWinRate = item.count ? ((item.wins || 0) / item.count) * 100 : 0;
                const width = Math.max(8, Math.min(100, Math.abs(item.pnl || 0) / Math.max(1, Math.abs(bestStats.pnl || 1)) * 100));
                return (
                  <button key={name} className="strategy-rank-row group relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-400/70 hover:shadow-[0_0_24px_rgba(178,74,242,.18)]">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-fuchsia-500/18 to-transparent" style={{ width: `${width}%` }} />
                    <div className="relative z-10 grid grid-cols-[44px_1fr_100px_120px_80px] items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/15 text-sm font-black text-fuchsia-300">#{index + 1}</div>
                      <div><div className="font-black text-white">{name}</div><div className="text-xs text-zinc-400">{item.count} trades · {item.wins || 0} wins · {item.losses || 0} losses · {item.breakEvens || 0} BE</div></div>
                      <div className="text-right text-sm font-black text-emerald-400">{itemWinRate.toFixed(1)}%</div>
                      <div className={item.pnl >= 0 ? "text-right font-black text-emerald-400" : "text-right font-black text-red-400"}>{formatMoney(item.pnl)}</div>
                      <div className="text-right text-sm font-black text-amber-400">{(item.riskTrades ? item.rrSum / item.riskTrades : 0).toFixed(2)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="strategy-detail-card strategy-detail-pro rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-black via-[#07030b] to-[#13091c] p-6">
            <div className="flex items-start justify-between">
              <div><div className="text-xs font-black uppercase tracking-widest text-zinc-500">Selected Strategy</div><h3 className="mt-2 text-2xl font-black text-white">{bestName}</h3></div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300">ϟ</span>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <StrategyLine label="Trades" value={bestStats.count} icon="▥" />
              <StrategyLine label="Closed" value={`${bestStats.count} closed`} muted />
              <StrategyLine label="Win Rate" value={`${winRate.toFixed(1)}%`} green icon="◎" />
              <StrategyLine label="Avg RR" value={bestAvgRR.toFixed(2)} amber icon="⌁" />
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="flex justify-between"><span className="text-zinc-400">Total P&L</span><span className="font-black text-emerald-400">{formatMoney(bestStats.pnl)}</span></div>
                <div className="mt-2 flex justify-between"><span className="text-zinc-400">Avg P&L / Trade</span><span className="font-black text-emerald-400">{formatMoney(avgPnl)}</span></div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="mb-3 flex justify-between text-xs font-black uppercase tracking-wider text-zinc-400"><span>W/L/BE Breakdown</span><span>{bestStats.wins || 0}:{bestStats.losses || 0}:{bestStats.breakEvens || 0}</span></div>
                <div className="flex h-3 overflow-hidden rounded-full bg-zinc-900"><div className="bg-emerald-500" style={{ width: `${bestStats.count ? ((bestStats.wins || 0) / bestStats.count) * 100 : 0}%` }} /><div className="bg-red-500" style={{ width: `${bestStats.count ? ((bestStats.losses || 0) / bestStats.count) * 100 : 0}%` }} /><div className="bg-amber-500" style={{ width: `${bestStats.count ? ((bestStats.breakEvens || 0) / bestStats.count) * 100 : 0}%` }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StrategySummaryCard({ label, value, subtitle, tone }) {
  const styles = {
    fuchsia: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    red: "border-red-500/25 bg-red-500/10 text-red-300",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  };
  return <div className={`rounded-xl border p-4 ${styles[tone] || styles.fuchsia}`}><div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</div><div className="mt-2 truncate text-xl font-black">{value}</div><div className="mt-1 text-xs font-bold text-zinc-400">{subtitle}</div></div>;
}

function StrategyLine({ label, value, icon, green, amber, muted }) {
  const color = green ? "text-emerald-400" : amber ? "text-amber-400" : muted ? "text-zinc-500" : "text-white";
  return <div className="flex items-center justify-between"><span className="text-zinc-400">{icon && <span className="mr-2 text-fuchsia-400">{icon}</span>}{label}</span><span className={`font-black ${color}`}>{value}</span></div>;
}

function StatisticsRiskView({ stats, trades = [] }) {
  const risk = getRiskDashboardStats(trades);
  const dailyGroups = groupTradesByDate(trades);
  const dailyRiskRows = Object.entries(dailyGroups)
    .map(([date, dayTrades]) => ({
      date,
      risk: dayTrades.reduce((sum, trade) => sum + Number(trade.risk || 0), 0),
      pnl: summarizeTrades(dayTrades).pnl,
      trades: dayTrades.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const chartRows = dailyRiskRows.length ? dailyRiskRows : [{ date: "No data", risk: 0, pnl: 0 }];
  const maxDailyLoss = dailyRiskRows.length ? Math.min(...dailyRiskRows.map((row) => row.pnl)) : 0;
  const riskTone = risk.maxRiskPercent > 2 ? "red" : risk.maxRiskPercent > 1 ? "fuchsia" : "green";

  return (
    <section className="mt-10">
      <SectionTitle title="Risk Management" icon={<Target size={18} />} />

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdvancedStatCard title="AVG RISK" value={formatMoney(risk.avgRisk)} sub={`${risk.avgRiskPercent.toFixed(2)}% account`} tone="fuchsia" />
        <AdvancedStatCard title="MAX RISK" value={formatMoney(risk.maxRisk)} sub={`${risk.maxRiskPercent.toFixed(2)}% account`} tone={riskTone} />
        <AdvancedStatCard title="MAX DAILY LOSS" value={formatMoney(maxDailyLoss)} sub="Worst day" tone="red" />
        <AdvancedStatCard title="RISK CONSISTENCY" value={`${risk.consistencyScore.toFixed(0)}%`} sub="Stable sizing" tone="green" />
      </div>

      <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="charts-pro-card rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-black via-[#05030a] to-[#13091c] p-6">
          <div className="flex items-start justify-between">
            <SectionTitle title="Daily Risk / P&L" icon={<BarChart3 size={18} />} />
            <span className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-2 text-xs font-black text-fuchsia-300">Risk control</span>
          </div>
          <div className="mt-5 h-80 rounded-xl border border-white/10 bg-black/25 p-3">
            <SafeResponsiveContainer>
              <BarChart data={chartRows} margin={{ top: 20, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="4 6" stroke="rgba(178,74,242,.20)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ background: "var(--tooltip-bg, #09090b)", border: "1px solid var(--tooltip-border, #333)", borderRadius: 12, color: "var(--tooltip-text, #ffffff)" }}
                  formatter={(value, name) => [formatMoney(value), name]}
                />
                <Bar dataKey="risk" fill="#b24bf3" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pnl" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-black via-[#090605] to-[#120b05] p-6">
          <SectionTitle title="Risk Rules" icon={<ListChecks size={18} />} />
          <div className="mt-5 space-y-3">
            <RiskRule passed={risk.maxRiskPercent <= 1} title="Keep single-trade risk near 1%" detail={`Max used: ${risk.maxRiskPercent.toFixed(2)}%`} />
            <RiskRule passed={risk.lossStreak < 2} title="Pause after 2 loss streak" detail={`Current loss streak: ${risk.lossStreak}`} />
            <RiskRule passed={risk.consistencyScore >= 65 || risk.riskTrades < 3} title="Consistent position sizing" detail={`Consistency: ${risk.consistencyScore.toFixed(0)}%`} />
            <RiskRule passed={stats.maxDrawdownPercent <= 5} title="Control drawdown" detail={`Max DD: ${stats.maxDrawdownPercent.toFixed(2)}%`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function RiskRule({ passed, title, detail }) {
  return <div className={passed ? "rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4" : "rounded-xl border border-red-500/25 bg-red-500/10 p-4"}><div className="flex items-center justify-between"><div className="font-black text-white">{title}</div><span className={passed ? "text-emerald-400" : "text-red-400"}>{passed ? "✓" : "!"}</span></div><div className="mt-1 text-sm text-zinc-400">{detail}</div></div>;
}

function StatisticsChartsView({ stats, curve, trades = [] }) {
  const pnl = stats.totalPnl || 0;
  const monthlyGroups = summarizeGroupedTrades(trades, getMonthGroupKey);
  const monthlyData = Object.entries(monthlyGroups).sort((a, b) => a[0].localeCompare(b[0])).map(([, group]) => ({ month: group.label, pnl: summarizeTrades(group.trades).pnl }));
  const strategyData = Object.entries(stats.strategyStats || {}).map(([name, item]) => ({ name, value: item.count, pnl: item.pnl }));
  const fallbackStrategies = strategyData.length ? strategyData : [{ name: "No strategy", value: stats.trades || 1, pnl }];
  const safeMonthlyData = monthlyData.length ? monthlyData : [{ month: "No data", pnl: 0 }];
  return (
    <section className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-2">
      <div className="statistics-chart-panel charts-pro-card rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-black via-[#020605] to-[#050b13] p-6">
        <div className="flex items-start justify-between"><SectionTitle title="Performance Timeline" icon={<TrendingUp size={18} />} /><span className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-300">Equity</span></div>
        <div className="mt-5 h-80 rounded-xl border border-white/10 bg-black/25 p-3"><SafeResponsiveContainer><LineChart data={curve} margin={{ top: 18, right: 20, left: 8, bottom: 6 }}><CartesianGrid strokeDasharray="4 6" stroke="rgba(16,185,129,.20)" vertical={false} /><XAxis dataKey="date" stroke="#64748b" tickLine={false} /><YAxis stroke="#64748b" tickLine={false} tickFormatter={(v) => `$${v}`} /><Tooltip contentStyle={{ background: "var(--tooltip-bg, #09090b)", border: "1px solid var(--tooltip-border, #333)", borderRadius: 12, color: "var(--tooltip-text, #ffffff)" }} formatter={(value) => [formatMoney(value), "Cumulative P&L"]} /><Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 8, fill: "#b24bf3", stroke: "#ffffff", strokeWidth: 3 }} /></LineChart></SafeResponsiveContainer></div>
      </div>

      <div className="statistics-chart-panel charts-pro-card rounded-2xl border border-blue-500/20 bg-gradient-to-br from-black via-[#020605] to-[#050b13] p-6">
        <div className="flex items-start justify-between"><SectionTitle title="Monthly P&L" icon={<BarChart3 size={18} />} /><span className="rounded-xl border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs font-black text-blue-300">2026</span></div>
        <div className="mt-5 h-80 rounded-xl border border-white/10 bg-black/25 p-3"><SafeResponsiveContainer><BarChart data={safeMonthlyData} margin={{ top: 20, right: 24, left: 8, bottom: 8 }}><CartesianGrid strokeDasharray="4 6" stroke="rgba(59,130,246,.20)" vertical={false} /><XAxis dataKey="month" stroke="#64748b" tickLine={false} /><YAxis stroke="#64748b" tickLine={false} tickFormatter={(v) => `$${v}`} /><Tooltip contentStyle={{ background: "var(--tooltip-bg, #09090b)", border: "1px solid var(--tooltip-border, #333)", borderRadius: 12, color: "var(--tooltip-text, #ffffff)" }} formatter={(value) => [formatMoney(value), "P&L"]} /><Bar dataKey="pnl" fill="#22c55e" radius={[8, 8, 0, 0]} /></BarChart></SafeResponsiveContainer></div>
      </div>

      <div className="statistics-chart-panel charts-pro-card rounded-2xl border border-amber-500/20 bg-gradient-to-br from-black via-[#020605] to-[#120b05] p-6">
        <div className="flex items-start justify-between"><SectionTitle title="Win/Loss Analysis" icon={<Target size={18} />} /><span className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-300">Ratio</span></div>
        <StatisticsWinLossCircle stats={stats} />
      </div>

      <div className="statistics-chart-panel charts-pro-card rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-black via-[#05030a] to-[#080413] p-6">
        <div className="flex items-start justify-between"><SectionTitle title="Strategy Breakdown" icon={<span className="text-xl">ϟ</span>} /><span className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-2 text-xs font-black text-fuchsia-300">Mix</span></div>
        <StrategyBreakdownDonut data={fallbackStrategies} total={stats.trades || 0} />
      </div>
    </section>
  );
}

function BarChart3Visual({ data }) {
  const max = Math.max(1, ...data.map((item) => Math.abs(item.pnl || 0)));
  return (
    <div className="flex h-full items-end justify-center gap-12 px-10 pb-10 pt-6">
      {data.map((item) => (
        <div key={item.month} className="flex h-full flex-1 max-w-md flex-col justify-end">
          <div className="relative flex flex-1 items-end border-b border-dashed border-zinc-700">
            <div className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_30px_rgba(34,197,94,.25)] transition-all duration-300 hover:scale-[1.02]" style={{ height: `${Math.max(18, Math.abs(item.pnl || 0) / max * 92)}%` }}>
              <div className="pt-3 text-center text-sm font-black text-white">{formatMoney(item.pnl)}</div>
            </div>
          </div>
          <div className="mt-3 text-center text-sm font-black text-zinc-400">{item.month}</div>
        </div>
      ))}
    </div>
  );
}

function StrategyBreakdownDonut({ data, total }) {
  const safeTotal = Math.max(1, data.reduce((sum, item) => sum + Number(item.value || 0), 0));
  let offset = 25;
  const segments = data.map((item, index) => {
    const percent = (Number(item.value || 0) / safeTotal) * 100;
    const segment = `${percent} ${100 - percent}`;
    const current = { ...item, percent, offset, color: index % 3 === 0 ? "#94a3b8" : index % 3 === 1 ? "#b24bf3" : "#10b981", segment };
    offset -= percent;
    return current;
  });
  return (
    <div className="flex h-80 items-center justify-center gap-8">
      <div className="relative flex h-60 w-60 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(148,163,184,.16)" strokeWidth="18" />
          {segments.map((segment) => <circle key={segment.name} cx="60" cy="60" r="42" fill="none" stroke={segment.color} strokeWidth="18" strokeLinecap="round" strokeDasharray={segment.segment} strokeDashoffset={segment.offset} pathLength="100" />)}
        </svg>
        <div className="relative z-10 text-center"><div className="text-5xl font-light text-white">{total}</div><div className="mt-2 text-sm text-zinc-500">Total Trades</div></div>
      </div>
      <div className="space-y-3">
        {segments.map((item) => <div key={item.name} className="flex items-center gap-3 text-sm"><span className="h-3 w-3 rounded-full" style={{ background: item.color }} /><span className="font-bold text-zinc-300">{item.name}</span><span className="text-zinc-500">{item.percent.toFixed(0)}%</span></div>)}
      </div>
    </div>
  );
}

function AnalyticsTable({ title, icon, data, isMistake }) {
  return <section className="mt-8 rounded-xl border border-white/10 bg-zinc-950 p-6"><SectionTitle title={title} icon={icon} /><div className="mt-5 grid gap-3">{Object.entries(data).map(([name, item]) => { const winRate = item.count ? ((item.wins || 0) / item.count) * 100 : 0; return <div key={name} className="grid grid-cols-4 items-center rounded-xl border border-white/10 bg-black p-4"><div className="font-black">{name}</div><div className="text-sm text-zinc-400">Count: <span className="font-bold text-white">{item.count}</span></div><div className="text-sm text-zinc-400">{isMistake ? "Losses" : "Win Rate"}: <span className={isMistake ? "font-bold text-red-400" : "font-bold text-emerald-400"}>{isMistake ? item.losses : `${winRate.toFixed(1)}%`}</span></div><div className={item.pnl >= 0 ? "text-right font-black text-emerald-400" : "text-right font-black text-red-400"}>{formatMoney(item.pnl)}</div></div>; })}</div></section>;
}

function MiniTradeRow({ trade }) {
  return <div className="rounded-xl border border-white/10 bg-black p-4"><div className="flex items-center justify-between"><span className="font-bold">{trade.pair}</span><span className={`font-black ${getPnlToneClass(trade.pnl)}`}>{getPnlArrow(trade.pnl)} {formatMoney(trade.pnl)}</span></div><div className="mt-2 text-sm text-zinc-400">{trade.direction} · {trade.setup}</div></div>;
}
function Meta({ label, value, green, gold, danger }) { return <div><div className="text-xs text-zinc-500">{label}</div><div className={`mt-2 text-lg font-black ${green ? "text-emerald-400" : gold ? "text-amber-400" : danger ? "text-orange-400" : "text-white"}`}>{value}</div></div>; }
function MiniInfo({ label, value, badge, tone }) { const badgeClass = tone === "red" ? "bg-red-600/90 border border-red-500/70 text-white shadow-[0_0_14px_rgba(239,68,68,0.35)]" : tone === "green" ? "bg-emerald-600/90 border border-emerald-500/70 text-white shadow-[0_0_14px_rgba(16,185,129,0.35)]" : "bg-fuchsia-500 text-black"; return <div className="mb-6"><div className="text-sm font-bold text-zinc-300">{label}</div><div className={badge ? `mt-2 w-fit rounded-full px-3 py-1 text-xs font-black ${badgeClass}` : "mt-2 text-sm text-zinc-400"}>{value}</div></div>; }
function SideBox({ title, children }) { return <div className="rounded-xl border border-white/10 bg-zinc-950 p-6"><h3 className="mb-5 text-lg font-black">{title}</h3>{children}</div>; }
function DashCard({ title, value, tone, icon, badge, isLoading = false }) {
  const styles = {
    emerald: {
      card: "from-[#10271f] via-[#0a1713] to-[#070b09] border-emerald-500/35 hover:border-emerald-400/50",
      icon: "border border-emerald-500/25 bg-emerald-500/[0.12] text-emerald-300",
      value: "text-zinc-100",
      line: "text-emerald-500",
      badge: "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300",
      glow: "bg-emerald-500/[0.07]",
    },
    fuchsia: {
      card: "from-[#281430] via-[#170c1c] to-[#0b080d] border-fuchsia-500/35 hover:border-fuchsia-400/50",
      icon: "border border-fuchsia-500/25 bg-fuchsia-500/[0.12] text-fuchsia-300",
      value: "text-zinc-100",
      line: "text-violet-500",
      badge: "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300",
      glow: "bg-fuchsia-500/[0.07]",
    },
    cyan: {
      card: "from-[#0d2932] via-[#09191f] to-[#060b0e] border-cyan-500/35 hover:border-cyan-400/50",
      icon: "border border-cyan-500/25 bg-cyan-500/[0.12] text-cyan-300",
      value: "text-zinc-100",
      line: "text-cyan-500",
      badge: "border-white/15 bg-white/[0.05] text-zinc-400",
      glow: "bg-cyan-500/[0.07]",
    },
    amber: {
      card: "from-[#30200b] via-[#1b1207] to-[#0e0a05] border-amber-500/35 hover:border-amber-400/50",
      icon: "border border-amber-500/25 bg-amber-500/[0.12] text-amber-300",
      value: "text-zinc-100",
      line: "text-amber-500",
      badge: "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300",
      glow: "bg-amber-500/[0.07]",
    },
  };
  const s = styles[tone] || styles.emerald;
  const isCustomValue = React.isValidElement(value);
  if (isLoading) {
    return (
      <div className={`dashboard-dash-card relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 ${s.card}`}>
        <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-3xl ${s.glow}`} />
        <div className="relative z-10 flex items-start justify-between">
          <div className="w-full">
            <div className="text-xs font-black uppercase tracking-wider text-zinc-400">{title}</div>
            <div className="mt-4 h-9 w-32 animate-pulse rounded-lg bg-white/10" />
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black opacity-40 ${s.icon}`}>{icon}</div>
        </div>
        <div className="relative z-10 mt-4 h-5 w-24 animate-pulse rounded-md bg-white/10" />
      </div>
    );
  }
  return <button className={`dashboard-dash-card group relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 text-left shadow-[0_16px_36px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_20px_42px_rgba(0,0,0,0.34)] ${s.card}`}><div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-3xl ${s.glow}`} /><div className="relative z-10 flex items-start justify-between"><div><div className="text-xs font-black uppercase tracking-wider text-zinc-500">{title}</div><div className={`mt-4 text-3xl font-black ${s.value}`}>{isCustomValue ? value : <AnimatedValue value={value} />}</div></div><div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black ${s.icon}`}>{icon}</div></div><div className="relative z-10 mt-3 flex items-end justify-between"><span className={`dashboard-card-badge rounded-md border px-2 py-1 text-xs font-black ${s.badge}`}>{badge}</span><svg width="86" height="34" viewBox="0 0 86 34" fill="none" className={`${s.line} opacity-65 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-85`}><path d="M2 26 C8 28, 11 12, 17 18 S27 27, 33 16 S45 13, 51 18 S61 8, 68 10 S76 5, 84 2" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M2 31 C11 28, 15 20, 22 22 S32 27, 38 19 S49 15, 55 20 S65 11, 72 13 S78 8, 84 7" stroke="currentColor" strokeWidth="1" opacity="0.35" fill="none" strokeLinecap="round" /></svg></div></button>;
}
function Chart({ curve, tall }) { return <div className={tall ? "mt-5 h-96" : "mt-5 h-72"}><SafeResponsiveContainer><LineChart data={curve}><CartesianGrid strokeDasharray="3 3" opacity={0.12} /><XAxis dataKey="date" stroke="#777" /><YAxis stroke="#777" /><Tooltip contentStyle={{ background: "var(--tooltip-bg, #09090b)", border: "1px solid var(--tooltip-border, #333)", borderRadius: 12, color: "var(--tooltip-text, #ffffff)" }} /><Line type="monotone" dataKey="pnl" stroke="#a855f7" strokeWidth={3} dot={{ r: 5 }} /></LineChart></SafeResponsiveContainer></div>; }
function SectionTitle({ title, icon, gold }) { return <div className="flex items-center gap-3 text-xl font-black"><div className={`rounded-lg p-2 ${gold ? "bg-amber-500/20 text-amber-400" : "bg-fuchsia-500/20 text-fuchsia-400"}`}>{icon}</div>{title}</div>; }
function TopPill({ label, value, green, red }) {
  return <div className={`calendar-top-pill rounded-xl border px-4 py-3 text-sm font-black ${green ? "calendar-top-pill-green border-emerald-500/40 bg-emerald-500/20 text-emerald-300" : red ? "calendar-top-pill-red border-red-500/40 bg-red-500/20 text-red-300" : "calendar-top-pill-neutral border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300"}`}><span className="calendar-top-pill-label mr-2 text-zinc-400">{label}</span>{value}</div>;
}
function Section({ title, icon, children }) { return <div className="trade-form-section mt-6 rounded-xl border border-white/8 bg-[#0a0a0a]"><div className="trade-form-section-header flex items-center gap-3 border-b border-white/8 px-6 py-4 rounded-t-xl"><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/8 text-fuchsia-400">{icon}</span><h3 className="trade-form-section-title text-sm font-black uppercase tracking-wider text-zinc-300">{title}</h3></div><div className="p-6">{children}</div></div>; }
function Field({ label, children }) { return <label className="block text-sm font-semibold text-white"><span className="mb-2 block">{label}</span>{children}</label>; }
function inputPurpleClass(extra = "") {
  return `border-white/15 bg-black text-white outline-none transition-all focus-visible:border-fuchsia-400 focus-visible:ring-2 focus-visible:ring-fuchsia-500/45 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_16px_rgba(178,74,242,0.30)] ${extra}`;
}

function MoneyInput({ value, onChange, placeholder = "0" }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-400">$</span>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputPurpleClass("pl-8")}
      />
    </div>
  );
}
function getSelectOptionStyle(_label) {
  // All options use the same plain style — no per-option coloring.
  // Buy/Sell dots are handled separately via CSS ::before pseudo-elements.
  const plain = { icon: "", active: "", normal: "text-zinc-300" };
  return plain;
}

function flattenSelectChildren(children) {
  const output = [];
  React.Children.forEach(children, (child) => {
    if (!child) return;
    if (Array.isArray(child)) {
      child.forEach((nestedChild) => {
        if (!nestedChild) return;
        const label = String(nestedChild.props?.children ?? "");
        output.push({ label, value: nestedChild.props?.value ?? label });
      });
      return;
    }
    if (child.type === React.Fragment) {
      output.push(...flattenSelectChildren(child.props.children));
      return;
    }
    const label = String(child.props?.children ?? "");
    output.push({ label, value: child.props?.value ?? label });
  });
  return output;
}

function getSelectOptionKey(label) {
  return String(label || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Select({ value, onChange, children }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("down");
  const selectRef = useRef(null);
  const selectId = useRef(`select-${Math.random().toString(36).slice(2)}`);
  const options = flattenSelectChildren(children);
  const selected = options.find((option) => String(option.value) === String(value)) || options[0];
  const selectedKey = getSelectOptionKey(selected?.label);

  useEffect(() => {
    function closeOtherSelects(event) {
      if (event.detail !== selectId.current) setOpen(false);
    }
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("critique-select-open", closeOtherSelects);
    window.addEventListener("critique-dropdown-open", closeOtherSelects);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("critique-select-open", closeOtherSelects);
      window.removeEventListener("critique-dropdown-open", closeOtherSelects);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleOpen() {
    setOpen((current) => {
      const next = !current;
      if (next) {
        const rect = selectRef.current?.getBoundingClientRect();
        const spaceBelow = window.innerHeight - (rect?.bottom || 0);
        setPlacement(spaceBelow < 280 ? "up" : "down");
        window.dispatchEvent(new CustomEvent("critique-select-open", { detail: selectId.current }));
        window.dispatchEvent(new CustomEvent("critique-dropdown-open", { detail: selectId.current }));
      }
      return next;
    });
  }

  function choose(option) {
    onChange?.({ target: { value: option.value } });
    setOpen(false);
  }

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="custom-select-trigger flex h-10 w-full items-center justify-between rounded-md border border-white/15 bg-black px-3 text-left text-sm text-white outline-none transition-all hover:border-fuchsia-400 focus:border-fuchsia-400 focus:shadow-[0_0_14px_rgba(178,74,242,0.16)]"
      >
        <span className={`custom-select-selected custom-select-option-${selectedKey} flex items-center gap-2`}>
          <span className="font-black">{selected?.label || "Select"}</span>
        </span>
        <ChevronDown size={16} className={open ? "text-fuchsia-300 transition-transform rotate-180" : "text-fuchsia-300 transition-transform"} />
      </button>
      {open && (
        <div className={`custom-select-menu absolute left-0 z-[9999] max-h-64 w-full overflow-y-auto rounded-xl border border-fuchsia-500/40 bg-[#050005] p-1 shadow-[0_18px_55px_rgba(0,0,0,0.95)] ring-1 ring-fuchsia-500/20 ${placement === "up" ? "bottom-11" : "top-11"}`}>
          {options.map((option) => {
            const active = String(option.value) === String(value);
            const style = getSelectOptionStyle(option.label);
            const optionKey = getSelectOptionKey(option.label);
            return (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(option);
                }}
                className={`custom-select-option custom-select-option-${optionKey} flex min-h-9 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm leading-5 outline-none transition-all focus:outline-none focus-visible:outline-none ${active ? "custom-select-active" : style.normal}`}
              >
                <span className="w-4 shrink-0 text-fuchsia-400 text-xs">{active ? "✓" : ""}</span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
function StatCard({ title, value, green, gold }) {
  const valueColor = green ? "text-emerald-400" : gold ? "text-amber-400" : "text-zinc-100";
  const accentColor = green ? "bg-emerald-500/8 border-b-2 border-emerald-500/30" : gold ? "bg-amber-500/8 border-b-2 border-amber-500/30" : "bg-fuchsia-500/8 border-b-2 border-fuchsia-500/30";
  return (
    <div className={`stat-card-item group relative overflow-hidden rounded-xl border border-white/8 bg-[#0d0d0d] p-5 transition-all duration-200 hover:border-white/15 hover:-translate-y-0.5 ${accentColor}`}>
      <div className="stat-card-label text-[11px] font-black uppercase tracking-widest text-zinc-600">{title}</div>
      <div className={`stat-card-value mt-3 text-2xl font-black ${valueColor}`}><AnimatedValue value={value} /></div>
    </div>
  );
}

function SignupPricingPage({ setAuthPage }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050308] px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-fuchsia-600/8 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-violet-600/6 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Mail icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-400">
            <Mail size={38} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black tracking-tight text-white">Check your email</h1>
        <p className="mt-3 text-base leading-7 text-zinc-400">
          We sent a confirmation link to your email address.<br />
          Click the link to verify your account, then sign in to start your free trial.
        </p>

        {/* Hint box */}
        <div className="mt-6 rounded-2xl border border-white/8 bg-white/3 px-5 py-4 text-sm leading-6 text-zinc-500">
          Didn't receive it? Check your <span className="font-semibold text-zinc-300">spam or junk folder</span>. The confirmation link expires in 24 hours.
        </div>

        {/* CTA */}
        <button
          onClick={() => setAuthPage("login")}
          className="mt-6 w-full rounded-2xl bg-fuchsia-500 py-4 text-base font-black text-black shadow-[0_0_30px_rgba(178,74,242,0.35)] transition hover:bg-fuchsia-400 hover:shadow-[0_0_40px_rgba(178,74,242,0.5)]"
        >
          I've confirmed — Sign in
        </button>

        <p className="mt-4 text-center text-xs text-zinc-600">
          Wrong email?{" "}
          <button onClick={() => setAuthPage("register")} className="font-bold text-fuchsia-400 hover:text-fuchsia-300">Register again</button>
        </p>
      </div>
    </div>
  );
}

function AuthPage({ authPage, setAuthPage, onSubmitAuth, authLoading, authMessage, isSupabaseReady, passwordRecoverySession, theme, setTheme }) {
  if (authPage === "landing") {
    return <LandingPage setAuthPage={setAuthPage} theme={theme} setTheme={setTheme} />;
  }

  if (["terms", "privacy", "refund", "contact"].includes(authPage)) {
    return <LegalInfoPage page={authPage} setAuthPage={setAuthPage} theme={theme} setTheme={setTheme} />;
  }

  if (authPage === "signup-pricing") {
    return <SignupPricingPage setAuthPage={setAuthPage} />;
  }

  const isLogin = authPage === "login";
  const isRegister = authPage === "register";
  const isForgot = authPage === "forgot";
  const isUpdatePassword = authPage === "updatePassword";
  const [showPassword, setShowPassword] = useState(false);
  const rememberedEmail = (() => {
    try {
      return localStorage.getItem(REMEMBER_EMAIL_KEY) || "";
    } catch {
      return "";
    }
  })();
  const [form, setForm] = useState({
    name: "",
    email: rememberedEmail,
    password: "",
    confirm: "",
    remember: Boolean(rememberedEmail),
    agreedToTerms: false,
  });
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  async function submitAuth(event) {
    event.preventDefault();
    if (!isUpdatePassword && !String(form.email || "").includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isForgot && String(form.password || "").length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if ((isRegister || isUpdatePassword) && !/[A-Z]/.test(String(form.password || ""))) {
      setError("Password needs at least one uppercase letter.");
      return;
    }
    if ((isRegister || isUpdatePassword) && !/\d/.test(String(form.password || ""))) {
      setError("Password needs at least one number.");
      return;
    }
    if ((isRegister || isUpdatePassword) && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (isRegister && !form.agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setError("");
    const mode = isLogin ? "login" : isRegister ? "register" : isUpdatePassword ? "updatePassword" : "forgot";
    const result = await onSubmitAuth?.(mode, form);
    if (result && !result.ok) setError(result.error?.message || "Authentication failed. Try again.");
  }

  const title = isLogin ? "Welcome back" : isRegister ? "Start reviewing your trades like a coach is watching." : isUpdatePassword ? "Create new password" : "Reset password";
  const subtitle = isLogin ? "Continue reviewing your trades, tracking your patterns, and improving your consistency." : isRegister ? "Create your TryCritique account and start your 7-day free trial. No card required." : isUpdatePassword ? "Choose a new secure password for your account" : "Enter your email and we will send a reset link";
  const isLight = theme === "light";
  const authInputClass = isLight ? "border-slate-200 bg-slate-50 pl-11 text-slate-950 placeholder:text-slate-400 focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" : "border-white/10 bg-black/45 pl-11 text-white placeholder:text-zinc-500 focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20";
  const authPasswordInputClass = isLight ? "border-slate-200 bg-slate-50 pl-11 pr-11 text-slate-950 placeholder:text-slate-400 focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20" : "border-white/10 bg-black/45 pl-11 pr-11 text-white placeholder:text-zinc-500 focus-visible:border-fuchsia-400 focus-visible:ring-fuchsia-500/20";
  const resetUrlHasRecoverySignal = (() => {
    try {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      return /code=|access_token|refresh_token|error=|error_code/i.test(`${search}${hash}`);
    } catch {
      return false;
    }
  })();
  const visibleAuthMessage = isForgot && /expired|invalid/i.test(authMessage || "") && !resetUrlHasRecoverySignal ? "" : authMessage;
  const authMessageIsWarning = /expired|invalid|request a new|open the latest|could not|failed/i.test(visibleAuthMessage || "");
  const authMessageClass = authMessageIsWarning
    ? isLight
      ? "mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-700"
      : "mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold leading-6 text-amber-200"
    : isLight
      ? "mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700"
      : "mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-bold leading-6 text-emerald-300";
  const passwordValue = String(form.password || "");
  const passwordRules = [
    { id: "length", label: "Minimum 6 characters", valid: passwordValue.length >= 6 },
    { id: "uppercase", label: "At least one uppercase letter", valid: /[A-Z]/.test(passwordValue) },
    { id: "number", label: "At least one number", valid: /\d/.test(passwordValue) },
  ];
  const shouldShowPasswordRules = (isRegister || isUpdatePassword) && passwordValue.length > 0 && passwordRules.some((rule) => !rule.valid);
  const canSubmitAuth = !authLoading && (!isRegister || form.agreedToTerms);

  return (
    <div className={isLight ? "auth-shell relative min-h-screen overflow-hidden bg-[#f8fafc] text-slate-950" : "auth-shell relative min-h-screen overflow-hidden bg-black text-white"}>
      <div className={isLight ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(178,74,242,0.13),transparent_28%),radial-gradient(circle_at_88%_76%,rgba(16,185,129,0.12),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#ffffff_48%,#f7efff_100%)]" : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(178,74,242,0.18),transparent_34%),radial-gradient(circle_at_84%_80%,rgba(16,185,129,0.10),transparent_28%),linear-gradient(135deg,#000_0%,#060206_45%,#12051b_100%)]"} />
      <div className="auth-animated-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className={isLight ? "pointer-events-none absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-fuchsia-200 to-transparent" : "pointer-events-none absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-fuchsia-500/15 to-transparent"} />

      <div className="relative z-10 flex min-h-screen flex-col lg:grid lg:grid-cols-[520px_1fr]">
        <div className="flex min-h-screen items-center justify-center p-6 lg:p-10">
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} whileHover={{ y: -4 }} transition={{ duration: 0.35 }} className={isLight ? "auth-card-panel w-full max-w-[430px] rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-slate-950 shadow-[0_28px_90px_rgba(15,23,42,0.12),0_0_40px_rgba(178,74,242,0.10)] backdrop-blur-xl" : "auth-card-panel w-full max-w-[480px] rounded-[1.6rem] border border-white/12 bg-[#050507]/92 p-10 shadow-[0_28px_90px_rgba(0,0,0,0.78),0_0_40px_rgba(178,74,242,0.08)] backdrop-blur-xl"}>
            <div className={isLight ? "mb-8 flex items-center justify-between" : "mb-10 flex items-center justify-center gap-4"}>
              <button type="button" onClick={() => setAuthPage("landing")} className="auth-brand-button flex items-center gap-3 text-left" aria-label="Go to home page">
                <BrandBolt className="h-11 w-8 drop-shadow-[0_0_8px_rgba(178,74,242,0.25)]" />
                <span className="text-2xl font-black tracking-tight">{BRAND_NAME}</span>
              </button>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={isLight ? "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-800 shadow-sm hover:border-fuchsia-300" : "absolute right-8 top-8 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-zinc-300 hover:border-fuchsia-500/50 hover:text-white"}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
            </div>

            <div className="text-center">
              <h1 className={isLight ? "text-3xl font-black tracking-tight text-slate-950" : "text-3xl font-black tracking-tight text-white"}>{title}</h1>
              <p className={isLight ? "mt-3 text-sm font-semibold leading-6 text-slate-500" : "mt-3 text-sm font-semibold leading-6 text-zinc-400"}>{subtitle}</p>
            </div>

            {!isSupabaseReady && (
              <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-bold leading-6 text-amber-300">
                Supabase is not connected. Make sure .env is inside the project root and restart npm run dev after saving it.
              </div>
            )}
            {visibleAuthMessage && (
              <div className={authMessageClass}>
                {visibleAuthMessage}
              </div>
            )}

            <form onSubmit={submitAuth} className="mt-8 space-y-5" autoComplete="on">
              {isUpdatePassword && !passwordRecoverySession && (
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-bold leading-6 text-amber-300">
                  Open the reset link from your email to create a new password.
                </div>
              )}

              {isRegister && (
                <AuthField label="Full name" icon="👤">
                  <Input id="auth-name" name="name" autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Enter your name" className={authInputClass} />
                </AuthField>
              )}

              <AuthField label="Email address" icon="✉">
                <Input id="auth-email" name="email" type="email" autoComplete="username" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Enter your email" className={authInputClass} />
              </AuthField>

              {!isForgot && (
                <AuthField label={isUpdatePassword ? "New password" : "Password"} icon="🔒">
                  <Input id="auth-password" name={isUpdatePassword || isRegister ? "new-password" : "password"} type={showPassword ? "text" : "password"} autoComplete={isUpdatePassword || isRegister ? "new-password" : "current-password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Enter your password" className={authPasswordInputClass} />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className={isLight ? "absolute right-3 top-[35px] text-slate-400 hover:text-slate-950" : "absolute right-3 top-[35px] text-zinc-500 hover:text-white"} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </AuthField>
              )}

              {shouldShowPasswordRules && (
                <div className={isLight ? "rounded-2xl border border-red-200 bg-red-50 px-4 py-3" : "rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3"}>
                  <div className={isLight ? "text-xs font-black uppercase tracking-[0.14em] text-red-600" : "text-xs font-black uppercase tracking-[0.14em] text-red-300"}>Password requirements</div>
                  <div className="mt-2 grid gap-1.5">
                    {passwordRules.filter((rule) => !rule.valid).map((rule) => (
                      <div key={rule.id} className={isLight ? "flex items-center gap-2 text-sm font-bold text-red-700" : "flex items-center gap-2 text-sm font-bold text-red-200"}>
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        {rule.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(isRegister || isUpdatePassword) && (
                <AuthField label="Confirm password" icon="🔐">
                  <Input id="auth-confirm-password" name="confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} placeholder="Repeat your password" className={authInputClass} />
                </AuthField>
              )}

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className={isLight ? "flex cursor-pointer items-center gap-2 font-bold text-slate-600" : "flex cursor-pointer items-center gap-2 font-bold text-zinc-400"}>
                    <input
                      type="checkbox"
                      checked={form.remember}
                      onChange={(event) => update("remember", event.target.checked)}
                      className="h-4 w-4 rounded border-fuchsia-400 bg-black text-fuchsia-500 focus:ring-fuchsia-500"
                    />
                    Remember me
                  </label>
                  <button type="button" onClick={() => setAuthPage("forgot")} className="font-black text-fuchsia-300 hover:text-fuchsia-200">Forgot password?</button>
                </div>
              )}

              {error && <div className={isForgot ? "rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-300" : "rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300"}>{error}</div>}

              {isRegister && (
                <label className={isLight ? "flex cursor-pointer items-start gap-3 text-sm font-semibold leading-6 text-slate-600" : "flex cursor-pointer items-start gap-3 text-sm font-semibold leading-6 text-zinc-400"}>
                  <input
                    type="checkbox"
                    checked={form.agreedToTerms}
                    onChange={(event) => update("agreedToTerms", event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-fuchsia-400 bg-black text-fuchsia-500 focus:ring-fuchsia-500"
                  />
                  <span>
                    I agree to the{" "}
                    <button type="button" onClick={(event) => { event.preventDefault(); setAuthPage("terms"); }} className="font-black text-fuchsia-400 hover:text-fuchsia-300">Terms of Service</button>
                    {" "}and{" "}
                    <button type="button" onClick={(event) => { event.preventDefault(); setAuthPage("privacy"); }} className="font-black text-fuchsia-400 hover:text-fuchsia-300">Privacy Policy</button>
                  </span>
                </label>
              )}

              <button type="submit" disabled={!canSubmitAuth} className="auth-submit-button group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-sm font-black text-white shadow-[0_18px_36px_rgba(178,74,242,0.24)] transition hover:scale-[1.01] hover:shadow-[0_20px_44px_rgba(178,74,242,0.34)] disabled:cursor-not-allowed disabled:opacity-60">
                <span className="relative z-10">{authLoading ? "Please wait..." : isLogin ? "Sign in" : isRegister ? "Create account" : isUpdatePassword ? "Update password" : "Send reset link"}</span>
                <span className="relative z-10 transition group-hover:translate-x-1">→</span>
              </button>
              {isRegister && !form.agreedToTerms && !authLoading && (
                <p className={isLight ? "text-center text-xs font-semibold text-slate-400" : "text-center text-xs font-semibold text-zinc-500"}>
                  Agree to the Terms and Privacy Policy above to create your account.
                </p>
              )}
            </form>

            <div className="mt-7 text-center text-sm font-semibold text-zinc-500">
              {isLogin && <>Don&apos;t have an account? <button onClick={() => setAuthPage("register")} className="font-black text-fuchsia-300 hover:text-fuchsia-200">Sign up for free</button></>}
              {isRegister && <>Already have an account? <button onClick={() => setAuthPage("login")} className="font-black text-fuchsia-300 hover:text-fuchsia-200">Sign in</button></>}
              {(isForgot || isUpdatePassword) && <button onClick={() => setAuthPage("login")} className="font-black text-fuchsia-300 hover:text-fuchsia-200">← Back to sign in</button>}
            </div>
            {isRegister && (
              <div className={isLight ? "mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold text-emerald-600" : "mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold text-emerald-300"}>
                <span>✓ 7-day free trial</span>
                <span className={isLight ? "text-slate-300" : "text-zinc-700"}>•</span>
                <span>✓ Full access to all features</span>
                <span className={isLight ? "text-slate-300" : "text-zinc-700"}>•</span>
                <span>✓ Cancel anytime</span>
              </div>
            )}
          </motion.div>
        </div>

        <div className="relative hidden min-h-screen items-center justify-center overflow-hidden p-10 lg:flex">
          {/* Floating accent cards */}
          <div className="auth-float-card auth-float-one absolute left-16 bottom-[30%] rounded-2xl border border-red-500/20 bg-black/40 p-5 opacity-80 shadow-[0_0_35px_rgba(239,68,68,0.10)] backdrop-blur-xl">
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Top Mistake This Week</div>
            <div className="mt-3 text-xl font-black text-red-300">FOMO entries</div>
            <div className="mt-1 text-xs font-bold text-red-400">Cost: − $840</div>
          </div>
          <div className="auth-float-card auth-float-two absolute right-12 top-28 rounded-2xl border border-fuchsia-500/20 bg-black/40 p-5 opacity-80 shadow-[0_0_35px_rgba(178,74,242,0.10)] backdrop-blur-xl">
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Mistake Detector</div>
            <div className="mt-3 text-xl font-black text-fuchsia-300">This week&apos;s fix</div>
            <div className="mt-1 text-xs font-bold text-zinc-400">Skip first 15 min post-news</div>
          </div>
          <div className="auth-float-card auth-float-three absolute right-[6%] top-[30%] rounded-2xl border border-emerald-500/20 bg-black/40 p-5 opacity-80 shadow-[0_0_35px_rgba(16,185,129,0.10)] backdrop-blur-xl">
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">This Week P&amp;L</div>
            <div className="mt-3 text-3xl font-black text-emerald-400">+$1,840</div>
            <div className="mt-1 text-xs font-bold text-zinc-400">Tracked from journal</div>
          </div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="auth-hero-panel relative z-10 max-w-xl text-center">
            <div className="auth-hero-mark mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-fuchsia-500/30 bg-fuchsia-500/10 text-5xl text-fuchsia-300">{BRAND_MARK}</div>
            <h2 className="text-5xl font-black leading-[0.97] tracking-tight text-white">
              {isLogin
                ? <><span className="text-white">Find the leak.</span><br /><span className="text-gradient-primary">Fix the next trade.</span></>
                : <><span className="text-white">Turn every trade</span><br /><span className="text-gradient-primary">into a lesson.</span></>}
            </h2>
            <p className="mx-auto mt-6 max-w-sm text-lg font-semibold leading-8 text-zinc-400">
              {isLogin
                ? "Review your latest patterns, check your most costly mistake, and go into today's session with a clear focus."
                : "Log your trades, find what's costing you money, and build a consistent review habit — one session at a time."}
            </p>
            <div className="mt-10 grid gap-3 text-left">
              {(isLogin
                ? [
                    "Review your latest trades",
                    "See your most costly mistake",
                    "Track session and strategy performance",
                    "Stay focused before the next session",
                  ]
                : [
                    "Log trades with screenshots, strategy, emotion, and mistakes",
                    "Detect repeated patterns that cost you money",
                    "Review sessions, strategies, and news-day performance",
                    "Build a cleaner routine before your next trade",
                  ]
              ).map((bullet) => (
                <div key={bullet} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3">
                  <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span className="text-sm font-semibold text-zinc-300">{bullet}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const LEGAL_PAGES = {
  terms: {
    label: "Terms of Service",
    eyebrow: "Terms",
    updated: "May 26, 2026",
    intro: "These terms explain how TryCritique should be used and what the service is designed to provide.",
    sections: [
      ["Service scope", "TryCritique is a trading journal, analytics, and self-review software product. It helps users record trades, organize notes, review performance, and identify personal behavior patterns."],
      ["No financial advice", "TryCritique does not provide investment advice, trading signals, broker services, copy trading, portfolio management, or guaranteed returns. Any trading decision remains the user's own responsibility."],
      ["Account use", "Users are responsible for keeping their login credentials secure and for entering accurate information into their journal."],
      ["Subscriptions", "Paid access is billed as a recurring subscription through our payment provider and Merchant of Record. Subscription status controls access to Pro features."],
      ["Acceptable use", "Users may not abuse the service, attempt to bypass security, upload unlawful content, or use TryCritique to provide regulated financial services to others."],
      ["Availability", "We aim to keep the service reliable, but access may occasionally be interrupted for maintenance, provider issues, or updates."],
    ],
  },
  privacy: {
    label: "Privacy Policy",
    eyebrow: "Privacy",
    updated: "May 26, 2026",
    intro: "This policy summarizes what data TryCritique uses to run the product and protect your account.",
    sections: [
      ["Data we process", "We process account details such as email, profile information, trading journal entries, screenshots you upload, settings, and subscription status."],
      ["How data is used", "Data is used to provide login, sync, backup, analytics, billing access, support, security, and product improvement."],
      ["Payment data", "Card details are handled by the payment provider and are not stored by TryCritique. We store subscription status and payment-provider identifiers needed to unlock Pro access."],
      ["Storage providers", "TryCritique uses Supabase for authentication and data sync, Vercel for hosting and serverless functions, and Dodo Payments for checkout, subscription, tax, and payment operations."],
      ["User control", "Users can export or remove journal data from the application. Support requests for account deletion can be sent through the contact page."],
      ["Security", "We use server-side keys only in protected server environments and avoid exposing private payment or database credentials in browser code."],
    ],
  },
  refund: {
    label: "Refund & Cancellation Policy",
    eyebrow: "Billing",
    updated: "May 26, 2026",
    intro: "This policy explains how subscriptions, cancellations, and refund requests are handled.",
    sections: [
      ["Free trial", "If a trial is offered, the subscription may renew automatically after the trial unless it is cancelled before the trial ends."],
      ["Cancellation", "Customers can cancel through the billing portal. Access normally remains available until the end of the current billing period unless stated otherwise."],
      ["Refund requests", "Refund requests are reviewed based on payment-provider rules, usage, timing, and local consumer requirements. Contact support with the billing email and reason for the request."],
      ["No guarantee of results", "TryCritique is a journaling and review tool. Refund eligibility is not based on trading performance or market outcomes."],
      ["Payment provider", "Payments, taxes, receipts, and certain refund operations are handled by the Merchant of Record shown at checkout."],
    ],
  },
  contact: {
    label: "Contact & Support",
    eyebrow: "Support",
    updated: "May 26, 2026",
    intro: "Need help with your account, subscription, or product access? Use the contact details below.",
    sections: [
      ["Support email", "Email: support@trycritique.com. Include your account email, a short description, and screenshots if they help explain the issue."],
      ["Billing help", "For subscription issues, include the billing email and whether the issue is checkout, cancellation, renewal, refund, or portal access."],
      ["Data requests", "For account deletion or data export questions, contact support from the email associated with your account."],
      ["Response time", "We aim to respond within 2 business days during normal launch-stage support operations."],
    ],
  },
};

function LegalInfoPage({ page, setAuthPage, theme, setTheme }) {
  const content = LEGAL_PAGES[page] || LEGAL_PAGES.terms;
  const isLight = theme === "light";
  const linkClass = isLight ? "text-slate-500 hover:text-fuchsia-600" : "text-zinc-400 hover:text-fuchsia-300";

  return (
    <div className={isLight ? "min-h-screen bg-[#f8fafc] text-slate-950" : "min-h-screen bg-black text-white"}>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <button onClick={() => setAuthPage("landing")} className="flex items-center gap-3 text-left">
            <BrandBolt className="h-10 w-7 drop-shadow-[0_0_8px_rgba(178,74,242,0.25)]" />
            <span className="text-xl font-black">{BRAND_NAME}</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={isLight ? "rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm" : "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-300"}>
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button onClick={() => setAuthPage("login")} className="rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-black text-white shadow-[0_16px_32px_rgba(178,74,242,0.22)]">Log In</button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 py-14">
          <div className="mb-8 flex flex-wrap gap-3 text-sm font-black">
            {Object.entries(LEGAL_PAGES).map(([key, item]) => (
              <button key={key} onClick={() => setAuthPage(key)} className={key === page ? "rounded-full bg-fuchsia-500 px-4 py-2 text-white" : `rounded-full border px-4 py-2 ${isLight ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/[0.04] text-zinc-300"}`}>
                {item.eyebrow}
              </button>
            ))}
          </div>

          <section className={isLight ? "rounded-[1.6rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10" : "rounded-[1.6rem] border border-white/10 bg-[#050505] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:p-10"}>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-400">{content.eyebrow}</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{content.label}</h1>
            <p className={isLight ? "mt-4 text-sm font-bold text-slate-500" : "mt-4 text-sm font-bold text-zinc-500"}>Last updated: {content.updated}</p>
            <p className={isLight ? "mt-6 max-w-3xl text-base font-semibold leading-7 text-slate-600" : "mt-6 max-w-3xl text-base font-semibold leading-7 text-zinc-400"}>{content.intro}</p>

            <div className="mt-9 space-y-5">
              {content.sections.map(([title, body]) => (
                <div key={title} className={isLight ? "rounded-2xl border border-slate-200 bg-slate-50 p-5" : "rounded-2xl border border-white/10 bg-white/[0.035] p-5"}>
                  <h2 className="text-lg font-black">{title}</h2>
                  <p className={isLight ? "mt-2 text-sm font-semibold leading-7 text-slate-600" : "mt-2 text-sm font-semibold leading-7 text-zinc-400"}>{body}</p>
                </div>
              ))}
            </div>

            <div className={isLight ? "mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-800" : "mt-8 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 text-sm font-semibold leading-6 text-amber-100"}>
              These pages are launch-stage operating policies for TryCritique and should be reviewed with a qualified professional before relying on them as final legal documents.
            </div>
          </section>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-6 text-sm font-bold">
          <span className={isLight ? "text-slate-500" : "text-zinc-500"}>© 2026 {BRAND_NAME}</span>
          <div className="flex flex-wrap gap-4">
            {Object.entries(LEGAL_PAGES).map(([key, item]) => (
              <button key={key} onClick={() => setAuthPage(key)} className={linkClass}>{item.eyebrow}</button>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}

const DEMO_SCENES = [
  {
    eyebrow: "Mistake Detector",
    title: "See exactly what's costing you money",
    body: "Most traders lose the same $500–$2,000 every week on the same 2–3 habits. TryCritique shows you which ones — ranked by total cost.",
    voiceover: "The Mistake Detector groups every tagged error by type, shows how often it happens, and ranks them by total cost. You pick one to fix — not all of them at once.",
    stat: "−$2,360",
    accent: "amber",
    bullets: ["FOMO entries · cost: −$840", "Revenge trades · cost: −$540", "One fix per week — no overwhelm"],
  },
  {
    eyebrow: "Win Rate & Analytics",
    title: "Know which setups actually work",
    body: "Stop guessing. See your real win rate per session, per strategy, and per currency — so you only take trades where you have a proven edge.",
    voiceover: "Instead of guessing which setups work, you can see your exact win rate and average R:R per session, strategy, and market condition.",
    stat: "78%",
    accent: "emerald",
    bullets: ["Win rate by session & setup", "Avg R:R per strategy", "Cut weak setups instantly"],
  },
  {
    eyebrow: "Trade Journal",
    title: "Log in 60 seconds, review in minutes",
    body: "Capture symbol, direction, session, risk, P&L, screenshots, emotion, and execution quality — then replay any trade with one click.",
    voiceover: "TryCritique gives traders a calm, structured workspace to log every trade with screenshots, tags, and notes — without spreadsheets.",
    stat: "+$780",
    accent: "fuchsia",
    bullets: ["Screenshot & tag every trade", "Risk and R:R tracking", "Searchable trade history"],
  },
  {
    eyebrow: "Calendar View",
    title: "Spot losing patterns at a glance",
    body: "See every trading day color-coded by P&L. Losing Mondays? Bad London session weeks? The calendar makes it impossible to ignore.",
    voiceover: "The calendar shows winning days, losing days, break-even days, and news events in one visual — so patterns that were hidden become obvious.",
    stat: "May",
    accent: "cyan",
    bullets: ["Daily P&L heatmap", "Weekly & monthly totals", "News-day context built in"],
  },
  {
    eyebrow: "Try it free",
    title: "7 days free. No credit card.",
    body: "Start your free trial today. Most traders find their biggest leak in the first week — and fix it in the second.",
    voiceover: "TryCritique is affordable and built for daily use. Journal, review, analytics, and calendar — one focused workspace that pays for itself.",
    stat: "Free",
    accent: "fuchsia",
    bullets: ["Full access for 7 days", "Cancel anytime — no lock-in", "Most traders find their leak in week 1"],
  },
];

function LandingPage({ setAuthPage, theme, setTheme }) {
  const isLight = theme === 'light';
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const goHome = () => {
    window.history.replaceState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={isLight ? 'min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-950' : 'min-h-screen overflow-x-hidden bg-transparent text-white'}>
      {!isLight && <ShaderBackground />}
      <div className={isLight ? 'pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(178,74,242,0.12),transparent_30%),radial-gradient(circle_at_82%_62%,rgba(20,184,166,0.12),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#ffffff_46%,#f7f0ff_100%)]' : 'pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(126,34,206,0.05),transparent_31%)]'} />
      <LandingHeader isLight={isLight} theme={theme} setTheme={setTheme} setAuthPage={setAuthPage} onGoHome={goHome} />
      <main className="relative z-10 pt-16">
        <LandingHero isLight={isLight} setAuthPage={setAuthPage} onWatchDemo={() => setIsDemoOpen(true)} />
        <div className="section-divider mx-5 lg:mx-8" />
        <LandingFeatures isLight={isLight} />
        <div className="section-divider mx-5 lg:mx-8" />
        <LandingHowItWorks isLight={isLight} />
        <LandingTestimonials isLight={isLight} />
        <LandingPricing isLight={isLight} setAuthPage={setAuthPage} />
        <LandingFAQ isLight={isLight} />
        <LandingFinalCTA isLight={isLight} setAuthPage={setAuthPage} />
        <LandingFooter isLight={isLight} setAuthPage={setAuthPage} />
        {isDemoOpen && <WatchDemoModal onClose={() => setIsDemoOpen(false)} onStart={() => setAuthPage('register')} isLight={isLight} />}
      </main>
    </div>
  );
}

function WatchDemoModal({ onClose, onStart, isLight }) {
  const [activeScene, setActiveScene] = useState(0);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Ready for voice preview");
  const scene = DEMO_SCENES[activeScene];
  const accentClass = {
    emerald: "text-emerald-300 border-emerald-400/35 bg-emerald-500/10",
    fuchsia: "text-fuchsia-300 border-fuchsia-400/35 bg-fuchsia-500/10",
    cyan: "text-cyan-300 border-cyan-400/35 bg-cyan-500/10",
    amber: "text-amber-300 border-amber-400/35 bg-amber-500/10",
  }[scene.accent] || "text-fuchsia-300 border-fuchsia-400/35 bg-fuchsia-500/10";

  const stopVoiceover = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoicePlaying(false);
    setVoiceStatus("Voice preview stopped");
  };

  const playSceneVoice = (sceneIndex) => {
    if (!("speechSynthesis" in window)) {
      setIsVoicePlaying(false);
      setVoiceStatus("Voice playback is not supported in this browser");
      return;
    }

    const currentScene = DEMO_SCENES[sceneIndex];
    if (!currentScene) {
      setIsVoicePlaying(false);
      setVoiceStatus("Voice preview complete");
      return;
    }

    setActiveScene(sceneIndex);
    setVoiceStatus(`Playing calm male voice · ${currentScene.eyebrow}`);

    const utterance = new SpeechSynthesisUtterance(currentScene.voiceover);
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("en"));
    const preferredVoice =
      englishVoices.find((voice) => /david|guy|mark|george|daniel|alex|james|richard|thomas|matthew|brian|male/i.test(voice.name)) ||
      englishVoices.find((voice) => !/female|samantha|zira|jenny|aria|susan|victoria|karen|moira|tessa/i.test(voice.name)) ||
      englishVoices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.86;
    utterance.pitch = 0.82;
    utterance.volume = 1;
    utterance.onend = () => {
      const nextScene = sceneIndex + 1;
      if (nextScene < DEMO_SCENES.length) {
        window.setTimeout(() => playSceneVoice(nextScene), 260);
      } else {
        setIsVoicePlaying(false);
        setVoiceStatus("Voice preview complete");
      }
    };
    utterance.onerror = () => {
      setIsVoicePlaying(false);
      setVoiceStatus("Voice preview could not play");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceover = () => {
    setIsVoicePlaying(true);
    playSceneVoice(activeScene);
  };

  useEffect(() => {
    if (isVoicePlaying) return undefined;
    const timer = window.setInterval(() => {
      setActiveScene((current) => (current + 1) % DEMO_SCENES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [isVoicePlaying]);

  useEffect(() => {
    const loadVoices = () => {
      if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
    };
    loadVoices();
    if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const accentBar   = { emerald: "from-emerald-500 to-teal-400",   fuchsia: "from-fuchsia-500 to-violet-500", cyan: "from-cyan-500 to-blue-400",   amber: "from-amber-500 to-orange-400" }[scene.accent] || "from-fuchsia-500 to-violet-500";
  const accentGlow  = { emerald: "rgba(16,185,129,0.22)",          fuchsia: "rgba(139,92,246,0.22)",          cyan: "rgba(6,182,212,0.22)",         amber: "rgba(245,158,11,0.22)"  }[scene.accent] || "rgba(139,92,246,0.22)";
  const accentText  = { emerald: "text-emerald-400",               fuchsia: "text-fuchsia-400",               cyan: "text-cyan-400",                amber: "text-amber-400"         }[scene.accent] || "text-fuchsia-400";
  const accentBorder= { emerald: "border-emerald-500/30",          fuchsia: "border-fuchsia-500/30",          cyan: "border-cyan-500/30",           amber: "border-amber-500/30"    }[scene.accent] || "border-fuchsia-500/30";
  const accentBg    = { emerald: "bg-emerald-500/10",              fuchsia: "bg-fuchsia-500/10",              cyan: "bg-cyan-500/10",               amber: "bg-amber-500/10"        }[scene.accent] || "bg-fuchsia-500/10";

  return (
    <div className="demo-modal-root fixed inset-0 z-[100] flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-xl">
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-violet-500/25 bg-gradient-to-b from-[#0c0814] to-[#07050f] text-white shadow-[0_40px_130px_rgba(109,40,217,0.35),0_0_0_1px_rgba(139,92,246,0.12)]">

        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]">
          <div className="absolute -top-20 left-1/4 h-64 w-64 rounded-full blur-3xl" style={{background:`radial-gradient(circle,${accentGlow},transparent 70%)`}} />
          <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        {/* Header bar */}
        <div className="relative flex items-center justify-between border-b border-white/8 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
              <PlayCircle size={17} className="text-white" />
            </span>
            <div>
              <div className="text-sm font-black text-white">TryCritique — Product Demo</div>
              <div className="text-[11px] font-semibold text-violet-400">{voiceStatus}</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-zinc-400 transition hover:bg-white/10 hover:text-white" aria-label="Close demo">
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="relative grid lg:grid-cols-[1.1fr_0.9fr]">

          {/* LEFT — mock product UI */}
          <div className="relative min-h-[420px] overflow-hidden border-r border-white/8 p-6">
            {/* Scene dots */}
            <div className="mb-5 flex items-center gap-2">
              {DEMO_SCENES.map((item, index) => (
                <button key={item.eyebrow} type="button" onClick={() => { stopVoiceover(); setActiveScene(index); }}
                  className={`transition-all duration-300 rounded-full ${index === activeScene ? `h-2 w-8 bg-gradient-to-r ${accentBar}` : "h-2 w-2 bg-white/15 hover:bg-white/30"}`}
                  aria-label={`Show ${item.eyebrow}`} />
              ))}
              <span className="ml-auto rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[10px] font-black text-zinc-400">Live preview</span>
            </div>

            {/* Stat card */}
            <motion.div key={scene.eyebrow + "-stat"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className={`rounded-2xl border ${accentBorder} ${accentBg} p-5`}>
              <div className={`text-[10px] font-black uppercase tracking-[0.22em] ${accentText}`}>{scene.eyebrow}</div>
              <div className="mt-3 text-5xl font-black text-white">{scene.stat}</div>
              <div className="mt-2 text-sm font-semibold text-zinc-400">Real data. Real patterns. Real improvement.</div>
              {/* accent bar */}
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                <motion.div initial={{ width: 0 }} animate={{ width: "72%" }} transition={{ duration: 0.9, delay: 0.2 }}
                  className={`h-full rounded-full bg-gradient-to-r ${accentBar}`} />
              </div>
            </motion.div>

            {/* Bullets card */}
            <motion.div key={scene.eyebrow + "-bullets"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
              className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-black text-white">{BRAND_NAME} Pro</span>
                <span className={`rounded-full border ${accentBorder} ${accentBg} px-2.5 py-0.5 text-[10px] font-black ${accentText}`}>Active</span>
              </div>
              <div className="space-y-2.5">
                {scene.bullets.map((bullet, index) => (
                  <motion.div key={bullet} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + index * 0.08 }}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5">
                    <Check size={14} className={accentText} />
                    <span className="text-sm font-semibold text-white/90">{bullet}</span>
                  </motion.div>
                ))}
              </div>

              {/* Mini chart */}
              <div className="mt-4 h-14 overflow-hidden rounded-xl border border-white/8 bg-black/30 px-3 py-2">
                <div className="flex h-full items-end gap-1.5">
                  {[28, 45, 38, 62, 55, 78, 65, 90, 72, 88].map((h, i) => (
                    <span key={i} className={`flex-1 rounded-t-sm bg-gradient-to-t ${accentBar} opacity-80`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — sales copy — isolated background so glow blobs don't bleed */}
          <div className="relative flex flex-col justify-between bg-[#0e0b1a] p-7">
            <div>
              <div className={`text-[10px] font-black uppercase tracking-[0.22em] ${accentText}`}>Why traders buy it</div>
              <motion.h3 key={scene.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                className="mt-3 text-3xl font-black leading-tight text-white">{scene.title}</motion.h3>
              <motion.p key={scene.body} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="mt-4 text-sm font-semibold leading-7 text-zinc-300">{scene.body}</motion.p>

              {/* Social proof */}
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <div className="flex -space-x-2">
                  {["#7c3aed","#0ea5e9","#10b981","#f59e0b"].map((c,i) => (
                    <span key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0e0b1a] text-[10px] font-black text-white" style={{background:c}}>{["J","M","S","R"][i]}</span>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-black text-white">2,000+ traders use TryCritique</div>
                  <div className="text-[10px] font-semibold text-zinc-400">Futures · Forex · Crypto · Stocks</div>
                </div>
              </div>

              {/* Voice */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3">
                <div className="text-xs font-semibold text-zinc-300 leading-5">{scene.voiceover.slice(0, 72)}…</div>
                <button type="button" onClick={isVoicePlaying ? stopVoiceover : startVoiceover}
                  className={`ml-3 shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-black transition ${isVoicePlaying ? "border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30" : "border-violet-500/50 bg-violet-500/20 text-violet-200 hover:bg-violet-500/30"}`}>
                  {isVoicePlaying ? <PauseCircle size={13} /> : <Volume2 size={13} />}
                  {isVoicePlaying ? "Stop" : "Play"}
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-7 space-y-3">
              <button type="button" onClick={() => { stopVoiceover(); onStart(); }}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-black text-white shadow-[0_8px_28px_rgba(139,92,246,0.40)] transition-all hover:shadow-[0_12px_36px_rgba(139,92,246,0.55)] hover:scale-[1.02]">
                <span className="relative flex items-center justify-center gap-2">
                  Start 7-Day Free Trial <ChevronRight size={16} />
                </span>
              </button>
              <button type="button" onClick={() => { stopVoiceover(); onClose(); }}
                className="w-full rounded-xl border border-white/15 bg-white/6 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white">
                Keep browsing
              </button>
              <div className="text-center text-[11px] font-semibold text-zinc-500">No credit card · Cancel anytime</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AuthField({ label, icon, children }) {
  const cleanIcon = label.includes("Email") ? <Mail size={17} /> : label.includes("password") || label.includes("Password") ? <Lock size={17} /> : label.includes("Full") ? <User size={17} /> : label.includes("Account") ? <Target size={17} /> : icon;
  return (
    <label className="relative block text-sm font-black">
      <span className="mb-2 block">{label}</span>
      <span className="pointer-events-none absolute left-3 top-[34px] z-10 flex h-6 w-6 items-center justify-center text-zinc-500">{cleanIcon}</span>
      {children}
    </label>
  );
}

function AuthHeroMetric({ value, label }) {
  return (
    <div className="auth-hero-metric rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-xs font-black uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}

