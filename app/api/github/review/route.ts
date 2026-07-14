import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGithubToken, ghFetch, GithubError } from "@/lib/github";
import { parseDeep, requireAi } from "@/lib/ai/deep";
import { PR_REVIEW_SYSTEM } from "@/lib/ai/prompts";

export const maxDuration = 300;

const MAX_DIFF_CHARS = 70_000;

const ReviewSchema = z.object({
  summary: z.string(),
  verdict: z.enum(["approve", "request-changes", "comment"]),
  score: z.number().int().describe("0-100"),
  praise: z.array(z.string()),
  comments: z.array(
    z.object({
      file: z.string(),
      line: z.number().int().describe("line number in the NEW file version"),
      issue: z.string(),
      suggestion: z.string(),
      impact: z.enum(["low", "medium", "high", "critical"]),
    }),
  ),
});

interface PrMeta {
  title: string;
  body: string | null;
  user: { login: string };
  changed_files: number;
  additions: number;
  deletions: number;
  head: { ref: string };
  base: { ref: string };
}

export async function POST(req: NextRequest) {
  const gate = requireAi();
  if (gate) return gate;

  const { repo, number } = (await req.json().catch(() => ({}))) as {
    repo?: string;
    number?: number;
  };
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo) || !number) {
    return NextResponse.json(
      { code: "bad_request", message: "repo (owner/name) and number are required." },
      { status: 400 },
    );
  }

  const token = await getGithubToken();
  if (!token) {
    return NextResponse.json(
      { code: "not_connected", message: "Connect a GitHub token in Settings first." },
      { status: 401 },
    );
  }

  try {
    const [meta, diff] = await Promise.all([
      ghFetch<PrMeta>(`/repos/${repo}/pulls/${number}`, token),
      ghFetch<string>(
        `/repos/${repo}/pulls/${number}`,
        token,
        "application/vnd.github.diff",
      ),
    ]);

    const truncated = diff.length > MAX_DIFF_CHARS;
    const diffText = truncated ? diff.slice(0, MAX_DIFF_CHARS) : diff;

    const response = await parseDeep({
      system: PR_REVIEW_SYSTEM,
      user: `Repository: ${repo}
PR #${number}: ${meta.title}
Author: ${meta.user.login}
Branches: ${meta.head.ref} → ${meta.base.ref}
Stats: ${meta.changed_files} file(s), +${meta.additions} −${meta.deletions}
${meta.body ? `\nDescription:\n${meta.body.slice(0, 2000)}\n` : ""}
Unified diff${truncated ? " (TRUNCATED — review what is visible and note it)" : ""}:
${diffText}`,
      schema: ReviewSchema,
      effort: "high",
      maxTokens: 16_000,
    });

    // parseDeep returns a NextResponse; merge PR meta in for the client.
    if (response.ok) {
      const review = await response.json();
      return NextResponse.json({
        ...review,
        pr: {
          repo,
          number,
          title: meta.title,
          author: meta.user.login,
          changedFiles: meta.changed_files,
          additions: meta.additions,
          deletions: meta.deletions,
          truncated,
        },
      });
    }
    return response;
  } catch (err) {
    const status = err instanceof GithubError ? err.status : 500;
    return NextResponse.json(
      { code: "github_error", message: err instanceof Error ? err.message : "Review failed" },
      { status },
    );
  }
}
