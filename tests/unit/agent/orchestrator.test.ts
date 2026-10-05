import { describe, it, expect, vi } from "vitest";
import { ApplicationOrchestrator } from "../../../packages/agent/src/orchestrator/ApplicationOrchestrator.js";
import type { LLMClient } from "../../../packages/llm/src/LLMClient.js";
import type { BrowserHarness, PageSnapshot } from "../../../packages/browser/src/types.js";
import type { CandidateProfile } from "../../../packages/candidate/src/profile/types.js";

// --- Fixtures ---

const CANDIDATE: CandidateProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  identity: { firstName: "Alice", lastName: "Smith" },
  contact: { email: "alice@example.com", phone: "+1-555-123-4567" },
  education: [
    { factId: "FACT-E001", institution: "MIT", degree: "BS", current: false, responsibilities: [] },
  ],
  experience: [
    {
      factId: "FACT-X001",
      company: "Acme",
      title: "SWE",
      startDate: "2022-01",
      current: true,
      responsibilities: ["Built things"],
    },
  ],
  projects: [],
  skills: [{ factId: "FACT-S001", name: "TypeScript" }],
  certifications: [],
  links: [],
  reusableAnswers: [],
};

const BASIC_SNAPSHOT: PageSnapshot = {
  url: "https://example.com/apply",
  title: "Apply for SWE",
  visibleText: "Software Engineer at Acme Corp. Apply below.",
  captchaDetected: false,
  takenAt: new Date(),
  fields: [
    { key: "first_name", label: "First Name", inputType: "text", required: true },
    { key: "last_name", label: "Last Name", inputType: "text", required: true },
    { key: "email", label: "Email Address", inputType: "email", required: true },
    {
      key: "why_us",
      label: "Why do you want to work here?",
      inputType: "textarea",
      required: false,
    },
  ],
};

const CAPTCHA_SNAPSHOT: PageSnapshot = {
  ...BASIC_SNAPSHOT,
  captchaDetected: true,
  visibleText: "Verify you are human — reCAPTCHA required",
};

const EMPTY_SNAPSHOT: PageSnapshot = { ...BASIC_SNAPSHOT, fields: [] };

function mockBrowser(snapshot: PageSnapshot): BrowserHarness {
  return {
    launch: vi.fn().mockResolvedValue(undefined),
    navigate: vi.fn().mockResolvedValue(undefined),
    snapshot: vi.fn().mockResolvedValue(snapshot),
    screenshot: vi.fn().mockResolvedValue(Buffer.alloc(0)),
    fill: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockResolvedValue(undefined),
    check: vi.fn().mockResolvedValue(undefined),
    click: vi.fn().mockResolvedValue(undefined),
    upload: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

function mockLLM(): LLMClient {
  return {
    generate: vi.fn().mockImplementation(async (_prompt: string, _schema: unknown) => {
      // Return appropriate mock depending on what's being requested
      const prompt = _prompt as string;
      if (prompt.includes("Extract job posting")) {
        return {
          title: "SWE",
          company: "Acme",
          description: "Build software.",
          requirements: [],
          atsType: "generic",
        };
      }
      if (prompt.includes("Classify this job application")) {
        return { classification: "GENERATED_ANSWER", confidence: 0.85, reason: "open ended" };
      }
      if (prompt.includes("helping a job candidate answer")) {
        return {
          answer: "I am passionate about Acme's mission.",
          factsUsed: ["FACT-X001"],
          confidence: 0.88,
          requiresApproval: false,
          reason: "grounded",
        };
      }
      return {};
    }),
  };
}

describe("ApplicationOrchestrator", () => {
  it("runs the full happy path and reaches NEEDS_HUMAN_REVIEW", async () => {
    const browser = mockBrowser(BASIC_SNAPSHOT);
    const llm = mockLLM();
    const orch = new ApplicationOrchestrator(llm, browser);

    const result = await orch.run("https://example.com/apply", CANDIDATE);

    expect(result.finalState).toBe("NEEDS_HUMAN_REVIEW");
    expect(result.error).toBeUndefined();
    expect(browser.launch).toHaveBeenCalledOnce();
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("fills deterministic fields (email, first/last name) without calling LLM", async () => {
    const browser = mockBrowser(BASIC_SNAPSHOT);
    const llm = mockLLM();
    const orch = new ApplicationOrchestrator(llm, browser);

    await orch.run("https://example.com/apply", CANDIDATE);

    // email, first name, last name should be filled deterministically
    const fillCalls = (browser.fill as ReturnType<typeof vi.fn>).mock.calls;
    const filledValues = fillCalls.map((c) => c[1]);
    expect(filledValues).toContain("alice@example.com");
    expect(filledValues).toContain("Alice");
    expect(filledValues).toContain("Smith");
  });

  it("stops immediately on CAPTCHA detection", async () => {
    const browser = mockBrowser(CAPTCHA_SNAPSHOT);
    const llm = mockLLM();
    const orch = new ApplicationOrchestrator(llm, browser);

    const result = await orch.run("https://example.com/apply", CANDIDATE);

    expect(result.finalState).toBe("BLOCKED_CAPTCHA");
    // Should NOT attempt to fill any fields
    expect(browser.fill).not.toHaveBeenCalled();
    // Browser must still be closed
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("stops as BLOCKED_UNSUPPORTED when no fields found", async () => {
    const browser = mockBrowser(EMPTY_SNAPSHOT);
    const llm = mockLLM();
    const orch = new ApplicationOrchestrator(llm, browser);

    const result = await orch.run("https://example.com/apply", CANDIDATE);

    expect(result.finalState).toBe("BLOCKED_UNSUPPORTED");
  });

  it("always closes the browser even on error", async () => {
    const browser = mockBrowser(BASIC_SNAPSHOT);
    (browser.navigate as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));
    const orch = new ApplicationOrchestrator(mockLLM(), browser);

    const result = await orch.run("https://example.com/apply", CANDIDATE);

    expect(result.finalState).toBe("FAILED");
    expect(result.error).toContain("Network error");
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("queues sensitive fields for human approval instead of filling", async () => {
    const snapshot: PageSnapshot = {
      ...BASIC_SNAPSHOT,
      fields: [
        { key: "veteran", label: "Are you a veteran?", inputType: "text", required: false },
        { key: "email", label: "Email", inputType: "email", required: true },
      ],
    };
    const browser = mockBrowser(snapshot);
    const orch = new ApplicationOrchestrator(mockLLM(), browser);

    const result = await orch.run("https://example.com/apply", CANDIDATE);

    expect(result.pendingApprovals.some((p) => p.label.includes("veteran"))).toBe(true);
    // Email should still be filled
    const fillCalls = (browser.fill as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[1]);
    expect(fillCalls).toContain("alice@example.com");
  });
});
