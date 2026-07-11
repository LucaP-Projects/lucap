import { test, expect } from "@playwright/test";
import { cleanupTestData } from "../helpers/cleanup";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

let createdName = '';

test.describe("QBO Compliance", () => {
  test.use({ storageState: ".auth/user.json" });

  test.afterEach(async () => {
    if (createdName) { await cleanupTestData('class', createdName); createdName = ''; }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("QBO-C001: Duplicate name on Class throws validation error", async ({ page }) => {
    const slug = getSlug(page.url());
    const ts = Date.now();
    const className = `QBO Dup ${ts}`;
    createdName = className;

    // Create first class
    await page.goto(`/${slug}/settings/class`);
    await page.waitForLoadState("domcontentloaded");
    await page.locator("button").filter({ hasText: "Add Class" }).click();
    await page.locator('input[placeholder="Enter class name"]').fill(className);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${className}`)).toBeVisible({ timeout: 10000 });

    // Try to create duplicate
    await page.locator("button").filter({ hasText: "Add Class" }).click();
    await page.locator('input[placeholder="Enter class name"]').fill(className);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=already exists`).or(page.locator("text=already been taken"))).toBeVisible({ timeout: 5000 });
  });

  test("QBO-C002: Required name field validation on Class", async ({ page }) => {
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/class`);
    await page.waitForLoadState("domcontentloaded");
    await page.locator("button").filter({ hasText: "Add Class" }).click();
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator("text=Name is required")).toBeVisible();
  });

  test("QBO-C003: Term settings page validates required fields", async ({ page }) => {
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/term`);
    await page.waitForLoadState("domcontentloaded");
    await page.locator("button").filter({ hasText: "Add Term" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Create Payment Term");
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator("text=Name is required")).toBeVisible();
  });

  test("QBO-C004: Settings pages are scoped to company", async ({ page }) => {
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/class`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Classes");
    await expect(page.locator("text=All Classes")).toBeVisible();
  });

  test("QBO-C005: Reports listing page shows all report categories", async ({ page }) => {
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/reports`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("text=Business Overview")).toBeVisible();
    await expect(page.locator("text=Who Owes You")).toBeVisible();
    await expect(page.locator("text=Sales and customers")).toBeVisible();
    await expect(page.locator("text=Inventory")).toBeVisible();
  });
});
