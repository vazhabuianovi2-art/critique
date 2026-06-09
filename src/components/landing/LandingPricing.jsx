import React from "react";
import { ChevronRight } from "lucide-react";

export function LandingPricing({ isLight, setAuthPage }) {
  return (
    <section id="pricing" className="mx-auto min-h-screen w-full max-w-7xl scroll-mt-16 px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className={isLight ? "text-sm font-black uppercase tracking-[0.22em] text-fuchsia-500" : "eyebrow-badge inline-flex mb-2"}>Pricing</div>
        <h2 className={isLight ? "mt-4 text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl" : "mt-5 text-5xl font-black leading-[0.97] tracking-tight sm:text-6xl"}>
          {isLight ? <>Simple price.<br />Serious trading clarity.</> : <><span className="text-white">Simple price.</span><br /><span className="text-gradient-primary">Serious trading clarity.</span></>}
        </h2>
        <p className={isLight ? "mx-auto mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600" : "mx-auto mt-6 max-w-2xl text-lg font-semibold leading-8 text-zinc-400"}>
          One plan with the core tools you need to journal, review, and improve every trading session.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className={isLight ? "relative overflow-hidden rounded-[1.6rem] border border-fuchsia-200 bg-white/85 p-8 shadow-[0_28px_90px_rgba(15,23,42,0.12)]" : "glass-card-vivid gradient-border glow-fuchsia relative overflow-hidden rounded-[1.6rem] p-8"}>
          <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-[4rem] bg-fuchsia-500/12" />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className={isLight ? "text-sm font-black uppercase tracking-[0.18em] text-slate-500" : "text-sm font-black uppercase tracking-[0.18em] text-zinc-500"}>Critique Pro</div>
                <div className={isLight ? "mt-2 text-2xl font-black text-slate-950" : "mt-2 text-2xl font-black text-white"}>Trading journal subscription</div>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-1 text-xs font-black text-emerald-400">Best value</span>
            </div>

            {/* 7-day trial banner */}
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-black">7</span>
              <div>
                <div className="text-sm font-black text-emerald-400">7-day free trial</div>
                <div className={isLight ? "text-xs font-semibold text-slate-500" : "text-xs font-semibold text-zinc-500"}>No credit card required to start</div>
              </div>
            </div>

            <div className="mt-6 flex items-end gap-3">
              <span className={isLight ? "text-7xl font-black tracking-tight text-slate-950" : "text-7xl font-black tracking-tight text-white"}>$10</span>
              <span className={isLight ? "pb-3 text-lg font-black text-slate-500" : "pb-3 text-lg font-black text-zinc-400"}>/ month after trial</span>
            </div>

            <p className={isLight ? "mt-5 text-sm font-semibold leading-6 text-slate-600" : "mt-5 text-sm font-semibold leading-6 text-zinc-400"}>
              Built for traders who want a simple system for tracking decisions, mistakes, risk, and progress.
            </p>
            <p className={isLight ? "mt-3 text-xs font-bold leading-5 text-slate-500" : "mt-3 text-xs font-bold leading-5 text-zinc-500"}>
              Payments are handled by Dodo Payments as Merchant of Record. TryCritique is a journal and analytics tool, not investment advice or trading signals.
            </p>

            <button type="button" onClick={() => setAuthPage("register")} className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-sm font-black text-white shadow-[0_18px_36px_rgba(178,74,242,0.24)] transition hover:scale-[1.01]">
              Start 7-Day Free Trial
              <ChevronRight size={18} />
            </button>
            <div className="mt-3 text-center text-xs font-semibold text-zinc-500">No credit card · Cancel anytime</div>
          </div>
        </div>

        <div className={isLight ? "rounded-[1.6rem] border border-slate-200 bg-white/72 p-6 shadow-sm backdrop-blur-xl" : "rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"}>
          <div className={isLight ? "mb-5 text-sm font-black uppercase tracking-[0.18em] text-slate-500" : "mb-5 text-sm font-black uppercase tracking-[0.18em] text-zinc-500"}>Included</div>
          <div className="grid gap-3">
            {[
              ["Unlimited trades", "Log every setup, result, screenshot and review note."],
              ["Dashboard analytics", "Track win rate, P&L curve, R multiple and account performance."],
              ["Mistake detector", "See repeated behavioral leaks and focus on the highest-impact fix."],
              ["Calendar and statistics", "Review sessions, months, strategies and trading consistency."],
              ["Backup and restore", "Export or restore your journal data when you need it."],
            ].map(([title, copy]) => (
              <div key={title} className={isLight ? "rounded-2xl border border-slate-200 bg-slate-50/80 p-4" : "rounded-2xl border border-white/10 bg-black/35 p-4"}>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-black text-emerald-400">✓</span>
                  <div>
                    <div className={isLight ? "text-sm font-black text-slate-950" : "text-sm font-black text-white"}>{title}</div>
                    <p className={isLight ? "mt-1 text-sm font-semibold leading-6 text-slate-600" : "mt-1 text-sm font-semibold leading-6 text-zinc-400"}>{copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
