"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useWorkbench } from "@/lib/store";
import { streamText, postJson, ApiError } from "@/lib/streamFetch";
import ArrayStepper, { type Frame } from "./ArrayStepper";
import {
  GraduationCap,
  Loader2,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Visualization {
  caption: string;
  frames: Frame[];
}

/** Strip markdown syntax so speech synthesis reads prose, not symbols. */
function toSpeech(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " code sample omitted. ")
    .replace(/[#*_`>|-]+/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export default function LearningPanel() {
  const { code, language, log } = useWorkbench();
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [viz, setViz] = useState<Visualization | null>(null);
  const [vizLoading, setVizLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Stop speech when leaving the panel.
  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
      abortRef.current?.abort();
    },
    [],
  );

  const explain = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setExplaining(true);
    setExplanation("");
    try {
      await streamText(
        "/api/explain",
        { code, language },
        setExplanation,
        controller.signal,
      );
    } catch (err) {
      if (err instanceof ApiError && err.code === "missing_api_key") {
        setExplanation(
          "**No API key configured.** Add `ANTHROPIC_API_KEY` to `.env.local` to unlock Learning Mode.",
        );
      } else if (!(err instanceof DOMException && err.name === "AbortError")) {
        log("error", err instanceof Error ? err.message : "Explanation failed.");
      }
    } finally {
      setExplaining(false);
    }
  };

  const visualize = async () => {
    setVizLoading(true);
    setViz(null);
    try {
      const v = await postJson<Visualization>("/api/visualize", { code, language });
      setViz(v);
      log("success", `Generated ${v.frames.length}-step algorithm animation.`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "missing_api_key") {
        log("warn", "Visualization needs ANTHROPIC_API_KEY.");
      } else {
        log("error", err instanceof Error ? err.message : "Visualization failed.");
      }
    } finally {
      setVizLoading(false);
    }
  };

  const toggleVoice = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    if (!explanation) return;
    const utterance = new SpeechSynthesisUtterance(toSpeech(explanation));
    utterance.rate = 1.05;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-mute">
            <GraduationCap size={13} className="text-info" />
            Learning mode
          </h3>
          <div className="flex items-center gap-1.5">
            {explanation && !explaining && (
              <button
                onClick={toggleVoice}
                className={`rounded-lg p-1.5 transition-colors ${
                  speaking
                    ? "bg-accent-soft text-accent"
                    : "text-mute hover:bg-raised hover:text-ink"
                }`}
                title={speaking ? "Stop voice" : "Read aloud"}
              >
                {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            )}
            <button
              onClick={explain}
              disabled={explaining}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-transform hover:scale-[1.03] disabled:opacity-40"
            >
              {explaining ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              {explanation ? "Re-explain" : "Explain this code"}
            </button>
          </div>
        </div>

        {explanation ? (
          <div className="prose-codeiq">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
            {explaining && (
              <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-accent" />
            )}
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-mute">
            Get a teaching-style walkthrough: why the complexity is what it is,
            why it can or cannot be better, and the key insight that unlocks
            the optimal solution — with optional voice narration.
          </p>
        )}
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-mute">
            Algorithm animation
          </h3>
          <button
            onClick={visualize}
            disabled={vizLoading}
            className="flex items-center gap-1.5 rounded-lg border border-stroke bg-raised px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-stroke-strong disabled:opacity-40"
          >
            {vizLoading ? (
              <Loader2 size={12} className="animate-spin text-accent" />
            ) : (
              <Play size={12} className="text-accent" />
            )}
            {vizLoading ? "Tracing…" : viz ? "Re-trace" : "Visualize"}
          </button>
        </div>
        {viz ? (
          <ArrayStepper caption={viz.caption} frames={viz.frames} />
        ) : (
          <p className="text-xs leading-relaxed text-mute">
            Watch your algorithm run step by step on a small input — pointers,
            comparisons and all.
          </p>
        )}
      </div>
    </div>
  );
}
