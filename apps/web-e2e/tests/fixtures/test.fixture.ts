import { test as base } from "@playwright/test";
import { SEEDED_USERS, TestUser } from "./auth.fixture";

type AuthFixtures = {
  adminUser: TestUser;
  staffUser: TestUser;
  regularUser: TestUser;
  superAccountantUser: TestUser;
  accountantStaffUser: TestUser;
};

export const test = base.extend<AuthFixtures>({
  adminUser: async ({}, use) => {
    await use(SEEDED_USERS.admin);
  },
  staffUser: async ({}, use) => {
    await use(SEEDED_USERS.staff);
  },
  regularUser: async ({}, use) => {
    await use(SEEDED_USERS.user);
  },
  superAccountantUser: async ({}, use) => {
    await use(SEEDED_USERS.superAccountant);
  },
  accountantStaffUser: async ({}, use) => {
    await use(SEEDED_USERS.accountantStaff);
  },
});

export { expect } from "@playwright/test";
