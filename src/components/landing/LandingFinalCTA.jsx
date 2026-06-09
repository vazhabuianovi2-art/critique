import React from "react";
import { Target, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function LandingFinalCTA({ isLight, setAuthPage }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
      <div className="section-divider mb-20" />
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={isLight ? "relative overflow-hidden rounded-[2rem] border border-violet-200/80 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-purple-700 p-12 text-center shadow-[0_32px_100px_rgba(109,40,217,0.35)]" : "glass-card-vivid gradient-border glow-fuchsia relative overflow-hidden rounded-[2rem] p-12 text-center"}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(178,74,242,0.18),transparent_60%)]" />
        <div className="relative z-10">
          <div className={isLight ? "mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-wider text-white backdrop-blur-sm" : "eyebrow-badge mx-auto mb-6 inline-flex"}>
            <Target size={13} /> 7-day free trial — no card required
          </div>
          <h2 className={isLight ? "text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl" : "text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"}>
            {isLight
              ? <>Stop the same mistakes.<br />Start building a real edge.</>
              : <><span className="text-white">Stop the same mistakes.</span><br /><span className="text-gradient-hero">Start building a real edge.</span></>}
          </h2>
          <p className={isLight ? "mx-auto mt-6 max-w-xl text-lg font-semibold leading-8 text-white/75" : "mx-auto mt-6 max-w-xl text-lg font-semibold leading-8 text-zinc-400"}>
            Every session without a structured review is a missed opportunity to improve. Start your trial and see what your trades are actually telling you.
          </p>
          <button
            type="button"
            onClick={() => setAuthPage("register")}
            className={isLight ? "mt-8 inline-flex h-14 items-center gap-3 rounded-xl bg-white px-10 text-base font-black text-violet-700 shadow-[0_8px_32px_rgba(0,0,0,0.20)] transition hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)]" : "btn-primary-glow mt-8 inline-flex h-14 items-center gap-3 rounded-xl px-10 text-base font-black text-white"}
          >
            Start 7-Day Free Trial <ChevronRight size={19} />
          </button>
          <p className={isLight ? "mt-3 text-sm font-semibold text-white/60" : "mt-3 text-sm font-semibold text-zinc-500"}>No credit card required · Cancel anytime</p>
        </div>
      </motion.div>
    </section>
  );
}
