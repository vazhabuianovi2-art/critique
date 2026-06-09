import React from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function LandingFinalCTA({ isLight, setAuthPage }) {
  return (
    <section className={isLight ? "mx-auto w-full max-w-7xl px-5 py-20 lg:px-8" : "mx-auto w-full max-w-7xl px-5 py-20 lg:px-8"}>
      <div className="section-divider mb-20" />
      <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} className={isLight ? "relative overflow-hidden rounded-[2rem] border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-purple-50 p-12 text-center shadow-[0_28px_90px_rgba(126,34,206,0.12)]" : "glass-card-vivid gradient-border glow-fuchsia relative overflow-hidden rounded-[2rem] p-12 text-center"}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(178,74,242,0.18),transparent_60%)]" />
        <div className="relative z-10">
          <div className={isLight ? "eyebrow-badge-light mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-300 bg-fuchsia-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-fuchsia-600" : "eyebrow-badge mx-auto mb-6 inline-flex"}>
            <Sparkles size={13} /> 7-day free trial — no card required
          </div>
          <h2 className={isLight ? "text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl" : "text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"}>
            {isLight ? "Your edge is waiting." : <><span className="text-white">Your edge is</span> <span className="text-gradient-hero">waiting.</span></>}
          </h2>
          <p className={isLight ? "mx-auto mt-5 max-w-xl text-lg font-semibold leading-8 text-slate-600" : "mx-auto mt-5 max-w-xl text-lg font-semibold leading-8 text-zinc-400"}>
            Join traders who stopped guessing and started improving with data.
          </p>
          <button type="button" onClick={() => setAuthPage("register")} className={isLight ? "mt-8 inline-flex h-14 items-center gap-3 rounded-xl bg-fuchsia-500 px-10 text-base font-black text-white shadow-[0_18px_42px_rgba(178,74,242,0.28)] transition hover:scale-[1.02] hover:bg-fuchsia-400" : "btn-primary-glow mt-8 inline-flex h-14 items-center gap-3 rounded-xl px-10 text-base font-black text-white"}>
            Start 7-Day Free Trial <ChevronRight size={19} />
          </button>
          <p className={isLight ? "mt-3 text-sm font-semibold text-slate-500" : "mt-3 text-sm font-semibold text-zinc-500"}>No credit card required · Cancel anytime</p>
        </div>
      </motion.div>
    </section>
  );
}
