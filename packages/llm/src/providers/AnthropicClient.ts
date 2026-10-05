import type { ZodSchema } from "zod";
import type { LLMClient, LLMOptions } from "../LLMClient.js";
import { retryWithValidation } from "../structured-output/retryWithValidation.js";

export class AnthropicClient implements LLMClient {
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(apiKey?: string, defaultModel = "claude-sonnet-4-6") {
    this.apiKey = apiKey ?? process.env["LLM_API_KEY"] ?? "";
    if (!this.apiKey) throw new Error("LLM_API_KEY is required for AnthropicClient");
    this.defaultModel = defaultModel;
  }

  async generate<T>(prompt: string, schema: ZodSchema<T>, options: LLMOptions = {}): Promise<T> {
    const { maxRetries = 3, temperature = 0.2, model = this.defaultModel } = options;

    return retryWithValidation(
      async () => {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model,
            max_tokens: 4096,
            temperature,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`Anthropic API error ${response.status}: ${body}`);
        }

        const data = (await response.json()) as { content: Array<{ type: string; text: string }> };
        const text = data.content.find((b) => b.type === "text")?.text ?? "";
        return text;
      },
      schema,
      maxRetries,
    );
  }
}
