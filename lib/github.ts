import { prisma } from "./db";
import { decrypt, encrypt } from "./crypto";

const TOKEN_KEY = "github_token";
const API = "https://api.github.com";

export async function getGithubToken(): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key: TOKEN_KEY } });
  if (!row) return null;
  try {
    return decrypt(row.value);
  } catch {
    return null; // CODEIQ_SECRET changed since the token was stored
  }
}

export async function setGithubToken(token: string | null): Promise<void> {
  if (!token) {
    await prisma.setting.deleteMany({ where: { key: TOKEN_KEY } });
    return;
  }
  const value = encrypt(token);
  await prisma.setting.upsert({
    where: { key: TOKEN_KEY },
    update: { value },
    create: { key: TOKEN_KEY, value },
  });
}

export class GithubError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function ghFetch<T>(
  path: string,
  token: string,
  accept = "application/vnd.github+json",
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new GithubError(401, "GitHub rejected the token — update it in Settings.");
    }
    if (res.status === 403 || res.status === 429) {
      throw new GithubError(res.status, "GitHub rate limit reached — try again shortly.");
    }
    if (res.status === 404) {
      throw new GithubError(404, "Not found — check the repository name and token scope.");
    }
    throw new GithubError(res.status, `GitHub API error (${res.status}).`);
  }

  if (accept.includes("diff")) {
    return (await res.text()) as unknown as T;
  }
  return (await res.json()) as T;
}
