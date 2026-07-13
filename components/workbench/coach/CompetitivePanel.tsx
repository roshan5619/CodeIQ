"use client";

import { useState } from "react";
import { useWorkbench } from "@/lib/store";
import { postJson, ApiError } from "@/lib/streamFetch";
import { scoreColor } from "@/components/ui/ScoreGauge";
import {
  AlertTriangle,
  Cpu,
  Loader2,
  MemoryStick,
  Rocket,
  Swords,
  Timer,
} from "lucide-react";

interface CompetitiveEval {
  acceptancePrediction: number;
  verdict: string;
  tleRisk: "low" | "medium" | "high";
  memoryRisk: "low" | "medium" | "high";
  estimatedRuntime: string;
  estimatedMemory: string;
  optimizations: string[];
  platformNotes: string[];
}

const PLATFORMS = ["LeetCode", "Codeforces", "CodeChef", "HackerRank", "AtCoder"];

const RISK_TONES = {
  low: "bg-accent-soft text-accent",
  medium: "bg-warn-soft text-warn",
  high: "bg-danger-soft text-danger",
} as const;

export default function CompetitivePanel() {
  const { code, language, log } = useWorkbench();
  const [platform, setPlatform] = useState("LeetCode");
  const [constraints, setConstraints] = useState("");
  const [result, setResult] = useState<CompetitiveEval | null>(null);
  const [loading, setLoading] = useState(false);

  const judge = async () => {
    setLoading(true);
    try {
      const r = await postJson<CompetitiveEval>("/api/competitive", {
        code,
        language,
        platform,
        constraints: constraints.trim() || undefined,
      });
      setResult(r);
      log("success", `${platform} judgement: ${r.acceptancePrediction}% acceptance prediction.`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "missing_api_key") {
        log("warn", "Competitive mode needs ANTHROPIC_API_KEY.");
      } else {
        log("error", err instanceof Error ? err.message : "Judgement failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="glass rounded-2xl p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-mute">
          <Swords size={13} className="text-info" />
          Competitive mode
        </h3>

        <div className="mb-3 flex flex-wrap gap-1">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                platform === p
                  ? "bg-accent-soft text-accent"
                  : "border border-stroke text-mute hover:text-ink"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <textarea
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          placeholder={"Constraints (optional), e.g.\n1 ≤ n ≤ 10^5, values up to 10^9, time limit 1s"}
          rows={2}
          className="mb-3 w-full resize-y rounded-xl border border-stroke bg-raised p-3 font-mono text-xs text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
        />

        <button
          onClick={judge}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.03] disabled:opacity-40"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Swords size={12} />}
          {loading ? "Judging…" : "Judge submission"}
        </button>
      </div>

      {result && (
        <>
          <div className="glass rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-mute">
                Acceptance prediction · {platform}
              </h3>
            </div>
            <div className="mb-2 flex items-baseline gap-2">
              <span
                className="font-mono text-3xl font-bold"
                style={{ color: scoreColor(result.acceptancePrediction) }}
              >
                {result.acceptancePrediction}%
              </span>
              <span className="text-xs text-mute">chance of Accepted</span>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-raised">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${result.acceptancePrediction}%`,
                  background: scoreColor(result.acceptancePrediction),
                }}
              />
            </div>
            <p className="text-[13px] leading-relaxed text-mute">{result.verdict}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-mute">
                  <Timer size={11} />
                  Runtime
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${RISK_TONES[result.tleRisk]}`}
                >
                  TLE {result.tleRisk}
                </span>
              </div>
              <div className="font-mono text-xs text-ink">{result.estimatedRuntime}</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-mute">
                  <MemoryStick size={11} />
                  Memory
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${RISK_TONES[result.memoryRisk]}`}
                >
                  {result.memoryRisk}
                </span>
              </div>
              <div className="font-mono text-xs text-ink">{result.estimatedMemory}</div>
            </div>
          </div>

          {result.optimizations.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-mute">
                <Rocket size={12} className="text-accent" />
                Path to Accepted
              </h3>
              <ol className="flex flex-col gap-2">
                {result.optimizations.map((opt, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 rounded-xl bg-accent-soft px-3 py-2.5 text-xs leading-relaxed text-ink/90"
                  >
                    <span className="font-mono font-bold text-accent">{i + 1}.</span>
                    {opt}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {result.platformNotes.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-mute">
                <AlertTriangle size={12} className="text-warn" />
                {platform} gotchas
              </h3>
              <ul className="flex flex-col gap-2">
                {result.platformNotes.map((note, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-xl bg-warn-soft px-3 py-2.5 text-xs leading-relaxed text-ink/90"
                  >
                    <Cpu size={12} className="mt-0.5 shrink-0 text-warn" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
