import { NextRequest, NextResponse } from "next/server";
import { getGithubToken, ghFetch, GithubError } from "@/lib/github";

interface Pr {
  number: number;
  title: string;
  state: string;
  draft: boolean;
  user: { login: string };
  head: { ref: string };
  base: { ref: string };
  changed_files?: number;
  additions?: number;
  deletions?: number;
  updated_at: string;
}

export async function GET(req: NextRequest) {
  const repo = req.nextUrl.searchParams.get("repo");
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    return NextResponse.json(
      { code: "bad_request", message: "repo=owner/name is required." },
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
    const prs = await ghFetch<Pr[]>(
      `/repos/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=25`,
      token,
    );
    return NextResponse.json(
      prs.map((p) => ({
        number: p.number,
        title: p.title,
        state: p.draft ? "draft" : p.state,
        author: p.user.login,
        headRef: p.head.ref,
        baseRef: p.base.ref,
        updatedAt: p.updated_at,
      })),
    );
  } catch (err) {
    const status = err instanceof GithubError ? err.status : 500;
    return NextResponse.json(
      { code: "github_error", message: err instanceof Error ? err.message : "GitHub error" },
      { status },
    );
  }
}
