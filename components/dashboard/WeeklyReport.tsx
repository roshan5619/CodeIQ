"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { postJson, ApiError } from "@/lib/streamFetch";
import { FileBarChart, Loader2, Sparkles } from "lucide-react";

interface Report {
  summary: string;
  createdAt: string;
}

export default function WeeklyReport({ initial }: { initial: Report | null }) {
  const [report, setReport] = useState<Report | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await postJson<Report>("/api/report", {});
      setReport(r);
    } catch (err) {
      if (err instanceof ApiError && err.code === "missing_api_key") {
        setError("Weekly reports need ANTHROPIC_API_KEY in .env.local.");
      } else if (err instanceof ApiError && err.code === "no_data") {
        setError("No analysis runs in the last 7 days yet — write some code first.");
      } else {
        setError(err instanceof Error ? err.message : "Report generation failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-mute">
          <FileBarChart size={13} className="text-info" />
          Weekly quality report
          {report && (
            <span className="ml-2 font-normal normal-case text-faint">
              generated{" "}
              {new Date(report.createdAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </h3>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.03] disabled:opacity-40"
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} />
          )}
          {loading ? "Writing…" : report ? "Regenerate" : "Generate report"}
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-xl bg-warn-soft px-3 py-2 text-xs text-warn">{error}</p>
      )}

      {report ? (
        <div className="prose-codeiq">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.summary}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-xs leading-relaxed text-mute">
          A senior-engineer summary of your week: trajectory, wins, risks, and
          what to focus on next — generated from your analysis history.
        </p>
      )}
    </div>
  );
}
