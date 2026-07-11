"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  Code2,
  BarChart3,
  GitPullRequest,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/workbench", label: "Workbench", icon: Code2 },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/github", label: "GitHub", icon: GitPullRequest },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-svh w-16 shrink-0 flex-col items-center border-r border-stroke bg-surface/70 py-4 backdrop-blur-xl">
      <Link
        href="/"
        title="CodeIQ home"
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform hover:scale-105"
      >
        <BrainCircuit size={22} strokeWidth={2.2} />
      </Link>

      <nav className="flex flex-col gap-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-mute hover:bg-raised hover:text-ink"
              }`}
            >
              <Icon size={20} strokeWidth={2} />
              {active && (
                <span className="absolute -left-[13px] h-5 w-[3px] rounded-full bg-accent" />
              )}
              <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg border border-stroke bg-raised px-2.5 py-1 text-xs font-medium text-ink shadow-xl group-hover:block">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
