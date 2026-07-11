'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

const adminApi = auth.api as typeof auth.api & {
  setRole: (params: { headers: Headers; body: { userId: string; role: string } }) => Promise<unknown>;
  listUserAccounts: (params: { headers: Headers; query: { limit: number; offset: number } }) => Promise<unknown>;
  createUser: (params: { headers: Headers; body: { email: string; name?: string; password?: string; roles?: string[] } }) => Promise<unknown>;
};

export async function setUserRole(userId: string, role: string) {
  const res = await adminApi.setRole({ headers: await headers(), body: { userId, role } });
  return res;
}

export async function listUsers(limit = 100, offset = 0) {
  const res = await adminApi.listUserAccounts({ headers: await headers(), query: { limit, offset }  });
  return res;
}

export async function createAuthUser(data: { email: string; name?: string; password?: string; roles?: string[] }) {
  const res = await adminApi.createUser({ headers: await headers(), body: data });
  return res;
}
