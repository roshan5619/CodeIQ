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

/** A pending code change under review in the diff modal. */
export interface DiffReview {
  title: string;
  original: string;
  modified: string;
  explanation: string;
  streaming: boolean;
}

export interface EdgeCaseResult {
  label: string;
  status: "pass" | "fail" | "predicted-pass" | "predicted-fail";
  note: string;
}

interface WorkbenchState {
  code: string;
  language: Language;
  mode: Mode;
  /** DB id of the snippet this editor session is saving runs against. */
  snippetId: string | null;
  status: AnalysisStatus;
  insight: InsightPayload | null;
  error: string | null;
  activeTab: TabId;
  /** Line range to highlight in the editor (clicked from a finding card). */
  focusRange: LineRange | null;
  console: ConsoleEntry[];
  lastAnalyzedAt: number | null;
  /** True when the server has no API key and the UI is showing sample data. */
  demoMode: boolean;
  /** Open diff-review modal state (refactor / fix flows). */
  diff: DiffReview | null;

  setCode: (code: string) => void;
  setLanguage: (language: Language) => void;
  setMode: (mode: Mode) => void;
  setSnippetId: (id: string | null) => void;
  /** Hydrate the editor from a saved snippet (dashboard "open" action). */
  loadSnippet: (snippet: { id: string; code: string; language: Language; mode: Mode }) => void;
  setStatus: (status: AnalysisStatus) => void;
  setInsight: (insight: InsightPayload | null) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: TabId) => void;
  setFocusRange: (range: LineRange | null) => void;
  setDemoMode: (demo: boolean) => void;
  openDiff: (diff: DiffReview) => void;
  updateDiff: (patch: Partial<DiffReview>) => void;
  closeDiff: () => void;
  applyEdgeCaseResults: (results: EdgeCaseResult[]) => void;
  log: (level: ConsoleEntry["level"], text: string) => void;
  clearConsole: () => void;
}

export const useWorkbench = create<WorkbenchState>((set) => ({
  code: sampleFor("python"),
  language: "python",
  mode: "standard",
  snippetId: null,
  status: "idle",
  insight: null,
  error: null,
  activeTab: "overview",
  focusRange: null,
  demoMode: false,
  diff: null,
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
      snippetId: null,
    }),
  setSnippetId: (snippetId) => set({ snippetId }),
  loadSnippet: ({ id, code, language, mode }) =>
    set({
      snippetId: id,
      code,
      language,
      mode,
      insight: null,
      status: "idle",
      focusRange: null,
      activeTab: mode !== "standard" ? "coach" : "overview",
    }),
  setMode: (mode) =>
    set((s) => ({
      mode,
      activeTab:
        mode !== "standard"
          ? "coach"
          : s.activeTab === "coach"
            ? "overview"
            : s.activeTab,
    })),
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
  setDemoMode: (demoMode) => set({ demoMode }),
  openDiff: (diff) => set({ diff }),
  updateDiff: (patch) =>
    set((s) => (s.diff ? { diff: { ...s.diff, ...patch } } : {})),
  closeDiff: () => set({ diff: null }),
  applyEdgeCaseResults: (results) =>
    set((s) => {
      if (!s.insight) return {};
      const byLabel = new Map(results.map((r) => [r.label, r]));
      return {
        insight: {
          ...s.insight,
          edgeCases: s.insight.edgeCases.map((ec) => {
            const r = byLabel.get(ec.label);
            return r ? { ...ec, status: r.status } : ec;
          }),
        },
      };
    }),
  log: (level, text) =>
    set((s) => ({
      console: [...s.console.slice(-199), { ts: Date.now(), level, text }],
    })),
  clearConsole: () => set({ console: [] }),
}));
