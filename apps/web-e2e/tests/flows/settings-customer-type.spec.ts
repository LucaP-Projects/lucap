import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Customer Type Settings", () => {
  test.use({ storageState: ".auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/customer-type`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Customer Types");
    await expect(page.locator("button").filter({ hasText: "Add Customer Type" })).toBeVisible();
  });

  test("create a new customer type", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Type ${ts}`;
    await page.locator("button").filter({ hasText: "Add Customer Type" }).click();
    await page.locator('input[placeholder="Enter customer type name"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
  });

  test("validates required name field", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Customer Type" }).click();
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator("text=Name is required")).toBeVisible();
  });

  test("edit an existing customer type", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Edit ${ts}`;
    await page.locator("button").filter({ hasText: "Add Customer Type" }).click();
    await page.locator('input[placeholder="Enter customer type name"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
    await page.locator("button").filter({ hasText: /^Edit$/ }).first().click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Edit Customer Type");
  });

  test("search filters customer types", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Search ${ts}`;
    await page.locator("button").filter({ hasText: "Add Customer Type" }).click();
    await page.locator('input[placeholder="Enter customer type name"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
    await page.locator('input[placeholder="Search customer types..."]').fill(name);
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 5000 });
  });
});
