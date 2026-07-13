import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAi } from "@/lib/ai/deep";
import { getAnthropic, DEEP_MODEL, toApiError } from "@/lib/ai/client";

export const maxDuration = 120;

const REPORT_SYSTEM = `You are CodeIQ's weekly engineering-quality reporter. Given aggregate statistics from a developer's analysis runs this week, write a short markdown report:

## This week in your code
2-3 sentences: the headline — trajectory, standout win, biggest risk.

## What improved / What slipped
Bullet the notable movements in the score dimensions, with the numbers.

## Focus for next week
2-3 concrete, prioritized suggestions grounded in the recurring findings.

Rules: honest and specific, never padded. If the week has very few runs, say so and keep it brief. No preamble; start with the first heading.`;

function weekStart(d = new Date()): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET() {
  const report = await prisma.report.findFirst({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(report ?? null);
}

export async function POST() {
  const gate = requireAi();
  if (gate) return gate;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const runs = await prisma.analysisRun.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    include: { snippet: { select: { title: true } } },
  });

  if (runs.length === 0) {
    return NextResponse.json(
      { code: "no_data", message: "No analysis runs in the last 7 days yet." },
      { status: 422 },
    );
  }

  const parsedScores = runs.map((r) => JSON.parse(r.scores) as Record<string, number>);
  const avg = (key: string) =>
    Math.round(parsedScores.reduce((s, sc) => s + (sc[key] ?? 0), 0) / runs.length);
  const stats = {
    runs: runs.length,
    languages: [...new Set(runs.map((r) => r.language))],
    avgOverall: Math.round(runs.reduce((s, r) => s + r.overall, 0) / runs.length),
    firstOverall: runs[0].overall,
    lastOverall: runs[runs.length - 1].overall,
    totalBugs: runs.reduce((s, r) => s + r.bugCount, 0),
    avgScores: {
      performance: avg("performance"),
      quality: avg("quality"),
      maintainability: avg("maintainability"),
      readability: avg("readability"),
      security: avg("security"),
      documentation: avg("documentation"),
      testability: avg("testability"),
      robustness: avg("robustness"),
    },
    snippets: [...new Set(runs.map((r) => r.snippet.title))].slice(0, 12),
  };

  try {
    const client = getAnthropic();
    const response = await client.messages.create({
      model: DEEP_MODEL,
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: [{ type: "text", text: REPORT_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [
        { role: "user", content: `Week's statistics:\n${JSON.stringify(stats, null, 2)}` },
      ],
    });

    const summary = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const ws = weekStart();
    const existing = await prisma.report.findFirst({ where: { weekStart: ws } });
    const report = existing
      ? await prisma.report.update({
          where: { id: existing.id },
          data: { summary, stats: JSON.stringify(stats) },
        })
      : await prisma.report.create({
          data: { weekStart: ws, summary, stats: JSON.stringify(stats) },
        });

    return NextResponse.json(report);
  } catch (err) {
    const mapped = toApiError(err);
    return NextResponse.json(
      { code: mapped.code, message: mapped.message },
      { status: mapped.status },
    );
  }
}
