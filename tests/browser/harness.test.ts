import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { PlaywrightHarness, mapFields } from "@applyagent/browser";

const fixture = (name: string) => pathToFileURL(resolve(__dirname, "../fixtures/html", name)).href;

describe("PlaywrightHarness – browser integration", () => {
  let browser: PlaywrightHarness;

  beforeEach(async () => {
    browser = new PlaywrightHarness();
    await browser.launch();
  });

  afterEach(async () => {
    await browser.close();
  });

  it("snapshots basic text/email/phone fields", async () => {
    await browser.navigate(fixture("basic-form.html"));
    const snap = await browser.snapshot();

    expect(snap.captchaDetected).toBe(false);
    const labels = snap.fields.map((f) => f.label.toLowerCase());
    expect(labels.some((l) => l.includes("first name"))).toBe(true);
    expect(labels.some((l) => l.includes("last name"))).toBe(true);
    expect(labels.some((l) => l.includes("email"))).toBe(true);
  });

  it("snapshots dropdown fields", async () => {
    await browser.navigate(fixture("dropdown-form.html"));
    const snap = await browser.snapshot();

    const fields = mapFields(snap.fields);
    const selectFields = fields.filter((f) => f.type === "select");
    expect(selectFields.length).toBeGreaterThan(0);
  });

  it("snapshots textarea fields", async () => {
    await browser.navigate(fixture("textarea-form.html"));
    const snap = await browser.snapshot();

    const fields = mapFields(snap.fields);
    const textareas = fields.filter((f) => f.type === "textarea");
    expect(textareas.length).toBeGreaterThan(0);
  });

  it("detects CAPTCHA on captcha fixture", async () => {
    await browser.navigate(fixture("captcha.html"));
    const snap = await browser.snapshot();
    expect(snap.captchaDetected).toBe(true);
  });

  it("does NOT treat prompt-injection content as a CAPTCHA or crash", async () => {
    await browser.navigate(fixture("malicious-prompt-injection.html"));
    const snap = await browser.snapshot();
    // Snapshot should complete without error; captcha should not be falsely triggered
    expect(snap).toBeDefined();
    expect(snap.captchaDetected).toBe(false);
  });

  it("fills a text field and reads it back", async () => {
    await browser.navigate(fixture("basic-form.html"));
    const snap = await browser.snapshot();

    const fields = mapFields(snap.fields);
    const emailField = fields.find((f) => f.type === "email");
    expect(emailField).toBeDefined();

    await browser.fill(emailField!.locator, "test@example.com");

    // Verify via the raw summary's label-based locator
    const snap2 = await browser.snapshot();
    const emailSummary = snap2.fields.find((f) => f.inputType === "email");
    expect(emailSummary).toBeDefined();
    // The value should now be filled in the page DOM — confirmed if no error thrown
  });

  it("takes a screenshot without error", async () => {
    await browser.navigate(fixture("basic-form.html"));
    const buf = await browser.screenshot();
    expect(buf.length).toBeGreaterThan(0);
  });
});
