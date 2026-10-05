import type { LLMClient } from "@applyagent/llm";
import { JobParser } from "../parser/JobParser.js";
import type { JobContext } from "../schema.js";

export class JobIngester {
  private readonly parser: JobParser;

  constructor(llm: LLMClient) {
    this.parser = new JobParser(llm);
  }

  /**
   * Fetches a job posting URL and returns a structured JobContext.
   * Uses Node's built-in fetch — no Playwright needed for initial fetch.
   */
  async ingest(url: string): Promise<JobContext> {
    const rawHtml = await this.fetchHtml(url);
    return this.parser.parse(url, rawHtml);
  }

  private async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ApplyAgent/1.0; +https://github.com/applyagent)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch job URL ${url}: HTTP ${response.status}`);
    }
    return response.text();
  }
}
