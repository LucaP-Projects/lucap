import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Preferences", () => {
  test.use({ storageState: ".auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/settings/preferences`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads with heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Preferences");
    await expect(page.locator("text=Accounting Preferences")).toBeVisible();
    await expect(page.locator("text=Save Preferences")).toBeVisible();
  });

  test("can save base currency preference", async ({ page }) => {
    const input = page.locator('input[placeholder="e.g. TND, USD"]');
    await input.clear();
    await input.fill("USD");
    await page.locator("button").filter({ hasText: "Save Preferences" }).click();
    await page.waitForTimeout(1000);
    const value = await input.inputValue();
    expect(value.toUpperCase()).toBe("USD");
  });
});
