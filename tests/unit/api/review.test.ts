import { describe, it, expect } from "vitest";
import {
  ApplicationStateMachine,
  InvalidTransitionError,
} from "../../../packages/agent/src/state-machine/ApplicationStateMachine.js";

/**
 * These tests verify the approval gate logic using the state machine directly.
 * The ReviewController relies on these same transitions — if the state machine
 * enforces them, the controller inherits the guarantee.
 */
describe("Approval gate — state machine enforcement", () => {
  it("cannot reach SUBMITTED without going through NEEDS_HUMAN_REVIEW and READY_TO_SUBMIT", () => {
    const sm = new ApplicationStateMachine("FORM_MAPPED");
    // Cannot skip straight to READY_TO_SUBMIT
    expect(() => sm.transition("READY_TO_SUBMIT")).toThrow(InvalidTransitionError);
    // Cannot skip straight to SUBMITTED
    expect(() => sm.transition("SUBMITTED")).toThrow(InvalidTransitionError);
  });

  it("requires NEEDS_HUMAN_REVIEW before READY_TO_SUBMIT", () => {
    const sm = new ApplicationStateMachine("FILLING");
    sm.transition("NEEDS_HUMAN_REVIEW");
    sm.transition("READY_TO_SUBMIT");
    expect(sm.current).toBe("READY_TO_SUBMIT");
  });

  it("can only submit from READY_TO_SUBMIT", () => {
    const sm = new ApplicationStateMachine("NEEDS_HUMAN_REVIEW");
    expect(() => sm.transition("SUBMITTED")).toThrow(InvalidTransitionError);
    sm.transition("READY_TO_SUBMIT");
    sm.transition("SUBMITTED");
    expect(sm.current).toBe("SUBMITTED");
  });

  it("idempotent: READY_TO_SUBMIT cannot transition to READY_TO_SUBMIT again", () => {
    const sm = new ApplicationStateMachine("READY_TO_SUBMIT");
    expect(() => sm.transition("READY_TO_SUBMIT")).toThrow(InvalidTransitionError);
  });

  it("rejected application moves to CANCELLED from NEEDS_HUMAN_REVIEW", () => {
    const sm = new ApplicationStateMachine("NEEDS_HUMAN_REVIEW");
    sm.transition("CANCELLED");
    expect(sm.current).toBe("CANCELLED");
    expect(sm.isTerminal).toBe(true);
  });

  it("cancelled application cannot be submitted", () => {
    const sm = new ApplicationStateMachine("CANCELLED");
    expect(() => sm.transition("SUBMITTED")).toThrow(InvalidTransitionError);
  });
});
