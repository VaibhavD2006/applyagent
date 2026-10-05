/** Describes how to locate a DOM element — prefers semantic locators over CSS */
export interface LocatorDescriptor {
  strategy: "role" | "label" | "placeholder" | "css" | "text";
  value: string;
  /** For role strategy: the ARIA role */
  role?: string;
  /** Fallback CSS selector */
  fallbackCss?: string;
}

export interface PageSnapshot {
  url: string;
  title: string;
  /** Visible text content of the page (stripped of HTML) */
  visibleText: string;
  /** All input-like elements found on the page */
  fields: FormFieldSummary[];
  /** Whether a CAPTCHA was detected */
  captchaDetected: boolean;
  takenAt: Date;
}

export interface FormFieldSummary {
  /** Unique key derived from label or id */
  key: string;
  label: string;
  inputType: string;
  required: boolean;
  options?: string[];
}

export interface FormField {
  id: string;
  label: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "date"
    | "number"
    | "unknown";
  required: boolean;
  options?: string[];
  currentValue?: string;
  /** Surrounding paragraph / fieldset text for LLM context */
  context?: string;
  locator: LocatorDescriptor;
}

export interface BrowserHarness {
  launch(): Promise<void>;
  navigate(url: string): Promise<void>;
  snapshot(): Promise<PageSnapshot>;
  screenshot(): Promise<Buffer>;
  fill(locator: LocatorDescriptor, value: string): Promise<void>;
  select(locator: LocatorDescriptor, value: string): Promise<void>;
  check(locator: LocatorDescriptor): Promise<void>;
  click(locator: LocatorDescriptor): Promise<void>;
  upload(locator: LocatorDescriptor, filePath: string): Promise<void>;
  close(): Promise<void>;
}
