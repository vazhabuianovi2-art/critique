import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Layers3,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";

const EMPTY_STRATEGY = {
  name: "",
  description: "",
  market: "",
  timeframe: "",
  setupConditions: "",
  entryRules: "",
  exitRules: "",
  riskRules: "",
  invalidation: "",
  notes: "",
  items: [],
};

function normalizeStrategy(strategy = {}) {
  return {
    ...EMPTY_STRATEGY,
    ...strategy,
    items: Array.isArray(strategy.items) ? strategy.items : [],
  };
}

function createEmptyStrategy() {
  return { ...EMPTY_STRATEGY, items: [] };
}

function getStrategyCompletion(strategy) {
  const fields = ["description", "setupConditions", "entryRules", "exitRules", "riskRules"];
  const completed = fields.filter((field) => String(strategy?.[field] || "").trim()).length;
  return Math.round((completed / fields.length) * 100);
}

function EditorField({ label, hint, children, full = false }) {
  return (
    <label className={full ? "block lg:col-span-2" : "block"}>
      <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">{label}</span>
      {hint && <span className="ml-2 text-xs font-semibold text-zinc-600">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function RuleTextarea({ icon: Icon, title, description, value, onChange, placeholder, tone = "fuchsia" }) {
  const toneClasses = {
    fuchsia: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    red: "border-red-500/25 bg-red-500/10 text-red-300",
  };
  return (
    <div className="strategy-rule-section rounded-2xl border border-white/10 bg-[#08080a] p-5">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneClasses[tone]}`}><Icon size={18} /></span>
        <div>
          <h3 className="font-black text-white">{title}</h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-zinc-500">{description}</p>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={5}
        className="strategy-rules-input mt-4 w-full resize-y rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm font-semibold leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-fuchsia-500/55 focus:ring-2 focus:ring-fuchsia-500/10"
      />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "fuchsia" }) {
  const iconTone = tone === "emerald" ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25" : tone === "amber" ? "text-amber-300 bg-amber-500/10 border-amber-500/25" : "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/25";
  return (
    <div className="strategy-rules-metric rounded-2xl border border-white/10 bg-[#09090b] p-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${iconTone}`}><Icon size={17} /></span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
          <p className="mt-1 truncate text-xl font-black text-white">{value}</p>
        </div>
      </div>
      {detail && <p className="mt-3 text-xs font-semibold text-zinc-500">{detail}</p>}
    </div>
  );
}

export function StrategyRulesPage({ strategies = [], trades = [], onSave }) {
  const normalizedStrategies = useMemo(() => strategies.map(normalizeStrategy), [strategies]);
  const [selected, setSelected] = useState(() => normalizedStrategies.length ? 0 : "new");
  const initial = normalizedStrategies.length ? normalizedStrategies[0] : createEmptyStrategy();
  const [draft, setDraft] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedStoredName = selected === "new" ? "" : normalizedStrategies[selected]?.name || baseline.name;
  const linkedTrades = useMemo(
    () => trades.filter((trade) => String(trade.setup || "") === String(selectedStoredName || draft.name || "")),
    [trades, selectedStoredName, draft.name]
  );
  const performance = useMemo(() => {
    const pnl = linkedTrades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
    const wins = linkedTrades.filter((trade) => Number(trade.pnl || 0) > 0).length;
    const losses = linkedTrades.filter((trade) => Number(trade.pnl || 0) < 0).length;
    const decisive = wins + losses;
    return { pnl, wins, losses, winRate: decisive ? (wins / decisive) * 100 : 0 };
  }, [linkedTrades]);
  const isDirty = JSON.stringify(normalizeStrategy(draft)) !== JSON.stringify(normalizeStrategy(baseline));
  const completedPlans = normalizedStrategies.filter((strategy) => getStrategyCompletion(strategy) === 100).length;

  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
    setError("");
    setNotice("");
  }

  function canLeaveDraft() {
    return !isDirty || window.confirm("You have unsaved strategy changes. Leave without saving?");
  }

  function selectStrategy(index) {
    if (!canLeaveDraft()) return;
    const next = normalizeStrategy(normalizedStrategies[index]);
    setSelected(index);
    setDraft(next);
    setBaseline(next);
    setError("");
    setNotice("");
  }

  function startNew() {
    if (!canLeaveDraft()) return;
    const next = createEmptyStrategy();
    setSelected("new");
    setDraft(next);
    setBaseline(next);
    setError("");
    setNotice("");
  }

  function saveStrategy() {
    const name = draft.name.trim();
    if (!name) {
      setError("Strategy name is required.");
      return;
    }
    const duplicateIndex = normalizedStrategies.findIndex((strategy, index) => index !== selected && strategy.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicateIndex >= 0) {
      setError(`A strategy named “${name}” already exists. Choose a different name.`);
      return;
    }

    const saved = {
      ...normalizeStrategy(draft),
      id: draft.id || `strategy-${Date.now()}`,
      name,
      updatedAt: new Date().toISOString(),
    };
    let next;
    let nextIndex;
    let renameInfo = null;
    if (selected === "new") {
      next = [...normalizedStrategies, saved];
      nextIndex = next.length - 1;
    } else {
      const oldName = normalizedStrategies[selected]?.name || "";
      if (oldName && oldName !== name) renameInfo = { oldName, newName: name };
      next = normalizedStrategies.map((strategy, index) => index === selected ? saved : strategy);
      nextIndex = selected;
    }

    onSave?.(next, renameInfo);
    setSelected(nextIndex);
    setDraft(saved);
    setBaseline(saved);
    setError("");
    setNotice(selected === "new" ? "Strategy created and added to Add Trade." : "Strategy plan saved successfully.");
  }

  function deleteStrategy() {
    if (selected === "new") {
      startNew();
      return;
    }
    const target = normalizedStrategies[selected];
    if (!target || !window.confirm(`Delete strategy “${target.name}”? Existing trades will keep their historical strategy label.`)) return;
    const next = normalizedStrategies.filter((_, index) => index !== selected);
    onSave?.(next);
    if (next.length) {
      const nextIndex = Math.min(selected, next.length - 1);
      const nextDraft = normalizeStrategy(next[nextIndex]);
      setSelected(nextIndex);
      setDraft(nextDraft);
      setBaseline(nextDraft);
    } else {
      const nextDraft = createEmptyStrategy();
      setSelected("new");
      setDraft(nextDraft);
      setBaseline(nextDraft);
    }
    setError("");
    setNotice("Strategy removed from your library.");
  }

  return (
    <div className="strategy-rules-page mx-auto w-full max-w-[1600px] pb-16">
      <div className="mb-7 flex items-center gap-3 text-sm font-bold text-zinc-500">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300"><ClipboardCheck size={17} /></span>
        <span className="text-zinc-300">TryCritique</span><span>/</span><span>Strategy &amp; Rules</span>
      </div>

      <section className="strategy-rules-hero relative overflow-hidden rounded-3xl border border-fuchsia-500/25 bg-[linear-gradient(120deg,#180521_0%,#100713_55%,#16210e_100%)] px-6 py-7 shadow-[0_24px_70px_rgba(0,0,0,.32)] sm:px-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="relative">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/25 bg-black/25 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300"><Sparkles size={13} /> Your trading playbook</div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Strategy &amp; Rules</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-zinc-400 sm:text-base">Build a clear trading plan, keep every rule in one place, and use the same strategy names when you journal trades.</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <MetricCard icon={Layers3} label="Strategies" value={normalizedStrategies.length} detail="Available inside Add Trade" />
        <MetricCard icon={CheckCircle2} label="Complete Plans" value={completedPlans} detail="Core rule sections completed" tone="emerald" />
      </div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="strategy-library-panel self-start rounded-2xl border border-white/10 bg-[#08080a] p-4 xl:sticky xl:top-6">
          <div className="flex items-center justify-between px-1 pb-3">
            <div>
              <h2 className="font-black text-white">Strategy Library</h2>
              <p className="mt-1 text-xs font-semibold text-zinc-500">Select a plan to review or edit.</p>
            </div>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-black text-zinc-400">{normalizedStrategies.length}</span>
          </div>
          <button type="button" onClick={startNew} className={`mt-2 flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${selected === "new" ? "border-fuchsia-500/45 bg-fuchsia-500/12 text-fuchsia-200" : "border-dashed border-white/15 text-zinc-400 hover:border-fuchsia-500/35 hover:text-fuchsia-300"}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-fuchsia-500/10"><Plus size={16} /></span>
            <span className="text-sm font-black">Create new strategy</span>
          </button>
          <div className="mt-3 space-y-2">
            {normalizedStrategies.map((strategy, index) => {
              const active = selected === index;
              const completion = getStrategyCompletion(strategy);
              const strategyTrades = trades.filter((trade) => trade.setup === strategy.name).length;
              return (
                <button key={strategy.id || `${strategy.name}-${index}`} type="button" onClick={() => selectStrategy(index)} className={`w-full rounded-xl border p-3 text-left transition ${active ? "border-fuchsia-500/45 bg-fuchsia-500/10 shadow-[0_0_20px_rgba(178,75,243,.08)]" : "border-white/8 bg-black/35 hover:border-white/20 hover:bg-white/[.035]"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-white">{strategy.name}</div>
                      <div className="mt-1 truncate text-xs font-semibold text-zinc-500">{strategy.market || "Any market"}{strategy.timeframe ? ` · ${strategy.timeframe}` : ""}</div>
                    </div>
                    <span className={`text-xs font-black ${completion === 100 ? "text-emerald-400" : "text-fuchsia-300"}`}>{completion}%</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full ${completion === 100 ? "bg-emerald-400" : "bg-fuchsia-500"}`} style={{ width: `${completion}%` }} /></div>
                  <div className="mt-2 text-right text-[11px] font-bold text-zinc-600">{strategyTrades} linked trades</div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <section className="strategy-editor-panel rounded-2xl border border-white/10 bg-[#09090b] p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-white">{selected === "new" ? "Create Strategy" : "Edit Strategy Plan"}</h2>
                  {isDirty && <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">Unsaved changes</span>}
                </div>
                <p className="mt-1 text-sm font-semibold text-zinc-500">This name is shared with the Strategy field in Add Trade.</p>
              </div>
              <div>
                <button type="button" onClick={saveStrategy} className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-500 px-4 py-2.5 text-sm font-black text-black transition hover:bg-fuchsia-400"><Save size={15} /> Save Plan</button>
              </div>
            </div>

            {(error || notice) && <div className={`mt-5 rounded-xl border px-4 py-3 text-sm font-bold ${error ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>{error || notice}</div>}

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <EditorField label="Strategy Name" hint="Required">
                <input value={draft.name} onChange={(event) => updateField("name", event.target.value)} placeholder="e.g. NY Open Liquidity Sweep" className="strategy-rules-input h-11 w-full rounded-xl border border-white/10 bg-black/70 px-4 text-sm font-bold text-white outline-none transition placeholder:text-zinc-700 focus:border-fuchsia-500/55 focus:ring-2 focus:ring-fuchsia-500/10" />
              </EditorField>
              <div className="grid grid-cols-2 gap-3">
                <EditorField label="Market">
                  <input value={draft.market} onChange={(event) => updateField("market", event.target.value)} placeholder="NQ, ES, Forex..." className="strategy-rules-input h-11 w-full rounded-xl border border-white/10 bg-black/70 px-4 text-sm font-bold text-white outline-none transition placeholder:text-zinc-700 focus:border-fuchsia-500/55" />
                </EditorField>
                <EditorField label="Timeframe">
                  <input value={draft.timeframe} onChange={(event) => updateField("timeframe", event.target.value)} placeholder="5m / 15m" className="strategy-rules-input h-11 w-full rounded-xl border border-white/10 bg-black/70 px-4 text-sm font-bold text-white outline-none transition placeholder:text-zinc-700 focus:border-fuchsia-500/55" />
                </EditorField>
              </div>
              <EditorField label="Strategy Thesis" hint="What edge are you trading?" full>
                <textarea value={draft.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Explain why this setup should work, the ideal market environment, and what you expect price to do..." rows={4} className="strategy-rules-input w-full resize-y rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm font-semibold leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-fuchsia-500/55 focus:ring-2 focus:ring-fuchsia-500/10" />
              </EditorField>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <RuleTextarea icon={Target} title="Setup Conditions" description="What must be present before this setup becomes valid?" value={draft.setupConditions} onChange={(value) => updateField("setupConditions", value)} placeholder={'• Higher-timeframe bias is clear\n• Liquidity level is marked\n• Trade is inside my session window'} />
            <RuleTextarea icon={TrendingUp} title="Entry Rules" description="Write the exact trigger that allows you to enter." value={draft.entryRules} onChange={(value) => updateField("entryRules", value)} placeholder={'• Wait for confirmation close\n• Enter only after displacement\n• No chasing after the planned entry'} tone="emerald" />
            <RuleTextarea icon={Clock3} title="Exit Rules" description="Define targets, stop movement, partials, and early exits." value={draft.exitRules} onChange={(value) => updateField("exitRules", value)} placeholder={'• Stop beyond invalidation\n• First target at opposing liquidity\n• Exit if the thesis is no longer valid'} tone="amber" />
            <RuleTextarea icon={ShieldCheck} title="Risk Rules" description="Set hard limits for risk, size, and daily exposure." value={draft.riskRules} onChange={(value) => updateField("riskRules", value)} placeholder={'• Maximum 0.5% risk per trade\n• Stop after 2 losses\n• Never widen the stop loss'} tone="red" />
            <div className="lg:col-span-2"><RuleTextarea icon={AlertTriangle} title="Invalidation & No-Trade Conditions" description="List the situations that cancel the setup or keep you out of the market." value={draft.invalidation} onChange={(value) => updateField("invalidation", value)} placeholder={'• High-impact news inside 10 minutes\n• Daily loss limit already reached\n• Market structure does not match the thesis'} tone="red" /></div>
          </div>

          <section className="strategy-editor-panel rounded-2xl border border-white/10 bg-[#09090b] p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard icon={BarChart3} label="Linked Trades" value={linkedTrades.length} detail={`${performance.wins} wins · ${performance.losses} losses`} />
              <MetricCard icon={Target} label="Win Rate" value={`${performance.winRate.toFixed(1)}%`} detail="Based on closed linked trades" tone="emerald" />
              <MetricCard icon={BookOpen} label="Net P&L" value={`${performance.pnl < 0 ? "-" : ""}$${Math.abs(performance.pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} detail="Historical strategy result" tone={performance.pnl >= 0 ? "emerald" : "amber"} />
            </div>
            <EditorField label="Review Notes" hint="Lessons, refinements, or backtest observations" full>
              <textarea value={draft.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Write what you are learning about this strategy and what you may test next..." rows={4} className="strategy-rules-input w-full resize-y rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm font-semibold leading-6 text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-fuchsia-500/55" />
            </EditorField>
            <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t border-white/8 pt-5 sm:flex-row sm:items-center">
              <button type="button" onClick={deleteStrategy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-2.5 text-sm font-black text-red-400 transition hover:bg-red-500/15"><Trash2 size={15} /> {selected === "new" ? "Clear Draft" : "Delete Strategy"}</button>
              <button type="button" onClick={saveStrategy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-500 px-6 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-fuchsia-400"><Save size={16} /> Save Strategy Plan</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
