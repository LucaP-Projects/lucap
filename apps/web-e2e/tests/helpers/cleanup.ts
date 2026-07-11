import { request } from '@playwright/test';

/**
 * Deletes test records created during E2E tests.
 * Call in afterEach after creating test data.
 */
export async function cleanupTestData(model: string, nameValue: string) {
  try {
    await request.post(`${process.env.E2E_BASE_URL || 'http://localhost:3000'}/api/e2e-cleanup`, {
      data: { model, nameField: 'name', nameValue },
    });
  } catch {
    // Cleanup is best-effort
  }
}
