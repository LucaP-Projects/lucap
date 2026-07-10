import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Reports", () => {
  test.use({ storageState: ".auth/user.json" });

  test("reports list page loads with sections", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/reports`);
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1")).toContainText("Reports");
    await expect(page.locator("text=Trial Balance")).toBeVisible();
    await expect(page.locator("text=General Ledger")).toBeVisible();
    await expect(page.locator("text=Transaction List")).toBeVisible();
    await expect(page.locator("text=Balance Sheet")).toBeVisible();
    await expect(page.locator("text=AP aging summary")).toBeVisible();
    await expect(page.locator("text=Sales by Customer Summary")).toBeVisible();
    await expect(page.locator("text=Sales by Product/Service Summary")).toBeVisible();
    await expect(page.locator("text=Sales by Class Summary")).toBeVisible();
    await expect(page.locator("text=Sales by Department Summary")).toBeVisible();
    await expect(page.locator("text=Vendor Balance Summary")).toBeVisible();
    await expect(page.locator("text=Tax Summary")).toBeVisible();
  });

  test("trial balance report page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/reports/trial-balance`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Reports");
    await expect(page.locator("text=Trial Balance")).toBeVisible();
  });

  test("general ledger report page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/reports/general-ledger`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Reports");
    await expect(page.locator("text=General Ledger")).toBeVisible();
  });

  test("tax summary report page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/reports/tax-summary`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Reports");
    await expect(page.locator("text=Tax Summary")).toBeVisible();
  });

  test("sales by class report page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/reports/sales-class-summary`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Reports");
    await expect(page.locator("text=Sales by Class")).toBeVisible();
  });

  test("sales by department report page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/reports/sales-dept-summary`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Reports");
    await expect(page.locator("text=Sales by Department")).toBeVisible();
  });

  test("vendor balance report page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/reports/vendor-balance-summary`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Reports");
    await expect(page.locator("text=Vendor Balance")).toBeVisible();
  });

  test("transaction list page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/reports/transaction-list`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Reports");
    await expect(page.locator("text=Transaction List")).toBeVisible();
  });
});
