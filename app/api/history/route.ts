import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { InsightPayload } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    snippetId?: string;
    code?: string;
    language?: string;
    mode?: string;
    insight?: InsightPayload;
  } | null;

  if (!body?.code || !body.language || !body.insight) {
    return NextResponse.json(
      { code: "bad_request", message: "code, language and insight are required." },
      { status: 400 },
    );
  }

  const { snippetId, code, language, mode = "standard", insight } = body;
  const title =
    insight.functions[0]?.name ??
    code
      .split("\n")
      .find((l) => l.trim())
      ?.slice(0, 40) ??
    "Untitled";

  try {
    let snippet =
      snippetId != null
        ? await prisma.snippet.findUnique({ where: { id: snippetId } })
        : null;

    if (snippet) {
      snippet = await prisma.snippet.update({
        where: { id: snippet.id },
        data: { code, language, mode, title },
      });
    } else {
      snippet = await prisma.snippet.create({
        data: { title, language, code, mode },
      });
    }

    const run = await prisma.analysisRun.create({
      data: {
        snippetId: snippet.id,
        mode,
        language,
        overall: insight.overall,
        bugCount: insight.bugs.length,
        scores: JSON.stringify(insight.scores),
        findings: JSON.stringify(insight),
      },
    });

    return NextResponse.json({ snippetId: snippet.id, runId: run.id });
  } catch (err) {
    return NextResponse.json(
      {
        code: "db_error",
        message: err instanceof Error ? err.message : "Failed to save analysis run.",
      },
      { status: 500 },
    );
  }
}
