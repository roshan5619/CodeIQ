import { NextRequest, NextResponse } from "next/server";
import { aiConfigured, getAnthropic, DEEP_MODEL, toApiError } from "@/lib/ai/client";
import { REFACTOR_SYSTEM } from "@/lib/ai/prompts";

export const maxDuration = 300;

export const REFACTOR_GOALS: Record<string, string> = {
  faster: "Faster — optimize the algorithm and hot paths",
  cleaner: "Cleaner — clarity, structure, dead-code removal",
  "less-memory": "Less memory — reduce allocations and copies",
  naming: "Better naming — rename identifiers for intent",
  solid: "SOLID principles — single responsibility, clean boundaries",
  patterns: "Design patterns — apply the right pattern where it earns its keep",
  production: "Production ready — input validation at boundaries, error handling, logging hooks",
};

export async function POST(req: NextRequest) {
  if (!aiConfigured()) {
    return NextResponse.json(
      { code: "missing_api_key", message: "ANTHROPIC_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const { code, language, goals } = (await req.json().catch(() => ({}))) as {
    code?: string;
    language?: string;
    goals?: string[];
  };
  if (!code || !language || !goals?.length) {
    return NextResponse.json(
      { code: "bad_request", message: "code, language and goals are required." },
      { status: 400 },
    );
  }

  const goalLines = goals
    .map((g) => REFACTOR_GOALS[g])
    .filter(Boolean)
    .map((g) => `- ${g}`)
    .join("\n");

  try {
    const client = getAnthropic();
    const stream = client.messages.stream({
      model: DEEP_MODEL,
      max_tokens: 32_000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
      system: [
        { type: "text", text: REFACTOR_SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      messages: [
        {
          role: "user",
          content: `Language: ${language}\n\nRequested goals:\n${goalLines}\n\nOriginal code:\n${code}`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
      cancel() {
        stream.controller.abort();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const mapped = toApiError(err);
    return NextResponse.json(
      { code: mapped.code, message: mapped.message },
      { status: mapped.status },
    );
  }
}
