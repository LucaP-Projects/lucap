import { test, expect } from "@playwright/test";

test.describe("Admin Portal", () => {
  test.use({ storageState: ".auth/admin.json" });

  test("admin dashboard loads", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/admin");
  });

  test("admin can access users page", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/admin/users");
  });

  test("admin can access accountants page", async ({ page }) => {
    await page.goto("/admin/accountants");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/admin/accountants");
  });
});
