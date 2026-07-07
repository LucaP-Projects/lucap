import { test, expect } from "@playwright/test";

test.describe("Accountant Portal", () => {
  test.use({ storageState: ".auth/superAccountant.json" });

  test("accountant dashboard loads", async ({ page }) => {
    await page.goto("/accountant-dashboard");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/accountant-dashboard");
  });

  test("accountant can see client review sections", async ({ page }) => {
    await page.goto("/accountant-dashboard");
    await page.waitForLoadState("domcontentloaded");

    const reviewLinks = page.locator('a[href*="/accountant-review"]');
    const count = await reviewLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("accountant can access tickets triage", async ({ page }) => {
    await page.goto("/accountant-dashboard/tickets");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/accountant-dashboard/tickets");
  });

  test("accountant can access client setup monitor", async ({ page }) => {
    await page.goto("/accountant-dashboard/setup");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/accountant-dashboard/setup");
  });

  test("invoice review page loads", async ({ page }) => {
    await page.goto("/accountant-review/invoices");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/accountant-review/invoices");
  });

  test("payments review page loads", async ({ page }) => {
    await page.goto("/accountant-review/payments");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/accountant-review/payments");
  });
});
