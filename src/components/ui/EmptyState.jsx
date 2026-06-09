import React from "react";
import { TrendingUp, BarChart3, Target, Plus } from "lucide-react";
import { Button } from "./button";
import { BRAND_NAME } from "../../utils/constants";

export function DashboardEmptyState({ onAddTrade, onOpenJournal }) {
  const features = [
    { icon: <TrendingUp size={20} />, title: "Track Performance", detail: "Monitor your P&L and trading metrics" },
    { icon: <BarChart3 size={20} />, title: "Analyze Trends", detail: "Visualize your trading patterns" },
    { icon: <Target size={20} />, title: "Set Goals", detail: "Define and achieve trading targets" },
  ];
  return (
    <section className="dashboard-empty mt-8 rounded-2xl border-2 border-dashed border-white/10 bg-black px-6 py-16 transition-all duration-300 sm:px-10 sm:py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
          <div className="absolute h-32 w-32 rounded-full bg-white/[0.03] blur-2xl" aria-hidden="true" />
          <div className="absolute right-1 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/70 text-emerald-400" aria-hidden="true"><BarChart3 size={16} /></div>
          <div className="absolute left-1 top-12 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/70 text-sky-400" aria-hidden="true"><Target size={16} /></div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-[#0a0a0d] text-fuchsia-300"><TrendingUp size={34} /></div>
        </div>

        <h2 className="text-3xl font-black text-white sm:text-4xl">Welcome to <span className="bg-gradient-to-r from-fuchsia-300 to-fuchsia-500 bg-clip-text text-transparent">{BRAND_NAME}</span>!</h2>
        <p className="mt-4 max-w-md text-base font-semibold leading-relaxed text-zinc-400">Your trading journey starts here. Log your first trade to see your performance analytics, track your progress, and unlock powerful insights.</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={onAddTrade} className="border border-fuchsia-500/35 bg-fuchsia-950/45 px-6 py-3 font-black text-fuchsia-100 hover:border-fuchsia-400/55 hover:bg-fuchsia-950/65"><Plus size={18} /> Log Your First Trade</Button>
          <Button onClick={onOpenJournal} className="border border-white/15 bg-black px-6 py-3 font-black text-white hover:bg-white/5">Explore Journal</Button>
        </div>

        <div className="mt-12 grid w-full gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0d] text-fuchsia-300">{feature.icon}</div>
              <h3 className="mt-4 text-base font-black text-white">{feature.title}</h3>
              <p className="mt-1 max-w-[180px] text-sm font-semibold text-zinc-500">{feature.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
