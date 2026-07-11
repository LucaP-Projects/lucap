import { Page } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

/**
 * Pre-seeded test users from prisma/seeds/data/users.ts
 * Password for all seeded users is set in the seed file.
 */
export const SEEDED_USERS = {
  admin: {
    email: "admin@lucap.com",
    password: "Admin@1234",
    name: "Admin User",
  } as TestUser,
  staff: {
    email: "staff@lucap.com",
    password: "Staff@1234",
    name: "Staff User",
  } as TestUser,
  user: {
    email: "user@lucap.com",
    password: "User@1234",
    name: "Regular User",
  } as TestUser,
  superAccountant: {
    email: "superaccountant@lucap.com",
    password: "SuperAcc@1234",
    name: "Super Accountant",
  } as TestUser,
  accountantStaff: {
    email: "accountantstaff@lucap.com",
    password: "AccStaff@1234",
    name: "Accountant Staff",
  } as TestUser,
} as const;

export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

/**
 * Login with existing user credentials
 */
export async function loginUser(page: Page, user: TestUser): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(user.email, user.password);
  await loginPage.waitForSuccessfulLogin();
}

/**
 * Generate unique test user credentials
 */
export function generateTestUser(prefix: string = "test"): TestUser {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    email: `${prefix}${timestamp}${random}@lucap.test`,
    password: "TestPassword123!",
    name: `Test User ${timestamp}`,
  };
}

/**
 * Logout the current user
 */
export async function logoutUser(page: Page): Promise<void> {
  const sidebarFooter = page.locator('[data-slot="sidebar-footer"]');
  try {
    if (await sidebarFooter.isVisible({ timeout: 2000 })) {
      const trigger = sidebarFooter.locator('button').first();
      if (await trigger.isVisible({ timeout: 2000 })) {
        await trigger.click();
        await page.waitForTimeout(500);
      }
    }
  } catch {
    // No sidebar footer visible (e.g. admin page)
  }

  const logoutMenuItem = page.locator('[role="menuitem"]', { hasText: /log out/i });
  try {
    if (await logoutMenuItem.isVisible({ timeout: 3000 })) {
      await logoutMenuItem.click();
    }
  } catch {
    // Fallback: try generic text match
    const fallback = page.locator('button, a, [role="menuitem"]', {
      hasText: /log out|sign out|logout/i,
    });
    if (await fallback.isVisible({ timeout: 2000 })) {
      await fallback.click();
    }
  }

  await page.waitForURL((url) => url.pathname.includes("/auth/login"), {
    timeout: 15000,
  });
}
