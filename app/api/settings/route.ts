import { NextRequest, NextResponse } from "next/server";
import { aiConfigured } from "@/lib/ai/client";
import { getGithubToken, setGithubToken } from "@/lib/github";

export async function GET() {
  const token = await getGithubToken();
  return NextResponse.json({
    aiConfigured: aiConfigured(),
    githubConnected: Boolean(token),
    secretConfigured: Boolean(process.env.CODEIQ_SECRET),
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    githubToken?: string | null;
  } | null;

  if (body === null || !("githubToken" in body)) {
    return NextResponse.json(
      { code: "bad_request", message: "githubToken is required (null clears it)." },
      { status: 400 },
    );
  }

  const token = body.githubToken?.trim() || null;

  // Validate before storing so a typo'd token fails loudly here, not later.
  if (token) {
    const check = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });
    if (!check.ok) {
      return NextResponse.json(
        { code: "bad_token", message: "GitHub rejected this token — check it and try again." },
        { status: 400 },
      );
    }
    const user = (await check.json()) as { login: string };
    await setGithubToken(token);
    return NextResponse.json({ githubConnected: true, login: user.login });
  }

  await setGithubToken(null);
  return NextResponse.json({ githubConnected: false });
}
