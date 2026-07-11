'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DepartmentFormValues, DepartmentRecord } from './schema';

export async function getDepartments(
  search?: string
): Promise<{ success: boolean; data?: DepartmentRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  try {

    const departments = await prisma.department.findMany({
      where: {
        companyId: session.user.activeCompanyId,
        ...(search
          ? {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      include: {
        parent: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: departments as unknown as DepartmentRecord[] };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching departments:', error);
    return { success: false, error: 'Failed to fetch departments' };
  }
}

export async function getDepartmentParents(): Promise<{
  success: boolean;
  data?: { id: string; name: string }[];
  error?: string;
}> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  try {

    const departments = await prisma.department.findMany({
      where: {
        companyId: session.user.activeCompanyId,
        active: true,
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: departments };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching department parents:', error);
    return { success: false, error: 'Failed to fetch department parents' };
  }
}

export async function createDepartment(
  data: DepartmentFormValues
): Promise<{ success: boolean; error?: string; data?: DepartmentRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  try {

    const existing = await prisma.department.findFirst({
      where: {
        companyId: session.user.activeCompanyId,
        name: { equals: data.name, mode: 'insensitive' },
      },
    });

    if (existing) {
      return {
        success: false,
        error: `A department with the name "${data.name}" already exists`,
      };
    }

    const department = await prisma.department.create({
      data: {
        companyId: session.user.activeCompanyId,
        name: data.name,
        parentId: data.parentId || null,
        active: data.active,
      },
      include: {
        parent: { select: { id: true, name: true } },
      },
    });

    return {
      success: true,
      data: department as unknown as DepartmentRecord,
    };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error creating department:', error);
    return { success: false, error: 'Failed to create department' };
  }
}

export async function updateDepartment(
  id: string,
  data: DepartmentFormValues
): Promise<{ success: boolean; error?: string; data?: DepartmentRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  try {

    const existing = await prisma.department.findFirst({
      where: {
        companyId: session.user.activeCompanyId,
        name: { equals: data.name, mode: 'insensitive' },
        id: { not: id },
      },
    });

    if (existing) {
      return {
        success: false,
        error: `A department with the name "${data.name}" already exists`,
      };
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        parentId: data.parentId || null,
        active: data.active,
      },
      include: {
        parent: { select: { id: true, name: true } },
      },
    });

    return {
      success: true,
      data: department as unknown as DepartmentRecord,
    };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error updating department:', error);
    return { success: false, error: 'Failed to update department' };
  }
}

export async function deleteDepartment(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  try {

    const hasChildren = await prisma.department.findFirst({
      where: { parentId: id },
    });

    if (hasChildren) {
      return {
        success: false,
        error: 'Cannot delete department with sub-departments. Remove or reassign them first.',
      };
    }
    await prisma.department.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error deleting department:', error);
    return { success: false, error: 'Failed to delete department' };
  }
}
