import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Purchases", () => {
  test.use({ storageState: ".auth/user.json" });

  test("purchases list page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/purchases`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/purchases");
    await expect(page.locator("h2")).toContainText("Purchases");
  });

  test("new purchase page navigates and loads form", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/purchases/new`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h2")).toContainText("New Purchase");
  });

  test("purchase form has required fields", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/purchases/new`);
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("text=Vendor *")).toBeVisible();
    await expect(page.locator("text=Payment Type *")).toBeVisible();
  });
});