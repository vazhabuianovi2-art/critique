import React from "react";
import { AlertTriangle, ChevronRight, PlayCircle, ChevronDown, TrendingUp, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function LandingHero({ isLight, setAuthPage, onWatchDemo }) {
  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-2 lg:px-8">

      {/* Light mode decorative blobs */}
      {isLight && (
        <>
          <div className="pointer-events-none absolute -top-32 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-violet-200/40 via-fuchsia-100/30 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-100/50 to-transparent blur-3xl" />
        </>
      )}

      {/* Left — copy */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative max-w-2xl">

        {/* Eyebrow */}
        <div className={isLight
          ? "mb-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-violet-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-fuchsia-600 shadow-[0_2px_12px_rgba(192,38,211,0.12)]"
          : "eyebrow-badge mb-7"}>
          <AlertTriangle size={13} />
          Trading journal that finds your leaks
        </div>

        {/* Headline */}
        <h1 className={isLight ? "text-5xl font-black leading-[0.93] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl" : "text-5xl font-black leading-[0.93] tracking-tight sm:text-6xl lg:text-7xl"}>
          Stop Repeating<br />
          the Same<br />
          <span className={isLight
            ? "bg-gradient-to-r from-fuchsia-600 via-violet-500 to-purple-600 bg-clip-text text-transparent"
            : "text-gradient-hero"}>
            Trading Mistakes
          </span>
        </h1>

        <p className={isLight ? "mt-8 max-w-xl text-lg font-semibold leading-8 text-slate-500" : "mt-8 max-w-xl text-lg font-semibold leading-[1.75] text-zinc-400"}>
          TryCritique reviews your trades, detects costly patterns, and shows what to fix before your next trading session.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => setAuthPage("register")}
            className={isLight
              ? "inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-8 text-base font-black text-white shadow-[0_8px_32px_rgba(139,92,246,0.35)] transition hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(139,92,246,0.45)]"
              : "btn-primary-glow inline-flex h-14 items-center justify-center gap-3 rounded-xl px-8 text-base font-black text-white"}
          >
            Start 7-Day Free Trial
            <ChevronRight size={19} />
          </button>
          <button
            type="button"
            onClick={onWatchDemo}
            className={isLight
              ? "group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-xl border border-violet-200 bg-white px-8 text-base font-black text-slate-900 shadow-[0_4px_18px_rgba(109,40,217,0.10)] transition-all duration-300 hover:border-violet-400 hover:shadow-[0_6px_24px_rgba(109,40,217,0.20)] hover:scale-[1.02]"
              : "group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-xl border border-violet-500/30 bg-white/5 px-8 text-base font-black text-white shadow-[0_4px_18px_rgba(109,40,217,0.15)] backdrop-blur-sm transition-all duration-300 hover:border-violet-400/60 hover:bg-white/10 hover:shadow-[0_6px_24px_rgba(109,40,217,0.28)] hover:scale-[1.02]"}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_2px_8px_rgba(109,40,217,0.35)]">
              <PlayCircle size={15} className="text-white" />
            </span>
            <span>
              <span className="block text-[13px] leading-tight">See Example</span>
              <span className={isLight ? "block text-[11px] font-semibold leading-tight text-violet-500" : "block text-[11px] font-semibold leading-tight text-violet-400"}>Mistake Report →</span>
            </span>
          </button>
        </div>

        {/* Trust line */}
        <div className={isLight ? "mt-5 flex items-center gap-2 text-sm font-semibold text-slate-400" : "mt-5 flex items-center gap-2 text-sm font-semibold text-zinc-500"}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-500">✓</span>
          7-day free trial · no credit card required · cancel anytime
        </div>

        {/* Quick stats strip */}
        {isLight && (
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { icon: TrendingUp, label: "Win rate improved", value: "+23%" },
              { icon: Shield, label: "Mistakes reduced", value: "−61%" },
              { icon: Zap, label: "Setup in", value: "60 sec" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2.5 shadow-[0_2px_10px_rgba(109,40,217,0.07)]">
                <Icon size={14} className="text-violet-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                <span className="text-xs font-black text-violet-600">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Market tags — dark mode only */}
        {!isLight && (
          <div className="mt-8 flex flex-wrap gap-2">
            {["Futures", "Forex", "Crypto", "Stocks", "Options", "Indices"].map((market) => (
              <span key={market} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-zinc-400">
                {market}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Right — Mistake Report card (unchanged — already premium dark) */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="relative mx-auto w-full max-w-[520px]"
      >
        {/* Glow behind card in light mode */}
        {isLight && (
          <div className="absolute inset-0 -m-8 rounded-[3rem] bg-gradient-to-br from-violet-300/20 via-fuchsia-200/15 to-transparent blur-2xl" />
        )}

        {/* Floating leak cost badge */}
        <div className="absolute -top-4 right-4 z-10 rounded-2xl border border-violet-500/30 bg-[#0f0a1e] px-5 py-3 shadow-[0_8px_30px_rgba(109,40,217,0.3),0_0_0_1px_rgba(139,92,246,0.12)]">
          <div className="text-xs font-black text-violet-400">Weekly leak cost</div>
          <div className="text-xl font-black text-red-400">− $2,360</div>
        </div>

        <div className="relative overflow-hidden rounded-[1.6rem] border border-violet-500/30 bg-gradient-to-b from-[#0f0a1e] via-[#0d0818] to-[#080510] shadow-[0_40px_120px_rgba(109,40,217,0.35),0_0_0_1px_rgba(139,92,246,0.15)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.22),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{backgroundImage:"linear-gradient(rgba(139,92,246,1) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,1) 1px,transparent 1px)",backgroundSize:"32px 32px"}} />

          <div className="relative border-b border-violet-500/20 bg-white/[0.06] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Mistake Report</div>
                <div className="mt-0.5 text-base font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">This Week</div>
              </div>
              <span className="rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-xs font-black text-red-400">4 patterns found</span>
            </div>
          </div>

          <div className="relative space-y-2 p-5">
            {[
              { label: "FOMO entries after news spike", count: 6, pct: 72, cost: "− $840", color: "red" },
              { label: "Trades during London close",    count: 4, pct: 48, cost: "− $520", color: "red" },
              { label: "Oversized risk after a loss",   count: 3, pct: 36, cost: "− $390", color: "amber" },
              { label: "Early exit — fear of giving back", count: 7, pct: 84, cost: "− $610", color: "amber" },
            ].map(({ label, count, pct, cost, color }) => (
              <div key={label} className={color === "red"
                ? "rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3"
                : "rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3"}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold text-white/90">{label}</div>
                  <div className={color === "red" ? "shrink-0 text-sm font-black text-red-400" : "shrink-0 text-sm font-black text-amber-400"}>{cost}</div>
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-white/8">
                    <div
                      className={color === "red"
                        ? "h-full rounded-full bg-gradient-to-r from-red-500 via-rose-400 to-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        : "h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white/40">{count}×</span>
                </div>
              </div>
            ))}

            <div className="relative overflow-hidden rounded-xl border border-violet-400/20 bg-white/95 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-500">This week's focus</div>
              </div>
              <p className="mt-2 text-sm font-black text-slate-900">
                Stop entering trades in the first 15 minutes after a major news event.
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-700">
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
