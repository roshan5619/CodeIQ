// Shared type contract between the UI, the mock data, and (from Phase 2 on)
// the AI structured-output schemas. Keep in sync with lib/ai/schemas.ts.

export const LANGUAGES = [
  { id: "python", label: "Python", monaco: "python" },
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "typescript", label: "TypeScript", monaco: "typescript" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "c", label: "C", monaco: "c" },
  { id: "cpp", label: "C++", monaco: "cpp" },
  { id: "go", label: "Go", monaco: "go" },
  { id: "rust", label: "Rust", monaco: "rust" },
  { id: "kotlin", label: "Kotlin", monaco: "kotlin" },
  { id: "swift", label: "Swift", monaco: "swift" },
  { id: "php", label: "PHP", monaco: "php" },
  { id: "ruby", label: "Ruby", monaco: "ruby" },
  { id: "csharp", label: "C#", monaco: "csharp" },
] as const;

export type Language = (typeof LANGUAGES)[number]["id"];

export type Mode = "standard" | "learning" | "interview" | "competitive";

export type Severity = "low" | "medium" | "high" | "critical";

export interface Scores {
  performance: number;
  quality: number;
  maintainability: number;
  readability: number;
  security: number;
  documentation: number;
  testability: number;
  robustness: number;
}

export const SCORE_LABELS: Record<keyof Scores, string> = {
  performance: "Performance",
  quality: "Code Quality",
  maintainability: "Maintainability",
  readability: "Readability",
  security: "Security",
  documentation: "Documentation",
  testability: "Testability",
  robustness: "Robustness",
};

export interface LineRange {
  start: number;
  end: number;
}

export interface FunctionComplexity {
  name: string;
  timeComplexity: string; // e.g. "O(n log n)"
  spaceComplexity: string;
  confidence: number; // 0-100
  explanation: string; // why this complexity was detected
  bestCase: string;
  averageCase: string;
  worstCase: string;
  lines: LineRange; // the whole function
  hotspots: Array<LineRange & { reason: string }>; // responsible loops/recursion
}

export interface BugFinding {
  line: number;
  title: string; // "Possible null pointer"
  detail: string;
  kind: "bug" | "logic" | "runtime" | "edge-case";
  severity: Severity;
  confidence: number; // 0-100
  suggestedFix: string;
}

export interface SecurityFinding {
  line: number;
  category: string; // "SQL Injection", "Hardcoded Secret", ...
  detail: string;
  severity: Severity;
  confidence: number;
  remediation: string;
}

export interface Optimization {
  title: string;
  currentComplexity: string;
  possibleComplexity: string;
  suggestion: string; // "Replace nested loops with a hash map"
  estimatedSpeedup: string; // "~12x on n = 10^5"
  memoryTradeoff: string; // "+O(n) — roughly +4MB at n = 10^5"
  effort: "trivial" | "moderate" | "involved";
  lines: LineRange | null;
}

export type EdgeCaseCategory =
  | "empty"
  | "single"
  | "boundary"
  | "duplicates"
  | "negative"
  | "large"
  | "unicode"
  | "null"
  | "fuzz";

export interface EdgeCase {
  label: string; // "Empty array"
  category: EdgeCaseCategory;
  input: string;
  expected: string;
  status: "pass" | "fail" | "predicted-pass" | "predicted-fail" | "not-run";
}

export interface HiddenTestPrediction {
  passProbability: number; // 0-100
  confidence: "low" | "medium" | "high";
  likelyFailures: string[]; // ["Empty input", "Integer overflow", ...]
  reasoning: string;
}

export interface InsightPayload {
  summary: string; // one-paragraph senior-engineer verdict
  overall: number; // 0-100
  scores: Scores;
  functions: FunctionComplexity[];
  bugs: BugFinding[];
  security: SecurityFinding[];
  optimizations: Optimization[];
  edgeCases: EdgeCase[];
  hiddenTests: HiddenTestPrediction;
}

export type AnalysisStatus = "idle" | "analyzing" | "ready" | "error";

export type TabId =
  | "overview"
  | "complexity"
  | "bugs"
  | "security"
  | "tests"
  | "optimize";
