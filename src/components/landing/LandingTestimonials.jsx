import React from "react";
import { motion } from "framer-motion";

const ACCENT_STYLES = {
  emerald: {
    card:   "border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/40 shadow-[0_4px_24px_rgba(5,150,105,0.08)]",
    avatar: "from-emerald-500 to-teal-500",
    star:   "text-emerald-400",
    bar:    "bg-gradient-to-r from-emerald-500 to-teal-400",
    quote:  "text-emerald-500/20",
  },
  fuchsia: {
    card:   "border-fuchsia-200/60 bg-gradient-to-br from-white to-fuchsia-50/40 shadow-[0_4px_24px_rgba(192,38,211,0.08)]",
    avatar: "from-fuchsia-500 to-violet-600",
    star:   "text-fuchsia-400",
    bar:    "bg-gradient-to-r from-fuchsia-500 to-violet-500",
    quote:  "text-fuchsia-500/20",
  },
  cyan: {
    card:   "border-cyan-200/60 bg-gradient-to-br from-white to-cyan-50/40 shadow-[0_4px_24px_rgba(6,182,212,0.08)]",
    avatar: "from-cyan-500 to-blue-500",
    star:   "text-cyan-400",
    bar:    "bg-gradient-to-r from-cyan-500 to-blue-400",
    quote:  "text-cyan-500/20",
  },
};

export function LandingTestimonials({ isLight }) {
  const testimonials = [
    {
      name: "Alex M.",
      role: "Futures trader · 2 years",
      quote: "I was losing three sessions in a row and had no idea why. Critique showed me I was taking a revenge trade every single time after my first loss of the day. Fixed it in two weeks.",
      rating: 5,
      accent: "emerald",
      result: "−$1,200/wk → +$340/wk",
    },
    {
      name: "Sarah K.",
      role: "Forex trader · 4 years",
      quote: "The economic calendar feature changed my week. I was consistently losing on NFP and CPI days without noticing the pattern. Now I sit those out and my monthly P&L improved immediately.",
      rating: 5,
      accent: "fuchsia",
      result: "NFP losses eliminated",
    },
    {
      name: "Daniel R.",
      role: "Stocks & options · 1 year",
      quote: "I tried three different trading journals before this. None of them told me what I was doing wrong — they just stored my trades. This one actually gives you a critique.",
      rating: 5,
      accent: "cyan",
      result: "Win rate: 44% → 67%",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
      <div className="section-divider mb-20" />
      <div className="mb-14 text-center">
        <div className={isLight
          ? "inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-600"
          : "eyebrow-badge inline-flex mb-3"}>
          {isLight && <span className="text-amber-400">★</span>}
          Trader results
        </div>
        <h2 className={isLight
          ? "mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl"
          : "mt-4 text-4xl font-black tracking-tight sm:text-5xl"}>
          {isLight
            ? <>Traders who stopped <span className="bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">guessing.</span></>
            : <><span className="text-white">Traders who stopped</span> <span className="text-gradient-primary">guessing.</span></>}
        </h2>
        <p className={isLight
          ? "mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-slate-500"
          : "mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-zinc-500"}>
          Real feedback from traders who use Critique to review sessions and fix what is actually costing them money.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map(({ name, role, quote, rating, accent, result }) => {
          const s = ACCENT_STYLES[accent];
          return (
            <motion.div
              key={name}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className={isLight
                ? `relative overflow-hidden rounded-[1.35rem] border p-6 ${s.card}`
                : "glass-card gradient-border rounded-[1.35rem] p-6"}
            >
              {/* Big decorative quote mark */}
              {isLight && (
                <div className={`pointer-events-none absolute right-4 top-4 text-[80px] font-black leading-none ${s.quote}`}>"</div>
              )}

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <span key={i} className={isLight ? `text-sm ${s.star}` : "text-sm text-amber-400"}>★</span>
                ))}
              </div>

              <p className={isLight ? "relative text-sm font-semibold leading-7 text-slate-700" : "text-sm font-semibold leading-7 text-zinc-300"}>"{quote}"</p>

              {/* Result badge */}
              {isLight && (
                <div className={`mt-4 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-black ${
                  accent === "emerald" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : accent === "fuchsia" ? "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700"
                  : "border-cyan-200 bg-cyan-50 text-cyan-700"}`}>
                  <span>↗</span> {result}
                </div>
              )}

              <div className="mt-5 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white bg-gradient-to-br ${isLight ? s.avatar : accent === "emerald" ? "from-emerald-500 to-teal-500" : accent === "fuchsia" ? "from-fuchsia-500 to-violet-600" : "from-cyan-500 to-blue-500"}`}>
                  {name[0]}
                </div>
                <div>
                  <div className={isLight ? "text-sm font-black text-slate-900" : "text-sm font-black text-white"}>{name}</div>
                  <div className={isLight ? "text-xs font-semibold text-slate-400" : "text-xs font-semibold text-zinc-500"}>{role}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
