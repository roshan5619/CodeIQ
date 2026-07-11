"use client";

import { useWorkbench } from "@/lib/store";
import type { TabId } from "@/lib/types";
import OverviewTab from "./tabs/OverviewTab";
import ComplexityTab from "./tabs/ComplexityTab";
import BugsTab from "./tabs/BugsTab";
import SecurityTab from "./tabs/SecurityTab";
import TestsTab from "./tabs/TestsTab";
import OptimizeTab from "./tabs/OptimizeTab";
import {
  Bug,
  FlaskConical,
  GaugeCircle,
  LayoutDashboard,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const TABS: Array<{
  id: TabId;
  label: string;
  icon: typeof Bug;
  count?: (counts: Counts) => number | null;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "complexity", label: "Complexity", icon: GaugeCircle },
  { id: "bugs", label: "Bugs", icon: Bug, count: (c) => c.bugs },
  { id: "security", label: "Security", icon: ShieldCheck, count: (c) => c.security },
  { id: "tests", label: "Tests", icon: FlaskConical },
  { id: "optimize", label: "Optimize", icon: Rocket, count: (c) => c.optimizations },
];

interface Counts {
  bugs: number;
  security: number;
  optimizations: number;
}

const TAB_CONTENT: Record<TabId, React.ComponentType> = {
  overview: OverviewTab,
  complexity: ComplexityTab,
  bugs: BugsTab,
  security: SecurityTab,
  tests: TestsTab,
  optimize: OptimizeTab,
};

export default function InsightsPanel() {
  const { insight, status, activeTab, setActiveTab } = useWorkbench();

  const counts: Counts = {
    bugs: insight?.bugs.length ?? 0,
    security: insight?.security.length ?? 0,
    optimizations: insight?.optimizations.length ?? 0,
  };

  const Content = TAB_CONTENT[activeTab];

  return (
    <div className="flex h-full flex-col bg-surface/40">
      {/* tab bar */}
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-stroke px-2 py-1.5">
        {TABS.map(({ id, label, icon: Icon, count }) => {
          const n = count ? count(counts) : null;
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-mute hover:bg-raised hover:text-ink"
              }`}
            >
              <Icon size={13} />
              {label}
              {n !== null && n > 0 && (
                <span
                  className={`rounded-full px-1.5 text-[10px] font-semibold ${
                    active ? "bg-accent text-bg" : "bg-raised text-mute"
                  }`}
                >
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {insight ? (
          <Content />
        ) : status === "analyzing" ? (
          <AnalyzingState />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Sparkles size={22} />
      </span>
      <p className="text-sm font-medium">Waiting for code</p>
      <p className="max-w-[240px] text-xs leading-relaxed text-mute">
        Start typing in the editor — analysis runs automatically a couple of
        seconds after you pause.
      </p>
    </div>
  );
}

function AnalyzingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Sparkles size={22} className="animate-pulse" />
      </span>
      <p className="text-sm font-medium">Analyzing…</p>
      <p className="text-xs text-mute">Reading your code like a senior engineer.</p>
    </div>
  );
}
