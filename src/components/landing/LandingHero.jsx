import React from "react";
import { AlertTriangle, ChevronRight, PlayCircle, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export function LandingHero({ isLight, setAuthPage, onWatchDemo }) {
  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-2 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-2xl">
        <div className={isLight ? "mb-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-300 bg-fuchsia-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-fuchsia-700" : "eyebrow-badge mb-7"}>
          <AlertTriangle size={13} />
          Trading journal that finds your leaks
        </div>
        <h1 className="text-5xl font-black leading-[0.93] tracking-tight sm:text-6xl lg:text-7xl">
          Stop Repeating<br />
          the Same<br />
          <span className={isLight ? "bg-gradient-to-r from-fuchsia-600 via-purple-500 to-emerald-500 bg-clip-text text-transparent" : "text-gradient-hero"}>
            Trading Mistakes
          </span>
        </h1>
        <p className={isLight ? "mt-8 max-w-xl text-lg font-semibold leading-8 text-slate-600" : "mt-8 max-w-xl text-lg font-semibold leading-[1.75] text-zinc-400"}>
          TryCritique reviews your trades, detects costly patterns, and shows what to fix before your next trading session.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => setAuthPage("register")}
            className={isLight ? "inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-fuchsia-500 px-8 text-base font-black text-white shadow-[0_18px_42px_rgba(178,74,242,0.28)] transition hover:scale-[1.02] hover:bg-fuchsia-400" : "btn-primary-glow inline-flex h-14 items-center justify-center gap-3 rounded-xl px-8 text-base font-black text-white"}
          >
            Start 7-Day Free Trial
            <ChevronRight size={19} />
          </button>
          <button
            type="button"
            onClick={onWatchDemo}
            className={isLight ? "inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-8 text-base font-black text-slate-950 transition hover:border-fuchsia-300 hover:bg-fuchsia-50" : "btn-ghost-glow inline-flex h-14 items-center justify-center gap-3 rounded-xl px-8 text-base font-black text-white"}
          >
            <PlayCircle size={20} />
            See Example Mistake Report
          </button>
        </div>

        <div className={isLight ? "mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500" : "mt-5 flex items-center gap-2 text-sm font-semibold text-zinc-500"}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">✓</span>
          7-day free trial · no credit card required · cancel anytime
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {["Futures", "Forex", "Crypto", "Stocks", "Options", "Indices"].map((market) => (
            <span key={market} className={isLight ? "rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-500" : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-zinc-400"}>
              {market}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Mistake report preview */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="relative mx-auto w-full max-w-[520px]"
      >
        {/* Floating leak cost badge */}
        <div className={isLight ? "absolute -top-4 right-4 z-10 rounded-2xl border border-red-200 bg-white px-5 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.12)]" : "absolute -top-4 right-4 z-10 rounded-2xl border border-red-500/30 bg-zinc-950 px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.55)]"}>
          <div className={isLight ? "text-xs font-black text-slate-400" : "text-xs font-black text-zinc-500"}>Weekly leak cost</div>
          <div className="text-xl font-black text-red-400">− $2,360</div>
        </div>

        <div className={isLight ? "overflow-hidden rounded-[1.6rem] border border-violet-200/60 bg-white shadow-[0_40px_110px_rgba(109,40,217,0.16),0_8px_30px_rgba(109,40,217,0.08)]" : "glass-card-vivid gradient-border glow-fuchsia overflow-hidden rounded-[1.6rem]"}>

          {/* Dark header */}
          {isLight && (
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 px-6 py-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.25),transparent_60%)]" />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-violet-400">Mistake Report</div>
                  <div className="mt-0.5 text-sm font-black text-white">This Week</div>
                </div>
                <span className="rounded-full border border-red-400/40 bg-red-500/20 px-3 py-1 text-xs font-black text-red-300">4 patterns found</span>
              </div>
            </div>
          )}

          <div className={isLight ? "p-5" : "p-6"}>
            {!isLight && (
              <div className="mb-5 flex items-center justify-between">
                <div className="text-sm font-black text-white">Mistake Report · This Week</div>
                <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-black text-red-400">4 patterns found</span>
              </div>
            )}

            <div className="space-y-2.5">
              {[
                { label: "FOMO entries after news spike", count: 6, pct: 72, cost: "− $840", color: "red" },
                { label: "Trades during London close", count: 4, pct: 48, cost: "− $520", color: "red" },
                { label: "Oversized risk after a loss", count: 3, pct: 36, cost: "− $390", color: "amber" },
                { label: "Early exit — fear of giving back", count: 7, pct: 84, cost: "− $610", color: "amber" },
              ].map(({ label, count, pct, cost, color }) => (
                <div
                  key={label}
                  className={
                    isLight
                      ? color === "red"
                        ? "flex items-center gap-3 overflow-hidden rounded-xl border border-red-100 bg-gradient-to-r from-red-50/80 to-white pl-0 pr-4 py-3 shadow-[0_1px_4px_rgba(239,68,68,0.07)]"
                        : "flex items-center gap-3 overflow-hidden rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/80 to-white pl-0 pr-4 py-3 shadow-[0_1px_4px_rgba(245,158,11,0.07)]"
                      : color === "red"
                        ? "rounded-2xl border border-red-500/25 bg-red-500/8 p-4"
                        : "rounded-2xl border border-amber-500/25 bg-amber-500/8 p-4"
                  }
                >
                  {isLight && (
                    <div className={color === "red" ? "h-full w-1 self-stretch rounded-r-full bg-gradient-to-b from-red-500 to-rose-400 shrink-0" : "h-full w-1 self-stretch rounded-r-full bg-gradient-to-b from-amber-500 to-yellow-400 shrink-0"} />
                  )}
                  <div className={isLight ? "flex-1 min-w-0" : "w-full"}>
                    <div className={isLight ? "flex items-center justify-between gap-2" : "flex items-center justify-between gap-3"}>
                      <div className={isLight ? "text-sm font-black text-slate-800 truncate" : "text-sm font-black text-white"}>{label}</div>
                      <div className={color === "red" ? "shrink-0 text-sm font-black text-red-500" : "shrink-0 text-sm font-black text-amber-500"}>{cost}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className={isLight ? color === "red" ? "h-1.5 flex-1 rounded-full bg-red-100" : "h-1.5 flex-1 rounded-full bg-amber-100" : "h-2 flex-1 rounded-full bg-white/10"}>
                        <div
                          className={color === "red" ? "h-full rounded-full bg-gradient-to-r from-red-500 to-rose-400" : "h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={isLight ? "text-xs font-bold text-slate-400" : "text-xs font-bold text-zinc-500"}>{count}×</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={isLight
              ? "mt-4 overflow-hidden rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-600 to-fuchsia-600 p-4 shadow-[0_4px_16px_rgba(109,40,217,0.22)]"
              : "mt-5 rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/8 p-4"}>
              <div className={isLight ? "text-[10px] font-black uppercase tracking-widest text-violet-200" : "text-xs font-black uppercase tracking-wider text-fuchsia-400"}>This week&apos;s focus</div>
              <p className={isLight ? "mt-2 text-sm font-black text-white" : "mt-2 text-sm font-black text-white"}>
                Stop entering trades in the first 15 minutes after a major news event.
              </p>
              <p className={isLight ? "mt-1 text-xs font-semibold text-violet-200" : "mt-1 text-xs font-semibold text-zinc-400"}>
                Fixing this alone recovers an estimated $840 per week.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {!isLight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs font-bold tracking-widest text-zinc-600 uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown size={20} className="text-zinc-600" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
