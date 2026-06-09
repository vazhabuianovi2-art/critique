import React from "react";
import { Sparkles, ChevronRight, PlayCircle, ChevronDown, ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { BRAND_NAME } from "../../utils/constants";

export function LandingHero({ isLight, setAuthPage, onWatchDemo }) {
  const metrics = [
    ["Portfolio Value", "$247,890"],
    ["Win Rate", "78.3%"],
    ["Risk", "1.2%"],
  ];
  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-2xl">
        <div className={isLight ? "mb-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-300 bg-fuchsia-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950" : "eyebrow-badge mb-7"}>
          <Sparkles size={13} />
          Trading journal for serious growth
        </div>
        <h1 className="text-6xl font-black leading-[0.93] tracking-tight sm:text-7xl lg:text-8xl">
          Trade<br />
          Smarter<br />
          <span className={isLight ? "bg-gradient-to-r from-blue-500 via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent" : "text-gradient-hero"}>Not Harder</span>
        </h1>
        <p className={isLight ? "mt-8 max-w-xl text-lg font-semibold leading-8 text-slate-600 sm:text-xl" : "mt-8 max-w-xl text-lg font-semibold leading-[1.75] text-zinc-400 sm:text-xl"}>
          The all-in-one trading journal that tracks your psychology, reveals your edge, and turns every trade into a sharper decision.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button type="button" onClick={() => setAuthPage("register")} className={isLight ? "inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-white px-8 text-base font-black text-slate-950 shadow-[0_22px_50px_rgba(15,23,42,0.10)] transition hover:scale-[1.02] hover:bg-slate-50" : "btn-primary-glow inline-flex h-14 items-center justify-center gap-3 rounded-xl px-8 text-base font-black text-white"}>
            Start Free Trial
            <ChevronRight size={19} />
          </button>
          <button type="button" onClick={onWatchDemo} className={isLight ? "inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-fuchsia-200 bg-white/65 px-8 text-base font-black text-slate-950 transition hover:border-fuchsia-300 hover:bg-white" : "btn-ghost-glow inline-flex h-14 items-center justify-center gap-3 rounded-xl px-8 text-base font-black text-white"}>
            <PlayCircle size={20} />
            Watch Demo
          </button>
        </div>

        {/* Free trial note */}
        <div className={isLight ? "mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500" : "mt-4 flex items-center gap-2 text-sm font-semibold text-zinc-500"}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">✓</span>
          7-day free trial — no credit card required
        </div>

        {/* Trust bar */}
        <div className="mt-8 flex flex-wrap items-center gap-6">
          {[
            ["500+", "Active traders"],
            ["50k+", "Trades logged"],
            ["4.9★", "User rating"],
          ].map(([val, label]) => (
            <div key={label} className="flex items-center gap-2">
              <span className={isLight ? "text-lg font-black text-slate-950" : "text-lg font-black text-white"}>{val}</span>
              <span className={isLight ? "text-sm font-semibold text-slate-500" : "text-sm font-semibold text-zinc-500"}>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: -2 }} whileHover={{ scale: 1.03, rotate: -1, y: -6 }} transition={{ delay: 0.1, duration: 0.65, hover: { type: "spring", stiffness: 200, damping: 20 } }} className="hero-dashboard-stage relative mx-auto w-full max-w-[660px] py-16">
        <div className={isLight ? "hero-float-card hero-float-profit absolute left-0 top-12 z-20 rounded-2xl border border-fuchsia-200 bg-white/90 px-6 py-4 shadow-[0_20px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl" : "hero-float-card hero-float-profit float-card-glow absolute left-0 top-12 z-20 rounded-2xl px-6 py-4"}>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black text-emerald-400">$</span>
            <div>
              <div className={isLight ? "text-xs font-black text-slate-500" : "text-xs font-black text-zinc-500"}>Today's P&L</div>
              <div className="text-xl font-black text-emerald-400">+$4,280</div>
            </div>
          </div>
        </div>
        <div className={isLight ? "hero-float-card hero-float-streak absolute right-1 top-40 z-20 rounded-2xl border border-fuchsia-200 bg-white/90 px-5 py-6 shadow-[0_20px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl" : "hero-float-card hero-float-streak float-card-glow absolute right-1 top-40 z-20 rounded-2xl px-5 py-6"}>
          <TrendingUp className="text-fuchsia-300" size={24} />
          <div className={isLight ? "mt-3 text-xs font-black text-slate-500" : "mt-3 text-xs font-black text-zinc-500"}>Streak</div>
          <div className="text-2xl font-black text-fuchsia-300">12W</div>
        </div>
        <div className={isLight ? "hero-float-card hero-float-dd absolute bottom-16 right-12 z-20 rounded-xl border border-slate-200 bg-white/90 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_20px_70px_rgba(15,23,42,0.14)]" : "hero-float-card hero-float-dd float-card-glow absolute bottom-16 right-12 z-20 rounded-xl px-5 py-3 text-sm font-black text-cyan-300"}>
          Max DD: 3.2%
        </div>

        <div className={isLight ? "hero-dashboard-card relative overflow-hidden rounded-[2rem] border border-fuchsia-200/70 bg-gradient-to-br from-white via-fuchsia-100/60 to-emerald-100/55 p-8 shadow-[0_34px_100px_rgba(126,34,206,0.16)]" : "hero-dashboard-card glass-card-vivid gradient-border glow-fuchsia relative overflow-hidden rounded-[2rem] p-8"}>
          <div className={isLight ? "absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(178,74,242,0.12),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(16,185,129,0.12),transparent_32%)]" : "absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(178,74,242,0.24),transparent_28%),radial-gradient(circle_at_88%_20%,rgba(16,185,129,0.18),transparent_32%)]"} />
          <div className="relative z-10">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <span className={isLight ? "font-mono text-sm font-black text-slate-400" : "font-mono text-sm font-black text-zinc-400"}>{BRAND_NAME} Pro</span>
            </div>
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className={isLight ? "text-lg font-black text-slate-600" : "text-lg font-black text-zinc-200"}>Portfolio Value</div>
                <div className={isLight ? "mt-8 h-3 w-56 rounded-full bg-slate-300" : "mt-8 h-3 w-56 rounded-full bg-zinc-800"}>
                  <div className="hero-progress-fill h-full w-[78%] origin-left rounded-full bg-gradient-to-r from-emerald-400 to-blue-500" />
                </div>
              </div>
              <div className="text-right text-4xl font-black text-emerald-400">$247,890</div>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-4">
              {metrics.map(([label, value]) => (
                <div key={label} className={isLight ? "hero-metric-card rounded-2xl border border-slate-200 bg-white/75 p-5 shadow-sm" : "hero-metric-card rounded-2xl border border-white/8 bg-black/20 p-5"}>
                  <div className={isLight ? "text-xs font-black text-slate-500" : "text-xs font-black text-zinc-500"}>{label}</div>
                  <div className={isLight ? "mt-3 text-2xl font-black text-slate-950" : "mt-3 text-2xl font-black text-white"}>{value}</div>
                </div>
              ))}
            </div>
            <div className={isLight ? "mt-6 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-600" : "mt-6 flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-5 py-4 text-sm font-black text-emerald-300"}>
              <ShieldCheck size={18} />
              Trading on track: strong momentum
            </div>
          </div>
        </div>
      </motion.div>
      {/* Scroll indicator */}
      {!isLight && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-zinc-600 uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown size={20} className="text-zinc-600" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
