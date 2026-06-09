import React from "react";
import { ListChecks } from "lucide-react";
import { motion } from "framer-motion";

export function LandingHowItWorks({ isLight }) {
  return (
    <section id="how-it-works" className="mx-auto min-h-screen w-full max-w-7xl scroll-mt-16 px-5 py-24 lg:px-8">
      <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <div className={isLight ? "text-sm font-black uppercase tracking-[0.22em] text-fuchsia-500" : "eyebrow-badge inline-flex mb-2"}>How it works</div>
          <h2 className={isLight ? "mt-4 text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl" : "mt-5 text-5xl font-black leading-[0.97] tracking-tight sm:text-6xl"}>
            {isLight ? <>From setup to insight<br />in three clean steps.</> : <><span className="text-white">From setup to insight</span><br /><span className="text-gradient-primary">in three clean steps.</span></>}
          </h2>
          <p className={isLight ? "mt-6 text-lg font-semibold leading-8 text-slate-600" : "mt-6 text-lg font-semibold leading-8 text-zinc-400"}>
            Critique keeps the flow simple: capture the trade, review the psychology, then use the dashboard to see what is actually improving.
          </p>

          <div className="mt-12 space-y-4">
            {[
              ["01", "Log the trade", "Add symbol, session, direction, risk, result, screenshots and tags in one focused form."],
              ["02", "Review your behavior", "Mark the mistake, emotion, rule follow-through and what you would improve next time."],
              ["03", "Find your edge", "Filter patterns across your journal and turn repeated problems into a practical focus plan."],
            ].map(([step, title, copy]) => (
              <div key={step} className={isLight ? "rounded-2xl border border-slate-200 bg-white/78 p-5 shadow-sm" : "glass-card rounded-2xl p-5 transition-all duration-300 hover:border-purple-500/30"}>
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/12 text-sm font-black text-fuchsia-300">{step}</span>
                  <div>
                    <div className={isLight ? "text-lg font-black text-slate-950" : "text-lg font-black text-white"}>{title}</div>
                    <p className={isLight ? "mt-2 text-sm font-semibold leading-6 text-slate-600" : "mt-2 text-sm font-semibold leading-6 text-zinc-400"}>{copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.025, y: -8 }} transition={{ type: "spring", stiffness: 220, damping: 22 }} className={isLight ? "relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white/80 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl" : "glass-card gradient-border glow-fuchsia relative overflow-hidden rounded-[1.6rem] p-5"}>
          <div className={isLight ? "absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(178,74,242,0.12),transparent_28%),radial-gradient(circle_at_90%_80%,rgba(16,185,129,0.10),transparent_30%)]" : "absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(178,74,242,0.18),transparent_28%),radial-gradient(circle_at_90%_80%,rgba(16,185,129,0.12),transparent_30%)]"} />
          <div className="relative z-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className={isLight ? "text-sm font-black text-slate-950" : "text-sm font-black text-white"}>Today&apos;s Workflow</div>
                <div className={isLight ? "mt-1 text-xs font-bold text-slate-500" : "mt-1 text-xs font-bold text-zinc-500"}>Pre-market to post-trade review</div>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-1 text-xs font-black text-emerald-400">On track</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className={isLight ? "rounded-2xl border border-slate-200 bg-slate-50/80 p-4" : "rounded-2xl border border-white/10 bg-black/35 p-4"}>
                <div className={isLight ? "text-xs font-black uppercase tracking-wider text-slate-500" : "text-xs font-black uppercase tracking-wider text-zinc-500"}>Add Trade</div>
                {[
                  ["Symbol", "NQ"],
                  ["Session", "NY AM"],
                  ["Direction", "Long"],
                  ["Risk", "$120"],
                ].map(([label, value]) => (
                  <div key={label} className={isLight ? "mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3" : "mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/45 px-3 py-3"}>
                    <span className={isLight ? "text-xs font-bold text-slate-500" : "text-xs font-bold text-zinc-500"}>{label}</span>
                    <span className={isLight ? "text-sm font-black text-slate-950" : "text-sm font-black text-white"}>{value}</span>
                  </div>
                ))}
                <div className="mt-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-3 text-center text-sm font-black text-white">Save Trade</div>
              </div>

              <div className="space-y-4">
                <div className={isLight ? "rounded-2xl border border-slate-200 bg-white p-5" : "rounded-2xl border border-white/10 bg-black/35 p-5"}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={isLight ? "text-xs font-black uppercase tracking-wider text-slate-500" : "text-xs font-black uppercase tracking-wider text-zinc-500"}>Review Signal</div>
                      <div className={isLight ? "mt-2 text-2xl font-black text-slate-950" : "mt-2 text-2xl font-black text-white"}>Discipline: 84%</div>
                    </div>
                    <ListChecks className="text-fuchsia-400" size={28} />
                  </div>
                  <div className={isLight ? "mt-5 h-3 rounded-full bg-slate-200" : "mt-5 h-3 rounded-full bg-white/10"}>
                    <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-fuchsia-500 to-emerald-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={isLight ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-4" : "rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4"}>
                    <div className="text-xs font-black text-emerald-500">Best setup</div>
                    <div className={isLight ? "mt-2 text-xl font-black text-slate-950" : "mt-2 text-xl font-black text-white"}>Breakout</div>
                  </div>
                  <div className={isLight ? "rounded-2xl border border-red-200 bg-red-50 p-4" : "rounded-2xl border border-red-500/25 bg-red-500/10 p-4"}>
                    <div className="text-xs font-black text-red-400">Main leak</div>
                    <div className={isLight ? "mt-2 text-xl font-black text-slate-950" : "mt-2 text-xl font-black text-white"}>FOMO</div>
                  </div>
                </div>

                <div className={isLight ? "rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-4" : "rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/10 p-4"}>
                  <div className="text-xs font-black uppercase tracking-wider text-fuchsia-400">Next focus</div>
                  <p className={isLight ? "mt-2 text-sm font-semibold leading-6 text-slate-600" : "mt-2 text-sm font-semibold leading-6 text-zinc-300"}>Wait for full confirmation before entering the second setup.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
