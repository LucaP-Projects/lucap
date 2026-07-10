import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Banking", () => {
  test.use({ storageState: ".auth/user.json" });

  test("deposits page loads with correct structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/banking/deposit`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Deposits");
    await expect(page.locator("text=All Deposits")).toBeVisible();
  });

  test("transfers page loads with correct structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/banking/transfer`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Transfers");
    await expect(page.locator("text=All Transfers")).toBeVisible();
  });

  test("time activities page loads with correct structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/time-activity`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Time Activities");
    await expect(page.locator("text=All Time Entries")).toBeVisible();
  });

  test("time activities table has correct columns", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/time-activity`);
    await page.waitForLoadState("domcontentloaded");
    const headers = page.locator("table thead th");
    await expect(headers.nth(0)).toContainText("Date");
    await expect(headers.nth(1)).toContainText("Duration");
    await expect(headers.nth(2)).toContainText("Description");
    await expect(headers.nth(3)).toContainText("Billable");
  });
});
