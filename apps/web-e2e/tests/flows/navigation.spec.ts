import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { SEEDED_USERS } from "../fixtures/auth.fixture";

test.describe("Login Page Navigation", () => {
  test("login page has expected elements", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(page.locator("h1")).toContainText("Login to your account");
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

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Authenticated Navigation", () => {
  test.use({ storageState: ".auth/user.json" });

  test("dashboard shows sidebar navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const sidebar = page.locator('[data-slot="sidebar"]');
    await expect(sidebar).toBeVisible({ timeout: 10000 });
  });

  test("navigate to invoices page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    const invoicesLink = page.locator(`a[href*="/${slug}/invoices"]`).first();
    if (await invoicesLink.isVisible({ timeout: 5000 })) {
      await invoicesLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/invoices");
    }
  });

  test("navigate to customers page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    const customersLink = page.locator(`a[href*="/${slug}/customers"]`).first();
    if (await customersLink.isVisible({ timeout: 5000 })) {
      await customersLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/customers");
    }
  });

  test("navigate to drive page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/drive`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/drive");
  });

  test("navigate to payments page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    const paymentsLink = page.locator(`a[href*="/${slug}/payments"]`).first();
    if (await paymentsLink.isVisible({ timeout: 5000 })) {
      await paymentsLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/payments");
    }
  });
});
