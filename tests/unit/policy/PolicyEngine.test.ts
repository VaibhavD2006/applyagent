import { describe, it, expect } from "vitest";
import { evaluatePolicy } from "../../../packages/policy/src/PolicyEngine.js";
import type { PolicyInput } from "../../../packages/policy/src/types.js";

function input(overrides: Partial<PolicyInput> = {}): PolicyInput {
  return {
    captchaDetected: false,
    classification: "GENERATED_ANSWER",
    confidence: 0.9,
    factualityValid: true,
    requiresApproval: false,
    ...overrides,
  };
}

describe("evaluatePolicy", () => {
  it("returns ALLOW for a valid high-confidence answer", () => {
    expect(evaluatePolicy(input()).decision).toBe("ALLOW");
  });

  it("returns STOP when captcha detected (highest priority)", () => {
    const r = evaluatePolicy(input({ captchaDetected: true }));
    expect(r.decision).toBe("STOP");
    expect(r.reason).toMatch(/captcha/i);
  });

  it("returns STOP for UNSUPPORTED classification", () => {
    const r = evaluatePolicy(input({ classification: "UNSUPPORTED" }));
    expect(r.decision).toBe("STOP");
  });

  it("captcha STOP takes priority over UNSUPPORTED", () => {
    const r = evaluatePolicy(input({ captchaDetected: true, classification: "UNSUPPORTED" }));
    expect(r.decision).toBe("STOP");
    expect(r.reason).toMatch(/captcha/i);
  });

  it("returns DENY when factuality check fails", () => {
    const r = evaluatePolicy(input({ factualityValid: false }));
    expect(r.decision).toBe("DENY");
  });

  it("returns REQUIRE_APPROVAL for SENSITIVE_APPROVAL classification", () => {
    const r = evaluatePolicy(input({ classification: "SENSITIVE_APPROVAL" }));
    expect(r.decision).toBe("REQUIRE_APPROVAL");
  });

  it("returns REQUIRE_APPROVAL for UNKNOWN classification", () => {
    const r = evaluatePolicy(input({ classification: "UNKNOWN" }));
    expect(r.decision).toBe("REQUIRE_APPROVAL");
  });

  it("returns REQUIRE_APPROVAL when confidence below threshold", () => {
    const r = evaluatePolicy(input({ confidence: 0.5 }));
    expect(r.decision).toBe("REQUIRE_APPROVAL");
    expect(r.reason).toMatch(/confidence/i);
  });

  it("returns REQUIRE_APPROVAL when generator flagged requiresApproval", () => {
    const r = evaluatePolicy(input({ requiresApproval: true }));
    expect(r.decision).toBe("REQUIRE_APPROVAL");
  });

  it("confidence at exactly threshold boundary is ALLOW", () => {
    expect(evaluatePolicy(input({ confidence: 0.7 })).decision).toBe("ALLOW");
  });

  it("confidence just below threshold is REQUIRE_APPROVAL", () => {
    expect(evaluatePolicy(input({ confidence: 0.699 })).decision).toBe("REQUIRE_APPROVAL");
  });
});
