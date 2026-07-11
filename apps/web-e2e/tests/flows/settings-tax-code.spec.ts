import { test, expect } from "@playwright/test";
import { cleanupTestData } from "../helpers/cleanup";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

let createdName = "";

test.describe("Tax Code Settings", () => {
  test.use({ storageState: ".auth/user.json" });

  test.afterEach(async () => { if (createdName) await cleanupTestData("tax-code", createdName); });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/tax-code`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with correct heading and structure", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Tax Codes");
    await expect(page.locator("text=All Tax Codes")).toBeVisible();
    await expect(page.locator('input[placeholder="Search tax codes..."]')).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Add Tax Code" })).toBeVisible();
  });

  test("create a new tax code", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Tax Code ${ts}`;

    await page.locator("button").filter({ hasText: "Add Tax Code" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Create Tax Code");
    await page.locator('input[placeholder="e.g. TVA 19%, EXEMPT"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
  });

  test("edit an existing tax code", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Edit Code ${ts}`;

    await page.locator("button").filter({ hasText: "Add Tax Code" }).click();
    await page.locator('input[placeholder="e.g. TVA 19%, EXEMPT"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });

    await page.locator("button").filter({ hasText: /^Edit$/ }).first().click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Edit Tax Code");
  });

  test("validates required name field", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Tax Code" }).click();
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator("text=Name is required")).toBeVisible();
  });

  test("delete a tax code", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Del Code ${ts}`;

    await page.locator("button").filter({ hasText: "Add Tax Code" }).click();
    await page.locator('input[placeholder="e.g. TVA 19%, EXEMPT"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });

    const rows = page.locator("table tbody tr");
    await rows.nth(await rows.count() - 1).locator("button").nth(1).click();
    await expect(page.locator('[role="alertdialog"] h2')).toContainText("Delete Tax Code");
    await page.locator("button").filter({ hasText: /^Delete$/ }).click();
    await expect(page.locator(`text=${name}`)).not.toBeVisible({ timeout: 10000 });
  });

  test("search filters tax codes", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Search Code ${ts}`;

    await page.locator("button").filter({ hasText: "Add Tax Code" }).click();
    await page.locator('input[placeholder="e.g. TVA 19%, EXEMPT"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });

    await page.locator('input[placeholder="Search tax codes..."]').fill(name);
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 5000 });
  });
});
