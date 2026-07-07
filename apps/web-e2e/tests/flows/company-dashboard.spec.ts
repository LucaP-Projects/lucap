import { test, expect } from "@playwright/test";

test.describe("Company Dashboard", () => {
  test.use({ storageState: ".auth/user.json" });

  test("dashboard loads with company context", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    expect(page.url()).not.toContain("/auth/login");
    expect(page.url()).not.toContain("/select-company");
  });

  test("sidebar shows main navigation items", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const sidebar = page.locator(
      '[data-testid="app-sidebar"], nav[aria-label="Main navigation"]',
    );
    await expect(sidebar).toBeVisible({ timeout: 10000 });
  });

  test("page has a heading", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("user menu is accessible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const userMenu = page.locator(
      '[data-testid="user-menu"], [data-testid="avatar-button"]',
    );
    await expect(userMenu).toBeVisible({ timeout: 10000 });
  });
});
