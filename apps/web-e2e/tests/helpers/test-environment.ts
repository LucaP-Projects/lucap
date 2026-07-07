import { test } from "@playwright/test";

export enum TestEnvironment {
  Local = "local",
  Staging = "staging",
  Production = "production",
}

export function detectEnvironment(): TestEnvironment {
  const webUrl = process.env.WEB_URL || "http://localhost:3000";

  if (webUrl.includes("staging.lucap.com")) return TestEnvironment.Staging;
  if (webUrl.includes("lucap.com") && !webUrl.includes("staging"))
    return TestEnvironment.Production;

  return TestEnvironment.Local;
}

export function isProtectedEnvironment(): boolean {
  const env = detectEnvironment();
  return env === TestEnvironment.Staging || env === TestEnvironment.Production;
}

export function isLocal(): boolean {
  return detectEnvironment() === TestEnvironment.Local;
}

export function allowDestructiveTests(): boolean {
  if (process.env.ALLOW_DESTRUCTIVE_TESTS === "true") {
    console.warn(
      "⚠️  ALLOW_DESTRUCTIVE_TESTS=true - Destructive tests enabled on protected environment",
    );
    return true;
  }
  return isLocal();
}

export const testDestructive = allowDestructiveTests() ? test : test.skip;
export const describeDestructive = allowDestructiveTests()
  ? test.describe
  : test.describe.skip;
