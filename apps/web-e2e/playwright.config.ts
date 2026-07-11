import { defineConfig, devices } from "@playwright/test";
import path from "path";

const authDir = path.join(__dirname, ".auth");
export const AUTH_STATES = {
  admin: path.join(authDir, "admin.json"),
  staff: path.join(authDir, "staff.json"),
  user: path.join(authDir, "user.json"),
  superAccountant: path.join(authDir, "superAccountant.json"),
  accountantStaff: path.join(authDir, "accountantStaff.json"),
} as const;

export default defineConfig({
  testDir: "./tests",

  globalSetup: "./tests/global-setup.ts",

  timeout: 120_000,

  expect: {
    timeout: 15_000,
  },

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: 2,

  reporter: [["html"], ["list"]],

  use: {
    baseURL: process.env.WEB_URL || "http://localhost:3000",

    trace: "on-first-retry",

    screenshot: "only-on-failure",

    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: [
        "**/auth.spec.ts",
        "**/navigation.spec.ts",
        "**/company-formation.spec.ts",
      ],
    },

    {
      name: "admin-auth",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATES.admin,
      },
      testMatch: ["**/admin-portal.spec.ts"],
    },

    {
      name: "user-auth",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATES.user,
      },
      testMatch: [
        "**/company-dashboard.spec.ts",
        "**/customer-flow.spec.ts",
        "**/invoice-flow.spec.ts",
        "**/settings-department.spec.ts",
        "**/settings-class.spec.ts",
        "**/settings-vendor-credit.spec.ts",
        "**/purchase.spec.ts",
        "**/purchase-order.spec.ts",
      ],
    },

    {
      name: "staff-auth",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATES.staff,
      },
      testMatch: ["**/staff-dashboard.spec.ts"],
    },

    {
      name: "accountant-auth",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATES.superAccountant,
      },
      testMatch: ["**/accountant-portal.spec.ts"],
    },
  ],
});
