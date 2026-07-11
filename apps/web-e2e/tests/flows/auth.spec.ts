import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { SEEDED_USERS, loginUser, logoutUser } from "../fixtures/auth.fixture";

test.describe("Authentication", () => {
  test("login as admin", async ({ page }) => {
    await loginUser(page, SEEDED_USERS.admin);
    expect(page.url()).not.toContain("/auth/login");
  });

  test("login as regular user", async ({ page }) => {
    await loginUser(page, SEEDED_USERS.user);
    expect(page.url()).not.toContain("/auth/login");
  });

  test("login as super accountant", async ({ page }) => {
    await loginUser(page, SEEDED_USERS.superAccountant);
    expect(page.url()).not.toContain("/auth/login");
  });

  test("login as accountant staff", async ({ page }) => {
    await loginUser(page, SEEDED_USERS.accountantStaff);
    expect(page.url()).not.toContain("/auth/login");
  });

  test("reject invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("wrong@email.com", "WrongPassword123!");

    const errorMessage = await loginPage.getErrorMessage();
    const staysOnLogin = page.url().includes("/auth/login");

    expect(errorMessage || staysOnLogin).toBeTruthy();
  });

  test("reject empty fields", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("", "");
    expect(page.url()).toContain("/auth/login");
  });

  test("logout clears session", async ({ page }) => {
    await loginUser(page, SEEDED_USERS.user);
    await logoutUser(page);
    expect(page.url()).toContain("/auth/login");
  });

  test("session persists across refresh", async ({ page }) => {
    await loginUser(page, SEEDED_USERS.user);
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).not.toContain("/auth/login");
  });

  test("navigate to forgot password", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const forgotLink = page.locator('a[href*="/auth/forgot-password"]');
    await forgotLink.click();
    await page.waitForURL(/\/auth\/forgot-password/);
    expect(page.url()).toContain("/auth/forgot-password");
  });
});

test.describe("Protected Routes", () => {
  test("redirect to login from dashboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/auth\/login/, { timeout: 15000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("redirect to login from invoices", async ({ page }) => {
    await page.goto("/invoices");
    await page.waitForURL(/\/auth\/login/, { timeout: 15000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("redirect to login from settings", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL(/\/auth\/login/, { timeout: 15000 });
    expect(page.url()).toContain("/auth/login");
  });
});
