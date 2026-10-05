import { describe, it, expect, vi } from "vitest";
import type { LLMClient } from "../../../packages/llm/src/LLMClient.js";
import { LLMExtractor } from "../../../packages/candidate/src/resume/LLMExtractor.js";
import { LLMValidationError } from "../../../packages/llm/src/LLMClient.js";
import { retryWithValidation } from "../../../packages/llm/src/structured-output/retryWithValidation.js";
import { z } from "zod";

// --- Mock LLMClient factory ---
function mockLLM(returnValue: unknown): LLMClient {
  return {
    generate: vi.fn().mockResolvedValue(returnValue),
  };
}

const SAMPLE_RESUME = `
Alice Smith
alice@example.com | (555) 123-4567

EDUCATION
MIT — BS Computer Science, 2018-2022

EXPERIENCE
Acme Corp — Senior Software Engineer, Jun 2022 – Present
- Built microservices in TypeScript
- Led team of 4 engineers

SKILLS
TypeScript, React, PostgreSQL

LINKS
https://github.com/alice
https://linkedin.com/in/alice
`;

describe("LLMExtractor", () => {
  it("returns a draft with extracted identity and contact", async () => {
    const llm = mockLLM({
      identity: { firstName: "Alice", lastName: "Smith" },
      contact: { email: "alice@example.com", phone: "(555) 123-4567" },
      education: [],
      experience: [],
      skills: [],
    });
    const extractor = new LLMExtractor(llm);
    const draft = await extractor.extract(SAMPLE_RESUME);

    expect(draft.identity.firstName).toBe("Alice");
    expect(draft.identity.lastName).toBe("Smith");
    expect(draft.contact.email).toBe("alice@example.com");
    expect(draft.resumeText).toBe(SAMPLE_RESUME);
  });

  it("assigns factIds to education entries", async () => {
    const llm = mockLLM({
      identity: { firstName: "Alice", lastName: "Smith" },
      contact: { email: "alice@example.com" },
      education: [{ institution: "MIT", degree: "BS", field: "CS", current: false }],
      experience: [],
    });
    const extractor = new LLMExtractor(llm);
    const draft = await extractor.extract(SAMPLE_RESUME);

    expect(draft.education?.[0]?.factId).toMatch(/^FACT-E\d{3}$/);
  });

  it("assigns factIds to experience entries", async () => {
    const llm = mockLLM({
      identity: { firstName: "Alice", lastName: "Smith" },
      contact: { email: "alice@example.com" },
      experience: [
        {
          company: "Acme Corp",
          title: "Senior SWE",
          startDate: "2022-06",
          current: true,
          responsibilities: ["Built things"],
        },
      ],
    });
    const extractor = new LLMExtractor(llm);
    const draft = await extractor.extract(SAMPLE_RESUME);

    expect(draft.experience?.[0]?.factId).toMatch(/^FACT-X\d{3}$/);
  });

  it("stores raw resume text on the draft", async () => {
    const llm = mockLLM({
      identity: { firstName: "Alice", lastName: "Smith" },
      contact: { email: "alice@example.com" },
    });
    const extractor = new LLMExtractor(llm);
    const draft = await extractor.extract("raw resume content");
    expect(draft.resumeText).toBe("raw resume content");
  });

  it("propagates LLMValidationError when LLM repeatedly returns invalid output", async () => {
    const llm: LLMClient = {
      generate: vi.fn().mockRejectedValue(new LLMValidationError(3, new Error("bad json"))),
    };
    const extractor = new LLMExtractor(llm);
    await expect(extractor.extract(SAMPLE_RESUME)).rejects.toThrow(LLMValidationError);
  });
});

describe("retryWithValidation", () => {
  const schema = z.object({ name: z.string() });

  it("returns parsed value on first success", async () => {
    const result = await retryWithValidation(async () => JSON.stringify({ name: "Alice" }), schema);
    expect(result.name).toBe("Alice");
  });

  it("strips markdown code fences before parsing", async () => {
    const result = await retryWithValidation(async () => '```json\n{"name":"Bob"}\n```', schema);
    expect(result.name).toBe("Bob");
  });

  it("retries on invalid JSON and succeeds on second attempt", async () => {
    let attempt = 0;
    const result = await retryWithValidation(async () => {
      attempt++;
      return attempt === 1 ? "not json" : JSON.stringify({ name: "Carol" });
    }, schema);
    expect(result.name).toBe("Carol");
    expect(attempt).toBe(2);
  });

  it("throws LLMValidationError after all retries fail", async () => {
    await expect(retryWithValidation(async () => "not json at all", schema, 2)).rejects.toThrow(
      LLMValidationError,
    );
  });

  it("throws LLMValidationError when schema validation always fails", async () => {
    await expect(
      retryWithValidation(async () => JSON.stringify({ wrong: "field" }), schema, 2),
    ).rejects.toThrow(LLMValidationError);
  });
});
