import { describe, it, expect } from "vitest";
import {
  ApplicationStateMachine,
  InvalidTransitionError,
  TERMINAL_STATES,
} from "../../../packages/agent/src/state-machine/ApplicationStateMachine.js";

describe("ApplicationStateMachine — valid transitions", () => {
  it("starts in CREATED state", () => {
    expect(new ApplicationStateMachine().current).toBe("CREATED");
  });

  it("follows the happy path to SUBMITTED", () => {
    const sm = new ApplicationStateMachine();
    const path = [
      "JOB_LOADED",
      "APPLICATION_OPEN",
      "FORM_DISCOVERED",
      "FORM_MAPPED",
      "FILLING",
      "NEEDS_HUMAN_REVIEW",
      "READY_TO_SUBMIT",
      "SUBMITTED",
    ] as const;
    for (const state of path) {
      sm.transition(state);
      expect(sm.current).toBe(state);
    }
  });

  it("can reach VERIFIED after SUBMITTED", () => {
    const sm = new ApplicationStateMachine("SUBMITTED");
    sm.transition("VERIFIED");
    expect(sm.current).toBe("VERIFIED");
  });

  it("can reach BLOCKED_CAPTCHA from APPLICATION_OPEN", () => {
    const sm = new ApplicationStateMachine("APPLICATION_OPEN");
    sm.transition("BLOCKED_CAPTCHA");
    expect(sm.current).toBe("BLOCKED_CAPTCHA");
  });

  it("can cancel from any non-terminal state", () => {
    const cancelableStates = [
      "CREATED",
      "JOB_LOADED",
      "APPLICATION_OPEN",
      "FORM_DISCOVERED",
      "FORM_MAPPED",
      "FILLING",
      "NEEDS_HUMAN_REVIEW",
      "READY_TO_SUBMIT",
    ] as const;
    for (const s of cancelableStates) {
      const sm = new ApplicationStateMachine(s);
      sm.transition("CANCELLED");
      expect(sm.current).toBe("CANCELLED");
    }
  });
});

describe("ApplicationStateMachine — invalid transitions", () => {
  it("throws InvalidTransitionError for illegal transition", () => {
    const sm = new ApplicationStateMachine("CREATED");
    expect(() => sm.transition("SUBMITTED")).toThrow(InvalidTransitionError);
  });

  it("cannot skip NEEDS_HUMAN_REVIEW — FORM_MAPPED cannot go directly to READY_TO_SUBMIT", () => {
    const sm = new ApplicationStateMachine("FORM_MAPPED");
    expect(() => sm.transition("READY_TO_SUBMIT")).toThrow(InvalidTransitionError);
  });

  it("cannot go from FILLING directly to SUBMITTED", () => {
    const sm = new ApplicationStateMachine("FILLING");
    expect(() => sm.transition("SUBMITTED")).toThrow(InvalidTransitionError);
  });

  it("cannot transition from terminal SUBMITTED to FILLING", () => {
    const sm = new ApplicationStateMachine("SUBMITTED");
    sm.transition("VERIFIED");
    expect(() => sm.transition("FILLING")).toThrow(InvalidTransitionError);
  });
});

describe("ApplicationStateMachine — terminal states", () => {
  it("isTerminal is false for CREATED", () => {
    expect(new ApplicationStateMachine("CREATED").isTerminal).toBe(false);
  });

  it("isTerminal is true for all terminal states", () => {
    for (const s of TERMINAL_STATES) {
      expect(new ApplicationStateMachine(s).isTerminal).toBe(true);
    }
  });

  it("canTransition returns false from terminal state", () => {
    const sm = new ApplicationStateMachine("CANCELLED");
    expect(sm.canTransition("CREATED")).toBe(false);
  });
});
