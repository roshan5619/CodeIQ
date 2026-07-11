"use client";

import { useWorkbench } from "@/lib/store";
import { ComplexityChip } from "@/components/ui/Badges";
import { ArrowRight, Gauge, MemoryStick, Rocket, Sparkles } from "lucide-react";

const EFFORT_LABEL = {
  trivial: "Trivial change",
  moderate: "Moderate rework",
  involved: "Involved rewrite",
} as const;

export default function OptimizeTab() {
  const insight = useWorkbench((s) => s.insight);
  const setFocusRange = useWorkbench((s) => s.setFocusRange);
  if (!insight) return null;

  if (insight.optimizations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-center">
        <Sparkles size={28} className="text-accent" />
        <p className="text-sm font-medium">Already optimal</p>
        <p className="text-xs text-mute">
          No better algorithm found for this implementation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {insight.optimizations.map((opt, i) => (
        <div key={i} className="glass rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Rocket size={14} />
            </span>
            <h3 className="text-[13px] font-semibold">{opt.title}</h3>
          </div>

          <div className="mb-3 flex items-center justify-center gap-3 rounded-xl bg-raised/70 py-3">
            <ComplexityChip value={opt.currentComplexity} tone="bad" />
            <ArrowRight size={15} className="text-accent" />
            <ComplexityChip value={opt.possibleComplexity} tone="good" />
          </div>

          <p className="mb-3 text-[13px] leading-relaxed text-mute">{opt.suggestion}</p>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="flex items-start gap-2 rounded-xl border border-stroke p-3">
              <Gauge size={13} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-mute">Speedup</div>
                <div className="text-xs font-medium text-ink">{opt.estimatedSpeedup}</div>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-stroke p-3">
              <MemoryStick size={13} className="mt-0.5 shrink-0 text-warn" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-mute">
                  Memory tradeoff
                </div>
                <div className="text-xs font-medium text-ink">{opt.memoryTradeoff}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="rounded-full bg-info-soft px-2.5 py-0.5 text-[11px] text-info">
              {EFFORT_LABEL[opt.effort]}
            </span>
            {opt.lines && (
              <button
                onClick={() => setFocusRange(opt.lines)}
                className="font-mono text-[11px] text-mute underline-offset-2 hover:text-accent hover:underline"
              >
                L{opt.lines.start}–{opt.lines.end}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
