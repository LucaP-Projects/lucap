'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getAccountantsForCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  // Accountants the user owns
  const owned = await prisma.accountant.findMany({
    where: { ownerId: userId },
    include: { users: true, assignments: { include: { company: true } } }
  });

  // Accountants where the user is a staff member
  const member = await prisma.accountantUser.findMany({
    where: { userId },
    include: { accountant: { include: { assignments: { include: { company: true } }, users: true } } }
  });

  const viaMembership = member.map((m) => m.accountant);

  // Merge unique
  const map = new Map<string, any>();
  owned.forEach((a) => map.set(a.id, a));
  viaMembership.forEach((a) => map.set(a.id, a));

  return Array.from(map.values());
}

export async function createAccountant(name: string, slug?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accountant = await prisma.accountant.create({
    data: {
      name,
      slug,
      ownerId: session.user.id,
      users: {
        create: {
          userId: session.user.id,
          role: 'OWNER'
        }
      }
    }
  });

  return accountant;
}

export async function addUserToAccountant(accountantId: string, userId: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER') {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  // TODO: Authorization check (only owner/admin)

  const au = await prisma.accountantUser.create({
    data: {
      accountantId,
      userId,
      role
    }
  });

  return au;
}

export async function assignCompanyToAccountant(accountantId: string, companyId: string, accountantUserId?: string, permissions?: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  // TODO: Authorization check

  const assignment = await prisma.accountantAssignment.upsert({
    where: { accountantId_companyId: { accountantId, companyId } },
    update: {
      accountantUserId,
      permissions
    },
    create: {
      accountantId,
      companyId,
      accountantUserId,
      permissions
    }
  });

  return assignment;
}
