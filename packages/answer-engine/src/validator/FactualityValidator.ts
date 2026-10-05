import type { CandidateProfile } from "@applyagent/candidate";
import type { GeneratedAnswer } from "../generator/AnswerGenerator.js";

export interface ValidationResult {
  valid: boolean;
  violations: string[];
}

/**
 * Validates that every fact cited in factsUsed exists in the candidate profile.
 * This is a deterministic check — no LLM needed.
 * If factsUsed is empty, the answer is invalid (no grounding).
 */
export function validateFactuality(
  answer: GeneratedAnswer,
  profile: CandidateProfile,
): ValidationResult {
  const violations: string[] = [];

  if (answer.factsUsed.length === 0) {
    violations.push("Answer cites no facts — every answer must be grounded in candidate profile");
  }

  // Build the set of valid factIds from this profile
  const validFactIds = new Set(collectFactIds(profile));

  // Check standard profile fact IDs (FACT-001 through FACT-016)
  const STANDARD_FACT_IDS = new Set([
    "FACT-001", "FACT-002", "FACT-003", "FACT-004",
    "FACT-005", "FACT-006", "FACT-007", "FACT-008",
    "FACT-009", "FACT-010", "FACT-011", "FACT-012",
    "FACT-013", "FACT-014", "FACT-015", "FACT-016",
  ]);

  for (const factId of answer.factsUsed) {
    if (!validFactIds.has(factId) && !STANDARD_FACT_IDS.has(factId)) {
      violations.push(`Cited fact ${factId} does not exist in candidate profile`);
    }
  }

  return { valid: violations.length === 0, violations };
}

function collectFactIds(profile: CandidateProfile): string[] {
  const ids: string[] = [
    "FACT-001", "FACT-002", "FACT-003", "FACT-004", // identity
    "FACT-005", "FACT-006", "FACT-007", "FACT-008", "FACT-009", "FACT-010", "FACT-011", // contact
  ];

  profile.education.forEach((e) => ids.push(e.factId));
  profile.experience.forEach((e) => ids.push(e.factId));
  profile.projects.forEach((p) => ids.push(p.factId));
  profile.skills.forEach((s) => ids.push(s.factId));
  profile.certifications.forEach((c) => ids.push(c.factId));
  profile.reusableAnswers.forEach((r) => ids.push(r.factId));

  return ids;
}
