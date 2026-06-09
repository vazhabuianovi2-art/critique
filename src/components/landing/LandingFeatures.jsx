import React from "react";
import { motion } from "framer-motion";

export function LandingFeatures({ isLight }) {
  return (
    <section id="features" className="mx-auto min-h-screen w-full max-w-7xl scroll-mt-16 px-5 py-24 lg:px-8">
      <div className="max-w-3xl">
        <div className={isLight ? "text-sm font-black uppercase tracking-[0.22em] text-fuchsia-500" : "eyebrow-badge inline-flex mb-2"}>Features</div>
        <h2 className={isLight ? "mt-4 text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl" : "mt-5 text-5xl font-black leading-[0.97] tracking-tight sm:text-6xl"}>
          {isLight ? <>Everything you need.<br />Nothing you don&apos;t.</> : <><span className="text-white">Everything you need.</span><br /><span className="text-gradient-primary">Nothing you don&apos;t.</span></>}
        </h2>
      </div>

      <div className="mt-24 grid items-center gap-14 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="max-w-lg">
          <div className="text-sm font-black uppercase tracking-[0.22em] text-fuchsia-400">Smart Trade Journal</div>
          <h3 className={isLight ? "mt-5 text-3xl font-black leading-tight text-slate-950 sm:text-4xl" : "mt-5 text-3xl font-black leading-tight text-white sm:text-4xl"}>
            Every trade. Every detail.<br />Instantly searchable.
          </h3>
          <p className={isLight ? "mt-6 text-lg font-semibold leading-8 text-slate-600" : "mt-6 text-lg font-semibold leading-8 text-zinc-400"}>
            Log trades in seconds, attach screenshots, add strategy tags, filter by session, emotion, or outcome. Replaces your spreadsheet completely.
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.025, y: -8 }} transition={{ type: "spring", stiffness: 220, damping: 22 }} className={isLight ? "overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white/78 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl" : "glass-card gradient-border glow-fuchsia overflow-hidden rounded-[1.35rem]"}>
          <div className={isLight ? "flex items-center justify-between border-b border-slate-200 px-5 py-4" : "flex items-center justify-between border-b border-white/10 px-5 py-4"}>
            <div className={isLight ? "text-sm font-black text-slate-950" : "text-sm font-black text-white"}>Trade Journal</div>
            <div className="flex items-center gap-4">
              <button type="button" className={isLight ? "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500" : "rounded-lg border border-white/12 bg-black px-3 py-1.5 text-xs font-bold text-zinc-400"}>Sort: Date</button>
              <span className={isLight ? "text-xs font-bold text-slate-500" : "text-xs font-bold text-zinc-400"}>47 trades</span>
              <span className="grid h-8 w-8 grid-cols-2 gap-0.5 rounded-lg bg-fuchsia-500/18 p-2">
                <i className="rounded-sm bg-fuchsia-400" />
                <i className="rounded-sm bg-fuchsia-400/55" />
                <i className="rounded-sm bg-fuchsia-400/55" />
                <i className="rounded-sm bg-fuchsia-400" />
              </span>
            </div>
          </div>

          <div className={isLight ? "grid grid-cols-5 border-b border-slate-200 text-center" : "grid grid-cols-5 border-b border-white/10 text-center"}>
            {[
              ["+$4,280", "Total P&L", "text-emerald-400"],
              ["68%", "Win Rate", "text-fuchsia-400"],
              ["47", "Trades", "text-cyan-400"],
              ["$184", "Avg Win", "text-emerald-400"],
              ["1.9R", "Avg R", "text-amber-400"],
            ].map(([value, label, tone]) => (
              <div key={label} className={isLight ? "border-r border-slate-200 px-3 py-4 last:border-r-0" : "border-r border-white/10 px-3 py-4 last:border-r-0"}>
                <div className={`text-sm font-black ${tone}`}>{value}</div>
                <div className={isLight ? "mt-1 text-[11px] font-bold text-slate-500" : "mt-1 text-[11px] font-bold text-zinc-400"}>{label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2">
            {[
              ["NQ", "Long", "NY AM · Breakout", "+$580", ["confluence", "trend"], "green"],
              ["ES", "Short", "London · Mean Revert", "$120", ["fakeout"], "red"],
              ["AAPL", "Long", "NY AM · Trend Follow", "+$340", ["momentum"], "green"],
              ["CL", "Long", "NY PM · Breakout", "+$210", ["news", "vol"], "green"],
            ].map(([symbol, side, meta, pnl, tags, tone]) => (
              <motion.div key={symbol} whileHover={{ scale: 1.03, y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className={tone === "red" ? "rounded-2xl border border-red-500/30 bg-red-500/8 p-4 cursor-pointer" : "rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-4 cursor-pointer"}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={isLight ? "text-lg font-black text-slate-950" : "text-lg font-black text-white"}>
                      {symbol} <span className={tone === "red" ? "rounded-md bg-red-500/20 px-2 py-1 text-[10px] font-black text-red-400" : "rounded-md bg-emerald-500/20 px-2 py-1 text-[10px] font-black text-emerald-400"}>{side}</span>
                    </div>
                    <div className={isLight ? "mt-3 text-xs font-semibold text-slate-500" : "mt-3 text-xs font-semibold text-zinc-400"}>{meta}</div>
                  </div>
                  <div className={tone === "red" ? "text-sm font-black text-red-400" : "text-sm font-black text-emerald-400"}>{tone === "red" ? "↘" : "↗"} {pnl}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-fuchsia-500/35 bg-fuchsia-500/12 px-2.5 py-1 text-[11px] font-bold text-fuchsia-300">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
