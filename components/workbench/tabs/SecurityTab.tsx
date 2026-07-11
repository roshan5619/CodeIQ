"use client";

import { useWorkbench } from "@/lib/store";
import { ConfidenceBadge, SeverityBadge } from "@/components/ui/Badges";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { scoreColor } from "@/components/ui/ScoreGauge";

export default function SecurityTab() {
  const insight = useWorkbench((s) => s.insight);
  const setFocusRange = useWorkbench((s) => s.setFocusRange);
  if (!insight) return null;

  const score = insight.scores.security;

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="glass flex items-center justify-between rounded-2xl p-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-mute">
            Security score
          </div>
          <div className="font-mono text-2xl font-bold" style={{ color: scoreColor(score) }}>
            {score}
          </div>
        </div>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-raised">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: scoreColor(score) }}
          />
        </div>
      </div>

      {insight.security.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-6 text-center">
          <ShieldCheck size={28} className="text-accent" />
          <p className="text-sm font-medium">No vulnerabilities found</p>
          <p className="text-xs text-mute">
            Checked for injection, XSS, RCE, hardcoded secrets, weak crypto and
            unsafe deserialization.
          </p>
        </div>
      ) : (
        insight.security.map((finding, i) => (
          <div key={i} className="glass rounded-2xl p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <button
                onClick={() => setFocusRange({ start: finding.line, end: finding.line })}
                className="flex items-center gap-2 text-left hover:text-accent"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-danger">
                  <ShieldAlert size={14} />
                </span>
                <div>
                  <div className="text-[13px] font-semibold leading-tight">
                    {finding.category}
                  </div>
                  <div className="font-mono text-[10.5px] text-mute">Line {finding.line}</div>
                </div>
              </button>
              <div className="flex shrink-0 items-center gap-1.5">
                <SeverityBadge severity={finding.severity} />
                <ConfidenceBadge value={finding.confidence} />
              </div>
            </div>
            <p className="mb-3 text-[13px] leading-relaxed text-mute">{finding.detail}</p>
            <div className="rounded-xl bg-accent-soft p-3 text-xs leading-relaxed text-ink/90">
              {finding.remediation}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
