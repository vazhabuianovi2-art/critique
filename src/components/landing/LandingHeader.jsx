import React from "react";
import { Sun, Moon } from "lucide-react";
import { BrandBolt } from "../ui/BrandBolt";
import { BRAND_NAME } from "../../utils/constants";

export function LandingHeader({ isLight, theme, setTheme, setAuthPage, onGoHome }) {
  const navItems = ["Features", "How it works", "Pricing", "FAQ"];
  return (
    <header className={isLight ? "fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl" : "fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-black/60 backdrop-blur-2xl shadow-[0_1px_0_rgba(178,74,242,0.12)]"}>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 lg:px-8">
        <button type="button" onClick={onGoHome} className="flex items-center gap-3 text-xl font-black">
          <span className="text-fuchsia-400 drop-shadow-[0_0_6px_rgba(178,74,242,0.2)]"><BrandBolt className="h-8 w-8" /></span>
          <span>{BRAND_NAME}</span>
        </button>
        <nav className={isLight ? "hidden items-center gap-9 text-sm font-black text-slate-500 md:flex" : "hidden items-center gap-9 text-sm font-black text-zinc-400 md:flex"}>
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} className={isLight ? "transition hover:text-slate-950" : "transition hover:text-white"}>
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={isLight ? "flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-800 shadow-sm transition hover:border-fuchsia-300" : "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-black text-zinc-300 transition hover:border-fuchsia-500/50 hover:text-white"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button type="button" onClick={() => setAuthPage("login")} className={isLight ? "inline-flex text-sm font-black text-slate-600 transition hover:text-slate-950" : "inline-flex text-sm font-black text-zinc-200 transition hover:text-white"}>
            Log In
          </button>
          <button type="button" onClick={() => setAuthPage("register")} className="rounded-xl bg-fuchsia-500 px-4 py-2.5 text-sm font-black text-white shadow-[0_18px_42px_rgba(178,74,242,0.28)] transition hover:bg-fuchsia-400">
            Try 7 Days Free
          </button>
        </div>
      </div>
    </header>
  );
}
