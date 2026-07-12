import Anthropic from "@anthropic-ai/sdk";

// Model tiers (user-approved split):
//  - LIVE_MODEL powers the debounced keystroke-cadence loop — latency-critical.
//  - DEEP_MODEL powers user-triggered deep operations (refactor, security
//    scan, PR review, docs, teaching) — quality-critical.
export const LIVE_MODEL = "claude-haiku-4-5";
export const DEEP_MODEL = "claude-opus-4-8";

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 60_000,
    });
  }
  return client;
}

/** Map SDK errors to an HTTP status + user-facing message for API routes. */
export function toApiError(err: unknown): {
  status: number;
  code: string;
  message: string;
  retryAfter?: number;
} {
  if (err instanceof Anthropic.RateLimitError) {
    const retryAfter = Number(err.headers?.get?.("retry-after") ?? 30);
    return {
      status: 429,
      code: "rate_limited",
      message: "AI rate limit reached — retrying shortly.",
      retryAfter,
    };
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return {
      status: 401,
      code: "bad_api_key",
      message: "The configured ANTHROPIC_API_KEY was rejected.",
    };
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return {
      status: 502,
      code: "connection",
      message: "Could not reach the AI service — check your connection.",
    };
  }
  if (err instanceof Anthropic.APIError) {
    return {
      status: typeof err.status === "number" ? err.status : 500,
      code: "api_error",
      message: err.message,
    };
  }
  return {
    status: 500,
    code: "unknown",
    message: err instanceof Error ? err.message : "Unexpected error",
  };
}
