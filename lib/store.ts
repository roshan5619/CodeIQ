"use client";

import { create } from "zustand";
import type {
  AnalysisStatus,
  InsightPayload,
  Language,
  LineRange,
  Mode,
  TabId,
} from "./types";
import { sampleFor } from "./samples";

interface ConsoleEntry {
  ts: number;
  level: "info" | "success" | "warn" | "error";
  text: string;
}

interface WorkbenchState {
  code: string;
  language: Language;
  mode: Mode;
  status: AnalysisStatus;
  insight: InsightPayload | null;
  error: string | null;
  activeTab: TabId;
  /** Line range to highlight in the editor (clicked from a finding card). */
  focusRange: LineRange | null;
  console: ConsoleEntry[];
  lastAnalyzedAt: number | null;

  setCode: (code: string) => void;
  setLanguage: (language: Language) => void;
  setMode: (mode: Mode) => void;
  setStatus: (status: AnalysisStatus) => void;
  setInsight: (insight: InsightPayload | null) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: TabId) => void;
  setFocusRange: (range: LineRange | null) => void;
  log: (level: ConsoleEntry["level"], text: string) => void;
  clearConsole: () => void;
}

export const useWorkbench = create<WorkbenchState>((set) => ({
  code: sampleFor("python"),
  language: "python",
  mode: "standard",
  status: "idle",
  insight: null,
  error: null,
  activeTab: "overview",
  focusRange: null,
  console: [
    {
      ts: Date.now(),
      level: "info",
      text: "CodeIQ ready — start typing and analysis runs automatically.",
    },
  ],
  lastAnalyzedAt: null,

  setCode: (code) => set({ code }),
  setLanguage: (language) =>
    set({
      language,
      code: sampleFor(language),
      insight: null,
      status: "idle",
      focusRange: null,
    }),
  setMode: (mode) => set({ mode }),
  setStatus: (status) =>
    set(
      status === "ready"
        ? { status, lastAnalyzedAt: Date.now() }
        : { status },
    ),
  setInsight: (insight) => set({ insight }),
  setError: (error) => set({ error }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setFocusRange: (focusRange) => set({ focusRange }),
  log: (level, text) =>
    set((s) => ({
      console: [...s.console.slice(-199), { ts: Date.now(), level, text }],
    })),
  clearConsole: () => set({ console: [] }),
}));
