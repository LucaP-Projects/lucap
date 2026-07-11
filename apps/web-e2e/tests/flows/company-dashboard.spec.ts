import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

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

    const sidebar = page.locator('[data-slot="sidebar"]');
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

    const userMenu = page.locator('[data-slot="sidebar-footer"] button').first();
    await expect(userMenu).toBeVisible({ timeout: 10000 });
  });
});
