import React from "react";
import { ListChecks, Newspaper, Target } from "lucide-react";
import { motion } from "framer-motion";

export function LandingHowItWorks({ isLight }) {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-7xl scroll-mt-16 px-5 py-24 lg:px-8">

      {/* Section header */}
      <div className="mb-14 max-w-2xl">
        <div className={isLight ? "text-sm font-black uppercase tracking-[0.22em] text-fuchsia-500" : "eyebrow-badge inline-flex mb-2"}>How it works</div>
        <h2 className={isLight ? "mt-4 text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl" : "mt-5 text-5xl font-black leading-[0.97] tracking-tight sm:text-6xl"}>
          {isLight
            ? <>Log it. Review it.<br />Fix one thing.</>
            : <><span className="text-white">Log it. Review it.</span><br /><span className="text-gradient-primary">Fix one thing.</span></>}
        </h2>
        <p className={isLight ? "mt-6 text-lg font-semibold leading-8 text-slate-600" : "mt-6 text-lg font-semibold leading-8 text-zinc-400"}>
          Critique keeps the process simple. Capture the trade, tag what happened, then let the platform surface the pattern you need to fix most.
        </p>
      </div>

      {/* 3 steps + mock UI */}
      <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          {[
            ["01", "Log the trade", "Add symbol, direction, session, risk, result, screenshots, and strategy tags in one focused form."],
            ["02", "Tag what happened", "Mark the mistake type, emotion, rule follow-through, entry quality, and what you would change next time."],
            ["03", "Get your critique", "Critique groups repeated patterns, shows the cost of each, and gives you one actionable focus for next week."],
          ].map(([step, title, copy]) => (
            <div
              key={step}
              className={isLight
                ? "group relative overflow-hidden rounded-2xl border border-violet-200/70 bg-gradient-to-br from-white via-white to-violet-50/60 p-5 shadow-[0_2px_16px_rgba(109,40,217,0.08)] transition-all duration-300 hover:border-violet-300 hover:shadow-[0_6px_28px_rgba(109,40,217,0.14)]"
                : "glass-card rounded-2xl p-5 transition-all duration-300 hover:border-purple-500/30"}
            >
              {isLight && (
                <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-fuchsia-400/10 blur-2xl" />
              )}
              <div className="flex gap-4">
                <span className={isLight
                  ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-sm font-black text-white shadow-[0_4px_12px_rgba(139,92,246,0.35)]"
                  : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/12 text-sm font-black text-fuchsia-300"}>
                  {step}
                </span>
                <div>
                  <div className={isLight ? "text-lg font-black text-slate-900" : "text-lg font-black text-white"}>{title}</div>
                  <p className={isLight ? "mt-2 text-sm font-semibold leading-6 text-slate-500" : "mt-2 text-sm font-semibold leading-6 text-zinc-400"}>{copy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <motion.div
          whileHover={{ scale: 1.02, y: -6 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className={isLight
            ? "relative overflow-hidden rounded-[1.6rem] border border-violet-200/80 bg-gradient-to-br from-white via-white to-violet-50/50 p-5 shadow-[0_20px_70px_rgba(109,40,217,0.13),0_4px_20px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            : "glass-card gradient-border glow-fuchsia relative overflow-hidden rounded-[1.6rem] p-5"}
        >
          {/* decorative blobs */}
          {isLight && (
            <>
              <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-16 -translate-y-16 rounded-full bg-fuchsia-400/12 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 -translate-x-12 translate-y-12 rounded-full bg-violet-400/10 blur-3xl" />
            </>
          )}
          {!isLight && <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(178,74,242,0.18),transparent_28%)]" />}

          <div className="relative z-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className={isLight ? "text-sm font-black text-slate-900" : "text-sm font-black text-white"}>Post-Session Review</div>
                <div className={isLight ? "mt-1 text-xs font-bold text-slate-400" : "mt-1 text-xs font-bold text-zinc-500"}>Tuesday · NY AM session</div>
              </div>
              <span className="rounded-full border border-red-400/40 bg-gradient-to-r from-red-500/15 to-red-400/10 px-3 py-1 text-xs font-black text-red-500 shadow-[0_2px_8px_rgba(239,68,68,0.12)]">
                2 mistakes flagged
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              {/* Trade Log panel */}
              <div className={isLight
                ? "rounded-2xl border border-violet-100 bg-gradient-to-b from-slate-50 to-white/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                : "rounded-2xl border border-white/10 bg-black/35 p-4"}>
                <div className={isLight ? "text-xs font-black uppercase tracking-wider text-violet-500" : "text-xs font-black uppercase tracking-wider text-zinc-500"}>Trade Log</div>
                {[
                  ["Symbol", "NQ"],
                  ["Session", "NY AM"],
                  ["Mistake", "FOMO entry"],
                  ["Result", "− $320"],
                ].map(([label, value]) => (
                  <div key={label} className={isLight
                    ? "mt-3 flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-[0_1px_4px_rgba(15,23,42,0.05)]"
                    : "mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/45 px-3 py-2.5"}>
                    <span className={isLight ? "text-xs font-bold text-slate-400" : "text-xs font-bold text-zinc-500"}>{label}</span>
                    <span className={label === "Result" ? "text-sm font-black text-red-500" : isLight ? "text-sm font-black text-slate-900" : "text-sm font-black text-white"}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {/* Rule Score */}
                <div className={isLight
                  ? "rounded-2xl border border-violet-200/60 bg-gradient-to-br from-white to-violet-50/40 p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)]"
                  : "rounded-2xl border border-white/10 bg-black/35 p-4"}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={isLight ? "text-xs font-black uppercase tracking-wider text-violet-500" : "text-xs font-black uppercase tracking-wider text-zinc-500"}>Rule Score</div>
                      <div className={isLight ? "mt-2 text-2xl font-black text-slate-900" : "mt-2 text-2xl font-black text-white"}>72%</div>
                    </div>
                    <div className={isLight
                      ? "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-[0_4px_10px_rgba(139,92,246,0.3)]"
                      : ""}>
                      <ListChecks className={isLight ? "text-white" : "text-fuchsia-400"} size={isLight ? 18 : 26} />
                    </div>
                  </div>
                  <div className={isLight ? "mt-4 h-2.5 rounded-full bg-violet-100" : "mt-4 h-2.5 rounded-full bg-white/10"}>
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-fuchsia-500 to-emerald-400" />
                  </div>
                </div>

                {/* Top Mistake */}
                <div className={isLight
                  ? "rounded-2xl border border-red-200/70 bg-gradient-to-br from-red-50 to-white p-4 shadow-[0_2px_12px_rgba(239,68,68,0.07)]"
                  : "rounded-2xl border border-red-500/25 bg-red-500/10 p-4"}>
                  <div className="text-xs font-black text-red-500">Top mistake this week</div>
                  <div className={isLight ? "mt-2 text-lg font-black text-slate-900" : "mt-2 text-lg font-black text-white"}>FOMO entries</div>
                  <div className={isLight ? "mt-1 text-xs font-bold text-slate-400" : "mt-1 text-xs font-bold text-zinc-500"}>5× · cost: − $980</div>
                </div>

                {/* Next Focus */}
                <div className={isLight
                  ? "rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50 to-white p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)]"
                  : "rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/10 p-4"}>
                  <div className="text-xs font-black uppercase tracking-wider text-fuchsia-500">Next focus</div>
                  <p className={isLight ? "mt-2 text-sm font-semibold leading-5 text-slate-700" : "mt-2 text-sm font-semibold leading-5 text-zinc-300"}>Wait for a full pullback before the second entry.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mistake Detector + Economic Calendar callout row */}
      <div className="mt-16 grid gap-6 lg:grid-cols-2">

        {/* Mistake Detector emphasis */}
        <div className={isLight
          ? "relative overflow-hidden rounded-[1.35rem] border border-red-200/60 bg-gradient-to-br from-white via-white to-red-50/50 p-7 shadow-[0_4px_24px_rgba(239,68,68,0.08)]"
          : "glass-card rounded-[1.35rem] border-red-500/20 p-7"}>
          {isLight && <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full bg-red-300/10 blur-3xl" />}
          <div className="relative flex items-start gap-4">
            <span className={isLight
              ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-[0_4px_14px_rgba(239,68,68,0.30)]"
              : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/12 text-red-300"}>
              <Target size={22} />
            </span>
            <div>
              <div className={isLight ? "text-lg font-black text-slate-900" : "text-lg font-black text-white"}>Mistake Detector</div>
              <p className={isLight ? "mt-2 text-sm font-semibold leading-6 text-slate-500" : "mt-2 text-sm font-semibold leading-6 text-zinc-400"}>
                The Mistake Detector groups every tagged error by type, shows how often it happens, and ranks them by total cost. You pick one to focus on — not all of them at once.
              </p>
            </div>
          </div>
          <div className="relative mt-5 space-y-3">
            {[
              { label: "FOMO entries", count: "5×", cost: "− $980", pct: 82 },
              { label: "Revenge trades", count: "3×", cost: "− $540", pct: 52 },
              { label: "Late exits", count: "4×", cost: "− $320", pct: 38 },
            ].map(({ label, count, cost, pct }) => (
              <div key={label} className={isLight
                ? "flex items-center gap-3 rounded-xl border border-red-100/80 bg-white/80 px-4 py-3 shadow-[0_1px_4px_rgba(239,68,68,0.06)]"
                : "flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3"}>
                <div className={isLight ? "w-28 shrink-0 text-sm font-black text-slate-900" : "w-28 shrink-0 text-sm font-black text-white"}>{label}</div>
                <div className={isLight ? "h-2 flex-1 rounded-full bg-red-100" : "h-2 flex-1 rounded-full bg-white/10"}>
                  <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-400" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-12 shrink-0 text-right text-xs font-bold text-red-500">{cost}</div>
                <div className={isLight ? "w-6 shrink-0 text-right text-xs font-bold text-slate-400" : "w-6 shrink-0 text-right text-xs font-bold text-zinc-500"}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Calendar emphasis */}
        <div className={isLight
          ? "relative overflow-hidden rounded-[1.35rem] border border-amber-200/60 bg-gradient-to-br from-white via-white to-amber-50/50 p-7 shadow-[0_4px_24px_rgba(245,158,11,0.08)]"
          : "glass-card rounded-[1.35rem] border-amber-500/20 p-7"}>
          {isLight && <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full bg-amber-300/10 blur-3xl" />}
          <div className="relative flex items-start gap-4">
            <span className={isLight
              ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_4px_14px_rgba(245,158,11,0.32)]"
              : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/12 text-amber-300"}>
              <Newspaper size={22} />
            </span>
            <div>
              <div className={isLight ? "text-lg font-black text-slate-900" : "text-lg font-black text-white"}>Economic News Impact</div>
              <p className={isLight ? "mt-2 text-sm font-semibold leading-6 text-slate-500" : "mt-2 text-sm font-semibold leading-6 text-zinc-400"}>
                See how high-impact news events — CPI, NFP, FOMC — affect your trade results. Many traders lose more on news days without realising it.
              </p>
            </div>
          </div>
          <div className="relative mt-5 space-y-3">
            {[
              { label: "NFP weeks", result: "− $1,240", outcome: "loss", badge: "Avoid" },
              { label: "FOMC weeks", result: "− $680", outcome: "loss", badge: "Caution" },
              { label: "No-event weeks", result: "+ $2,180", outcome: "win", badge: "Edge" },
            ].map(({ label, result, outcome, badge }) => (
              <div key={label} className={isLight
                ? "flex items-center justify-between rounded-xl border border-amber-100/80 bg-white/80 px-4 py-3 shadow-[0_1px_4px_rgba(245,158,11,0.06)]"
                : "flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3"}>
                <div className={isLight ? "text-sm font-black text-slate-900" : "text-sm font-black text-white"}>{label}</div>
                <div className="flex items-center gap-3">
                  <span className={outcome === "win" ? "text-sm font-black text-emerald-600" : "text-sm font-black text-red-500"}>{result}</span>
                  <span className={
                    outcome === "win"
                      ? "rounded-full border border-emerald-400/40 bg-gradient-to-r from-emerald-500/15 to-emerald-400/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-600"
                      : outcome === "loss"
                        ? "rounded-full border border-red-400/40 bg-gradient-to-r from-red-500/15 to-red-400/10 px-2.5 py-0.5 text-[10px] font-black text-red-500"
                        : "rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-400/15 to-amber-300/10 px-2.5 py-0.5 text-[10px] font-black text-amber-600"
                  }>{badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
