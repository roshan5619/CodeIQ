"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, { title: string; sub: string }> = {
  "/workbench": {
    title: "Workbench",
    sub: "Live AI analysis while you write",
  },
  "/dashboard": {
    title: "Dashboard",
    sub: "Quality trends and developer growth",
  },
  "/github": {
    title: "GitHub",
    sub: "Repository and pull-request intelligence",
  },
  "/settings": {
    title: "Settings",
    sub: "Keys, integrations and preferences",
  },
};

export default function Topbar() {
  const pathname = usePathname();
  const match = Object.entries(TITLES).find(([k]) => pathname.startsWith(k));
  const { title, sub } = match?.[1] ?? { title: "CodeIQ", sub: "" };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-stroke bg-surface/60 px-5 backdrop-blur-xl">
      <div className="flex items-baseline gap-3">
        <h1 className="font-display text-[15px] font-semibold tracking-wide">
          {title}
        </h1>
        <span className="hidden text-xs text-mute sm:inline">{sub}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-mute">
        <span className="inline-block h-2 w-2 rounded-full bg-accent" />
        Local mode
      </div>
    </header>
  );
}
