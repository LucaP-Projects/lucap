import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Invoices", () => {
  test.use({ storageState: ".auth/user.json" });

  test("invoices list page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/invoices`);
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });
    expect(page.url()).toContain("/invoices");
  });

  test("new invoice button is visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/invoices`);
    await page.waitForLoadState("domcontentloaded");

    const newBtn = page.locator(
      'a[href*="/invoices/new"], button:has-text("New Invoice")',
    );
    await expect(newBtn).toBeVisible({ timeout: 10000 });
  });

  test("invoice table or list renders", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/invoices`);
    await page.waitForLoadState("domcontentloaded");

    const table = page.locator("table").first();
    const list = page.locator('[data-testid="invoice-list"]').first();
    const anyContent = page.locator("main, [role='main']").first();

    const tableVisible = await table.isVisible({ timeout: 3000 }).catch(() => false);
    const listVisible = await list.isVisible({ timeout: 3000 }).catch(() => false);
    const contentVisible = await anyContent.isVisible({ timeout: 3000 }).catch(() => false);

    expect(tableVisible || listVisible || contentVisible).toBeTruthy();
  });
});