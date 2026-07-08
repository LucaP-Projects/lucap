import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Accountant Portal", () => {
  test.use({ storageState: ".auth/superAccountant.json" });

  test("accountant dashboard loads", async ({ page }) => {
    await page.goto("/accountant-dashboard");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/accountant-dashboard");
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
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/accountant-review/invoices`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/accountant-review/invoices");
  });

  test("payments review page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/accountant-review/payments`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/accountant-review/payments");
  });
});