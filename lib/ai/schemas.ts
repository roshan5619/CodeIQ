import { z } from "zod";

// Zod mirror of the InsightPayload contract in lib/types.ts.
// Structured-outputs rules: every field required, enums for closed sets,
// nullable instead of optional.

const LineRangeSchema = z.object({
  start: z.number().int().describe("1-based first line"),
  end: z.number().int().describe("1-based last line, inclusive"),
});

const ScoresSchema = z.object({
  performance: z.number().int().describe("0-100"),
  quality: z.number().int(),
  maintainability: z.number().int(),
  readability: z.number().int(),
  security: z.number().int(),
  documentation: z.number().int(),
  testability: z.number().int(),
  robustness: z.number().int().describe("edge-case and error handling"),
});

const FunctionComplexitySchema = z.object({
  name: z.string().describe("function or method name, without parentheses"),
  timeComplexity: z.string().describe('e.g. "O(n log n)"'),
  spaceComplexity: z.string(),
  confidence: z.number().int().describe("0-100"),
  explanation: z
    .string()
    .describe(
      "WHY this complexity holds — name the exact loops/recursion/operations responsible",
    ),
  bestCase: z.string().describe('e.g. "O(1) — first two elements match"'),
  averageCase: z.string(),
  worstCase: z.string(),
  lines: LineRangeSchema.describe("the whole function body"),
  hotspots: z
    .array(
      z.object({
        start: z.number().int(),
        end: z.number().int(),
        reason: z.string().describe("what makes these lines costly"),
      }),
    )
    .describe("the specific lines responsible for the dominant cost"),
});

const BugFindingSchema = z.object({
  line: z.number().int().describe("1-based line number of the risky code"),
  title: z.string().describe('short, e.g. "Possible null pointer"'),
  detail: z.string(),
  kind: z.enum(["bug", "logic", "runtime", "edge-case"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  confidence: z.number().int().describe("0-100"),
  suggestedFix: z.string().describe("concrete one-or-two-sentence fix"),
});

const SecurityFindingSchema = z.object({
  line: z.number().int(),
  category: z
    .string()
    .describe(
      'e.g. "SQL Injection", "XSS", "Command Injection", "Hardcoded Secret", "Weak Cryptography", "Unsafe Deserialization"',
    ),
  detail: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  confidence: z.number().int(),
  remediation: z.string(),
});

const OptimizationSchema = z.object({
  title: z.string(),
  currentComplexity: z.string(),
  possibleComplexity: z.string(),
  suggestion: z.string().describe('concrete, e.g. "Replace nested loops with a hash map"'),
  estimatedSpeedup: z.string().describe('e.g. "~12x at n = 10^5"'),
  memoryTradeoff: z.string().describe('e.g. "+O(n) — roughly +4 MB at n = 10^5"'),
  effort: z.enum(["trivial", "moderate", "involved"]),
  lines: LineRangeSchema.nullable(),
});

const EdgeCaseSchema = z.object({
  label: z.string().describe('e.g. "Empty array"'),
  category: z.enum([
    "empty",
    "single",
    "boundary",
    "duplicates",
    "negative",
    "large",
    "unicode",
    "null",
    "fuzz",
  ]),
  input: z.string().describe("a runnable call expression in the code's language"),
  expected: z.string().describe("expected output or behavior"),
});

const HiddenTestPredictionSchema = z.object({
  passProbability: z.number().int().describe("0-100"),
  confidence: z.enum(["low", "medium", "high"]),
  likelyFailures: z
    .array(z.string())
    .describe('categories most likely to fail, e.g. "Large constraints (TLE)"'),
  reasoning: z.string(),
});

export const InsightSchema = z.object({
  summary: z
    .string()
    .describe("2-3 sentence senior-engineer verdict on this code"),
  overall: z.number().int().describe("0-100 overall quality"),
  scores: ScoresSchema,
  functions: z.array(FunctionComplexitySchema),
  bugs: z.array(BugFindingSchema),
  security: z.array(SecurityFindingSchema),
  optimizations: z.array(OptimizationSchema),
  edgeCases: z
    .array(EdgeCaseSchema)
    .describe("8-14 cases covering distinct categories"),
  hiddenTests: HiddenTestPredictionSchema,
});

export type InsightOutput = z.infer<typeof InsightSchema>;
