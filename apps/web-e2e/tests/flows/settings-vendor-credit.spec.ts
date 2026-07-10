import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Vendor Credits", () => {
  test.use({ storageState: ".auth/user.json" });

  test("vendor credits list page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/vendor-credits`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/vendor-credits");
    await expect(page.locator("h1")).toContainText("Vendor Credits");
  });

  test("new vendor credit page navigates and loads form", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/vendor-credits/new`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h2")).toContainText("New Vendor Credit");
  });

  test("vendor credit form has required fields", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/vendor-credits/new`);
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("text=Vendor *")).toBeVisible();
    await expect(page.locator("text=Line Items *")).toBeVisible();
  });
});
