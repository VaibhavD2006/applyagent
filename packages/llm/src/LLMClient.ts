import type { ZodSchema } from "zod";

export interface LLMClient {
  /**
   * Generate a structured response from a prompt, validated against the given Zod schema.
   * Implementations must retry on validation failure (up to maxRetries) before throwing.
   */
  generate<T>(prompt: string, schema: ZodSchema<T>, options?: LLMOptions): Promise<T>;
}

export interface LLMOptions {
  maxRetries?: number;
  temperature?: number;
  model?: string;
}

export class LLMValidationError extends Error {
  constructor(
    public readonly attempts: number,
    public readonly lastError: unknown,
  ) {
    super(`LLM output failed schema validation after ${attempts} attempts`);
    this.name = "LLMValidationError";
  }
}
