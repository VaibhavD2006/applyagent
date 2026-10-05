import type { LLMClient } from "@applyagent/llm";
import type { CandidateProfile } from "@applyagent/candidate";
import type { BrowserHarness, FormField } from "@applyagent/browser";
import { mapFields } from "@applyagent/browser";
import { JobParser } from "@applyagent/job";
import {
  deterministicMap,
  QuestionClassifier,
  AnswerGenerator,
  validateFactuality,
} from "@applyagent/answer-engine";
import { evaluatePolicy } from "@applyagent/policy";
import { ApplicationStateMachine } from "../state-machine/ApplicationStateMachine.js";
import type { ApplicationState } from "../state-machine/ApplicationStateMachine.js";

export interface OrchestratorResult {
  applicationId: string;
  finalState: ApplicationState;
  fieldsProcessed: number;
  pendingApprovals: PendingApproval[];
  error?: string;
}

export interface PendingApproval {
  fieldId: string;
  label: string;
  proposedAnswer: string;
  reason: string;
}

export interface OrchestratorOptions {
  maxSteps?: number;
  maxRuntimeMs?: number;
}

export class ApplicationOrchestrator {
  private readonly classifier: QuestionClassifier;
  private readonly generator: AnswerGenerator;
  private readonly jobParser: JobParser;

  constructor(
    private readonly llm: LLMClient,
    private readonly browser: BrowserHarness,
  ) {
    this.classifier = new QuestionClassifier(llm);
    this.generator = new AnswerGenerator(llm);
    this.jobParser = new JobParser(llm);
  }

  async run(
    jobUrl: string,
    candidate: CandidateProfile,
    opts: OrchestratorOptions = {},
  ): Promise<OrchestratorResult> {
    const { maxSteps = 100, maxRuntimeMs = 20 * 60 * 1000 } = opts;
    const startedAt = Date.now();
    const applicationId = `app_${Date.now()}`;
    const sm = new ApplicationStateMachine();
    const pendingApprovals: PendingApproval[] = [];
    let steps = 0;

    const checkLimits = () => {
      if (++steps > maxSteps) throw new Error(`Exceeded maxSteps (${maxSteps})`);
      if (Date.now() - startedAt > maxRuntimeMs) throw new Error("Exceeded maxRuntimeMs");
    };

    try {
      // 1. Launch browser and navigate
      await this.browser.launch();
      sm.transition("JOB_LOADED");
      checkLimits();

      await this.browser.navigate(jobUrl);
      sm.transition("APPLICATION_OPEN");
      checkLimits();

      // 2. Snapshot — check for CAPTCHA immediately
      const snapshot = await this.browser.snapshot();
      if (snapshot.captchaDetected) {
        sm.transition("BLOCKED_CAPTCHA");
        return { applicationId, finalState: sm.current, fieldsProcessed: 0, pendingApprovals };
      }

      // 3. Discover form fields
      sm.transition("FORM_DISCOVERED");
      const fields: FormField[] = mapFields(snapshot.fields);

      if (fields.length === 0) {
        sm.transition("BLOCKED_UNSUPPORTED");
        return { applicationId, finalState: sm.current, fieldsProcessed: 0, pendingApprovals };
      }

      // 4. Parse job context from page
      const jobContext = await this.jobParser.parse(jobUrl, snapshot.visibleText);
      sm.transition("FORM_MAPPED");
      checkLimits();

      // 5. Process each field
      sm.transition("FILLING");
      let fieldsProcessed = 0;

      for (const field of fields) {
        checkLimits();

        // Skip file uploads — handled separately
        if (field.type === "file") continue;

        // 5a. Try deterministic mapping first (no LLM)
        const direct = deterministicMap(field.label, candidate);
        if (direct) {
          await this.browser.fill(field.locator, direct.value);
          fieldsProcessed++;
          continue;
        }

        // 5b. Classify question with LLM
        const classification = await this.classifier.classify(field.label, field.context);
        checkLimits();

        // 5c. Policy check on classification alone (before generating answer)
        const prePolicy = evaluatePolicy({
          captchaDetected: false,
          classification: classification.classification,
          confidence: classification.confidence,
          factualityValid: true,
          requiresApproval: false,
        });

        if (prePolicy.decision === "STOP") {
          sm.transition("BLOCKED_UNSUPPORTED");
          return { applicationId, finalState: sm.current, fieldsProcessed, pendingApprovals };
        }

        if (prePolicy.decision === "REQUIRE_APPROVAL") {
          pendingApprovals.push({
            fieldId: field.id,
            label: field.label,
            proposedAnswer: "",
            reason: prePolicy.reason,
          });
          continue;
        }

        // 5d. Generate answer
        const generated = await this.generator.generate(field.label, candidate, jobContext);
        checkLimits();

        // 5e. Validate factuality
        const factuality = validateFactuality(generated, candidate);

        // 5f. Final policy decision
        const policy = evaluatePolicy({
          captchaDetected: false,
          classification: classification.classification,
          confidence: generated.confidence,
          factualityValid: factuality.valid,
          requiresApproval: generated.requiresApproval,
        });

        if (policy.decision === "STOP") {
          sm.transition("BLOCKED_UNSUPPORTED");
          return { applicationId, finalState: sm.current, fieldsProcessed, pendingApprovals };
        }

        if (policy.decision === "DENY") {
          // Skip this field — don't fill with invalid answer
          continue;
        }

        if (policy.decision === "REQUIRE_APPROVAL") {
          pendingApprovals.push({
            fieldId: field.id,
            label: field.label,
            proposedAnswer: generated.answer,
            reason: policy.reason,
          });
          continue;
        }

        // ALLOW — fill the field
        await this.browser.fill(field.locator, generated.answer);
        fieldsProcessed++;
      }

      // 6. Always transition through human review — never skip
      sm.transition("NEEDS_HUMAN_REVIEW");
      return { applicationId, finalState: sm.current, fieldsProcessed, pendingApprovals };
    } catch (err) {
      if (!sm.isTerminal) {
        try { sm.transition("FAILED"); } catch { /* already in bad state */ }
      }
      return {
        applicationId,
        finalState: sm.current,
        fieldsProcessed: 0,
        pendingApprovals,
        error: err instanceof Error ? err.message : String(err),
      };
    } finally {
      await this.browser.close();
    }
  }
}
