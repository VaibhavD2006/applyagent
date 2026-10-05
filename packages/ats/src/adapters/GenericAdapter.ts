import type { BrowserHarness } from "@applyagent/browser";
import { mapFields } from "@applyagent/browser";
import type { JobContext } from "@applyagent/job";
import type { ATSAdapter, ApplicationPage, SubmitResult } from "./ATSAdapter.js";

const CONFIRMATION_SIGNALS = [
  "application submitted",
  "thank you for applying",
  "we received your application",
  "application received",
  "successfully submitted",
  "application complete",
];

export class GenericAdapter implements ATSAdapter {
  readonly atsType = "generic";

  async openApplication(browser: BrowserHarness, job: JobContext): Promise<ApplicationPage> {
    await browser.navigate(job.url);
    const snapshot = await browser.snapshot();
    const fields = mapFields(snapshot.fields);

    return {
      formUrl: snapshot.url,
      fields,
      isMultiStep: false,
      currentStep: 0,
    };
  }

  async nextStep(browser: BrowserHarness): Promise<ApplicationPage> {
    // Generic: try clicking common "Next" / "Continue" buttons
    const nextLabels = ["Next", "Continue", "Next Step", "Proceed"];
    for (const label of nextLabels) {
      try {
        await browser.click({ strategy: "text", value: label });
        const snapshot = await browser.snapshot();
        return {
          formUrl: snapshot.url,
          fields: mapFields(snapshot.fields),
          isMultiStep: true,
          currentStep: 1,
        };
      } catch {
        // try next label
      }
    }
    throw new Error("Could not find Next/Continue button on generic form");
  }

  async submit(browser: BrowserHarness): Promise<SubmitResult> {
    const submitLabels = ["Submit", "Submit Application", "Apply", "Send Application"];
    for (const label of submitLabels) {
      try {
        await browser.click({ strategy: "role", role: "button", value: label });
        const snapshot = await browser.snapshot();
        const confirmed = await this.isConfirmationPage(browser);
        return {
          success: confirmed,
          confirmationText: confirmed ? snapshot.visibleText.slice(0, 200) : undefined,
          confirmationUrl: snapshot.url,
        };
      } catch {
        // try next
      }
    }
    return { success: false, error: "Could not find Submit button" };
  }

  async isConfirmationPage(browser: BrowserHarness): Promise<boolean> {
    const snapshot = await browser.snapshot();
    const lower = snapshot.visibleText.toLowerCase();
    return CONFIRMATION_SIGNALS.some((s) => lower.includes(s));
  }
}
