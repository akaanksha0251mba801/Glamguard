export async function parseJsonResponse<T>(
  response: Response,
  fallbackErrorMessage: string
): Promise<T> {
  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const rawText = await response.text();
  const trimmed = rawText.trim();

  let parsed: (T & { error?: string }) | null = null;
  const looksLikeJson =
    contentType.includes("application/json") ||
    contentType.includes("+json") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[");

  if (trimmed && looksLikeJson) {
    try {
      parsed = JSON.parse(trimmed) as T & { error?: string };
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    if (parsed && typeof parsed.error === "string" && parsed.error.trim()) {
      throw new Error(parsed.error.trim());
    }
    if (response.status >= 500) {
      throw new Error(
        `${fallbackErrorMessage} The server returned an unexpected error (${response.status}). Please try again.`
      );
    }
    throw new Error(`${fallbackErrorMessage} (HTTP ${response.status}).`);
  }

  if (!parsed) {
    throw new Error(
      `${fallbackErrorMessage} The server returned an invalid non-JSON response.`
    );
  }

  return parsed;
}
