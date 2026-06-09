import React from "react";
import { motion } from "framer-motion";

export function LandingTestimonials({ isLight }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
      <div className="section-divider mb-20" />
      <div className="text-center mb-14">
        <div className={isLight ? "text-sm font-black uppercase tracking-[0.22em] text-fuchsia-500" : "eyebrow-badge inline-flex mb-3"}>Traders love it</div>
        <h2 className={isLight ? "mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl" : "mt-4 text-4xl font-black tracking-tight sm:text-5xl"}>
          {isLight ? "Real results from real traders." : <><span className="text-white">Real results from</span> <span className="text-gradient-primary">real traders.</span></>}
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "Alex M.", role: "Futures trader · 2 years", quote: "I went from losing 3 weeks in a row to finally understanding why. The mistake detector showed me I was overtrading after lunch every single day.", rating: 5, accent: "emerald" },
          { name: "Sarah K.", role: "Forex trader · 4 years", quote: "The calendar view changed everything. I can see exactly which sessions I perform best in. I cut my losing days in half within the first month.", rating: 5, accent: "fuchsia" },
          { name: "Daniel R.", role: "Options trader · 1 year", quote: "Replaces my old spreadsheet completely. Logging a trade takes 30 seconds and the psychology tracking is something no spreadsheet can do.", rating: 5, accent: "cyan" },
        ].map(({ name, role, quote, rating, accent }) => (
          <motion.div key={name} whileHover={{ y: -6, scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} className={isLight ? "rounded-[1.35rem] border border-slate-200 bg-white/80 p-6 shadow-sm" : "glass-card gradient-border rounded-[1.35rem] p-6"}>
            <div className="flex gap-1 mb-4">
              {Array.from({ length: rating }).map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            <p className={isLight ? "text-sm font-semibold leading-7 text-slate-700" : "text-sm font-semibold leading-7 text-zinc-300"}>"{quote}"</p>
            <div className="mt-5 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${accent === "emerald" ? "bg-emerald-500/20 text-emerald-400" : accent === "fuchsia" ? "bg-fuchsia-500/20 text-fuchsia-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                {name[0]}
              </div>
              <div>
                <div className={isLight ? "text-sm font-black text-slate-950" : "text-sm font-black text-white"}>{name}</div>
                <div className={isLight ? "text-xs font-semibold text-slate-500" : "text-xs font-semibold text-zinc-500"}>{role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
