import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Staff Dashboard", () => {
  test.use({ storageState: ".auth/staff.json" });

  test("staff can access dashboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).not.toContain("/auth/login");
  });

  test("staff can access settings team page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());

    await page.goto(`/${slug}/settings/team`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/settings/team");
  });
});