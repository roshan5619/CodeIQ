"use client";

import { useWorkbench } from "@/lib/store";
import { ConfidenceBadge, SeverityBadge } from "@/components/ui/Badges";
import { Bug, CheckCircle2, Wrench } from "lucide-react";

export default function BugsTab() {
  const insight = useWorkbench((s) => s.insight);
  const setFocusRange = useWorkbench((s) => s.setFocusRange);
  if (!insight) return null;

  if (insight.bugs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-center">
        <CheckCircle2 size={28} className="text-accent" />
        <p className="text-sm font-medium">No bugs detected</p>
        <p className="text-xs text-mute">
          The analyzer found no risky lines in this code.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {insight.bugs.map((bug, i) => (
        <div key={i} className="glass rounded-2xl p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <button
              onClick={() => setFocusRange({ start: bug.line, end: bug.line })}
              className="flex items-center gap-2 text-left hover:text-accent"
              title="Jump to line"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warn-soft text-warn">
                <Bug size={14} />
              </span>
              <div>
                <div className="text-[13px] font-semibold leading-tight">{bug.title}</div>
                <div className="font-mono text-[10.5px] text-mute">
                  Line {bug.line} · {bug.kind}
                </div>
              </div>
            </button>
            <div className="flex shrink-0 items-center gap-1.5">
              <SeverityBadge severity={bug.severity} />
              <ConfidenceBadge value={bug.confidence} />
            </div>
          </div>
          <p className="mb-3 text-[13px] leading-relaxed text-mute">{bug.detail}</p>
          <div className="flex items-start gap-2 rounded-xl bg-accent-soft p-3">
            <Wrench size={13} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-xs leading-relaxed text-ink/90">{bug.suggestedFix}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
