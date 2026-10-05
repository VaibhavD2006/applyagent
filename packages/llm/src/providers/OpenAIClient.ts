import type { ZodSchema } from "zod";
import type { LLMClient, LLMOptions } from "../LLMClient.js";
import { retryWithValidation } from "../structured-output/retryWithValidation.js";

export class OpenAIClient implements LLMClient {
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(apiKey?: string, defaultModel = "gpt-4o") {
    this.apiKey = apiKey ?? process.env["LLM_API_KEY"] ?? "";
    if (!this.apiKey) throw new Error("LLM_API_KEY is required for OpenAIClient");
    this.defaultModel = defaultModel;
  }

  async generate<T>(prompt: string, schema: ZodSchema<T>, options: LLMOptions = {}): Promise<T> {
    const { maxRetries = 3, temperature = 0.2, model = this.defaultModel } = options;

    return retryWithValidation(
      async () => {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model,
            temperature,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`OpenAI API error ${response.status}: ${body}`);
        }

        const data = (await response.json()) as {
          choices: Array<{ message: { content: string } }>;
        };
        return data.choices[0]?.message?.content ?? "";
      },
      schema,
      maxRetries,
    );
  }
}
