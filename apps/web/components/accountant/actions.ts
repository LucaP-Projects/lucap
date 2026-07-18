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

// Platform-wide listing for the Admin Console — unlike getAccountantsForCurrentUser(),
// this isn't scoped to the caller's own firm membership.
export async function getAllAccountantsForAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  return prisma.accountant.findMany({
    include: {
      users: { include: { user: { select: { name: true, email: true } } } },
      assignments: { include: { company: { select: { name: true, slug: true } } } }
    },
    orderBy: { name: 'asc' }
  });
}

export async function getAccountantByIdForAdmin(accountantId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  return prisma.accountant.findUnique({
    where: { id: accountantId },
    include: {
      owner: { select: { name: true, email: true } },
      users: { include: { user: { select: { name: true, email: true } } } },
      assignments: { include: { company: { select: { id: true, name: true, slug: true } } } }
    }
  });
}

// Only the firm owner (or a platform admin) can manage a firm's staff/clients —
// there's no separate "senior accountant" role to also grant this.
async function canManageAccountant(accountantId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return false;
  if (session.user.role === 'ADMIN') return true;

  const accountant = await prisma.accountant.findUnique({ where: { id: accountantId } });
  return accountant?.ownerId === session.user.id;
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
          userId: session.user.id
        }
      }
    }
  });

  return accountant;
}

export async function addUserToAccountant(accountantId: string, userId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');
  if (!(await canManageAccountant(accountantId))) throw new Error('Unauthorized');

  const au = await prisma.accountantUser.create({
    data: {
      accountantId,
      userId
    }
  });

  return au;
}

export async function assignCompanyToAccountant(accountantId: string, companyId: string, accountantUserId?: string, permissions?: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');
  if (!(await canManageAccountant(accountantId))) throw new Error('Unauthorized');

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
