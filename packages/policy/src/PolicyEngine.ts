import { APPROVAL_CLASSIFICATIONS, STOP_CLASSIFICATIONS } from "./SensitiveFields.js";
import type { PolicyDecision, PolicyInput, PolicyResult } from "./types.js";

const CONFIDENCE_THRESHOLD = 0.7;

/**
 * Deterministic policy engine — no LLM, no side effects.
 * Evaluates a PolicyInput and returns a PolicyDecision.
 * Rules are ordered: STOP > DENY > REQUIRE_APPROVAL > ALLOW.
 */
export function evaluatePolicy(input: PolicyInput): PolicyResult {
  // 1. CAPTCHA always stops
  if (input.captchaDetected) {
    return { decision: "STOP", reason: "CAPTCHA detected — requires human intervention" };
  }

  // 2. UNSUPPORTED classification stops
  if (STOP_CLASSIFICATIONS.has(input.classification)) {
    return { decision: "STOP", reason: `Classification ${input.classification} cannot be handled automatically` };
  }

  // 3. Invalid factuality — deny the answer
  if (!input.factualityValid) {
    return { decision: "DENY", reason: "Answer failed factuality validation — contains unsupported claims" };
  }

  // 4. Sensitive or unknown classifications require approval
  if (APPROVAL_CLASSIFICATIONS.has(input.classification)) {
    return { decision: "REQUIRE_APPROVAL", reason: `Classification ${input.classification} requires human approval` };
  }

  // 5. Low confidence requires approval
  if (input.confidence < CONFIDENCE_THRESHOLD) {
    return {
      decision: "REQUIRE_APPROVAL",
      reason: `Confidence ${input.confidence.toFixed(2)} below threshold ${CONFIDENCE_THRESHOLD}`,
    };
  }

  // 6. Generator flagged approval
  if (input.requiresApproval) {
    return { decision: "REQUIRE_APPROVAL", reason: "Answer generator flagged this for human review" };
  }

  return { decision: "ALLOW", reason: "All policy checks passed" };
}

export type { PolicyDecision, PolicyInput, PolicyResult };
