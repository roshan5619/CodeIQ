"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { postJson, ApiError } from "@/lib/streamFetch";
import { SeverityBadge } from "@/components/ui/Badges";
import { scoreColor } from "@/components/ui/ScoreGauge";
import type { Severity } from "@/lib/types";
import {
  ArrowLeft,
  Check,
  Download,
  GitBranch,
  GitPullRequest,
  Loader2,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Star,
  ThumbsUp,
  XCircle,
} from "lucide-react";

interface Repo {
  fullName: string;
  private: boolean;
  description: string | null;
  language: string | null;
  stars: number;
  updatedAt: string;
}

interface Pr {
  number: number;
  title: string;
  state: string;
  author: string;
  headRef: string;
  baseRef: string;
  updatedAt: string;
}

interface Review {
  summary: string;
  verdict: "approve" | "request-changes" | "comment";
  score: number;
  praise: string[];
  comments: Array<{
    file: string;
    line: number;
    issue: string;
    suggestion: string;
    impact: Severity;
  }>;
  pr: {
    repo: string;
    number: number;
    title: string;
    author: string;
    changedFiles: number;
    additions: number;
    deletions: number;
    truncated: boolean;
  };
}

const VERDICT_STYLE = {
  approve: { label: "Approve", cls: "bg-accent-soft text-accent", icon: ThumbsUp },
  "request-changes": { label: "Request changes", cls: "bg-danger-soft text-danger", icon: XCircle },
  comment: { label: "Comment", cls: "bg-info-soft text-info", icon: MessageSquare },
} as const;

function reviewToMarkdown(r: Review): string {
  const lines = [
    `# AI Review — ${r.pr.repo}#${r.pr.number}: ${r.pr.title}`,
    ``,
    `**Verdict:** ${VERDICT_STYLE[r.verdict].label} · **Score:** ${r.score}/100 · ${r.pr.changedFiles} file(s), +${r.pr.additions} −${r.pr.deletions}`,
    ``,
    r.summary,
    ``,
  ];
  if (r.praise.length) {
    lines.push(`## Done well`, ...r.praise.map((p) => `- ${p}`), ``);
  }
  if (r.comments.length) {
    lines.push(`## Line comments`);
    for (const c of r.comments) {
      lines.push(
        ``,
        `### \`${c.file}:${c.line}\` — ${c.impact.toUpperCase()}`,
        ``,
        c.issue,
        ``,
        `**Suggestion:** ${c.suggestion}`,
      );
    }
  }
  return lines.join("\n");
}

export default function GitHubExplorer() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [filter, setFilter] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [prs, setPrs] = useState<Pr[] | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const s = res.ok ? await res.json() : { githubConnected: false };
      setConnected(Boolean(s.githubConnected));
      if (s.githubConnected) {
        const rr = await fetch("/api/github/repos", { cache: "no-store" });
        if (rr.ok) setRepos((await rr.json()) as Repo[]);
        else setError(((await rr.json()) as { message?: string }).message ?? "Failed to load repos.");
      }
    })();
  }, []);

  const filteredRepos = useMemo(
    () =>
      (repos ?? []).filter((r) =>
        r.fullName.toLowerCase().includes(filter.toLowerCase()),
      ),
    [repos, filter],
  );

  const openRepo = async (fullName: string) => {
    setSelectedRepo(fullName);
    setPrs(null);
    setReview(null);
    setError(null);
    const res = await fetch(`/api/github/prs?repo=${encodeURIComponent(fullName)}`, {
      cache: "no-store",
    });
    if (res.ok) setPrs((await res.json()) as Pr[]);
    else setError(((await res.json()) as { message?: string }).message ?? "Failed to load PRs.");
  };

  const runReview = async (number: number) => {
    setReviewing(number);
    setError(null);
    try {
      const r = await postJson<Review>("/api/github/review", {
        repo: selectedRepo,
        number,
      });
      setReview(r);
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === "missing_api_key"
          ? "AI review needs ANTHROPIC_API_KEY in .env.local."
          : err instanceof Error
            ? err.message
            : "Review failed.",
      );
    } finally {
      setReviewing(null);
    }
  };

  const exportMd = () => {
    if (!review) return;
    const blob = new Blob([reviewToMarkdown(review)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `review-${review.pr.repo.replace("/", "-")}-${review.pr.number}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyMd = async () => {
    if (!review) return;
    await navigator.clipboard.writeText(reviewToMarkdown(review));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ------- render states -------

  if (connected === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={20} className="animate-spin text-mute" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="glass max-w-md rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-soft text-violet">
            <GitBranch size={24} />
          </div>
          <h2 className="font-display mb-2 text-lg font-semibold">Connect GitHub</h2>
          <p className="mb-5 text-sm leading-relaxed text-mute">
            Add a fine-grained personal access token in Settings to browse your
            repositories and get AI reviews on any pull request.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.03]"
          >
            <Settings size={15} />
            Open Settings
          </Link>
        </div>
      </div>
    );
  }

  // review display
  if (review) {
    const V = VERDICT_STYLE[review.verdict];
    const byFile = review.comments.reduce<Record<string, Review["comments"]>>(
      (acc, c) => {
        (acc[c.file] ??= []).push(c);
        return acc;
      },
      {},
    );
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setReview(null)}
            className="flex items-center gap-1.5 text-xs text-mute transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} />
            {review.pr.repo} · pull requests
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={copyMd}
              className="flex items-center gap-1.5 rounded-lg border border-stroke px-3 py-1.5 text-xs font-semibold text-mute transition-colors hover:text-ink"
            >
              {copied ? <Check size={13} className="text-accent" /> : <MessageSquare size={13} />}
              Copy markdown
            </button>
            <button
              onClick={exportMd}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.03]"
            >
              <Download size={13} />
              Export .md
            </button>
          </div>
        </div>

        {/* header card */}
        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold">
                #{review.pr.number} · {review.pr.title}
              </h2>
              <p className="mt-0.5 text-xs text-mute">
                by @{review.pr.author} · {review.pr.changedFiles} file(s) ·{" "}
                <span className="text-accent">+{review.pr.additions}</span>{" "}
                <span className="text-danger">−{review.pr.deletions}</span>
                {review.pr.truncated && " · diff truncated for review"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span
                className="font-mono text-2xl font-bold"
                style={{ color: scoreColor(review.score) }}
              >
                {review.score}
              </span>
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${V.cls}`}
              >
                <V.icon size={12} />
                {V.label}
              </span>
            </div>
          </div>
          <div className="prose-codeiq">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{review.summary}</ReactMarkdown>
          </div>
          {review.praise.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              {review.praise.map((p, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-xl bg-accent-soft px-3 py-2 text-xs leading-relaxed text-ink/90"
                >
                  <ThumbsUp size={12} className="mt-0.5 shrink-0 text-accent" />
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* line comments grouped by file */}
        {Object.entries(byFile).map(([file, comments]) => (
          <div key={file} className="glass overflow-hidden rounded-2xl">
            <div className="border-b border-stroke bg-surface/60 px-4 py-2.5 font-mono text-xs text-ink">
              {file}
            </div>
            <div className="flex flex-col divide-y divide-stroke/50">
              {comments.map((c, i) => (
                <div key={i} className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-mute">Line {c.line}</span>
                    <SeverityBadge severity={c.impact} />
                  </div>
                  <p className="mb-2 text-[13px] leading-relaxed">{c.issue}</p>
                  <div className="prose-codeiq rounded-xl bg-accent-soft px-3 py-2 text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {c.suggestion}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {review.comments.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-mute">
            No line-level issues worth raising — clean change set.
          </div>
        )}
      </div>
    );
  }

  // PR list
  if (selectedRepo) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-3 p-5">
        <button
          onClick={() => {
            setSelectedRepo(null);
            setPrs(null);
            setError(null);
          }}
          className="flex w-fit items-center gap-1.5 text-xs text-mute transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} />
          All repositories
        </button>
        <h2 className="font-display text-base font-semibold">{selectedRepo}</h2>
        {error && (
          <p className="rounded-xl bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p>
        )}
        {!prs ? (
          <div className="flex justify-center p-10">
            <Loader2 size={18} className="animate-spin text-mute" />
          </div>
        ) : prs.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-sm text-mute">
            No pull requests in this repository.
          </div>
        ) : (
          prs.map((pr) => (
            <div
              key={pr.number}
              className="glass flex items-center gap-3 rounded-2xl p-4"
            >
              <GitPullRequest
                size={16}
                className={
                  pr.state === "open"
                    ? "shrink-0 text-accent"
                    : pr.state === "draft"
                      ? "shrink-0 text-faint"
                      : "shrink-0 text-violet"
                }
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">
                  #{pr.number} · {pr.title}
                </div>
                <div className="text-[11px] text-mute">
                  @{pr.author} · {pr.headRef} → {pr.baseRef} · {pr.state}
                </div>
              </div>
              <button
                onClick={() => runReview(pr.number)}
                disabled={reviewing !== null}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.03] disabled:opacity-40"
              >
                {reviewing === pr.number ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                {reviewing === pr.number ? "Reviewing…" : "AI review"}
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  // repo list
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-3 p-5">
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter repositories…"
          className="w-full rounded-xl border border-stroke bg-raised py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
        />
      </div>
      {error && (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p>
      )}
      {!repos ? (
        <div className="flex justify-center p-10">
          <Loader2 size={18} className="animate-spin text-mute" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredRepos.map((repo) => (
            <button
              key={repo.fullName}
              onClick={() => openRepo(repo.fullName)}
              className="glass group rounded-2xl p-4 text-left transition-colors hover:border-stroke-strong"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[13px] font-semibold group-hover:text-accent">
                  {repo.fullName}
                </span>
                {repo.private && (
                  <span className="shrink-0 rounded-full bg-raised px-2 py-0.5 text-[10px] text-mute">
                    private
                  </span>
                )}
              </div>
              <p className="mb-2 line-clamp-2 min-h-8 text-xs leading-relaxed text-mute">
                {repo.description ?? "No description"}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-faint">
                {repo.language && <span>{repo.language}</span>}
                <span className="flex items-center gap-1">
                  <Star size={11} />
                  {repo.stars}
                </span>
                <span className="ml-auto">
                  {new Date(repo.updatedAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
