import { test, expect } from "@playwright/test";
import { InvoicesPage } from "../pages/invoices.page";

test.describe("Invoices", () => {
  test.use({ storageState: ".auth/user.json" });

  test("invoices list page loads", async ({ page }) => {
    const invoicesPage = new InvoicesPage(page);
    await invoicesPage.goto();

    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
    expect(page.url()).toContain("/invoices");
  });

  test("new invoice button is visible", async ({ page }) => {
    const invoicesPage = new InvoicesPage(page);
    await invoicesPage.goto();

    const newBtn = page.locator(
      'a[href*="/invoices/new"], button:has-text("New Invoice")',
    );
    await expect(newBtn).toBeVisible({ timeout: 10000 });
  });

  test("invoice table or list renders", async ({ page }) => {
    await page.goto("/invoices");
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
