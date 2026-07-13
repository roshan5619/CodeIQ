import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { aiConfigured, getAnthropic, DEEP_MODEL, toApiError } from "./client";

/** 503 response when no API key is configured, else null. */
export function requireAi(): NextResponse | null {
  if (aiConfigured()) return null;
  return NextResponse.json(
    { code: "missing_api_key", message: "ANTHROPIC_API_KEY is not configured." },
    { status: 503 },
  );
}

/** Stream a deep-model completion as a plain-text response. */
export function streamDeep(options: {
  system: string;
  user: string;
  maxTokens?: number;
  effort?: "low" | "medium" | "high";
}): Response {
  const client = getAnthropic();
  const stream = client.messages.stream({
    model: DEEP_MODEL,
    max_tokens: options.maxTokens ?? 24_000,
    thinking: { type: "adaptive" },
    output_config: { effort: options.effort ?? "medium" },
    system: [
      { type: "text", text: options.system, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: options.user }],
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
}

/** One structured deep-model call, returned as JSON (or a mapped error). */
export async function parseDeep<T>(options: {
  system: string;
  user: string;
  schema: ZodType<T>;
  maxTokens?: number;
  effort?: "low" | "medium" | "high";
}): Promise<NextResponse> {
  try {
    const client = getAnthropic();
    const response = await client.messages.parse({
      model: DEEP_MODEL,
      max_tokens: options.maxTokens ?? 8192,
      thinking: { type: "adaptive" },
      output_config: {
        effort: options.effort ?? "medium",
        format: zodOutputFormat(options.schema),
      },
      system: [
        { type: "text", text: options.system, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: options.user }],
    });

    if (!response.parsed_output) {
      return NextResponse.json(
        { code: "parse_failed", message: "The model returned an unreadable result." },
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
