import { describe, it, expect } from "vitest";
import { validateFactuality } from "../../../packages/answer-engine/src/validator/FactualityValidator.js";
import type { GeneratedAnswer } from "../../../packages/answer-engine/src/generator/AnswerGenerator.js";
import type { CandidateProfile } from "../../../packages/candidate/src/profile/types.js";

const PROFILE: CandidateProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  identity: { firstName: "Alice", lastName: "Smith" },
  contact: { email: "alice@example.com" },
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

function answer(overrides: Partial<GeneratedAnswer>): GeneratedAnswer {
  return {
    answer: "I have experience with TypeScript.",
    factsUsed: ["FACT-S001"],
    confidence: 0.9,
    requiresApproval: false,
    reason: "Grounded in skills",
    ...overrides,
  };
}

describe("validateFactuality", () => {
  it("passes valid answer citing existing fact", () => {
    const r = validateFactuality(answer({ factsUsed: ["FACT-S001"] }), PROFILE);
    expect(r.valid).toBe(true);
    expect(r.violations).toHaveLength(0);
  });

  it("passes answer citing standard FACT-001 through FACT-016", () => {
    const r = validateFactuality(answer({ factsUsed: ["FACT-001", "FACT-005"] }), PROFILE);
    expect(r.valid).toBe(true);
  });

  it("passes answer citing experience factId", () => {
    const r = validateFactuality(answer({ factsUsed: ["FACT-X001"] }), PROFILE);
    expect(r.valid).toBe(true);
  });

  it("fails when factsUsed is empty", () => {
    const r = validateFactuality(answer({ factsUsed: [] }), PROFILE);
    expect(r.valid).toBe(false);
    expect(r.violations[0]).toMatch(/no facts/i);
  });

  it("fails when factId does not exist in profile", () => {
    const r = validateFactuality(answer({ factsUsed: ["FACT-Z999"] }), PROFILE);
    expect(r.valid).toBe(false);
    expect(r.violations.some((v) => v.includes("FACT-Z999"))).toBe(true);
  });

  it("reports all invalid fact IDs in violations", () => {
    const r = validateFactuality(answer({ factsUsed: ["FACT-Z001", "FACT-Z002"] }), PROFILE);
    expect(r.valid).toBe(false);
    expect(r.violations).toHaveLength(2);
  });
});
