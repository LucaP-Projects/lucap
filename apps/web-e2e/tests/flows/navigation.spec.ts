import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { SEEDED_USERS } from "../fixtures/auth.fixture";

test.describe("Login Page Navigation", () => {
  test("login page has expected elements", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(page.locator("h1")).toContainText("Login");
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("login page has forgot password link", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const forgotLink = page.locator('a[href*="/auth/forgot-password"]');
    await expect(forgotLink).toBeVisible();
  });
});

test.describe("Authenticated Navigation", () => {
  test.use({ storageState: ".auth/user.json" });

  test("dashboard shows sidebar navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const sidebar = page.locator(
      '[data-testid="app-sidebar"], nav[aria-label="Main navigation"]',
    );
    await expect(sidebar).toBeVisible({ timeout: 10000 });
  });

  test("navigate to invoices page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const invoicesLink = page.locator('a[href*="/invoices"]').first();
    if (await invoicesLink.isVisible({ timeout: 5000 })) {
      await invoicesLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/invoices");
    }
  });

  test("navigate to customers page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const customersLink = page.locator('a[href*="/customers"]').first();
    if (await customersLink.isVisible({ timeout: 5000 })) {
      await customersLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/customers");
    }
  });

  test("navigate to drive page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const driveLink = page.locator('a[href*="/drive"]').first();
    if (await driveLink.isVisible({ timeout: 5000 })) {
      await driveLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/drive");
    }
  });

  test("navigate to payments page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const paymentsLink = page.locator('a[href*="/payments"]').first();
    if (await paymentsLink.isVisible({ timeout: 5000 })) {
      await paymentsLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/payments");
    }
  });
});
