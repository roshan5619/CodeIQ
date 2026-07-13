import { NextRequest, NextResponse } from "next/server";
import vm from "node:vm";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { aiConfigured, getAnthropic, LIVE_MODEL, toApiError } from "@/lib/ai/client";
import { PREDICT_TESTS_SYSTEM } from "@/lib/ai/prompts";

export const maxDuration = 120;

const CASE_TIMEOUT_MS = 1500;

interface CaseInput {
  label: string;
  input: string;
  expected: string;
}

interface CaseResult {
  label: string;
  status: "pass" | "fail" | "predicted-pass" | "predicted-fail";
  note: string;
}

const PredictionSchema = z.object({
  results: z.array(
    z.object({
      label: z.string(),
      predicted: z.enum(["pass", "fail"]),
      note: z.string(),
    }),
  ),
});

/** Loose deep-compare between an executed value and the expected string. */
function matches(actual: unknown, expected: string, ctx: vm.Context): boolean {
  const actualStr =
    typeof actual === "string" ? actual : JSON.stringify(actual) ?? String(actual);
  const trimmed = expected.trim();
  if (actualStr === trimmed || String(actual) === trimmed) return true;
  try {
    const expectedValue = vm.runInContext(`(${trimmed})`, ctx, { timeout: 200 });
    return JSON.stringify(actual) === JSON.stringify(expectedValue);
  } catch {
    return false;
  }
}

function runJs(code: string, cases: CaseInput[]): CaseResult[] {
  // Fresh intrinsics, no require/process — a guardrail for accidental damage,
  // not a hard security boundary; this is a local dev tool.
  const ctx = vm.createContext({ console: { log: () => {} } });

  try {
    vm.runInContext(code, ctx, { timeout: CASE_TIMEOUT_MS * 2 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return cases.map((c) => ({
      label: c.label,
      status: "fail" as const,
      note: `Code failed to load: ${msg}`,
    }));
  }

  return cases.map((c) => {
    try {
      const actual = vm.runInContext(`(${c.input})`, ctx, {
        timeout: CASE_TIMEOUT_MS,
      });
      const pass = matches(actual, c.expected, ctx);
      return {
        label: c.label,
        status: pass ? ("pass" as const) : ("fail" as const),
        note: pass
          ? ""
          : `Expected ${c.expected.trim()}, got ${JSON.stringify(actual) ?? String(actual)}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const timedOut = /timed out/i.test(msg);
      return {
        label: c.label,
        status: "fail" as const,
        note: timedOut ? `Timed out after ${CASE_TIMEOUT_MS}ms` : `Threw: ${msg}`,
      };
    }
  });
}

async function transpileTs(code: string): Promise<string> {
  const ts = await import("typescript");
  return ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
    },
  }).outputText;
}

async function predictWithAi(
  code: string,
  language: string,
  cases: CaseInput[],
): Promise<CaseResult[]> {
  const client = getAnthropic();
  const response = await client.messages.parse({
    model: LIVE_MODEL,
    max_tokens: 4096,
    system: [
      { type: "text", text: PREDICT_TESTS_SYSTEM, cache_control: { type: "ephemeral" } },
    ],
    messages: [
      {
        role: "user",
        content: `Language: ${language}\n\nCode:\n${code}\n\nTest cases:\n${cases
          .map((c, i) => `${i + 1}. ${c.label}: ${c.input} → expected ${c.expected}`)
          .join("\n")}`,
      },
    ],
    output_config: { format: zodOutputFormat(PredictionSchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed) throw new Error("Prediction returned an unreadable result.");

  const byLabel = new Map(parsed.results.map((r) => [r.label, r]));
  return cases.map((c) => {
    const r = byLabel.get(c.label);
    return {
      label: c.label,
      status: r?.predicted === "pass" ? "predicted-pass" : "predicted-fail",
      note: r?.note ?? "",
    };
  });
}

export async function POST(req: NextRequest) {
  const { code, language, cases } = (await req.json().catch(() => ({}))) as {
    code?: string;
    language?: string;
    cases?: CaseInput[];
  };
  if (!code || !language || !cases?.length) {
    return NextResponse.json(
      { code: "bad_request", message: "code, language and cases are required." },
      { status: 400 },
    );
  }

  try {
    if (language === "javascript") {
      return NextResponse.json({ mode: "executed", results: runJs(code, cases) });
    }
    if (language === "typescript") {
      const js = await transpileTs(code);
      return NextResponse.json({ mode: "executed", results: runJs(js, cases) });
    }

    // Other languages: AI-predicted outcomes, clearly labeled.
    if (!aiConfigured()) {
      return NextResponse.json(
        {
          code: "missing_api_key",
          message:
            "Real execution is available for JavaScript/TypeScript only; predicting outcomes for other languages needs ANTHROPIC_API_KEY.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({
      mode: "predicted",
      results: await predictWithAi(code, language, cases),
    });
  } catch (err) {
    const mapped = toApiError(err);
    return NextResponse.json(
      { code: mapped.code, message: mapped.message },
      { status: mapped.status },
    );
  }
}
