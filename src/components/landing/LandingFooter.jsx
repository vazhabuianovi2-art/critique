import React from "react";
import { BrandBolt } from "../ui/BrandBolt";
import { BRAND_NAME } from "../../utils/constants";

export function LandingFooter({ isLight, setAuthPage }) {
  return (
    <footer className={isLight ? "border-t border-slate-200 bg-white/60 px-5 py-12 text-sm font-bold text-slate-500 lg:px-8" : "border-t border-white/[0.06] px-5 py-12 text-sm font-bold text-zinc-500 lg:px-8"}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="mb-3 flex items-center gap-3">
            <BrandBolt className="h-9 w-9 drop-shadow-[0_0_8px_rgba(178,74,242,0.25)]" />
            <span className={isLight ? "text-lg font-black text-slate-950" : "text-lg font-black text-white"}>{BRAND_NAME}</span>
          </div>
          <p className="text-xs leading-6">
            TryCritique is a trading journal and self-review tool. It does not provide trading signals, investment advice, brokerage services, or guaranteed returns.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className={isLight ? "mb-1 text-xs font-black uppercase tracking-wider text-slate-400" : "mb-1 text-xs font-black uppercase tracking-wider text-zinc-600"}>Legal</div>
          <button onClick={() => setAuthPage("terms")} className="text-left transition-colors hover:text-fuchsia-300">Terms of Service</button>
          <button onClick={() => setAuthPage("privacy")} className="text-left transition-colors hover:text-fuchsia-300">Privacy Policy</button>
          <button onClick={() => setAuthPage("refund")} className="text-left transition-colors hover:text-fuchsia-300">Refund Policy</button>
          <button onClick={() => setAuthPage("contact")} className="text-left transition-colors hover:text-fuchsia-300">Contact Us</button>
        </div>
        <div className="flex flex-col gap-2">
          <div className={isLight ? "mb-1 text-xs font-black uppercase tracking-wider text-slate-400" : "mb-1 text-xs font-black uppercase tracking-wider text-zinc-600"}>Product</div>
          {["Features", "How it works", "Pricing", "FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} className="transition-colors hover:text-fuchsia-300">{item}</a>
          ))}
        </div>
      </div>
      <div className={isLight ? "mx-auto mt-10 max-w-7xl border-t border-slate-200 pt-6 text-center text-xs text-slate-400" : "mx-auto mt-10 max-w-7xl border-t border-white/[0.06] pt-6 text-center text-xs text-zinc-600"}>
        © {new Date().getFullYear()} TryCritique. Built for traders, by traders.
      </div>
    </footer>
  );
}
