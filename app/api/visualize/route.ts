import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseDeep, requireAi } from "@/lib/ai/deep";
import { VISUALIZE_SYSTEM } from "@/lib/ai/prompts";

export const maxDuration = 120;

const VisualizationSchema = z.object({
  caption: z.string().describe("what is being animated, incl. the chosen input"),
  frames: z.array(
    z.object({
      cells: z.array(z.string()).describe("current state of the data structure"),
      pointers: z.array(
        z.object({
          label: z.string().describe("e.g. i, j, left, right, mid"),
          index: z.number().int().describe("0-based index into cells"),
        }),
      ),
      note: z.string().describe("one sentence: what happens at this step"),
    }),
  ),
});

export type Visualization = z.infer<typeof VisualizationSchema>;

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

  return parseDeep({
    system: VISUALIZE_SYSTEM,
    user: `Language: ${language}\n\nCode:\n${code}`,
    schema: VisualizationSchema,
    effort: "medium",
    maxTokens: 8192,
  });
}
