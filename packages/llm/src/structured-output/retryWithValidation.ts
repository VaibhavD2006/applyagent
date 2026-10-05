import type { ZodSchema } from "zod";
import { LLMValidationError } from "../LLMClient.js";

/**
 * Calls generateRaw up to maxRetries times, parsing with schema each time.
 * Returns parsed value on first success; throws LLMValidationError if all retries fail.
 */
export async function retryWithValidation<T>(
  generateRaw: (attempt: number) => Promise<string>,
  schema: ZodSchema<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const raw = await generateRaw(attempt);

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      lastError = e;
      continue;
    }

    const result = schema.safeParse(parsed);
    if (result.success) return result.data;
    lastError = result.error;
  }

  throw new LLMValidationError(maxRetries, lastError);
}
