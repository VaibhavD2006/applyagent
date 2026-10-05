import type { Page } from "playwright";
import type { PageSnapshot, FormFieldSummary } from "./types.js";
import { detectCaptcha } from "./detection/CaptchaDetector.js";

export async function snapshotPage(page: Page): Promise<PageSnapshot> {
  const url = page.url();
  const title = await page.title();

  const visibleText = await page.evaluate(() => document.body.innerText ?? "");

  const fields = await extractFieldSummaries(page);
  const captchaDetected = detectCaptcha(visibleText) || detectCaptcha(await page.content());

  return {
    url,
    title,
    visibleText: visibleText.slice(0, 10_000),
    fields,
    captchaDetected,
    takenAt: new Date(),
  };
}

async function extractFieldSummaries(page: Page): Promise<FormFieldSummary[]> {
  return page.evaluate(() => {
    const summaries: Array<{
      key: string;
      label: string;
      inputType: string;
      required: boolean;
      options?: string[];
    }> = [];

    const inputs = document.querySelectorAll("input, textarea, select");
    inputs.forEach((el) => {
      const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if ((input as HTMLInputElement).type === "hidden") return;
      if ((input as HTMLInputElement).type === "submit") return;
      if ((input as HTMLInputElement).type === "button") return;

      const labelEl =
        input.id ? document.querySelector(`label[for="${input.id}"]`) : null;
      const label =
        labelEl?.textContent?.trim() ||
        (input as HTMLInputElement).placeholder ||
        input.getAttribute("aria-label") ||
        input.getAttribute("name") ||
        "";

      const key = (input.id || input.getAttribute("name") || label)
        .toLowerCase()
        .replace(/\s+/g, "_");

      const inputType =
        el.tagName.toLowerCase() === "select"
          ? "select"
          : el.tagName.toLowerCase() === "textarea"
            ? "textarea"
            : (input as HTMLInputElement).type || "text";

      const required = input.required || input.getAttribute("aria-required") === "true";

      let options: string[] | undefined;
      if (el.tagName.toLowerCase() === "select") {
        options = Array.from((el as HTMLSelectElement).options)
          .map((o) => o.text.trim())
          .filter(Boolean);
      }

      summaries.push({ key, label, inputType, required, options });
    });

    return summaries;
  });
}
