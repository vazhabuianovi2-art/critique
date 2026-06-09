import React from "react";
import { AlertTriangle } from "lucide-react";

export function LandingFAQ({ isLight }) {
  const questions = [
    [
      "Do I need to connect my broker?",
      "No broker connection required. You log trades manually. This keeps everything private, flexible, and usable with any instrument or broker worldwide.",
    ],
    [
      "Is this financial advice?",
      "No. TryCritique is a trading journal and self-review tool. It does not provide trading signals, investment advice, brokerage services, or guaranteed returns.",
    ],
    [
      "Can I upload screenshots?",
      "Yes. Each trade supports screenshots, notes, strategy tags, emotion rating, session context, rule review, and quality ratings for your entry and exit.",
    ],
    [
      "Will it actually show my mistakes?",
      "Yes. The Mistake Detector groups every tagged error by type, shows how often it occurred, and ranks them by total cost. You pick one to focus on — not all of them at once.",
    ],
    [
      "Can I export my data?",
      "Yes. You can export a CSV file for spreadsheet analysis, or create a full JSON backup to restore your journal on any device at any time.",
    ],
    [
      "Do I need a credit card for the trial?",
      "No. The 7-day free trial requires no payment details. You only enter billing information if you choose to subscribe after the trial ends.",
    ],
    [
      "Can I use it for futures, forex, crypto, or stocks?",
      "Yes. TryCritique is instrument-agnostic. Traders use it for NQ, ES, forex pairs, crypto, stocks, options, and indices. Any market where you log a trade works.",
    ],
  ];

  return (
    <section id="faq" className="mx-auto min-h-screen w-full max-w-7xl scroll-mt-16 px-5 py-24 lg:px-8">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <div className={isLight ? "text-sm font-black uppercase tracking-[0.22em] text-fuchsia-500" : "eyebrow-badge inline-flex mb-2"}>FAQ</div>
          <h2 className={isLight ? "mt-4 text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl" : "mt-5 text-5xl font-black leading-[0.97] tracking-tight sm:text-6xl"}>
            {isLight
              ? <>Questions before<br />you start?</>
              : <><span className="text-white">Questions before</span><br /><span className="text-gradient-primary">you start?</span></>}
          </h2>
          <p className={isLight ? "mt-6 text-lg font-semibold leading-8 text-slate-600" : "mt-6 text-lg font-semibold leading-8 text-zinc-400"}>
            No broker connection. No signals. No advice. Just a focused journal that shows you where your money is going and what to fix.
          </p>

          <div className={isLight ? "mt-10 rounded-[1.35rem] border border-amber-200 bg-amber-50/80 p-6 shadow-sm" : "mt-10 rounded-[1.35rem] border border-amber-500/25 bg-amber-500/8 p-6"}>
            <div className="flex items-start gap-4">
              <span className={isLight ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-amber-600" : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-300"}>
                <AlertTriangle size={22} />
              </span>
              <div>
                <div className={isLight ? "text-lg font-black text-slate-950" : "text-lg font-black text-white"}>Disclaimer</div>
                <p className={isLight ? "mt-2 text-sm font-semibold leading-6 text-slate-600" : "mt-2 text-sm font-semibold leading-6 text-zinc-400"}>
                  TryCritique is a trading journal and self-review tool. It does not provide trading signals, investment advice, brokerage services, or guaranteed returns.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map(([question, answer], index) => (
            <details
              key={question}
              className={isLight ? "group rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm open:border-fuchsia-200" : "group glass-card rounded-2xl p-5 open:border-fuchsia-500/40 transition-all duration-300"}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/12 text-xs font-black text-fuchsia-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
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
