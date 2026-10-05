import { describe, it, expect } from "vitest";
import { detectCaptcha } from "../../../packages/browser/src/detection/CaptchaDetector.js";

describe("detectCaptcha", () => {
  it("detects recaptcha keyword", () => {
    expect(detectCaptcha("Please complete the reCAPTCHA to continue")).toBe(true);
  });

  it("detects hcaptcha keyword", () => {
    expect(detectCaptcha("hCaptcha verification required")).toBe(true);
  });

  it("detects 'verify you are human'", () => {
    expect(detectCaptcha("Verify you are human before submitting")).toBe(true);
  });

  it("detects cloudflare challenge", () => {
    expect(detectCaptcha("Cloudflare challenge page — checking your browser")).toBe(true);
  });

  it("detects 'i'm not a robot'", () => {
    expect(detectCaptcha("Check the box: I'm not a robot")).toBe(true);
  });

  it("returns false for normal application page", () => {
    expect(detectCaptcha("Apply for Software Engineer at Acme Corp")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(detectCaptcha("")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(detectCaptcha("RECAPTCHA REQUIRED")).toBe(true);
  });
});
