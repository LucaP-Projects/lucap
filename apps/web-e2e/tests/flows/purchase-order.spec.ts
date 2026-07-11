import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Purchase Orders", () => {
  test.use({ storageState: ".auth/user.json" });

  test("purchase orders list page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/purchase-orders`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/purchase-orders");
    await expect(page.locator("h2")).toContainText("Purchase Orders");
  });

  test("new purchase order page navigates and loads form", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/purchase-orders/new`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h2")).toContainText("New Purchase Order");
  });

  test("purchase order form has required fields", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/purchase-orders/new`);
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("text=Vendor *")).toBeVisible();
    await expect(page.locator("text=Line Items")).toBeVisible();
  });
});