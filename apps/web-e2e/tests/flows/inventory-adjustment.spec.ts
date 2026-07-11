import { test, expect } from "@playwright/test";
import { cleanupTestData } from "../helpers/cleanup";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

let createdName = "";

test.describe("Inventory Adjustments", () => {
  test.use({ storageState: ".auth/user.json" });

  test.afterEach(async () => { if (createdName) await cleanupTestData("inventory-adjustment", createdName); });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/inventory/adjustments`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with correct heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Inventory Adjustments");
    await expect(page.locator("text=All Adjustments")).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "New Adjustment" })).toBeVisible();
  });

  test("opens create sheet with correct title", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Adjustment" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("New Adjustment");
    await expect(page.locator("text=Item ID*")).toBeVisible();
    await expect(page.locator("text=Quantity*")).toBeVisible();
    await expect(page.locator("text=Date*")).toBeVisible();
  });

  test("validates required fields", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Adjustment" }).click();
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator("text=Item is required")).toBeVisible();
    await expect(page.locator("text=Date is required")).toBeVisible();
  });
});
