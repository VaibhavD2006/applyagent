import type { BrowserHarness } from "@applyagent/browser";
import { mapFields } from "@applyagent/browser";
import type { JobContext } from "@applyagent/job";
import type { ATSAdapter, ApplicationPage, SubmitResult } from "./ATSAdapter.js";

/**
 * Greenhouse-specific adapter.
 * Greenhouse apps are at boards.greenhouse.io/<company>/jobs/<id>
 * The apply button navigates to a separate /application page.
 */
export class GreenhouseAdapter implements ATSAdapter {
  readonly atsType = "greenhouse";

  async openApplication(browser: BrowserHarness, job: JobContext): Promise<ApplicationPage> {
    await browser.navigate(job.url);

    // Click the "Apply for this job" button typical of Greenhouse postings
    try {
      await browser.click({ strategy: "css", value: "a#job-application-form, a.job-application-link, a[href*='/application']" });
    } catch {
      // Already on application page or button not found — continue with current page
    }

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
    // Greenhouse forms are typically single-page
    const snapshot = await browser.snapshot();
    return {
      formUrl: snapshot.url,
      fields: mapFields(snapshot.fields),
      isMultiStep: false,
      currentStep: 0,
    };
  }

  async submit(browser: BrowserHarness): Promise<SubmitResult> {
    try {
      // Greenhouse submit button
      await browser.click({ strategy: "css", value: "input[type=submit]#submit_app, button[type=submit]" });
      const snapshot = await browser.snapshot();
      const confirmed = await this.isConfirmationPage(browser);
      return {
        success: confirmed,
        confirmationText: confirmed ? snapshot.visibleText.slice(0, 200) : undefined,
        confirmationUrl: snapshot.url,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  async isConfirmationPage(browser: BrowserHarness): Promise<boolean> {
    const snapshot = await browser.snapshot();
    const lower = snapshot.visibleText.toLowerCase();
    return (
      lower.includes("thank you for applying") ||
      lower.includes("application submitted") ||
      lower.includes("we've received your application") ||
      snapshot.url.includes("/confirmation")
    );
  }
}
