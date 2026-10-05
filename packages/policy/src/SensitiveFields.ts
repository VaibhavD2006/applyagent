/** Classifications that always require human approval */
export const APPROVAL_CLASSIFICATIONS = new Set([
  "SENSITIVE_APPROVAL",
  "UNKNOWN",
]);

/** Classifications that stop the agent entirely */
export const STOP_CLASSIFICATIONS = new Set([
  "UNSUPPORTED",
]);
