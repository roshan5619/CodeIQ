"use client";

import { useEffect, useRef } from "react";
import { useWorkbench } from "@/lib/store";
import { Terminal, Trash2 } from "lucide-react";

const LEVEL_TONES = {
  info: "text-mute",
  success: "text-accent",
  warn: "text-warn",
  error: "text-danger",
} as const;

export default function ConsolePanel() {
  const entries = useWorkbench((s) => s.console);
  const clearConsole = useWorkbench((s) => s.clearConsole);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  return (
    <div className="flex h-full flex-col bg-surface/60">
      <div className="flex shrink-0 items-center justify-between border-b border-stroke px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-mute">
          <Terminal size={12} />
          Console
        </span>
        <button
          onClick={clearConsole}
          className="rounded p-1 text-faint transition-colors hover:text-ink"
          title="Clear console"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
        {entries.map((e, i) => (
          <div key={i} className="flex gap-2">
            <span className="shrink-0 text-faint">
              {new Date(e.ts).toLocaleTimeString([], {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span className={LEVEL_TONES[e.level]}>{e.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
