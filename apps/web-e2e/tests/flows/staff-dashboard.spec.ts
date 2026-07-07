import { test, expect } from "@playwright/test";

test.describe("Staff Dashboard", () => {
  test.use({ storageState: ".auth/staff.json" });

  test("staff can access dashboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).not.toContain("/auth/login");
  });

  test("staff can access settings team page", async ({ page }) => {
    await page.goto("/settings/team");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/settings/team");
  });
});
