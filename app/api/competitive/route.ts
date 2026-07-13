import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseDeep, requireAi } from "@/lib/ai/deep";
import { COMPETITIVE_SYSTEM } from "@/lib/ai/prompts";

export const maxDuration = 120;

const CompetitiveSchema = z.object({
  acceptancePrediction: z.number().int().describe("0-100 probability of Accepted"),
  verdict: z.string().describe("the judgement with the operation-count arithmetic"),
  tleRisk: z.enum(["low", "medium", "high"]),
  memoryRisk: z.enum(["low", "medium", "high"]),
  estimatedRuntime: z.string().describe('e.g. "~2.4s at n = 10^5"'),
  estimatedMemory: z.string().describe('e.g. "~12 MB at n = 10^5"'),
  optimizations: z
    .array(z.string())
    .describe("changes needed for Accepted, ordered by impact"),
  platformNotes: z.array(z.string()),
});

export type CompetitiveEval = z.infer<typeof CompetitiveSchema>;

export async function POST(req: NextRequest) {
  const gate = requireAi();
  if (gate) return gate;

  const { code, language, platform, constraints } = (await req
    .json()
    .catch(() => ({}))) as {
    code?: string;
    language?: string;
    platform?: string;
    constraints?: string;
  };
  if (!code || !language) {
    return NextResponse.json(
      { code: "bad_request", message: "code and language are required." },
      { status: 400 },
    );
  }

  return parseDeep({
    system: COMPETITIVE_SYSTEM,
    user: `Platform: ${platform ?? "LeetCode"}\nLanguage: ${language}\nConstraints: ${constraints?.trim() || "not provided — assume typical limits"}\n\nSubmission:\n${code}`,
    schema: CompetitiveSchema,
    effort: "medium",
  });
}
