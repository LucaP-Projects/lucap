import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Term Settings", () => {
  test.use({ storageState: ".auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/term`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with heading and structure", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Payment Terms");
    await expect(page.locator("text=All Terms")).toBeVisible();
    await expect(page.locator('input[placeholder="Search terms..."]')).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Add Term" })).toBeVisible();
  });

  test("create a new term", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Net ${ts}`;
    await page.locator("button").filter({ hasText: "Add Term" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Create Payment Term");
    await page.locator('input[placeholder="e.g. Net 30, 2% 15 Net 60"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
  });

  test("validates required name field", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Term" }).click();
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator("text=Name is required")).toBeVisible();
  });

  test("edit an existing term", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Edit ${ts}`;
    await page.locator("button").filter({ hasText: "Add Term" }).click();
    await page.locator('input[placeholder="e.g. Net 30, 2% 15 Net 60"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
    await page.locator("button").filter({ hasText: /^Edit$/ }).first().click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("Edit Payment Term");
  });

  test("search filters terms", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Search ${ts}`;
    await page.locator("button").filter({ hasText: "Add Term" }).click();
    await page.locator('input[placeholder="e.g. Net 30, 2% 15 Net 60"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
    await page.locator('input[placeholder="Search terms..."]').fill(name);
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 5000 });
    await page.locator('input[placeholder="Search terms..."]').fill("ZZZZ_NONEXISTENT_999");
    await page.waitForTimeout(500);
    await expect(page.locator("text=No payment terms found")).toBeVisible();
  });

  test("delete a term", async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Del ${ts}`;
    await page.locator("button").filter({ hasText: "Add Term" }).click();
    await page.locator('input[placeholder="e.g. Net 30, 2% 15 Net 60"]').fill(name);
    await page.locator("button").filter({ hasText: "Create" }).click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });
    const rows = page.locator("table tbody tr");
    await rows.nth(await rows.count() - 1).locator("button").nth(1).click();
    await expect(page.locator('[role="alertdialog"] h2')).toContainText("Delete Term");
    await page.locator("button").filter({ hasText: /^Delete$/ }).click();
    await expect(page.locator(`text=${name}`)).not.toBeVisible({ timeout: 10000 });
  });
});
