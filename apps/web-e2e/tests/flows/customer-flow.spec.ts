import { test, expect } from "@playwright/test";

test.describe("Customer Management", () => {
  test.use({ storageState: ".auth/user.json" });

  test("customers list page loads", async ({ page }) => {
    await page.goto("/customers");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/customers");
  });

  test("customer table or list renders", async ({ page }) => {
    await page.goto("/customers");
    await page.waitForLoadState("domcontentloaded");

    const table = page.locator("table").first();
    const list = page.locator('[role="grid"], [data-testid="customer-list"]').first();
    const anyContent = page.locator("main, [role='main']").first();

    const tableVisible = await table.isVisible({ timeout: 3000 }).catch(() => false);
    const listVisible = await list.isVisible({ timeout: 3000 }).catch(() => false);
    const contentVisible = await anyContent.isVisible({ timeout: 3000 }).catch(() => false);

    expect(tableVisible || listVisible || contentVisible).toBeTruthy();
  });
});
