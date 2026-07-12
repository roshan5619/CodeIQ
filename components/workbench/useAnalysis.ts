"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWorkbench } from "@/lib/store";
import { MOCK_INSIGHT } from "@/lib/mock";
import type { InsightPayload } from "@/lib/types";

const DEBOUNCE_MS = 2500;
const MIN_CODE_LENGTH = 20;

class AnalyzeError extends Error {
  constructor(
    public code: string,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}

/**
 * Drives the live-analysis loop: debounce after the last keystroke, cancel
 * any in-flight request, call /api/analyze, publish the result to the store.
 * When the server has no API key, falls back to demo data and flags demoMode.
 */
export function useAnalysis() {
  const {
    code,
    language,
    mode,
    setStatus,
    setInsight,
    setError,
    setDemoMode,
    log,
  } = useWorkbench();
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
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, mode }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new AnalyzeError(
          body.code ?? `http_${res.status}`,
          body.message ?? `Analysis failed (${res.status})`,
          body.retryAfter,
        );
      }

      const insight = (await res.json()) as InsightPayload;
      if (controller.signal.aborted) return;

      setDemoMode(false);
      setInsight(insight);
      setStatus("ready");
      log(
        "success",
        `Analysis complete in ${((performance.now() - started) / 1000).toFixed(1)}s — overall ${insight.overall}/100, ${insight.bugs.length} bug(s), ${insight.security.length} security finding(s).`,
      );
    } catch (err) {
      if (controller.signal.aborted) return;

      if (err instanceof AnalyzeError && err.code === "missing_api_key") {
        // No key configured: keep the product alive with sample data.
        setDemoMode(true);
        setInsight(MOCK_INSIGHT);
        setStatus("ready");
        log(
          "warn",
          "No ANTHROPIC_API_KEY configured — showing demo data. Add the key to .env.local and restart to enable live analysis.",
        );
        return;
      }

      const message =
        err instanceof AnalyzeError && err.code === "rate_limited"
          ? `${err.message}${err.retryAfter ? ` Retry in ~${err.retryAfter}s.` : ""}`
          : err instanceof Error
            ? err.message
            : "Analysis failed";
      setError(message);
      setStatus("error");
      log("error", message);
    }
  }, [code, language, mode, setStatus, setInsight, setError, setDemoMode, log]);

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
