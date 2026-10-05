export type PolicyDecision = "ALLOW" | "DENY" | "REQUIRE_APPROVAL" | "STOP";

export interface PolicyInput {
  captchaDetected: boolean;
  classification: string;
  confidence: number;
  factualityValid: boolean;
  requiresApproval: boolean;
}

export interface PolicyResult {
  decision: PolicyDecision;
  reason: string;
}
