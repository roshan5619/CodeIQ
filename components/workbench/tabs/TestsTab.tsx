"use client";

import { useState } from "react";
import { useWorkbench, type EdgeCaseResult } from "@/lib/store";
import { scoreColor } from "@/components/ui/ScoreGauge";
import { postJson, ApiError } from "@/lib/streamFetch";
import type { EdgeCase } from "@/lib/types";
import {
  CheckCircle2,
  CircleDashed,
  FlaskConical,
  Loader2,
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
  const { code, language, insight, applyEdgeCaseResults, log } = useWorkbench();
  const [running, setRunning] = useState(false);
  if (!insight) return null;

  const { hiddenTests, edgeCases } = insight;

  const runAll = async () => {
    if (running || edgeCases.length === 0) return;
    setRunning(true);
    log("info", `Running ${edgeCases.length} edge case(s)…`);
    try {
      const res = await postJson<{ mode: string; results: EdgeCaseResult[] }>(
        "/api/edge-run",
        {
          code,
          language,
          cases: edgeCases.map(({ label, input, expected }) => ({
            label,
            input,
            expected,
          })),
        },
      );
      applyEdgeCaseResults(res.results);
      const passed = res.results.filter((r) => r.status.includes("pass")).length;
      const verb = res.mode === "executed" ? "Executed" : "Predicted (AI)";
      log(
        passed === res.results.length ? "success" : "warn",
        `${verb}: ${passed}/${res.results.length} passing.`,
      );
      for (const r of res.results) {
        if (r.status.includes("fail") && r.note) {
          log("warn", `  ✗ ${r.label}: ${r.note}`);
        }
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === "missing_api_key") {
        log(
          "warn",
          "Outcome prediction for this language needs ANTHROPIC_API_KEY (JS/TS run for real without it).",
        );
      } else {
        log("error", err instanceof Error ? err.message : "Test run failed.");
      }
    } finally {
      setRunning(false);
    }
  };

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
            onClick={runAll}
            disabled={running}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {running ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            {running ? "Running…" : "Run all"}
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
