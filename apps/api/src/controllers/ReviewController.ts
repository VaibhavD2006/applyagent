import { randomUUID } from "crypto";
import { ApplicationRepository } from "@applyagent/agent/state-machine/ApplicationRepository.js";
import { ApplicationStateMachine } from "@applyagent/agent/state-machine/ApplicationStateMachine.js";

const repo = new ApplicationRepository();

export class ReviewController {
  async getReview(id: string) {
    const app = await repo.getById(id);
    if (!app) return null;
    return {
      id: app.id,
      state: app.state,
      jobUrl: app.jobUrl,
      jobContext: app.jobContext,
      approved: app.state === "READY_TO_SUBMIT" || app.state === "SUBMITTED",
      approvalToken: app.approvalToken,
    };
  }

  async approve(id: string) {
    const app = await repo.getById(id);
    if (!app) return null;

    // Idempotent: already approved
    if (app.state === "READY_TO_SUBMIT" || app.approvalToken) {
      return { id, approved: true, approvalToken: app.approvalToken };
    }

    if (app.state !== "NEEDS_HUMAN_REVIEW") {
      return { id, approved: false, error: `Cannot approve from state ${app.state}` };
    }

    const sm = new ApplicationStateMachine(app.state);
    sm.transition("READY_TO_SUBMIT");

    const approvalToken = randomUUID();
    await repo.updateState(id, "READY_TO_SUBMIT", { approvalToken });
    return { id, approved: true, approvalToken };
  }

  async reject(id: string) {
    const app = await repo.getById(id);
    if (!app) return null;

    const sm = new ApplicationStateMachine(app.state);
    if (!sm.canTransition("CANCELLED")) {
      return { id, cancelled: false, error: `Cannot cancel from state ${app.state}` };
    }

    await repo.updateState(id, "CANCELLED");
    return { id, cancelled: true };
  }
}
