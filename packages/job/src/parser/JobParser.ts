import { z } from "zod";
import type { LLMClient } from "@applyagent/llm";
import { AtsTypeSchema, type AtsType, type JobContext } from "../schema.js";
import { randomUUID } from "crypto";

const ParsedJobSchema = z.object({
  title: z.string(),
  company: z.string(),
  description: z.string(),
  requirements: z.array(z.string()).default([]),
  atsType: AtsTypeSchema,
});

export class JobParser {
  constructor(private readonly llm: LLMClient) {}

  async parse(url: string, rawHtml: string): Promise<JobContext> {
    // Detect ATS from URL first — deterministic, no LLM needed
    const atsType = detectAtsFromUrl(url);

    const prompt = buildParsePrompt(rawHtml, url);
    const parsed = await this.llm.generate(prompt, ParsedJobSchema);

    return {
      id: randomUUID(),
      url,
      title: parsed.title,
      company: parsed.company,
      description: parsed.description,
      requirements: parsed.requirements,
      // Trust URL-based detection over LLM for ATS type
      atsType: atsType ?? parsed.atsType,
      rawHtml,
      fetchedAt: new Date(),
    };
  }
}

export function detectAtsFromUrl(url: string): AtsType | null {
  const lower = url.toLowerCase();
  if (lower.includes("greenhouse.io") || lower.includes("boards.greenhouse")) return "greenhouse";
  if (lower.includes("lever.co") || lower.includes("jobs.lever")) return "lever";
  if (lower.includes("workday.com") || lower.includes("myworkdayjobs")) return "workday";
  if (lower.includes("ashbyhq.com") || lower.includes("jobs.ashbyhq")) return "ashby";
  return null;
}

function buildParsePrompt(rawHtml: string, url: string): string {
  // Strip HTML tags for a cleaner LLM input
  const text = rawHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 8000);

  return `Extract job posting information from the text below.

URL: ${url}

RULES:
- Only extract what is explicitly stated.
- For atsType: detect from URL patterns (greenhouse/lever/workday/ashby) or use "generic".
- Return ONLY valid JSON, no explanation.

SCHEMA:
{
  "title": string,
  "company": string,
  "description": string (summary, max 500 chars),
  "requirements": string[] (key requirements, max 10),
  "atsType": "greenhouse" | "lever" | "workday" | "ashby" | "generic"
}

JOB POSTING TEXT:
${text}`;
}
