import { test, expect } from "@playwright/test";
import { cleanupTestData } from "../helpers/cleanup";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

let createdName = "";

test.describe("Tax Payments", () => {
  test.use({ storageState: ".auth/user.json" });

  test.afterEach(async () => { if (createdName) await cleanupTestData("tax-payment", createdName); });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/tax-payment`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with correct heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Tax Payments");
    await expect(page.locator("text=All Tax Payments")).toBeVisible();
  });
});
