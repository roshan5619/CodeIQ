import Link from "next/link";
import { BarChart3, Code2 } from "lucide-react";
import { prisma } from "@/lib/db";
import DashboardCharts, { type RunPoint } from "@/components/dashboard/DashboardCharts";
import WeeklyReport from "@/components/dashboard/WeeklyReport";
import type { InsightPayload } from "@/lib/types";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [runs, latestReport] = await Promise.all([
    prisma.analysisRun.findMany({
      orderBy: { createdAt: "asc" },
      take: 200,
      include: { snippet: { select: { id: true, title: true } } },
    }),
    prisma.report.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  if (runs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="glass max-w-md rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <BarChart3 size={24} />
          </div>
          <h2 className="font-display mb-2 text-lg font-semibold">No data yet</h2>
          <p className="mb-5 text-sm leading-relaxed text-mute">
            Write some code in the workbench — every analysis run lands here as
            quality trends, bug density and growth charts.
          </p>
          <Link
            href="/workbench"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.03]"
          >
            <Code2 size={15} />
            Open Workbench
          </Link>
        </div>
      </div>
    );
  }

  const points: RunPoint[] = runs.map((r) => {
    const scores = JSON.parse(r.scores) as Record<string, number>;
    let prediction = 0;
    try {
      prediction =
        (JSON.parse(r.findings) as InsightPayload).hiddenTests?.passProbability ?? 0;
    } catch {
      /* legacy rows */
    }
    return {
      id: r.id,
      t: r.createdAt.toISOString(),
      overall: r.overall,
      bugCount: r.bugCount,
      performance: scores.performance ?? 0,
      security: scores.security ?? 0,
      readability: scores.readability ?? 0,
      prediction,
      language: r.language,
      mode: r.mode,
      snippetId: r.snippet.id,
      title: r.snippet.title,
    };
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-5">
      <DashboardCharts points={points} />
      <WeeklyReport
        initial={
          latestReport
            ? {
                summary: latestReport.summary,
                createdAt: latestReport.createdAt.toISOString(),
              }
            : null
        }
      />
    </div>
  );
}
