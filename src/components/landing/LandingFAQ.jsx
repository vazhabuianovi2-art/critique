import React from "react";
import { Sparkles } from "lucide-react";

export function LandingFAQ({ isLight }) {
  return (
    <section id="faq" className="mx-auto min-h-screen w-full max-w-7xl scroll-mt-16 px-5 py-24 lg:px-8">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <div className={isLight ? "text-sm font-black uppercase tracking-[0.22em] text-fuchsia-500" : "eyebrow-badge inline-flex mb-2"}>FAQ</div>
          <h2 className={isLight ? "mt-4 text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl" : "mt-5 text-5xl font-black leading-[0.97] tracking-tight sm:text-6xl"}>
            {isLight ? <>Questions before<br />you start?</> : <><span className="text-white">Questions before</span><br /><span className="text-gradient-primary">you start?</span></>}
          </h2>
          <p className={isLight ? "mt-6 text-lg font-semibold leading-8 text-slate-600" : "mt-6 text-lg font-semibold leading-8 text-zinc-400"}>
            The short version: Critique is built to help you keep your journal simple, searchable, and useful after every trading day.
          </p>

          <div className={isLight ? "mt-10 rounded-[1.35rem] border border-fuchsia-200 bg-white/80 p-6 shadow-sm" : "mt-10 rounded-[1.35rem] border border-fuchsia-500/25 bg-fuchsia-500/8 p-6"}>
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
                <Sparkles size={22} />
              </span>
              <div>
                <div className={isLight ? "text-lg font-black text-slate-950" : "text-lg font-black text-white"}>Designed for quick review</div>
                <p className={isLight ? "mt-2 text-sm font-semibold leading-6 text-slate-600" : "mt-2 text-sm font-semibold leading-6 text-zinc-400"}>
                  Use it during your session, then come back later to review patterns without rebuilding spreadsheets.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            ["Do I need Supabase to use it?", "Supabase sync is supported, but your journal also keeps a local browser backup so your trades remain available on this device."],
            ["Can I attach screenshots?", "Yes. Trades can include screenshots, notes, tags, rule review, emotion, setup quality, entry quality and exit quality."],
            ["Will it show my mistakes?", "Yes. The mistake detector groups repeated issues and helps you choose one focus area instead of guessing what to fix."],
            ["Can I export my data?", "Yes. You can export CSV files and also create a JSON backup for restoring your journal later."],
            ["What happens after I click Get Started?", "You create an account, then the app opens your dashboard, journal, calendar, statistics and settings pages."],
          ].map(([question, answer], index) => (
            <details key={question} className={isLight ? "group rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm open:border-fuchsia-200" : "group glass-card rounded-2xl p-5 open:border-fuchsia-500/40 transition-all duration-300"}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/12 text-xs font-black text-fuchsia-300">{String(index + 1).padStart(2, "0")}</span>
                  <span className={isLight ? "text-base font-black text-slate-950" : "text-base font-black text-white"}>{question}</span>
                </div>
                <span className="text-xl font-black text-fuchsia-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className={isLight ? "mt-4 pl-13 text-sm font-semibold leading-6 text-slate-600" : "mt-4 pl-13 text-sm font-semibold leading-6 text-zinc-400"}>
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
