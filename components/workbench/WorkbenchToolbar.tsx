"use client";

import { useWorkbench } from "@/lib/store";
import { LANGUAGES, type Language, type Mode } from "@/lib/types";
import { ChevronDown, Zap } from "lucide-react";

const MODES: Array<{ id: Mode; label: string }> = [
  { id: "standard", label: "Standard" },
  { id: "learning", label: "Learning" },
  { id: "interview", label: "Interview" },
  { id: "competitive", label: "Competitive" },
];

function StatusPill() {
  const status = useWorkbench((s) => s.status);
  const lastAnalyzedAt = useWorkbench((s) => s.lastAnalyzedAt);

  if (status === "analyzing") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium text-accent">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        Analyzing…
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-[11px] font-medium text-danger">
        <span className="h-1.5 w-1.5 rounded-full bg-danger" />
        Analysis failed
      </span>
    );
  }
  if (status === "ready" && lastAnalyzedAt) {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-raised px-3 py-1 text-[11px] font-medium text-mute">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Up to date
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-raised px-3 py-1 text-[11px] font-medium text-mute">
      <span className="h-1.5 w-1.5 rounded-full bg-faint" />
      Idle
    </span>
  );
}

export default function WorkbenchToolbar({ onAnalyze }: { onAnalyze: () => void }) {
  const { language, mode, setLanguage, setMode } = useWorkbench();

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-stroke bg-surface/60 px-4 py-2">
      {/* language picker */}
      <div className="relative">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="appearance-none rounded-lg border border-stroke bg-raised py-1.5 pl-3 pr-8 font-mono text-xs text-ink outline-none transition-colors hover:border-stroke-strong focus:border-accent"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-mute"
        />
      </div>

      {/* mode switcher */}
      <div className="flex items-center gap-0.5 rounded-lg border border-stroke bg-raised p-0.5">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              mode === m.id
                ? "bg-accent-soft text-accent"
                : "text-mute hover:text-ink"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <StatusPill />
        <button
          onClick={onAnalyze}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.03]"
          title="Analyze now (skips the debounce)"
        >
          <Zap size={13} />
          Analyze
        </button>
      </div>
    </div>
  );
}
