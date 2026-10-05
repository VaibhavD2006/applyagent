import type { Browser, BrowserContext, Page } from "playwright";
import type {
  BrowserHarness as IBrowserHarness,
  LocatorDescriptor,
  PageSnapshot,
} from "./types.js";
import { detectCaptcha } from "./detection/CaptchaDetector.js";
import { snapshotPage } from "./PageSnapshot.js";

export class PlaywrightHarness implements IBrowserHarness {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async launch(): Promise<void> {
    const { chromium } = await import("playwright");
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    });
    this.page = await this.context.newPage();
  }

  async navigate(url: string): Promise<void> {
    const page = this.requirePage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  }

  async snapshot(): Promise<PageSnapshot> {
    const page = this.requirePage();
    return snapshotPage(page);
  }

  async screenshot(): Promise<Buffer> {
    const page = this.requirePage();
    const buf = await page.screenshot({ type: "png", fullPage: false });
    return Buffer.from(buf);
  }

  async fill(locator: LocatorDescriptor, value: string): Promise<void> {
    const el = this.resolveLocator(locator);
    await el.fill(value);
  }

  async select(locator: LocatorDescriptor, value: string): Promise<void> {
    const el = this.resolveLocator(locator);
    await el.selectOption(value);
  }

  async check(locator: LocatorDescriptor): Promise<void> {
    const el = this.resolveLocator(locator);
    await el.check();
  }

  async click(locator: LocatorDescriptor): Promise<void> {
    const el = this.resolveLocator(locator);
    await el.click();
  }

  async upload(locator: LocatorDescriptor, filePath: string): Promise<void> {
    const el = this.resolveLocator(locator);
    await el.setInputFiles(filePath);
  }

  async close(): Promise<void> {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
    this.page = null;
    this.context = null;
    this.browser = null;
  }

  private requirePage(): Page {
    if (!this.page) throw new Error("Browser not launched. Call launch() first.");
    return this.page;
  }

  private resolveLocator(locator: LocatorDescriptor) {
    const page = this.requirePage();
    switch (locator.strategy) {
      case "role":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return page.getByRole(locator.role as any, { name: locator.value });
      case "label":
        return page.getByLabel(locator.value);
      case "placeholder":
        return page.getByPlaceholder(locator.value);
      case "text":
        return page.getByText(locator.value);
      case "css":
        return page.locator(locator.value);
    }
  }
}

export { detectCaptcha };
