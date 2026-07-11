import { test, expect } from "@playwright/test";
import { cleanupTestData } from "../helpers/cleanup";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

let createdName = "";

test.describe("Department Settings", () => {
  test.use({ storageState: ".auth/user.json" });

  test.afterEach(async () => { if (createdName) await cleanupTestData("department", createdName); });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/department`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with correct heading and structure", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Departments");
    await expect(page.locator("text=All Departments")).toBeVisible();
    await expect(page.locator('input[placeholder="Search departments..."]')).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Add Department" })).toBeVisible();
  });

  test("create a new department", async ({ page }) => {
    const ts = Date.now();
    const deptName = `E2E Test Dept ${ts}`;

    await page.locator("button").filter({ hasText: "Add Department" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Create Department");
    await page.locator('input[placeholder="Enter department name"]').fill(deptName);
    await page.locator("button").filter({ hasText: "Create" }).click();

    await expect(page.locator(`text=${deptName}`)).toBeVisible({ timeout: 10000 });
  });

  test("edit an existing department", async ({ page }) => {
    const ts = Date.now();
    const deptName = `E2E Test Dept ${ts}`;

    await page.locator("button").filter({ hasText: "Add Department" }).click();
    await page.locator('input[placeholder="Enter department name"]').fill(deptName);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${deptName}`)).toBeVisible({ timeout: 10000 });

    await page.locator("button").filter({ hasText: /^Edit$/ }).first().click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Edit Department");

    const newName = `${deptName} Updated`;
    await page.locator('input[placeholder="Enter department name"]').clear();
    await page.locator('input[placeholder="Enter department name"]').fill(newName);
    await page.locator("button").filter({ hasText: "Save Changes" }).click();

    await expect(page.locator(`text=${newName}`)).toBeVisible({ timeout: 10000 });
  });

  test("delete a department", async ({ page }) => {
    const ts = Date.now();
    const deptName = `E2E Test Dept Delete ${ts}`;

    await page.locator("button").filter({ hasText: "Add Department" }).click();
    await page.locator('input[placeholder="Enter department name"]').fill(deptName);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${deptName}`)).toBeVisible({ timeout: 10000 });

    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();
    const deleteBtn = rows.nth(rowCount - 1).locator("button").filter({ hasText: /^$/ });
    await rows.nth(rowCount - 1).locator("button").nth(1).click();

    await expect(page.locator('[role="alertdialog"] h2')).toContainText("Delete Department");
    await page.locator("button").filter({ hasText: /^Delete$/ }).click();

    await expect(page.locator(`text=${deptName}`)).not.toBeVisible({ timeout: 10000 });
  });

  test("validates required name field", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Department" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Create Department");
    await page.locator("button").filter({ hasText: "Create" }).click();

    await expect(page.locator("text=Name is required")).toBeVisible();
  });

  test("search filters departments", async ({ page }) => {
    const ts = Date.now();
    const deptName = `E2E Search Dept ${ts}`;

    await page.locator("button").filter({ hasText: "Add Department" }).click();
    await page.locator('input[placeholder="Enter department name"]').fill(deptName);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${deptName}`)).toBeVisible({ timeout: 10000 });

    await page.locator('input[placeholder="Search departments..."]').fill(deptName);
    await expect(page.locator(`text=${deptName}`)).toBeVisible({ timeout: 5000 });

    await page.locator('input[placeholder="Search departments..."]').fill("ZZZZ_NONEXISTENT_999");
    await page.waitForTimeout(500);
    await expect(page.locator("text=No departments found")).toBeVisible();
  });
});
