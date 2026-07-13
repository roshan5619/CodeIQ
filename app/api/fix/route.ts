import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { aiConfigured, getAnthropic, DEEP_MODEL, toApiError } from "@/lib/ai/client";
import { FIX_SYSTEM } from "@/lib/ai/prompts";

export const maxDuration = 120;

const FixSchema = z.object({
  fixedCode: z.string().describe("the COMPLETE file with the minimal fix applied"),
  explanation: z.string().describe("1-3 sentences: what was changed and why"),
  falsePositive: z
    .boolean()
    .describe("true when the reported finding is not actually a problem"),
});

export async function POST(req: NextRequest) {
  if (!aiConfigured()) {
    return NextResponse.json(
      { code: "missing_api_key", message: "ANTHROPIC_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const { code, language, finding } = (await req.json().catch(() => ({}))) as {
    code?: string;
    language?: string;
    finding?: { line: number; title: string; detail: string; suggestedFix?: string };
  };
  if (!code || !language || !finding) {
    return NextResponse.json(
      { code: "bad_request", message: "code, language and finding are required." },
      { status: 400 },
    );
  }

  try {
    const client = getAnthropic();
    const response = await client.messages.parse({
      model: DEEP_MODEL,
      max_tokens: 16_000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: zodOutputFormat(FixSchema),
      },
      system: [
        { type: "text", text: FIX_SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      messages: [
        {
          role: "user",
          content: `Language: ${language}\n\nFinding to fix:\n- Line ${finding.line}: ${finding.title}\n- Detail: ${finding.detail}${finding.suggestedFix ? `\n- Suggested direction: ${finding.suggestedFix}` : ""}\n\nFull file:\n${code}`,
        },
      ],
    });

    if (!response.parsed_output) {
      return NextResponse.json(
        { code: "parse_failed", message: "Fix generation returned an unreadable result." },
        { status: 502 },
      );
    }
    return NextResponse.json(response.parsed_output);
  } catch (err) {
    const mapped = toApiError(err);
    return NextResponse.json(
      { code: mapped.code, message: mapped.message },
      { status: mapped.status },
    );
  }
}
