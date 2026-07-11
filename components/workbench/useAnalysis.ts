"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWorkbench } from "@/lib/store";
import { MOCK_INSIGHT } from "@/lib/mock";
import type { InsightPayload } from "@/lib/types";

const DEBOUNCE_MS = 2500;
const MIN_CODE_LENGTH = 20;

/**
 * Drives the live-analysis loop: debounce after the last keystroke, cancel
 * any in-flight request, call the analyzer, publish the result to the store.
 *
 * Phase 1 serves a mock payload; runAnalysis() swaps to the real
 * /api/analyze endpoint in Phase 2 without touching the wiring.
 */
export function useAnalysis() {
  const { code, language, mode, setStatus, setInsight, setError, log } =
    useWorkbench();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("analyzing");
    setError(null);
    const started = performance.now();

    try {
      const insight = await fetchInsight(code, language, mode, controller.signal);
      if (controller.signal.aborted) return;
      setInsight(insight);
      setStatus("ready");
      log(
        "success",
        `Analysis complete in ${Math.round(performance.now() - started)}ms — overall ${insight.overall}/100, ${insight.bugs.length} bug(s), ${insight.security.length} security finding(s).`,
      );
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      setStatus("error");
      log("error", message);
    }
  }, [code, language, mode, setStatus, setInsight, setError, log]);

  // Debounced auto-analysis on code changes.
  useEffect(() => {
    if (code.trim().length < MIN_CODE_LENGTH) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(analyze, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [code, analyze]);

  // Abort in-flight work on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  return { analyze };
}

async function fetchInsight(
  code: string,
  language: string,
  mode: string,
  signal: AbortSignal,
): Promise<InsightPayload> {
  // Phase 2 replaces this block with:
  //   const res = await fetch("/api/analyze", { method: "POST", body: ..., signal });
  void code;
  void language;
  void mode;
  await new Promise((resolve, reject) => {
    const t = setTimeout(resolve, 900);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("aborted", "AbortError"));
    });
  });
  return MOCK_INSIGHT;
}
