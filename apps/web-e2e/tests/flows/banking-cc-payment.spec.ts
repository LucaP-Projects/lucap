import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Credit Card Payments", () => {
  test.use({ storageState: ".auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/banking/credit-card`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Credit Card Payments");
    await expect(page.locator("text=All Payments")).toBeVisible();
  });
});
