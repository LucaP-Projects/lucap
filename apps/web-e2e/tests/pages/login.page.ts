import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator(
      '[role="alert"], .error-message, .text-destructive, [data-sonner-toast]',
    );
  }

  async goto() {
    await this.page.goto("/auth/login");
    await this.page.waitForLoadState("domcontentloaded");
    await this.emailInput.waitFor({ state: "visible", timeout: 30000 });
  }

  async login(email: string, password: string) {
    await this.emailInput.waitFor({ state: "visible", timeout: 10000 });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async waitForSuccessfulLogin() {
    try {
      await this.page.waitForURL(
        (url) =>
          !url.pathname.includes("/auth/login") &&
          url.pathname !== "/auth/forgot-password",
        { timeout: 60000 },
      );
    } catch {
      const toast = this.page.locator("[data-sonner-toast]").first();
      const toastText = await toast.textContent().catch(() => null);
      const errorText = await this.errorMessage.textContent().catch(() => null);
      const msg = toastText || errorText || "Unknown error";
      throw new Error(`Login failed: ${msg}`);
    }
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      await this.page.waitForTimeout(2000);
      const toast = this.page.locator("[data-sonner-toast]").first();
      if (await toast.isVisible({ timeout: 2000 })) {
        return (await toast.textContent())?.trim() || null;
      }
      if (await this.errorMessage.isVisible({ timeout: 1000 })) {
        return (await this.errorMessage.textContent())?.trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  }
}
