"use client";

import { useWorkbench } from "@/lib/store";
import { SCORE_LABELS, type Scores } from "@/lib/types";
import ScoreGauge, { scoreColor } from "@/components/ui/ScoreGauge";
import { FlaskConical } from "lucide-react";

export default function OverviewTab() {
  const insight = useWorkbench((s) => s.insight);
  if (!insight) return null;

  const { overall, scores, summary, hiddenTests } = insight;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* overall + verdict */}
      <div className="glass flex items-center gap-4 rounded-2xl p-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg width={80} height={80} className="-rotate-90">
            <circle cx={40} cy={40} r={35} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth={6} />
            <circle
              cx={40}
              cy={40}
              r={35}
              fill="none"
              stroke={scoreColor(overall)}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 35}
              strokeDashoffset={2 * Math.PI * 35 * (1 - overall / 100)}
              style={{ transition: "stroke-dashoffset 700ms ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xl font-bold" style={{ color: scoreColor(overall) }}>
              {overall}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-mute">overall</span>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-mute">{summary}</p>
      </div>

      {/* 8 score dimensions */}
      <div className="glass rounded-2xl p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-mute">
          Quality dimensions
        </h3>
        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {(Object.keys(SCORE_LABELS) as Array<keyof Scores>).map((key) => (
            <ScoreGauge key={key} label={SCORE_LABELS[key]} value={scores[key]} size={64} />
          ))}
        </div>
      </div>

      {/* hidden test prediction */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-mute">
            <FlaskConical size={12} className="text-info" />
            Hidden test prediction
          </h3>
          <span className="rounded-full bg-info-soft px-2 py-0.5 text-[10.5px] font-medium capitalize text-info">
            {hiddenTests.confidence} confidence
          </span>
        </div>
        <div className="mb-2 flex items-baseline gap-2">
          <span
            className="font-mono text-3xl font-bold"
            style={{ color: scoreColor(hiddenTests.passProbability) }}
          >
            {hiddenTests.passProbability}%
          </span>
          <span className="text-xs text-mute">predicted pass rate</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-raised">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${hiddenTests.passProbability}%`,
              background: scoreColor(hiddenTests.passProbability),
            }}
          />
        </div>
        {hiddenTests.likelyFailures.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hiddenTests.likelyFailures.map((f) => (
              <span
                key={f}
                className="rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] text-warn"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
