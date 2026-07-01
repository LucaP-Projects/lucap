'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getSessionWithCompany } from '@/lib/auth';
import { Permission, SystemRole } from '@/lib/generated/prisma/enums';

/**
 * Creates a new custom role for a company.
 * @param name The name of the role (e.g., "Junior Accountant")
 * @param permissions Array of Permission enums
 * @param systemRole Optional mapping to a system role
 */
export async function createCompanyRole(
  name: string,
  permissions: Permission[],
  systemRole?: SystemRole
) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('No active company');

  // Authorization: Only admins/owners of the company should create roles
  // (In a real app, check permissions.can('role', 'create'))

  const role = await prisma.role.create({
    data: {
      name,
      permissions,
      systemRole,
      companyId: session.user.activeCompanyId,
    },
  });

  revalidatePath('/settings/roles');
  return role;
}

/**
 * Updates an existing role's permissions or name.
 */
export async function updateCompanyRole(
  roleId: string,
  data: { name?: string; permissions?: Permission[]; systemRole?: SystemRole | null }
) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('No active company');

  const role = await prisma.role.update({
    where: {
      id: roleId,
      companyId: session.user.activeCompanyId, // Ensure scoping
    },
    data,
  });

  revalidatePath('/settings/roles');
  return role;
}

/**
 * Assigns a specific role to a user within the active company.
 */
export async function assignUserRole(userId: string, roleId: string) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('No active company');

  const userCompany = await prisma.userCompany.update({
    where: {
      userId_companyId: {
        userId,
        companyId: session.user.activeCompanyId,
      },
    },
    data: {
      roleId,
    },
  });

  revalidatePath('/settings/staff');
  return userCompany;
}

/**
 * Fetches all roles available for the current company.
 */
export async function getCompanyRoles() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return [];

  return prisma.role.findMany({
    where: {
      companyId: session.user.activeCompanyId,
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}
