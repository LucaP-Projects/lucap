import { Page, Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('[data-testid="app-sidebar"], nav[aria-label="Main navigation"]');
    this.userMenu = page.locator(
      '[data-testid="user-menu"], [data-testid="avatar-button"]',
    );
  }

  async goto() {
    await this.page.goto("/");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async isDashboardVisible(): Promise<boolean> {
    try {
      await this.sidebar.waitFor({ state: "visible", timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async navigateTo(section: string) {
    const link = this.page.locator(`a[href*="${section}"], button:has-text("${section}")`).first();
    await link.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async getPageHeading(): Promise<string | null> {
    const heading = this.page.locator("h1").first();
    try {
      return (await heading.textContent())?.trim() || null;
    } catch {
      return null;
    }
  }
}
