"use client";

import { useState } from "react";
import { useWorkbench } from "@/lib/store";
import { postJson, ApiError } from "@/lib/streamFetch";
import { ComplexityChip } from "@/components/ui/Badges";
import { scoreColor } from "@/components/ui/ScoreGauge";
import {
  Building2,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Lock,
  Timer,
  XCircle,
} from "lucide-react";

interface InterviewEval {
  problemTitle: string;
  expectedComplexity: string;
  currentComplexity: string;
  meetsBar: boolean;
  verdict: string;
  difficulty: "easy" | "medium" | "hard";
  interviewRating: number;
  hints: string[];
  alternatives: Array<{ name: string; complexity: string; tradeoff: string }>;
  companies: string[];
}

const DIFFICULTY_TONES = {
  easy: "bg-accent-soft text-accent",
  medium: "bg-warn-soft text-warn",
  hard: "bg-danger-soft text-danger",
} as const;

export default function InterviewPanel() {
  const { code, language, log } = useWorkbench();
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState<InterviewEval | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(0);

  const evaluate = async () => {
    setLoading(true);
    setRevealed(0);
    try {
      const r = await postJson<InterviewEval>("/api/interview", {
        code,
        language,
        problem: problem.trim() || undefined,
      });
      setResult(r);
      log("success", `Interview evaluation: ${r.interviewRating}/10 on "${r.problemTitle}".`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "missing_api_key") {
        log("warn", "Interview mode needs ANTHROPIC_API_KEY.");
      } else {
        log("error", err instanceof Error ? err.message : "Evaluation failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="glass rounded-2xl p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-mute">
          <Timer size={13} className="text-info" />
          Interview mode
        </h3>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Paste the problem statement (optional — I'll infer it from your code otherwise)…"
          rows={3}
          className="mb-3 w-full resize-y rounded-xl border border-stroke bg-raised p-3 text-xs text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
        />
        <button
          onClick={evaluate}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.03] disabled:opacity-40"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Timer size={12} />}
          {loading ? "Evaluating…" : "Evaluate as interview answer"}
        </button>
      </div>

      {result && (
        <>
          {/* verdict card */}
          <div className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <div className="text-[13px] font-semibold">{result.problemTitle}</div>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase ${DIFFICULTY_TONES[result.difficulty]}`}
                >
                  {result.difficulty}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span
                  className="font-mono text-2xl font-bold"
                  style={{ color: scoreColor(result.interviewRating * 10) }}
                >
                  {result.interviewRating}/10
                </span>
                <span className="text-[9px] uppercase tracking-wider text-mute">
                  interview rating
                </span>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-center gap-3 rounded-xl bg-raised/70 py-3">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] uppercase tracking-wider text-mute">Yours</span>
                <ComplexityChip
                  value={result.currentComplexity}
                  tone={result.meetsBar ? "good" : "bad"}
                />
              </div>
              {result.meetsBar ? (
                <CheckCircle2 size={18} className="text-accent" />
              ) : (
                <XCircle size={18} className="text-warn" />
              )}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] uppercase tracking-wider text-mute">Expected</span>
                <ComplexityChip value={result.expectedComplexity} tone="good" />
              </div>
            </div>

            <p className="text-[13px] leading-relaxed text-mute">{result.verdict}</p>

            {result.companies.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Building2 size={12} className="text-faint" />
                {result.companies.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-stroke bg-surface/60 px-2.5 py-0.5 text-[10.5px] text-mute"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* progressive hints */}
          <div className="glass rounded-2xl p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-mute">
              <Lightbulb size={13} className="text-warn" />
              Hints — reveal only what you need
            </h3>
            <div className="flex flex-col gap-2">
              {result.hints.map((hint, i) =>
                i < revealed ? (
                  <div
                    key={i}
                    className="rounded-xl bg-warn-soft px-3 py-2.5 text-xs leading-relaxed text-ink/90"
                  >
                    <span className="mr-1.5 font-semibold text-warn">Hint {i + 1}:</span>
                    {hint}
                  </div>
                ) : (
                  <button
                    key={i}
                    onClick={() => setRevealed(i + 1)}
                    disabled={i > revealed}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-stroke py-2.5 text-xs text-mute transition-colors hover:border-warn hover:text-warn disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Lock size={12} />
                    Reveal hint {i + 1}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* alternatives */}
          {result.alternatives.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-mute">
                Alternative approaches
              </h3>
              <div className="flex flex-col gap-2">
                {result.alternatives.map((alt) => (
                  <div
                    key={alt.name}
                    className="rounded-xl border border-stroke bg-surface/50 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">{alt.name}</span>
                      <ComplexityChip value={alt.complexity} tone="neutral" />
                    </div>
                    <p className="text-xs leading-relaxed text-mute">{alt.tradeoff}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
