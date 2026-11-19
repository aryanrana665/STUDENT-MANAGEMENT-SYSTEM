import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  FlaskConical,
  Loader2,
  Play,
  RotateCcw,
} from "lucide-react";
import { PROMPT_LAB_TEMPLATES } from "../data/seedData";
import type { PromptTechniqueId } from "../types";

interface ComparisonOutput {
  basic: { text: string; latencyMs: number; wordCount: number };
  improved: { text: string; latencyMs: number; wordCount: number };
  model: string;
}

interface PromptLabViewProps {
  onLogActivity: (action: string) => void;
}

export const PromptLabView: React.FC<PromptLabViewProps> = ({
  onLogActivity,
}) => {
  const [activeId, setActiveId] = useState<PromptTechniqueId>("zero-shot");
  const template =
    PROMPT_LAB_TEMPLATES.find((t) => t.id === activeId) ||
    PROMPT_LAB_TEMPLATES[0];

  const [basicPrompt, setBasicPrompt] = useState(template.basicPrompt);
  const [improvedPrompt, setImprovedPrompt] = useState(template.improvedPrompt);
  const [systemInstruction, setSystemInstruction] = useState(
    template.systemInstruction || ""
  );

  const [loading, setLoading] = useState(false);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonOutput | null>(null);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) =>
        setApiConfigured(Boolean(data.configured))
      )
      .catch(() => setApiConfigured(false));
  }, []);

  const handleSelectTechnique = (id: PromptTechniqueId) => {
    const next =
      PROMPT_LAB_TEMPLATES.find((t) => t.id === id) || PROMPT_LAB_TEMPLATES[0];
    setActiveId(id);
    setBasicPrompt(next.basicPrompt);
    setImprovedPrompt(next.improvedPrompt);
    setSystemInstruction(next.systemInstruction || "");
    setResult(null);
    setErrorMsg(null);
  };

  const handleReset = () => {
    setBasicPrompt(template.basicPrompt);
    setImprovedPrompt(template.improvedPrompt);
    setSystemInstruction(template.systemInstruction || "");
    setResult(null);
    setErrorMsg(null);
  };

  const handleRunComparison = async () => {
    if (!basicPrompt.trim() || !improvedPrompt.trim() || loading) return;
    setErrorMsg(null);

    if (apiConfigured === false) {
      setErrorMsg(
        "GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in your environment secrets to run live prompt comparisons."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technique: template.id,
          basicPrompt,
          improvedPrompt,
          systemInstruction: systemInstruction.trim() || undefined,
        }),
      });

      const data = (await res.json()) as ComparisonOutput & {
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        if (data.code === "API_KEY_MISSING") setApiConfigured(false);
        setErrorMsg(data.error || "Failed to execute prompt comparison.");
        return;
      }

      setResult(data);
      onLogActivity(`Ran Prompt Lab comparison (${template.label})`);
    } catch {
      setErrorMsg("Network error while calling /api/ai/compare.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-violet-400">
            <FlaskConical className="w-4 h-4" />
            <span>Interactive Prompt Workbench</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Prompt Engineering Lab
          </h1>
          <p className="text-sm text-slate-400">
            Compare basic prompts against structured zero-shot, few-shot,
            role-based, and context-based techniques
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Example</span>
          </button>

          <button
            type="button"
            disabled={loading || !basicPrompt.trim() || !improvedPrompt.trim()}
            onClick={handleRunComparison}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 text-xs font-medium text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/25 cursor-pointer whitespace-nowrap"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{loading ? "Comparing..." : "Run Comparison"}</span>
          </button>
        </div>
      </div>

      {/* Technique Selector Tabs */}
      <div
        role="tablist"
        aria-label="Prompt engineering techniques"
        className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl glass-surface w-fit"
      >
        {PROMPT_LAB_TEMPLATES.map((t) => {
          const active = t.id === activeId;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => handleSelectTechnique(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Missing API Key Setup Notice */}
      {(apiConfigured === false || errorMsg) && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/35 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-100 space-y-1">
            <div className="font-medium">
              {apiConfigured === false
                ? "Server AI Configuration Required"
                : "Comparison Error"}
            </div>
            <p className="text-xs text-amber-200/85 leading-relaxed">
              {errorMsg ||
                "GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in your environment secrets to run live side-by-side comparisons."}
            </p>
          </div>
        </div>
      )}

      {/* Technique Overview */}
      <div className="glass-panel rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Technique Principle</span>
          </div>
          <h2 className="font-display text-lg font-semibold text-white">
            {template.label}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {template.summary}
          </p>
          <p className="text-xs text-slate-400 pt-1">
            Best suited for: {template.whenToUse}
          </p>
        </div>

        <div className="lg:col-span-5 lg:border-l lg:border-slate-800/80 lg:pl-6 space-y-2.5">
          <div className="text-xs font-medium text-violet-400">
            Structural Upgrades Applied
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {template.keyUpgrades.map((u, idx) => (
              <li key={u} className="flex items-start gap-2.5">
                <span className="font-mono text-blue-400">0{idx + 1}.</span>
                <span>{u}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Side-by-Side Prompt Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Basic Prompt */}
        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-semibold text-slate-200">
                Basic Prompt
              </h3>
              <p className="text-xs text-slate-400">
                Underspecified baseline without structure or constraints
              </p>
            </div>
            <span className="font-mono tabular-nums text-[11px] text-slate-400">
              {basicPrompt.length} chars
            </span>
          </div>

          <textarea
            rows={8}
            value={basicPrompt}
            onChange={(e) => setBasicPrompt(e.target.value)}
            className="w-full p-4 rounded-xl bg-[#080d20] border border-slate-700/80 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Improved Prompt */}
        <div className="glass-panel rounded-2xl p-5 space-y-3 border-blue-400/25">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-semibold text-white">
                Improved Prompt ({template.label})
              </h3>
              <p className="text-xs text-blue-400">
                Structured instructions, context, or few-shot rubric
              </p>
            </div>
            <span className="font-mono tabular-nums text-[11px] text-slate-400">
              {improvedPrompt.length} chars
            </span>
          </div>

          {template.id === "role-based" && (
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-violet-300">
                System Instruction (Persona)
              </label>
              <input
                type="text"
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#080d20] border border-violet-500/35 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}

          <textarea
            rows={template.id === "role-based" ? 5 : 8}
            value={improvedPrompt}
            onChange={(e) => setImprovedPrompt(e.target.value)}
            className="w-full p-4 rounded-xl bg-[#080d20] border border-blue-500/35 text-xs font-mono text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Live Output Comparison */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300">
                Basic Prompt Output
              </span>
              <span className="font-mono tabular-nums text-[11px] text-slate-400">
                {result.basic.wordCount} words · {result.basic.latencyMs} ms
              </span>
            </div>
            <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto pr-1">
              {result.basic.text}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-3 border-blue-400/35">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-blue-400">
                Improved Prompt Output
              </span>
              <span className="font-mono tabular-nums text-[11px] text-slate-400">
                {result.improved.wordCount} words · {result.improved.latencyMs} ms
              </span>
            </div>
            <div className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto pr-1">
              {result.improved.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
