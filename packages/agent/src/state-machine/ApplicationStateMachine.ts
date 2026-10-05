export const ApplicationStateSchema = [
  "CREATED",
  "JOB_LOADED",
  "APPLICATION_OPEN",
  "FORM_DISCOVERED",
  "FORM_MAPPED",
  "FILLING",
  "NEEDS_HUMAN_REVIEW",
  "READY_TO_SUBMIT",
  "SUBMITTED",
  "VERIFIED",
  "BLOCKED_CAPTCHA",
  "BLOCKED_UNSUPPORTED",
  "FAILED",
  "CANCELLED",
] as const;

export type ApplicationState = (typeof ApplicationStateSchema)[number];

/** Terminal states — no further transitions allowed */
const TERMINAL_STATES = new Set<ApplicationState>([
  "SUBMITTED",
  "VERIFIED",
  "BLOCKED_CAPTCHA",
  "BLOCKED_UNSUPPORTED",
  "FAILED",
  "CANCELLED",
]);

/** Valid transitions: from → allowed next states */
const TRANSITIONS: Record<ApplicationState, ApplicationState[]> = {
  CREATED: ["JOB_LOADED", "CANCELLED", "FAILED"],
  JOB_LOADED: ["APPLICATION_OPEN", "CANCELLED", "FAILED"],
  APPLICATION_OPEN: ["FORM_DISCOVERED", "BLOCKED_CAPTCHA", "BLOCKED_UNSUPPORTED", "FAILED", "CANCELLED"],
  FORM_DISCOVERED: ["FORM_MAPPED", "BLOCKED_UNSUPPORTED", "FAILED", "CANCELLED"],
  FORM_MAPPED: ["FILLING", "NEEDS_HUMAN_REVIEW", "FAILED", "CANCELLED"],
  FILLING: ["NEEDS_HUMAN_REVIEW", "FAILED", "CANCELLED"],
  NEEDS_HUMAN_REVIEW: ["READY_TO_SUBMIT", "CANCELLED"],
  READY_TO_SUBMIT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["VERIFIED", "FAILED"],
  // Terminal states have no further transitions
  VERIFIED: [],
  BLOCKED_CAPTCHA: [],
  BLOCKED_UNSUPPORTED: [],
  FAILED: [],
  CANCELLED: [],
};

export class InvalidTransitionError extends Error {
  constructor(from: ApplicationState, to: ApplicationState) {
    super(`Invalid state transition: ${from} → ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export class ApplicationStateMachine {
  private state: ApplicationState;

  constructor(initialState: ApplicationState = "CREATED") {
    this.state = initialState;
  }

  get current(): ApplicationState {
    return this.state;
  }

  get isTerminal(): boolean {
    return TERMINAL_STATES.has(this.state);
  }

  transition(to: ApplicationState): void {
    const allowed = TRANSITIONS[this.state];
    if (!allowed.includes(to)) {
      throw new InvalidTransitionError(this.state, to);
    }
    this.state = to;
  }

  canTransition(to: ApplicationState): boolean {
    return TRANSITIONS[this.state]?.includes(to) ?? false;
  }
}

export { TERMINAL_STATES, TRANSITIONS };
