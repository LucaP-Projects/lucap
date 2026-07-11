import { test, expect } from "@playwright/test";

function getSlug(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

test.describe("Banking", () => {
  test.use({ storageState: ".auth/user.json" });

  test("deposits page loads and create sheet opens", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/banking/deposit`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Deposits");
    await expect(page.locator("text=All Deposits")).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "New Deposit" })).toBeVisible();
    await page.locator("button").filter({ hasText: "New Deposit" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("New Deposit");
  });

  test("transfers page loads and create sheet opens", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/banking/transfer`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Transfers");
    await expect(page.locator("text=All Transfers")).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "New Transfer" })).toBeVisible();
    await page.locator("button").filter({ hasText: "New Transfer" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("New Transfer");
  });

  test("credit card payments page loads and create sheet opens", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/banking/credit-card`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Credit Card Payments");
    await expect(page.locator("text=All Payments")).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "New Payment" })).toBeVisible();
    await page.locator("button").filter({ hasText: "New Payment" }).click();
    await expect(page.locator('[role="dialog"] h2')).toContainText("New Credit Card Payment");
  });

  test("time activities page loads with correct structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const slug = getSlug(page.url());
    await page.goto(`/${slug}/time-activity`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Time Activities");
    await expect(page.locator("text=All Time Entries")).toBeVisible();
    const headers = page.locator("table thead th");
    await expect(headers.nth(0)).toContainText("Date");
    await expect(headers.nth(1)).toContainText("Duration");
  });
});
