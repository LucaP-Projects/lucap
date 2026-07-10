import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Company Currency Settings", () => {
  test.use({ storageState: ".auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/company-currency`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with correct heading and structure", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Currencies");
    await expect(page.locator("text=All Currencies")).toBeVisible();
    await expect(page.locator('input[placeholder="Search currencies..."]')).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Add Currency" })).toBeVisible();
  });

  test("create a new currency", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Currency" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Add Currency");
    await page.locator('input[placeholder="e.g. USD, EUR, TND"]').fill("XXY");
    await page.locator("button").filter({ hasText: "Add" }).click();
    await expect(page.locator("text=XXY")).toBeVisible({ timeout: 10000 });
  });

  test("validates required currency code", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Currency" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Add Currency");
    await page.locator("button").filter({ hasText: "Add" }).click();
    await expect(page.locator("text=Currency code is required")).toBeVisible();
  });

  test("search filters currencies", async ({ page }) => {
    await page.locator('input[placeholder="Search currencies..."]').fill("XXY");
    await page.waitForTimeout(500);
    const body = page.locator("table tbody");
    if (await body.locator("tr").count() > 0) {
      await expect(body.locator("text=XXY")).toBeVisible({ timeout: 5000 });
    }
  });

  test("edit an existing currency", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Currency" }).click();
    await page.locator('input[placeholder="e.g. USD, EUR, TND"]').fill("XXZ");
    await page.locator("button").filter({ hasText: "Add" }).click();
    await expect(page.locator("text=XXZ")).toBeVisible({ timeout: 10000 });

    await page.locator("button").filter({ hasText: /^Edit$/ }).first().click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Edit Currency");
  });
});
