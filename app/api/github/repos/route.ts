import { NextResponse } from "next/server";
import { getGithubToken, ghFetch, GithubError } from "@/lib/github";

interface Repo {
  full_name: string;
  private: boolean;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  updated_at: string;
}

export async function GET() {
  const token = await getGithubToken();
  if (!token) {
    return NextResponse.json(
      { code: "not_connected", message: "Connect a GitHub token in Settings first." },
      { status: 401 },
    );
  }

  try {
    const repos = await ghFetch<Repo[]>(
      "/user/repos?sort=updated&per_page=50",
      token,
    );
    return NextResponse.json(
      repos.map((r) => ({
        fullName: r.full_name,
        private: r.private,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        openIssues: r.open_issues_count,
        updatedAt: r.updated_at,
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
