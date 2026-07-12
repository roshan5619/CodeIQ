import { NextRequest, NextResponse } from "next/server";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { aiConfigured, getAnthropic, LIVE_MODEL, toApiError } from "@/lib/ai/client";
import { InsightSchema } from "@/lib/ai/schemas";
import { ANALYZE_SYSTEM } from "@/lib/ai/prompts";
import type { InsightPayload } from "@/lib/types";

export const maxDuration = 60;

const MAX_CODE_CHARS = 24_000;

function numbered(code: string): string {
  return code
    .split("\n")
    .map((line, i) => `${i + 1}| ${line}`)
    .join("\n");
}

export async function POST(req: NextRequest) {
  if (!aiConfigured()) {
    return NextResponse.json(
      {
        code: "missing_api_key",
        message:
          "ANTHROPIC_API_KEY is not configured — add it to .env.local to enable live analysis.",
      },
      { status: 503 },
    );
  }

  let body: { code?: string; language?: string; mode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { code: "bad_request", message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { code, language, mode } = body;
  if (!code || !language) {
    return NextResponse.json(
      { code: "bad_request", message: "code and language are required." },
      { status: 400 },
    );
  }
  if (code.length > MAX_CODE_CHARS) {
    return NextResponse.json(
      {
        code: "too_large",
        message: `Code exceeds ${MAX_CODE_CHARS.toLocaleString()} characters — live analysis is capped for latency.`,
      },
      { status: 413 },
    );
  }

  try {
    const client = getAnthropic();
    const response = await client.messages.parse({
      model: LIVE_MODEL,
      max_tokens: 8192,
      system: [
        {
          type: "text",
          text: ANALYZE_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Language: ${language}\nMode: ${mode ?? "standard"}\n\nCode (line-numbered):\n${numbered(code)}`,
        },
      ],
      output_config: { format: zodOutputFormat(InsightSchema) },
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return NextResponse.json(
        { code: "parse_failed", message: "The analyzer returned an unreadable result — try again." },
        { status: 502 },
      );
    }

    // Edge cases arrive without run status; mark them not-run for the UI.
    const payload: InsightPayload = {
      ...parsed,
      edgeCases: parsed.edgeCases.map((ec) => ({ ...ec, status: "not-run" as const })),
    };

    return NextResponse.json(payload);
  } catch (err) {
    const mapped = toApiError(err);
    return NextResponse.json(
      { code: mapped.code, message: mapped.message, retryAfter: mapped.retryAfter },
      { status: mapped.status },
    );
  }
}
