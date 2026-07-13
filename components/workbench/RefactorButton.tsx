"use client";

import { useRef, useState } from "react";
import { useWorkbench } from "@/lib/store";
import { streamText, ApiError } from "@/lib/streamFetch";
import { ChevronDown, Loader2, Wand2 } from "lucide-react";

const DELIMITER = "-----CODEIQ-EXPLANATION-----";

const GOALS = [
  { id: "faster", label: "Faster" },
  { id: "cleaner", label: "Cleaner" },
  { id: "less-memory", label: "Less memory" },
  { id: "naming", label: "Better naming" },
  { id: "solid", label: "SOLID principles" },
  { id: "patterns", label: "Design patterns" },
  { id: "production", label: "Production ready" },
] as const;

export default function RefactorButton() {
  const { code, language, openDiff, updateDiff, closeDiff, log } = useWorkbench();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(["cleaner"]));
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const run = async () => {
    if (selected.size === 0 || busy) return;
    setOpen(false);
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const goals = [...selected];
    const goalLabels = GOALS.filter((g) => selected.has(g.id))
      .map((g) => g.label)
      .join(", ");

    openDiff({
      title: `AI Refactor — ${goalLabels}`,
      original: code,
      modified: "",
      explanation: "",
      streaming: true,
    });
    log("info", `Refactoring for: ${goalLabels}…`);

    try {
      await streamText(
        "/api/refactor",
        { code, language, goals },
        (full) => {
          const idx = full.indexOf(DELIMITER);
          if (idx === -1) {
            updateDiff({ modified: full });
          } else {
            updateDiff({
              modified: full.slice(0, idx).trimEnd(),
              explanation: full.slice(idx + DELIMITER.length).trim(),
            });
          }
        },
        controller.signal,
      );
      updateDiff({ streaming: false });
      log("success", "Refactor ready — review the diff and apply.");
    } catch (err) {
      closeDiff();
      if (err instanceof ApiError && err.code === "missing_api_key") {
        log("warn", "Refactor needs ANTHROPIC_API_KEY — add it to .env.local.");
      } else if (!(err instanceof DOMException && err.name === "AbortError")) {
        log("error", err instanceof Error ? err.message : "Refactor failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-lg border border-stroke bg-raised px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-stroke-strong disabled:opacity-50"
      >
        {busy ? (
          <Loader2 size={13} className="animate-spin text-accent" />
        ) : (
          <Wand2 size={13} className="text-accent" />
        )}
        Refactor
        <ChevronDown size={12} className="text-mute" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="glass-strong absolute right-0 top-full z-40 mt-2 w-56 rounded-xl p-2">
            <div className="mb-1 px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-mute">
              Refactor goals
            </div>
            {GOALS.map((g) => (
              <label
                key={g.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-ink transition-colors hover:bg-raised"
              >
                <input
                  type="checkbox"
                  checked={selected.has(g.id)}
                  onChange={() => toggle(g.id)}
                  className="h-3.5 w-3.5 accent-[#35e0c3]"
                />
                {g.label}
              </label>
            ))}
            <button
              onClick={run}
              disabled={selected.size === 0}
              className="mt-2 w-full rounded-lg bg-accent py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.02] disabled:opacity-40"
            >
              Refactor with {selected.size} goal{selected.size === 1 ? "" : "s"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
