import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Employee Settings", () => {
  test.use({ storageState: ".auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/employee`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with correct heading and structure", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Employees");
    await expect(page.locator("text=All Employees")).toBeVisible();
    await expect(page.locator('input[placeholder="Search employees..."]')).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Add Employee" })).toBeVisible();
  });

  test("create a new employee", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Emp ${ts}`;

    await page.locator("button").filter({ hasText: "Add Employee" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Add Employee");
    await page.locator('input[placeholder="Full name"]').fill(name);
    await page.locator("button").filter({ hasText: "Add" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
  });

  test("validates required name field", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Employee" }).click();
    await page.locator("button").filter({ hasText: "Add" }).click();
    await expect(page.locator("text=Name is required")).toBeVisible();
  });
});
