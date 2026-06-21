import React, { useMemo, useRef, useState } from "react";
import { BrandBolt } from "./ui/BrandBolt";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Camera,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Layers3,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

const EMPTY_STRATEGY = {
  name: "",
  description: "",
  market: "",
  setupConditions: "",
  entryRules: "",
  exitRules: "",
  riskRules: "",
  invalidation: "",
  notes: "",
  items: [],
  images: [],
};

function normalizeStrategy(strategy = {}) {
  const cleanStrategy = { ...strategy };
  delete cleanStrategy.tradeContents;
  delete cleanStrategy.timeframe;
  return {
    ...EMPTY_STRATEGY,
    ...cleanStrategy,
    items: Array.isArray(strategy.items) ? strategy.items : [],
    images: Array.isArray(strategy.images)
      ? strategy.images.map((image, index) => typeof image === "string" ? { id: `legacy-image-${index}`, src: image, caption: "" } : image).filter((image) => image?.src)
      : [],
  };
}

function createEmptyStrategy() {
  return { ...EMPTY_STRATEGY, items: [], images: [] };
}

function getStrategyCompletion(strategy) {
  const fields = ["description", "setupConditions", "entryRules", "exitRules", "riskRules"];
  const completed = fields.filter((field) => String(strategy?.[field] || "").trim()).length;
  return Math.round((completed / fields.length) * 100);
}

function resizeStrategyImage(file, maxSize = 800, quality = 0.68) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("This image format is not supported."));
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.fillStyle = "#08080a";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
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
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState({ name: "", market: "", description: "" });
  const [createError, setCreateError] = useState("");
  const imageInputRef = useRef(null);

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
    setActiveImageIndex(null);
    setSelected(index);
    setDraft(next);
    setBaseline(next);
    setError("");
    setNotice("");
  }

  function startNew() {
    setCreateDraft({ name: "", market: "", description: "" });
    setCreateError("");
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setCreateError("");
  }

  function createStrategyFromModal(event) {
    event.preventDefault();
    const name = createDraft.name.trim();
    if (!name) {
      setCreateError("Strategy name is required.");
      return;
    }
    const duplicate = normalizedStrategies.some((strategy) => strategy.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicate) {
      setCreateError(`A strategy named “${name}” already exists.`);
      return;
    }
    if (isDirty && !window.confirm("You have unsaved changes in the current strategy. Create a new strategy without saving them?")) return;

    const saved = {
      ...createEmptyStrategy(),
      id: `strategy-${Date.now()}`,
      name,
      market: createDraft.market.trim(),
      description: createDraft.description.trim(),
      updatedAt: new Date().toISOString(),
    };
    const next = [...normalizedStrategies, saved];
    onSave?.(next);
    setSelected(next.length - 1);
    setDraft(saved);
    setBaseline(saved);
    setActiveImageIndex(null);
    setError("");
    setNotice("Strategy created. Add images and detailed rules below.");
    closeCreateModal();
  }

  async function uploadStrategyImages(event) {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    event.target.value = "";
    if (!files.length) return;
    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setError("Each image must be smaller than 10MB.");
      return;
    }

    setIsUploadingImages(true);
    setError("");
    setNotice("");
    try {
      const uploaded = [];
      for (let index = 0; index < files.length; index += 1) {
        uploaded.push({
          id: `strategy-image-${Date.now()}-${index}`,
          src: await resizeStrategyImage(files[index]),
          caption: "",
        });
      }
      setDraft((current) => ({ ...current, images: [...current.images, ...uploaded] }));
    } catch (uploadError) {
      setError(uploadError?.message || "Could not add this image.");
    } finally {
      setIsUploadingImages(false);
    }
  }

  function updateImageCaption(index, caption) {
    setDraft((current) => ({ ...current, images: current.images.map((image, imageIndex) => imageIndex === index ? { ...image, caption } : image) }));
    setNotice("");
  }

  function removeStrategyImage(index) {
    setDraft((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }));
    setActiveImageIndex(null);
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
        <BrandBolt className="h-9 w-9 shrink-0 drop-shadow-[0_0_10px_rgba(178,75,243,.22)]" />
        <span className="text-zinc-300">TryCritique</span><span>/</span><span>Strategy &amp; Rules</span>
      </div>

      <section className="strategy-rules-hero dashboard-hero relative overflow-hidden rounded-2xl px-6 py-7 sm:px-8">
        <div className="dashboard-hero-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-fuchsia-600/[0.025] blur-3xl" />
        <div className="relative z-10">
          <div className="max-w-3xl">
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
                      <div className="mt-1 truncate text-xs font-semibold text-zinc-500">{strategy.market || "Any market"}</div>
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
          {selected === "new" ? (
            <section className="strategy-editor-panel flex min-h-[520px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#09090b] px-6 py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300"><Plus size={26} /></span>
              <h2 className="mt-5 text-2xl font-black text-white">Create your first strategy</h2>
              <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-zinc-500">Start with the strategy name, market, and a short description. You can add images and detailed rules after creating it.</p>
              <button type="button" onClick={startNew} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-fuchsia-500 px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-fuchsia-400"><Plus size={16} /> Create new strategy</button>
            </section>
          ) : (
          <>
          <section className="strategy-editor-panel rounded-2xl border border-white/10 bg-[#09090b] p-5 sm:p-6">
            <div className="border-b border-white/8 pb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-white">{selected === "new" ? "Create Strategy" : "Edit Strategy Plan"}</h2>
                  {isDirty && <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">Unsaved changes</span>}
                </div>
                <p className="mt-1 text-sm font-semibold text-zinc-500">This name is shared with the Strategy field in Add Trade.</p>
              </div>
            </div>

            {(error || notice) && <div className={`mt-5 rounded-xl border px-4 py-3 text-sm font-bold ${error ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>{error || notice}</div>}

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <EditorField label="Strategy Name" hint="Required">
                <input value={draft.name} onChange={(event) => updateField("name", event.target.value)} placeholder="e.g. NY Open Liquidity Sweep" className="strategy-rules-input h-11 w-full rounded-xl border border-white/10 bg-black/70 px-4 text-sm font-bold text-white outline-none transition placeholder:text-zinc-700 focus:border-fuchsia-500/55 focus:ring-2 focus:ring-fuchsia-500/10" />
              </EditorField>
              <EditorField label="Market">
                <input value={draft.market} onChange={(event) => updateField("market", event.target.value)} placeholder="NQ, ES, Forex..." className="strategy-rules-input h-11 w-full rounded-xl border border-white/10 bg-black/70 px-4 text-sm font-bold text-white outline-none transition placeholder:text-zinc-700 focus:border-fuchsia-500/55" />
              </EditorField>
              <EditorField label="About Your Strategy" hint="Explain your edge and ideal market environment" full>
                <textarea value={draft.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Explain why this setup should work, the ideal market environment, and what you expect price to do..." rows={4} className="strategy-rules-input w-full resize-y rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm font-semibold leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-fuchsia-500/55 focus:ring-2 focus:ring-fuchsia-500/10" />
              </EditorField>
            </div>
          </section>

          <section className="strategy-editor-panel rounded-2xl border border-white/10 bg-[#09090b] p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300"><Camera size={18} /></span>
                <div>
                  <h2 className="font-black text-white">Strategy Images</h2>
                  <p className="mt-1 text-xs font-semibold leading-5 text-zinc-500">Add chart examples and explain what each image shows.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-zinc-500">{draft.images.length} image{draft.images.length === 1 ? "" : "s"}</span>
                <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={uploadStrategyImages} className="hidden" />
                <button type="button" disabled={isUploadingImages} onClick={() => imageInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/12 px-4 py-2.5 text-sm font-black text-fuchsia-300 transition hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-40">
                  {isUploadingImages ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} {isUploadingImages ? "Processing..." : "Upload Images"}
                </button>
              </div>
            </div>

            {draft.images.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {draft.images.map((image, index) => (
                  <div key={image.id || index} className="strategy-image-card group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                    <button type="button" onClick={() => setActiveImageIndex(index)} className="block aspect-video w-full overflow-hidden bg-black" aria-label={`Open strategy image ${index + 1}`}>
                      <img src={image.src} alt={image.caption || `Strategy example ${index + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                    </button>
                    <button type="button" onClick={() => removeStrategyImage(index)} aria-label={`Remove strategy image ${index + 1}`} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/80 text-zinc-300 backdrop-blur transition hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-300"><X size={14} /></button>
                    <div className="p-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">What this image shows</label>
                      <input value={image.caption || ""} onChange={(event) => updateImageCaption(index, event.target.value)} placeholder="e.g. Liquidity sweep and entry confirmation" className="strategy-rules-input mt-2 h-10 w-full rounded-xl border border-white/10 bg-black/70 px-3 text-xs font-semibold text-white outline-none placeholder:text-zinc-700 focus:border-fuchsia-500/55" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button type="button" onClick={() => imageInputRef.current?.click()} className="mt-5 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/25 px-5 py-10 text-center transition hover:border-fuchsia-500/35 hover:bg-fuchsia-500/[.04]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-fuchsia-300"><ImagePlus size={21} /></span>
                <span className="mt-3 text-sm font-black text-zinc-300">Add chart or setup examples</span>
                <span className="mt-1 text-xs font-semibold text-zinc-600">PNG, JPG or WebP · add as many images as you need</span>
              </button>
            )}
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <RuleTextarea icon={Target} title="Setup Conditions" description="What must be present before this setup becomes valid?" value={draft.setupConditions} onChange={(value) => updateField("setupConditions", value)} placeholder={'• Directional bias is clear\n• Liquidity level is marked\n• Trade is inside my session window'} />
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
          </>
          )}
        </main>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="create-strategy-title" onClick={closeCreateModal}>
          <div className="strategy-create-modal w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-[#09090b] shadow-[0_35px_120px_rgba(0,0,0,.8)]" onClick={(event) => event.stopPropagation()}>
            <div className="strategy-create-modal-header relative overflow-hidden border-b border-white/10 bg-[linear-gradient(120deg,#180521_0%,#100713_60%,#15200e_100%)] px-6 py-6 sm:px-7">
              <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-fuchsia-500/15 blur-3xl" />
              <div className="relative flex items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/12 text-fuchsia-300"><Sparkles size={19} /></span>
                  <div>
                    <h2 id="create-strategy-title" className="text-2xl font-black text-white">Create New Strategy</h2>
                    <p className="mt-1.5 text-sm font-semibold leading-6 text-zinc-400">Create the strategy first, then add images and detailed execution rules.</p>
                  </div>
                </div>
                <button type="button" onClick={closeCreateModal} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-zinc-400 transition hover:bg-white/10 hover:text-white" aria-label="Close create strategy modal"><X size={17} /></button>
              </div>
            </div>

            <form onSubmit={createStrategyFromModal} className="space-y-5 p-6 sm:p-7">
              {createError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{createError}</div>}
              <div className="grid gap-5 sm:grid-cols-2">
                <EditorField label="Strategy Name" hint="Required">
                  <input autoFocus value={createDraft.name} onChange={(event) => { setCreateDraft((current) => ({ ...current, name: event.target.value })); setCreateError(""); }} placeholder="e.g. NY Open Liquidity Sweep" className="strategy-rules-input h-11 w-full rounded-xl border border-white/10 bg-black/70 px-4 text-sm font-bold text-white outline-none placeholder:text-zinc-700 focus:border-fuchsia-500/55 focus:ring-2 focus:ring-fuchsia-500/10" />
                </EditorField>
                <EditorField label="Market">
                  <input value={createDraft.market} onChange={(event) => setCreateDraft((current) => ({ ...current, market: event.target.value }))} placeholder="NQ, ES, Forex..." className="strategy-rules-input h-11 w-full rounded-xl border border-white/10 bg-black/70 px-4 text-sm font-bold text-white outline-none placeholder:text-zinc-700 focus:border-fuchsia-500/55" />
                </EditorField>
              </div>
              <EditorField label="About Your Strategy" hint="Optional">
                <textarea value={createDraft.description} onChange={(event) => setCreateDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Explain the idea behind this strategy and the ideal market environment..." rows={5} className="strategy-rules-input w-full resize-y rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm font-semibold leading-6 text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-fuchsia-500/55 focus:ring-2 focus:ring-fuchsia-500/10" />
              </EditorField>
              <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/[.06] px-4 py-3 text-xs font-semibold leading-5 text-zinc-400">After creation, the full strategy workspace will open automatically for images, setup conditions, entry rules, exit rules, and risk rules.</div>
              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeCreateModal} className="rounded-xl border border-white/15 bg-black px-5 py-2.5 text-sm font-black text-zinc-300 transition hover:border-white/25 hover:text-white">Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-500 px-5 py-2.5 text-sm font-black text-black shadow-[0_0_24px_rgba(178,75,243,.22)] transition hover:-translate-y-0.5 hover:bg-fuchsia-400"><Plus size={16} /> Create Strategy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeImageIndex !== null && draft.images[activeImageIndex] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" onClick={() => setActiveImageIndex(null)}>
          <button type="button" onClick={() => setActiveImageIndex(null)} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-black/70 text-white transition hover:bg-white/10" aria-label="Close image preview"><X size={20} /></button>
          <div className="max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <img src={draft.images[activeImageIndex].src} alt={draft.images[activeImageIndex].caption || "Strategy example"} className="max-h-[82vh] max-w-[92vw] rounded-2xl border border-white/10 object-contain shadow-[0_30px_100px_rgba(0,0,0,.75)]" />
            {draft.images[activeImageIndex].caption && <p className="mx-auto mt-4 max-w-3xl text-center text-sm font-semibold text-zinc-300">{draft.images[activeImageIndex].caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
