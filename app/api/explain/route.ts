import { NextRequest, NextResponse } from "next/server";
import { requireAi, streamDeep } from "@/lib/ai/deep";
import { EXPLAIN_SYSTEM } from "@/lib/ai/prompts";
import { toApiError } from "@/lib/ai/client";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const gate = requireAi();
  if (gate) return gate;

  const { code, language } = (await req.json().catch(() => ({}))) as {
    code?: string;
    language?: string;
  };
  if (!code || !language) {
    return NextResponse.json(
      { code: "bad_request", message: "code and language are required." },
      { status: 400 },
    );
  }

  try {
    return streamDeep({
      system: EXPLAIN_SYSTEM,
      user: `Language: ${language}\n\nCode:\n${code}`,
      effort: "medium",
    });
  } catch (err) {
    const mapped = toApiError(err);
    return NextResponse.json(
      { code: mapped.code, message: mapped.message },
      { status: mapped.status },
    );
  }
}
