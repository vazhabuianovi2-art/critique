// Pure display-formatting helpers.
// No React, no state, no localStorage, no Supabase, no auth/billing.
// All functions are pure: (input) → display string / CSS class string.

export function formatMoney(value) {
  const number = Number(value || 0);
  const prefix = number >= 0 ? "$" : "-$";
  return `${prefix}${Math.abs(number).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatTimeInput(raw) {
  // strips non-digits, limits to 4, inserts colon after 2 digits
  const digits = String(raw).replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function formatDisplayName(value, fallback = "User") {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  const name = raw.includes("@") ? raw.split("@")[0] : raw;
  const cleaned = name.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;
  return cleaned
    .split(" ")
    .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : "")
    .join(" ");
}

export function getFirstDisplayName(name, fallback = "User") {
  const displayName = formatDisplayName(name, fallback);
  return displayName.split(" ")[0] || fallback;
}

export function getPnlToneClass(value) {
  const pnl = Number(value || 0);
  if (pnl > 0) return "text-emerald-400";
  if (pnl < 0) return "text-red-400";
  return "text-amber-400";
}

export function getPnlPillClass(value) {
  const pnl = Number(value || 0);
  if (pnl > 0) return "border-emerald-500/30 bg-emerald-500/15 text-emerald-300";
  if (pnl < 0) return "border-red-500/30 bg-red-500/15 text-red-300";
  return "border-amber-500/30 bg-amber-500/15 text-amber-300";
}

export function getPnlArrow(value) {
  const pnl = Number(value || 0);
  if (pnl > 0) return "↗";
  if (pnl < 0) return "↘";
  return "—";
}

export function getAccountTypeLabel(type) {
  return String(type || "Demo Account").replace(/\s+Account$/i, "").toLowerCase();
}

export function formatEconomicRangeDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getEconomicWeekLabel(value) {
  if (value === "last") return "Last Week";
  if (value === "next") return "Next Week";
  return "This Week";
}

export function getEventImpactTone(impact) {
  const value = String(impact || "").toLowerCase();
  if (value.includes("high")) return "red";
  if (value.includes("medium")) return "amber";
  if (value.includes("holiday")) return "zinc";
  return "blue";
}

export function getEventImpactClass(impact) {
  const tone = getEventImpactTone(impact);
  if (tone === "red") return "border-red-500/35 bg-red-500/10 text-red-300";
  if (tone === "amber") return "border-amber-500/35 bg-amber-500/10 text-amber-300";
  if (tone === "zinc") return "border-white/10 bg-white/8 text-zinc-400";
  return "border-blue-500/35 bg-blue-500/10 text-blue-300";
}

export function getEventImpactLabel(impact) {
  const tone = getEventImpactTone(impact);
  if (tone === "red") return "High";
  if (tone === "amber") return "Medium";
  if (tone === "zinc") return "Holiday";
  return "Low";
}

export function getEventImpactFolderClass(impact) {
  const tone = getEventImpactTone(impact);
  if (tone === "red") return "bg-red-500 shadow-[0_0_10px_rgba(248,113,113,0.35)]";
  if (tone === "amber") return "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.30)]";
  if (tone === "zinc") return "bg-zinc-500 shadow-[0_0_10px_rgba(113,113,122,0.22)]";
  return "bg-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.28)]";
}
