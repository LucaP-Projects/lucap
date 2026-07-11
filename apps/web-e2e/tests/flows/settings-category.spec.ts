import { test, expect } from "@playwright/test";
import { cleanupTestData } from "../helpers/cleanup";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

let createdName = "";

test.describe("Category Settings", () => {
  test.use({ storageState: ".auth/user.json" });

  test.afterEach(async () => { if (createdName) await cleanupTestData("category", createdName); });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/category`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Categories");
    await expect(page.locator("button").filter({ hasText: "Add Category" })).toBeVisible();
  });

  test("create a new category", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Cat ${ts}`;
    await page.locator("button").filter({ hasText: "Add Category" }).click();
    await page.locator('input[placeholder="Enter category name"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
  });

  test("validates required name field", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Category" }).click();
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator("text=Name is required")).toBeVisible();
  });

  test("edit an existing category", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Edit ${ts}`;
    await page.locator("button").filter({ hasText: "Add Category" }).click();
    await page.locator('input[placeholder="Enter category name"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
    await page.locator("button").filter({ hasText: /^Edit$/ }).first().click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Edit Category");
  });
});
