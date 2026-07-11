import { test, expect } from "@playwright/test";
import { cleanupTestData } from "../helpers/cleanup";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

let createdName = "";

test.describe("Budget Settings", () => {
  test.use({ storageState: ".auth/user.json" });

  test.afterEach(async () => { if (createdName) await cleanupTestData("budget", createdName); });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/budget`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with correct heading and structure", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Budgets");
    await expect(page.locator("text=All Budgets")).toBeVisible();
    await expect(page.locator('input[placeholder="Search budgets..."]')).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Create Budget" })).toBeVisible();
  });

  test("create a new budget", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Budget ${ts}`;

    await page.locator("button").filter({ hasText: "Create Budget" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Create Budget");
    await page.locator('input[placeholder="e.g. FY 2026 Operating Budget"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();

    // Should show validation for at least one account entry
    await expect(page.locator("text=At least one account entry is required")).toBeVisible({ timeout: 5000 });
  });
});
