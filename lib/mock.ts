import type { InsightPayload } from "./types";

// A realistic payload for the default Python two_sum sample. Used to exercise
// the entire workbench UI before the AI engine is wired in, and as a visual
// reference for what the analyzer should produce.
export const MOCK_INSIGHT: InsightPayload = {
  summary:
    "Correct brute-force implementation of Two Sum. The nested scan makes it quadratic, which will time out on large inputs — a hash-map pass gets you to linear time. No safety issues, but the docstring undersells edge-case behavior (empty input returns []).",
  overall: 68,
  scores: {
    performance: 41,
    quality: 74,
    maintainability: 78,
    readability: 85,
    security: 96,
    documentation: 62,
    testability: 71,
    robustness: 58,
  },
  functions: [
    {
      name: "two_sum",
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1)",
      confidence: 97,
      explanation:
        "The outer loop runs n times and the inner loop scans the remaining n−i−1 elements for every i, giving n(n−1)/2 comparisons — quadratic growth. Space is constant: only loop indices are allocated.",
      bestCase: "O(1) — first two elements match",
      averageCase: "O(n²)",
      worstCase: "O(n²) — no pair exists",
      lines: { start: 1, end: 7 },
      hotspots: [
        {
          start: 3,
          end: 4,
          reason: "Nested for-loops — every pair (i, j) is compared",
        },
      ],
    },
  ],
  bugs: [
    {
      line: 6,
      title: "Silent empty-list return on no match",
      detail:
        "Returning [] when no pair exists is indistinguishable from a valid answer of indices — callers may index into the result and raise IndexError.",
      kind: "edge-case",
      severity: "medium",
      confidence: 82,
      suggestedFix:
        "Raise a ValueError('no pair sums to target') or return None and document it.",
    },
  ],
  security: [],
  optimizations: [
    {
      title: "Replace nested loops with a hash map",
      currentComplexity: "O(n²)",
      possibleComplexity: "O(n)",
      suggestion:
        "Single pass: store each value's index in a dict; for each num, check if target − num was already seen.",
      estimatedSpeedup: "~12x at n = 10³, ~5000x at n = 10⁵",
      memoryTradeoff: "+O(n) — roughly +4 MB at n = 10⁵ integers",
      effort: "trivial",
      lines: { start: 3, end: 6 },
    },
  ],
  edgeCases: [
    {
      label: "Empty array",
      category: "empty",
      input: "two_sum([], 5)",
      expected: "[]",
      status: "not-run",
    },
    {
      label: "Single element",
      category: "single",
      input: "two_sum([3], 3)",
      expected: "[]",
      status: "not-run",
    },
    {
      label: "Duplicate values",
      category: "duplicates",
      input: "two_sum([3, 3], 6)",
      expected: "[0, 1]",
      status: "not-run",
    },
    {
      label: "Negative numbers",
      category: "negative",
      input: "two_sum([-1, -7, 4], -8)",
      expected: "[0, 1]",
      status: "not-run",
    },
    {
      label: "Maximum integers",
      category: "boundary",
      input: "two_sum([2**31 - 1, 1], 2**31)",
      expected: "[0, 1]",
      status: "not-run",
    },
    {
      label: "Large dataset (10⁵ items)",
      category: "large",
      input: "two_sum(list(range(100000)), 199997)",
      expected: "[99998, 99999]",
      status: "not-run",
    },
  ],
  hiddenTests: {
    passProbability: 74,
    confidence: "high",
    likelyFailures: ["Large constraints (TLE)", "No-solution handling"],
    reasoning:
      "Logic is correct for all pair-finding cases, but O(n²) will exceed typical 1-second limits when n ≥ 10⁴, and the [] return may fail judges expecting an exception or sentinel.",
  },
};
