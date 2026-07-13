import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseDeep, requireAi } from "@/lib/ai/deep";
import { INTERVIEW_SYSTEM } from "@/lib/ai/prompts";

export const maxDuration = 120;

const InterviewSchema = z.object({
  problemTitle: z.string().describe("the inferred or given problem name"),
  expectedComplexity: z.string().describe("optimal time complexity, e.g. O(n)"),
  currentComplexity: z.string(),
  meetsBar: z.boolean().describe("true when current matches the expected optimum"),
  verdict: z.string().describe("2-3 sentences an interviewer would say"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  interviewRating: z.number().int().describe("1-10"),
  hints: z.array(z.string()).describe("exactly 3, progressively stronger"),
  alternatives: z.array(
    z.object({
      name: z.string(),
      complexity: z.string(),
      tradeoff: z.string(),
    }),
  ),
  companies: z.array(z.string()),
});

export type InterviewEval = z.infer<typeof InterviewSchema>;

export async function POST(req: NextRequest) {
  const gate = requireAi();
  if (gate) return gate;

  const { code, language, problem } = (await req.json().catch(() => ({}))) as {
    code?: string;
    language?: string;
    problem?: string;
  };
  if (!code || !language) {
    return NextResponse.json(
      { code: "bad_request", message: "code and language are required." },
      { status: 400 },
    );
  }

  return parseDeep({
    system: INTERVIEW_SYSTEM,
    user: `Language: ${language}\n${problem ? `\nProblem statement:\n${problem}\n` : ""}\nCandidate's solution:\n${code}`,
    schema: InterviewSchema,
    effort: "medium",
  });
}
