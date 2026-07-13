"use client";

import { useState } from "react";
import { useWorkbench } from "@/lib/store";
import { ConfidenceBadge, SeverityBadge } from "@/components/ui/Badges";
import { postJson, ApiError } from "@/lib/streamFetch";
import { Bug, CheckCircle2, Loader2, Wand2, Wrench } from "lucide-react";

interface FixResponse {
  fixedCode: string;
  explanation: string;
  falsePositive: boolean;
}

export default function BugsTab() {
  const { code, language, insight, setFocusRange, openDiff, updateDiff, log } =
    useWorkbench();
  const [fixing, setFixing] = useState<number | null>(null);
  if (!insight) return null;

  const fix = async (i: number) => {
    const bug = insight.bugs[i];
    setFixing(i);
    log("info", `Generating fix for "${bug.title}"…`);
    try {
      const res = await postJson<FixResponse>("/api/fix", {
        code,
        language,
        finding: bug,
      });
      if (res.falsePositive) {
        log("warn", `Re-examined "${bug.title}": likely a false positive — ${res.explanation}`);
        return;
      }
      openDiff({
        title: `Fix — ${bug.title}`,
        original: code,
        modified: res.fixedCode,
        explanation: res.explanation,
        streaming: false,
      });
      updateDiff({});
    } catch (err) {
      if (err instanceof ApiError && err.code === "missing_api_key") {
        log("warn", "One-click fixes need ANTHROPIC_API_KEY — add it to .env.local.");
      } else {
        log("error", err instanceof Error ? err.message : "Fix generation failed.");
      }
    } finally {
      setFixing(null);
    }
  };

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
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-accent-soft p-3">
            <Wrench size={13} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-xs leading-relaxed text-ink/90">{bug.suggestedFix}</p>
          </div>
          <button
            onClick={() => fix(i)}
            disabled={fixing !== null}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {fixing === i ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Wand2 size={12} />
            )}
            {fixing === i ? "Generating fix…" : "Fix with AI"}
          </button>
        </div>
      ))}
    </div>
  );
}
