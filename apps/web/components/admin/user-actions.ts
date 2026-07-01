'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function setUserRole(userId: string, role: string) {
  // Calls better-auth admin plugin endpoint to set role
  const res = await auth.api.setRole({ headers: await headers(), body: { userId, role } });
  return res;
}

export async function listUsers(limit = 100, offset = 0) {
  // Use the admin list users endpoint
  const res = await auth.api.listUserAccounts({ headers: await headers(), query: { limit, offset }  });
  // res likely contains { users, total }
  return res;
}

export async function createAuthUser(data: { email: string; name?: string; password?: string; roles?: string[]; }) {
  // Uses better-auth admin createUser endpoint
  const res = await auth.api.createUser({ headers: await headers(), body: data });
  return res;
}
