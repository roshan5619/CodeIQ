"use client";

import { useWorkbench } from "@/lib/store";
import { ComplexityChip, ConfidenceBadge } from "@/components/ui/Badges";
import { Crosshair } from "lucide-react";

export default function ComplexityTab() {
  const insight = useWorkbench((s) => s.insight);
  const setFocusRange = useWorkbench((s) => s.setFocusRange);
  if (!insight) return null;

  if (insight.functions.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-mute">
        No functions detected yet — write a function and the complexity
        breakdown appears here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {insight.functions.map((fn) => (
        <div key={`${fn.name}-${fn.lines.start}`} className="glass rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              onClick={() => setFocusRange(fn.lines)}
              className="group flex items-center gap-1.5 font-mono text-sm font-semibold text-ink hover:text-accent"
              title="Highlight in editor"
            >
              {fn.name}()
              <Crosshair size={13} className="text-faint group-hover:text-accent" />
            </button>
            <ConfidenceBadge value={fn.confidence} />
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-raised/70 p-3">
              <div className="mb-1 text-[10px] uppercase tracking-wider text-mute">
                Time complexity
              </div>
              <ComplexityChip value={fn.timeComplexity} tone="bad" />
            </div>
            <div className="rounded-xl bg-raised/70 p-3">
              <div className="mb-1 text-[10px] uppercase tracking-wider text-mute">
                Space complexity
              </div>
              <ComplexityChip value={fn.spaceComplexity} tone="neutral" />
            </div>
          </div>

          <p className="mb-3 text-[13px] leading-relaxed text-mute">{fn.explanation}</p>

          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            {(
              [
                ["Best", fn.bestCase],
                ["Average", fn.averageCase],
                ["Worst", fn.worstCase],
              ] as const
            ).map(([label, val]) => (
              <div key={label} className="rounded-lg border border-stroke p-2">
                <div className="text-[10px] uppercase tracking-wider text-mute">{label}</div>
                <div className="mt-0.5 font-mono text-xs text-ink">{val}</div>
              </div>
            ))}
          </div>

          {fn.hotspots.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {fn.hotspots.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setFocusRange({ start: h.start, end: h.end })}
                  className="flex items-center gap-2 rounded-lg bg-warn-soft px-3 py-2 text-left text-xs text-warn transition-colors hover:bg-warn/20"
                >
                  <span className="shrink-0 font-mono text-[10.5px]">
                    L{h.start}–{h.end}
                  </span>
                  <span className="text-ink/80">{h.reason}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
