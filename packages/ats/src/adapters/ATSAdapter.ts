import type { BrowserHarness, FormField } from "@applyagent/browser";
import type { JobContext } from "@applyagent/job";

export interface ApplicationPage {
  /** URL of the actual form page (may differ from job posting URL) */
  formUrl: string;
  /** All fields discovered on the form */
  fields: FormField[];
  /** Whether this is a multi-step form */
  isMultiStep: boolean;
  /** Current step index (0-based) */
  currentStep: number;
  /** Total steps if known */
  totalSteps?: number;
}

export interface SubmitResult {
  success: boolean;
  confirmationText?: string;
  confirmationUrl?: string;
  error?: string;
}

/**
 * ATS-specific adapter that knows how to:
 * 1. Navigate from a job posting URL to the actual application form
 * 2. Discover form fields with ATS-specific selectors
 * 3. Submit the completed form
 * 4. Detect confirmation
 */
export interface ATSAdapter {
  readonly atsType: string;

  /** Navigate to application form and return the first page */
  openApplication(browser: BrowserHarness, job: JobContext): Promise<ApplicationPage>;

  /** Advance to next step in a multi-step form */
  nextStep(browser: BrowserHarness): Promise<ApplicationPage>;

  /** Submit the completed application */
  submit(browser: BrowserHarness): Promise<SubmitResult>;

  /** Detect whether the current page is a confirmation page */
  isConfirmationPage(browser: BrowserHarness): Promise<boolean>;
}
