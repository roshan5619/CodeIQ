"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { scoreColor } from "@/components/ui/ScoreGauge";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

// Validated categorical palette for the dark surface (#0c1018):
// lightness band, chroma, CVD separation and contrast all pass.
const SERIES = {
  teal: "#0d9488",
  sky: "#0284c7",
  violet: "#8b5cf6",
} as const;

export interface RunPoint {
  id: string;
  t: string;
  overall: number;
  bugCount: number;
  performance: number;
  security: number;
  readability: number;
  prediction: number;
  language: string;
  mode: string;
  snippetId: string;
  title: string;
}

const GRID = "rgba(148,163,184,0.08)";
const TICK = { fill: "#93a0b4", fontSize: 10.5 };

function shortTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
}

function GlassTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs">
      {label !== undefined && <div className="mb-1 text-[10px] text-mute">{label}</div>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: entry.color ?? "var(--color-accent)" }}
          />
          <span className="text-mute">{entry.name}:</span>
          <span className="font-mono font-semibold text-ink">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatTile({
  label,
  value,
  delta,
  color,
}: {
  label: string;
  value: string;
  delta?: number;
  color?: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-mute">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold" style={{ color }}>
          {value}
        </span>
        {delta !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-medium ${
              delta > 0 ? "text-accent" : delta < 0 ? "text-danger" : "text-mute"
            }`}
          >
            {delta > 0 ? (
              <ArrowUpRight size={12} />
            ) : delta < 0 ? (
              <ArrowDownRight size={12} />
            ) : (
              <Minus size={12} />
            )}
            {delta > 0 ? "+" : ""}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  legend,
  children,
}: {
  title: string;
  legend?: Array<{ label: string; color: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-mute">
          {title}
        </h3>
        {legend && (
          <div className="flex items-center gap-3">
            {legend.map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-[10.5px] text-mute">
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="h-52">{children}</div>
    </div>
  );
}

export default function DashboardCharts({ points }: { points: RunPoint[] }) {
  const data = points.map((p) => ({ ...p, label: shortTime(p.t) }));
  const latest = points[points.length - 1];
  const prev = points[points.length - 2];
  const totalBugs = points.reduce((s, p) => s + p.bugCount, 0);
  const avgSecurity = Math.round(
    points.reduce((s, p) => s + p.security, 0) / points.length,
  );
  const avgPrediction = Math.round(
    points.reduce((s, p) => s + p.prediction, 0) / points.length,
  );

  const langCounts = Object.entries(
    points.reduce<Record<string, number>>((acc, p) => {
      acc[p.language] = (acc[p.language] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const maxLang = langCounts[0]?.[1] ?? 1;

  const recent = [...points].reverse().slice(0, 8);

  return (
    <>
      {/* stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Latest overall"
          value={String(latest.overall)}
          delta={prev ? latest.overall - prev.overall : undefined}
          color={scoreColor(latest.overall)}
        />
        <StatTile label="Analysis runs" value={String(points.length)} />
        <StatTile
          label="Bugs surfaced"
          value={String(totalBugs)}
          color="var(--color-warn)"
        />
        <StatTile
          label="Avg security"
          value={String(avgSecurity)}
          color={scoreColor(avgSecurity)}
        />
      </div>

      {/* overall trend */}
      <ChartCard title="Overall score trend">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
            <defs>
              <linearGradient id="overallFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.teal} stopOpacity={0.35} />
                <stop offset="100%" stopColor={SERIES.teal} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={false} minTickGap={28} />
            <YAxis domain={[0, 100]} tick={TICK} tickLine={false} axisLine={false} width={50} />
            <Tooltip content={<GlassTooltip />} cursor={{ stroke: GRID }} />
            <Area
              type="monotone"
              dataKey="overall"
              name="Overall"
              stroke={SERIES.teal}
              strokeWidth={2}
              fill="url(#overallFill)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* dimensions */}
        <ChartCard
          title="Quality dimensions"
          legend={[
            { label: "Performance", color: SERIES.teal },
            { label: "Security", color: SERIES.sky },
            { label: "Readability", color: SERIES.violet },
          ]}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis domain={[0, 100]} tick={TICK} tickLine={false} axisLine={false} width={50} />
              <Tooltip content={<GlassTooltip />} cursor={{ stroke: GRID }} />
              <Line type="monotone" dataKey="performance" name="Performance" stroke={SERIES.teal} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="security" name="Security" stroke={SERIES.sky} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="readability" name="Readability" stroke={SERIES.violet} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* bug density */}
        <ChartCard title="Bugs per analysis">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis allowDecimals={false} tick={TICK} tickLine={false} axisLine={false} width={50} />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
              <Bar
                dataKey="bugCount"
                name="Bugs"
                fill={SERIES.sky}
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* hidden test prediction */}
        <ChartCard title={`Hidden-test prediction (avg ${avgPrediction}%)`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis domain={[0, 100]} tick={TICK} tickLine={false} axisLine={false} width={50} />
              <Tooltip content={<GlassTooltip />} cursor={{ stroke: GRID }} />
              <Line
                type="monotone"
                dataKey="prediction"
                name="Pass probability"
                stroke={SERIES.violet}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* languages */}
        <div className="glass rounded-2xl p-4">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-mute">
            Runs by language
          </h3>
          <div className="flex flex-col gap-2.5">
            {langCounts.map(([lang, count]) => (
              <div key={lang} className="flex items-center gap-3">
                <span className="w-20 shrink-0 font-mono text-[11px] text-mute">{lang}</span>
                <div className="h-4 flex-1 overflow-hidden rounded-md bg-raised">
                  <div
                    className="h-full rounded-md"
                    style={{
                      width: `${(count / maxLang) * 100}%`,
                      background: SERIES.teal,
                    }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-[11px] text-ink">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* recent runs */}
      <div className="glass overflow-hidden rounded-2xl">
        <h3 className="border-b border-stroke px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-mute">
          Recent analyses
        </h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-stroke text-[10px] uppercase tracking-wider text-faint">
              <th className="px-4 py-2 font-medium">When</th>
              <th className="px-4 py-2 font-medium">Snippet</th>
              <th className="px-4 py-2 font-medium">Language</th>
              <th className="px-4 py-2 font-medium">Mode</th>
              <th className="px-4 py-2 text-right font-medium">Overall</th>
              <th className="px-4 py-2 text-right font-medium">Bugs</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id} className="border-b border-stroke/50 last:border-0">
                <td className="px-4 py-2.5 text-mute">
                  {new Date(r.t).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="max-w-40 truncate px-4 py-2.5 font-mono">{r.title}</td>
                <td className="px-4 py-2.5 text-mute">{r.language}</td>
                <td className="px-4 py-2.5 capitalize text-mute">{r.mode}</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold" style={{ color: scoreColor(r.overall) }}>
                  {r.overall}
                </td>
                <td className="px-4 py-2.5 text-right font-mono">{r.bugCount}</td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/workbench?snippet=${r.snippetId}`}
                    className="text-accent underline-offset-2 hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
