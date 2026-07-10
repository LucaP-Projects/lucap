import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Tax Agency Settings", () => {
  test.use({ storageState: ".auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/tax-agency`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with correct heading and structure", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Tax Agencies");
    await expect(page.locator("text=All Tax Agencies")).toBeVisible();
    await expect(page.locator('input[placeholder="Search agencies..."]')).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Add Agency" })).toBeVisible();
  });

  test("create a new tax agency", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Agency ${ts}`;

    await page.locator("button").filter({ hasText: "Add Agency" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Add Tax Agency");
    await page.locator('input[placeholder="e.g. Ministere des Finances"]').fill(name);
    await page.locator("button").filter({ hasText: "Add" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
  });

  test("edit an existing tax agency", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Edit Agency ${ts}`;

    await page.locator("button").filter({ hasText: "Add Agency" }).click();
    await page.locator('input[placeholder="e.g. Ministere des Finances"]').fill(name);
    await page.locator("button").filter({ hasText: "Add" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });

    await page.locator("button").filter({ hasText: /^Edit$/ }).first().click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Edit Tax Agency");
  });

  test("validates required name field", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Agency" }).click();
    await page.locator("button").filter({ hasText: "Add" }).click();
    await expect(page.locator("text=Name is required")).toBeVisible();
  });

  test("search filters agencies", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Search Agency ${ts}`;

    await page.locator("button").filter({ hasText: "Add Agency" }).click();
    await page.locator('input[placeholder="e.g. Ministere des Finances"]').fill(name);
    await page.locator("button").filter({ hasText: "Add" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });

    await page.locator('input[placeholder="Search agencies..."]').fill(name);
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 5000 });
  });
});
