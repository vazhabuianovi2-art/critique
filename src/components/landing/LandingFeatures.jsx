import React from "react";
import { BookOpen, AlertTriangle, BarChart3, Newspaper, Shield, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Smart Trade Journal",
    copy: "Log trades with screenshots, strategy, session, emotion, mistake, and result. Everything searchable in seconds.",
    iconDark: "border-fuchsia-500/30 bg-fuchsia-500/12 text-fuchsia-300",
    iconLight: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600",
    cardDark: "glass-card rounded-[1.35rem] p-6",
    cardLight: "rounded-[1.35rem] border border-fuchsia-200/70 bg-gradient-to-br from-white to-fuchsia-50/50 p-6 shadow-[0_3px_16px_rgba(192,38,211,0.08)]",
  },
  {
    icon: AlertTriangle,
    title: "Mistake Detector",
    copy: "See which mistakes cost you the most money and where they happen. One focused fix per week — no overwhelm.",
    iconDark: "border-red-500/30 bg-red-500/12 text-red-300",
    iconLight: "border-red-200 bg-red-50 text-red-500",
    cardDark: "glass-card rounded-[1.35rem] p-6 border-red-500/20",
    cardLight: "rounded-[1.35rem] border border-red-200/70 bg-gradient-to-br from-white to-red-50/50 p-6 shadow-[0_3px_16px_rgba(239,68,68,0.07)]",
  },
  {
    icon: BarChart3,
    title: "Session & Strategy Analytics",
    copy: "Find which sessions, setups, and strategies actually perform. Stop trading the hours and setups that drain you.",
    iconDark: "border-emerald-500/30 bg-emerald-500/12 text-emerald-300",
    iconLight: "border-emerald-200 bg-emerald-50 text-emerald-600",
    cardDark: "glass-card rounded-[1.35rem] p-6",
    cardLight: "rounded-[1.35rem] border border-emerald-200/70 bg-gradient-to-br from-white to-emerald-50/50 p-6 shadow-[0_3px_16px_rgba(5,150,105,0.07)]",
  },
  {
    icon: Newspaper,
    title: "Economic News Impact",
    copy: "Track how high-impact news days affect your results. See if you trade better or worse around major events.",
    iconDark: "border-amber-500/30 bg-amber-500/12 text-amber-300",
    iconLight: "border-amber-200 bg-amber-50 text-amber-600",
    cardDark: "glass-card rounded-[1.35rem] p-6",
    cardLight: "rounded-[1.35rem] border border-amber-200/70 bg-gradient-to-br from-white to-amber-50/50 p-6 shadow-[0_3px_16px_rgba(245,158,11,0.07)]",
  },
  {
    icon: Shield,
    title: "Pre-Trade Discipline",
    copy: "Use a pre-trade routine checklist before the session starts. Fewer emotional decisions. Fewer rule breaks.",
    iconDark: "border-cyan-500/30 bg-cyan-500/12 text-cyan-300",
    iconLight: "border-cyan-200 bg-cyan-50 text-cyan-600",
    cardDark: "glass-card rounded-[1.35rem] p-6",
    cardLight: "rounded-[1.35rem] border border-cyan-200/70 bg-gradient-to-br from-white to-cyan-50/50 p-6 shadow-[0_3px_16px_rgba(6,182,212,0.07)]",
  },
  {
    icon: CalendarDays,
    title: "Calendar Review",
    copy: "See profitable and losing days visually across the month. Spot weekly patterns and consistency gaps instantly.",
    iconDark: "border-purple-500/30 bg-purple-500/12 text-purple-300",
    iconLight: "border-purple-200 bg-purple-50 text-purple-600",
    cardDark: "glass-card rounded-[1.35rem] p-6",
    cardLight: "rounded-[1.35rem] border border-purple-200/70 bg-gradient-to-br from-white to-purple-50/50 p-6 shadow-[0_3px_16px_rgba(109,40,217,0.07)]",
  },
];

export function LandingFeatures({ isLight }) {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl scroll-mt-16 px-5 py-24 lg:px-8">

      {/* Problem panel */}
      <div className={isLight ? "mb-16 overflow-hidden rounded-[1.35rem] border border-red-200/70 bg-gradient-to-br from-white via-red-50/30 to-rose-50/20 p-8 shadow-[0_4px_24px_rgba(239,68,68,0.08)]" : "mb-16 glass-card overflow-hidden rounded-[1.35rem] p-8"}>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className={isLight ? "text-sm font-black uppercase tracking-[0.22em] text-red-500" : "mb-3 text-sm font-black uppercase tracking-[0.22em] text-red-400"}>
              The real problem
            </div>
            <h2 className={isLight ? "mt-4 text-4xl font-black leading-[1.05] tracking-tight text-slate-950" : "mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white"}>
              Most traders know what they did wrong.<br />
              <span className={isLight ? "text-red-500" : "text-red-400"}>They just keep doing it anyway.</span>
            </h2>
            <p className={isLight ? "mt-5 text-base font-semibold leading-7 text-slate-600" : "mt-5 text-base font-semibold leading-7 text-zinc-400"}>
              Without a structured review, the same patterns repeat every week. Revenge trades after a loss. FOMO entries after a big move. Late exits out of fear. The cost adds up — and most traders never see the full picture.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Revenge trading", "after a loss"],
              ["FOMO entries", "chasing moves"],
              ["Rule breaks", "under pressure"],
              ["Late exits", "fear of giving back"],
              ["Oversized risk", "after drawdown"],
              ["News-day overtrading", "no edge in volatility"],
            ].map(([mistake, context]) => (
              <div key={mistake} className={isLight ? "rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50 to-rose-50/60 p-4 shadow-[0_2px_8px_rgba(239,68,68,0.07)]" : "rounded-2xl border border-red-500/20 bg-red-500/8 p-4"}>
                <div className="text-sm font-black text-red-400">{mistake}</div>
                <div className={isLight ? "mt-1 text-xs font-semibold text-slate-500" : "mt-1 text-xs font-semibold text-zinc-500"}>{context}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solution header */}
      <div className="mb-12 max-w-3xl">
        <div className={isLight ? "text-sm font-black uppercase tracking-[0.22em] text-fuchsia-500" : "eyebrow-badge inline-flex mb-2"}>The solution</div>
        <h2 className={isLight ? "mt-4 text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl" : "mt-5 text-5xl font-black leading-[0.97] tracking-tight sm:text-6xl"}>
          {isLight
            ? <>Every tool you need<br />to stop the leak.</>
            : <><span className="text-white">Every tool you need</span><br /><span className="text-gradient-primary">to stop the leak.</span></>}
        </h2>
        <p className={isLight ? "mt-6 text-lg font-semibold leading-8 text-slate-600" : "mt-6 text-lg font-semibold leading-8 text-zinc-400"}>
          TryCritique turns every session into structured feedback. Log once, and the platform finds the patterns you keep missing.
        </p>
      </div>

      {/* Features grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, copy, iconDark, iconLight, cardDark, cardLight }) => (
          <motion.div
            key={title}
            whileHover={{ y: -5, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className={isLight ? cardLight : cardDark}
          >
            <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border ${isLight ? iconLight : iconDark}`}>
              <Icon size={22} />
            </span>
            <div className={isLight ? "text-lg font-black text-slate-950" : "text-lg font-black text-white"}>{title}</div>
            <p className={isLight ? "mt-3 text-sm font-semibold leading-6 text-slate-600" : "mt-3 text-sm font-semibold leading-6 text-zinc-400"}>{copy}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
