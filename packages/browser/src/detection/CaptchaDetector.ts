const CAPTCHA_SIGNALS = [
  "recaptcha",
  "hcaptcha",
  "turnstile",
  "captcha",
  "cf-challenge",
  "verify you are human",
  "verify you're human",
  "prove you are not a robot",
  "i'm not a robot",
  "i am not a robot",
  "bot detection",
  "cloudflare challenge",
];

/** Returns true if the page text or HTML contains CAPTCHA signals */
export function detectCaptcha(text: string): boolean {
  const lower = text.toLowerCase();
  return CAPTCHA_SIGNALS.some((s) => lower.includes(s));
}
