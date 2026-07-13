export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * POST JSON and stream the text/plain response body, invoking onText with the
 * accumulated text after every chunk. Resolves with the full text.
 */
export async function streamText(
  url: string,
  body: unknown,
  onText: (fullText: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(
      err.code ?? `http_${res.status}`,
      err.message ?? `Request failed (${res.status})`,
    );
  }
  if (!res.body) throw new ApiError("no_body", "Empty response body.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onText(full);
  }
  full += decoder.decode();
  onText(full);
  return full;
}

/** POST JSON, expect JSON back; throws ApiError with the server's code. */
export async function postJson<T>(
  url: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      data.code ?? `http_${res.status}`,
      data.message ?? `Request failed (${res.status})`,
    );
  }
  return data as T;
}
