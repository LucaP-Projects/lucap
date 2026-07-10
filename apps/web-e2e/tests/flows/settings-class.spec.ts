import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Class Settings", () => {
  test.use({ storageState: ".auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/class`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with correct heading and structure", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Classes");
    await expect(page.locator("text=All Classes")).toBeVisible();
    await expect(page.locator('input[placeholder="Search classes..."]')).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Add Class" })).toBeVisible();
  });

  test("create a new class", async ({ page }) => {
    const ts = Date.now();
    const className = `E2E Test Class ${ts}`;

    await page.locator("button").filter({ hasText: "Add Class" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Create Class");
    await page.locator('input[placeholder="Enter class name"]').fill(className);
    await page.locator("button").filter({ hasText: "Create" }).click();

    await expect(page.locator(`text=${className}`)).toBeVisible({ timeout: 10000 });
  });

  test("edit an existing class", async ({ page }) => {
    const ts = Date.now();
    const className = `E2E Test Class ${ts}`;

    await page.locator("button").filter({ hasText: "Add Class" }).click();
    await page.locator('input[placeholder="Enter class name"]').fill(className);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${className}`)).toBeVisible({ timeout: 10000 });

    await page.locator("button").filter({ hasText: /^Edit$/ }).first().click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Edit Class");

    const newName = `${className} Updated`;
    await page.locator('input[placeholder="Enter class name"]').clear();
    await page.locator('input[placeholder="Enter class name"]').fill(newName);
    await page.locator("button").filter({ hasText: "Save Changes" }).click();

    await expect(page.locator(`text=${newName}`)).toBeVisible({ timeout: 10000 });
  });

  test("delete a class", async ({ page }) => {
    const ts = Date.now();
    const className = `E2E Test Class Delete ${ts}`;

    await page.locator("button").filter({ hasText: "Add Class" }).click();
    await page.locator('input[placeholder="Enter class name"]').fill(className);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${className}`)).toBeVisible({ timeout: 10000 });

    const rows = page.locator("table tbody tr");
    await rows.nth(await rows.count() - 1).locator("button").nth(1).click();

    await expect(page.locator('[role="alertdialog"] h2')).toContainText("Delete Class");
    await page.locator("button").filter({ hasText: /^Delete$/ }).click();

    await expect(page.locator(`text=${className}`)).not.toBeVisible({ timeout: 10000 });
  });

  test("validates required name field", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Class" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Create Class");
    await page.locator("button").filter({ hasText: "Create" }).click();

    await expect(page.locator("text=Name is required")).toBeVisible();
  });

  test("search filters classes", async ({ page }) => {
    const ts = Date.now();
    const className = `E2E Search Class ${ts}`;

    await page.locator("button").filter({ hasText: "Add Class" }).click();
    await page.locator('input[placeholder="Enter class name"]').fill(className);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${className}`)).toBeVisible({ timeout: 10000 });

    await page.locator('input[placeholder="Search classes..."]').fill(className);
    await expect(page.locator(`text=${className}`)).toBeVisible({ timeout: 5000 });

    await page.locator('input[placeholder="Search classes..."]').fill("ZZZZ_NONEXISTENT_999");
    await page.waitForTimeout(500);
    await expect(page.locator("text=No classes found")).toBeVisible();
  });
});
