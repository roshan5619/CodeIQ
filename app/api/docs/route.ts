import { NextRequest, NextResponse } from "next/server";
import { aiConfigured, getAnthropic, DEEP_MODEL, toApiError } from "@/lib/ai/client";
import { DOCS_SYSTEM } from "@/lib/ai/prompts";

export const maxDuration = 300;

const KINDS = new Set(["readme", "api", "comments", "architecture", "flowchart"]);

export async function POST(req: NextRequest) {
  if (!aiConfigured()) {
    return NextResponse.json(
      { code: "missing_api_key", message: "ANTHROPIC_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const { code, language, kind } = (await req.json().catch(() => ({}))) as {
    code?: string;
    language?: string;
    kind?: string;
  };
  if (!code || !language || !kind || !KINDS.has(kind)) {
    return NextResponse.json(
      { code: "bad_request", message: "code, language and a valid kind are required." },
      { status: 400 },
    );
  }

  try {
    const client = getAnthropic();
    const stream = client.messages.stream({
      model: DEEP_MODEL,
      max_tokens: 24_000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: [
        { type: "text", text: DOCS_SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      messages: [
        {
          role: "user",
          content: `Document kind: ${kind}\nLanguage: ${language}\n\nCode:\n${code}`,
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
