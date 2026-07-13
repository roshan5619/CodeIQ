"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

export interface Frame {
  cells: string[];
  pointers: Array<{ label: string; index: number }>;
  note: string;
}

const POINTER_COLORS = [
  "var(--color-accent)",
  "var(--color-info)",
  "var(--color-warn)",
  "var(--color-violet)",
];

export default function ArrayStepper({
  caption,
  frames,
}: {
  caption: string;
  frames: Frame[];
}) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = frames[Math.min(step, frames.length - 1)];

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setStep((s) => {
        if (s + 1 >= frames.length) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1400);
    return () => clearInterval(t);
  }, [playing, frames.length]);

  const pointerColor = useMemo(() => {
    const labels = [...new Set(frames.flatMap((f) => f.pointers.map((p) => p.label)))];
    return new Map(labels.map((l, i) => [l, POINTER_COLORS[i % POINTER_COLORS.length]]));
  }, [frames]);

  if (!frame) return null;

  return (
    <div className="rounded-2xl border border-stroke bg-surface/50 p-4">
      <p className="mb-4 text-xs text-mute">{caption}</p>

      {/* cells with pointer markers */}
      <div className="mb-3 flex flex-wrap items-end justify-center gap-1.5">
        {frame.cells.map((cell, i) => {
          const pointers = frame.pointers.filter((p) => p.index === i);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="flex h-4 items-end gap-1">
                {pointers.map((p) => (
                  <span
                    key={p.label}
                    className="font-mono text-[10px] font-bold leading-none"
                    style={{ color: pointerColor.get(p.label) }}
                  >
                    {p.label}▾
                  </span>
                ))}
              </div>
              <div
                className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-2 font-mono text-xs transition-all duration-300 ${
                  pointers.length > 0
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-stroke bg-raised text-ink"
                }`}
              >
                {cell}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mb-4 min-h-8 text-center text-xs leading-relaxed text-mute">
        {frame.note}
      </p>

      {/* controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => {
            setPlaying(false);
            setStep(0);
          }}
          className="rounded-lg p-1.5 text-mute transition-colors hover:bg-raised hover:text-ink"
          title="Restart"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setStep((s) => Math.max(0, s - 1));
          }}
          disabled={step === 0}
          className="rounded-lg p-1.5 text-mute transition-colors hover:bg-raised hover:text-ink disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-bg transition-transform hover:scale-105"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setStep((s) => Math.min(frames.length - 1, s + 1));
          }}
          disabled={step >= frames.length - 1}
          className="rounded-lg p-1.5 text-mute transition-colors hover:bg-raised hover:text-ink disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
        <span className="ml-2 font-mono text-[10.5px] text-mute">
          {step + 1}/{frames.length}
        </span>
      </div>
    </div>
  );
}
