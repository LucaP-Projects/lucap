import { chromium, FullConfig } from "@playwright/test";
import { SEEDED_USERS } from "./fixtures/auth.fixture";
import { LoginPage } from "./pages/login.page";
import * as fs from "fs";
import * as path from "path";

const authDir = path.join(__dirname, "..", ".auth");

export const AUTH_STATES = {
  admin: path.join(authDir, "admin.json"),
  staff: path.join(authDir, "staff.json"),
  user: path.join(authDir, "user.json"),
  superAccountant: path.join(authDir, "superAccountant.json"),
  accountantStaff: path.join(authDir, "accountantStaff.json"),
} as const;

export type AuthStateKey = keyof typeof AUTH_STATES;

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || "http://localhost:3000";

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const browser = await chromium.launch();

  console.log("🔐 Setting up authenticated sessions for all user types...");

  const errors: Array<{ userType: string; error: unknown }> = [];

  for (const [userType, user] of Object.entries(SEEDED_USERS)) {
    const storageStatePath = AUTH_STATES[userType as AuthStateKey];

    if (fs.existsSync(storageStatePath)) {
      const stats = fs.statSync(storageStatePath);
      const ageMs = Date.now() - stats.mtimeMs;
      const oneHourMs = 60 * 60 * 1000;

      if (ageMs < oneHourMs) {
        console.log(
          `  ✓ ${userType}: Using cached session (${Math.round(ageMs / 1000)}s old)`,
        );
        continue;
      }
    }

    console.log(`  → ${userType}: Authenticating...`);

    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    try {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await loginPage.waitForSuccessfulLogin();

      await context.storageState({ path: storageStatePath });
      console.log(`  ✓ ${userType}: Session saved`);
    } catch (error) {
      console.error(`  ✗ ${userType}: Authentication failed:`, error);
      errors.push({ userType, error });
    } finally {
      await context.close();
    }
  }

  await browser.close();

  if (errors.length > 0) {
    const errorMessages = errors
      .map(
        (e) =>
          `${e.userType}: ${e.error instanceof Error ? e.error.message : String(e.error)}`,
      )
      .join("\n  ");
    if (process.env.CI) {
      console.warn(`⚠ Authentication failed for ${errors.length} user(s):\n  ${errorMessages}`);
    } else {
      throw new Error(
        `Authentication failed for ${errors.length} user(s):\n  ${errorMessages}`,
      );
    }
  }

  console.log("🔐 All sessions ready!\n");
}

export default globalSetup;
