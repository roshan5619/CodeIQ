"use client";

import { useWorkbench } from "@/lib/store";
import { scoreColor } from "@/components/ui/ScoreGauge";
import type { EdgeCase } from "@/lib/types";
import {
  CheckCircle2,
  CircleDashed,
  FlaskConical,
  Play,
  XCircle,
} from "lucide-react";

function StatusIcon({ status }: { status: EdgeCase["status"] }) {
  switch (status) {
    case "pass":
    case "predicted-pass":
      return <CheckCircle2 size={15} className="text-accent" />;
    case "fail":
    case "predicted-fail":
      return <XCircle size={15} className="text-danger" />;
    default:
      return <CircleDashed size={15} className="text-faint" />;
  }
}

export default function TestsTab() {
  const insight = useWorkbench((s) => s.insight);
  const log = useWorkbench((s) => s.log);
  if (!insight) return null;

  const { hiddenTests, edgeCases } = insight;

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* prediction card */}
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
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-3xl font-bold"
            style={{ color: scoreColor(hiddenTests.passProbability) }}
          >
            {hiddenTests.passProbability}%
          </span>
          <span className="text-xs text-mute">chance of passing hidden tests</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-mute">{hiddenTests.reasoning}</p>
        {hiddenTests.likelyFailures.length > 0 && (
          <div className="mt-3">
            <div className="mb-1.5 text-[10px] uppercase tracking-wider text-mute">
              Likely failing cases
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hiddenTests.likelyFailures.map((f) => (
                <span key={f} className="rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] text-warn">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* edge cases */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-mute">
            Generated edge cases · {edgeCases.length}
          </h3>
          <button
            onClick={() =>
              log("info", "Test execution arrives with the deep-tools phase.")
            }
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.03]"
          >
            <Play size={12} />
            Run all
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {edgeCases.map((ec, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-stroke bg-surface/50 px-3 py-2"
            >
              <StatusIcon status={ec.status} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium">{ec.label}</div>
                <div className="truncate font-mono text-[10.5px] text-mute">
                  {ec.input} → {ec.expected}
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-raised px-2 py-0.5 text-[10px] capitalize text-mute">
                {ec.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
