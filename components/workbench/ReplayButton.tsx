"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import Modal from "@/components/ui/Modal";
import { defineCodeIQTheme } from "@/components/editor/theme";
import { useWorkbench } from "@/lib/store";
import { LANGUAGES } from "@/lib/types";
import { scoreColor } from "@/components/ui/ScoreGauge";
import { History, RotateCcw } from "lucide-react";

export default function ReplayButton() {
  const { snapshots, language, setCode, log } = useWorkbench();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const monacoLanguage =
    LANGUAGES.find((l) => l.id === language)?.monaco ?? "plaintext";

  const openModal = () => {
    setIndex(snapshots.length - 1);
    setOpen(true);
  };

  const snap = snapshots[index];

  const restore = () => {
    if (!snap) return;
    setCode(snap.code);
    setOpen(false);
    log("info", `Restored code from ${new Date(snap.ts).toLocaleTimeString()}.`);
  };

  return (
    <>
      <button
        onClick={openModal}
        disabled={snapshots.length === 0}
        className="flex items-center gap-1.5 rounded-lg border border-stroke bg-raised px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-stroke-strong disabled:cursor-not-allowed disabled:opacity-40"
        title={
          snapshots.length === 0
            ? "Snapshots are captured at each analysis"
            : "Replay this session's code history"
        }
      >
        <History size={13} className="text-violet" />
        Replay
      </button>

      {open && snap && (
        <Modal title="Code replay — this session" onClose={() => setOpen(false)} wide>
          <div className="flex h-[70vh] flex-col">
            <div className="flex shrink-0 items-center gap-4 border-b border-stroke bg-surface/60 px-5 py-3">
              <input
                type="range"
                min={0}
                max={snapshots.length - 1}
                value={index}
                onChange={(e) => setIndex(Number(e.target.value))}
                className="flex-1 accent-[#35e0c3]"
              />
              <span className="shrink-0 font-mono text-[11px] text-mute">
                {index + 1}/{snapshots.length} ·{" "}
                {new Date(snap.ts).toLocaleTimeString()}
              </span>
              <span
                className="shrink-0 font-mono text-sm font-bold"
                style={{ color: scoreColor(snap.overall) }}
              >
                {snap.overall}
              </span>
            </div>
            <div className="min-h-0 flex-1">
              <Editor
                height="100%"
                language={monacoLanguage}
                value={snap.code}
                theme="codeiq-dark"
                beforeMount={defineCodeIQTheme}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12.5,
                  fontFamily:
                    "var(--font-geist-mono), ui-monospace, 'Cascadia Code', monospace",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
            <div className="flex shrink-0 justify-end border-t border-stroke bg-surface/60 px-5 py-3">
              <button
                onClick={restore}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-bg transition-transform hover:scale-[1.03]"
              >
                <RotateCcw size={13} />
                Restore this version
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
