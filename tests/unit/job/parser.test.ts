import { describe, it, expect, vi } from "vitest";
import { JobParser, detectAtsFromUrl } from "../../../packages/job/src/parser/JobParser.js";
import type { LLMClient } from "../../../packages/llm/src/LLMClient.js";

function mockLLM(returnValue: unknown): LLMClient {
  return { generate: vi.fn().mockResolvedValue(returnValue) };
}

const PARSED_JOB = {
  title: "Senior Software Engineer",
  company: "Acme Corp",
  description: "Build great software.",
  requirements: ["TypeScript", "5+ years experience"],
  atsType: "generic" as const,
};

describe("detectAtsFromUrl", () => {
  it("detects greenhouse", () => {
    expect(detectAtsFromUrl("https://boards.greenhouse.io/acme/jobs/123")).toBe("greenhouse");
  });
  it("detects lever", () => {
    expect(detectAtsFromUrl("https://jobs.lever.co/acme/abc-123")).toBe("lever");
  });
  it("detects workday", () => {
    expect(detectAtsFromUrl("https://acme.wd1.myworkdayjobs.com/jobs/1")).toBe("workday");
  });
  it("detects ashby", () => {
    expect(detectAtsFromUrl("https://jobs.ashbyhq.com/acme/xyz")).toBe("ashby");
  });
  it("returns null for unknown URLs", () => {
    expect(detectAtsFromUrl("https://careers.acme.com/jobs/1")).toBeNull();
  });
});

describe("JobParser", () => {
  it("parses a job posting and returns JobContext", async () => {
    const parser = new JobParser(mockLLM(PARSED_JOB));
    const result = await parser.parse("https://careers.acme.com/jobs/1", "<html>...</html>");

    expect(result.title).toBe("Senior Software Engineer");
    expect(result.company).toBe("Acme Corp");
    expect(result.atsType).toBe("generic");
    expect(result.url).toBe("https://careers.acme.com/jobs/1");
    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("overrides LLM atsType with URL-detected atsType", async () => {
    const parser = new JobParser(mockLLM({ ...PARSED_JOB, atsType: "generic" }));
    const result = await parser.parse(
      "https://boards.greenhouse.io/acme/jobs/123",
      "<html>...</html>",
    );
    // URL-based detection wins
    expect(result.atsType).toBe("greenhouse");
  });

  it("stores fetchedAt as a Date", async () => {
    const parser = new JobParser(mockLLM(PARSED_JOB));
    const result = await parser.parse("https://example.com/job", "<html/>");
    expect(result.fetchedAt).toBeInstanceOf(Date);
  });

  it("returns empty requirements array when none provided", async () => {
    const parser = new JobParser(mockLLM({ ...PARSED_JOB, requirements: [] }));
    const result = await parser.parse("https://example.com/job", "<html/>");
    expect(result.requirements).toEqual([]);
  });
});
