'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ClassFormValues, ClassRecord } from './schema';

export async function getClasses(
  search?: string
): Promise<{ success: boolean; data?: ClassRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  try {

    const classes = await prisma.class.findMany({
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

    return { success: true, data: classes as unknown as ClassRecord[] };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching classes:', error);
    return { success: false, error: 'Failed to fetch classes' };
  }
}

export async function getClassParents(): Promise<{
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

    const classes = await prisma.class.findMany({
      where: {
        companyId: session.user.activeCompanyId,
        active: true,
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: classes };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching class parents:', error);
    return { success: false, error: 'Failed to fetch class parents' };
  }
}

export async function createClass(
  data: ClassFormValues
): Promise<{ success: boolean; error?: string; data?: ClassRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  try {

    const existing = await prisma.class.findFirst({
      where: {
        companyId: session.user.activeCompanyId,
        name: { equals: data.name, mode: 'insensitive' },
      },
    });

    if (existing) {
      return {
        success: false,
        error: `A class with the name "${data.name}" already exists`,
      };
    }

    const created = await prisma.class.create({
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

    return { success: true, data: created as unknown as ClassRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error creating class:', error);
    return { success: false, error: 'Failed to create class' };
  }
}

export async function updateClass(
  id: string,
  data: ClassFormValues
): Promise<{ success: boolean; error?: string; data?: ClassRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  if (!session?.user?.activeCompanyId) {
    redirect('/select-company');
  }

  try {

    const existing = await prisma.class.findFirst({
      where: {
        companyId: session.user.activeCompanyId,
        name: { equals: data.name, mode: 'insensitive' },
        id: { not: id },
      },
    });

    if (existing) {
      return {
        success: false,
        error: `A class with the name "${data.name}" already exists`,
      };
    }

    const updated = await prisma.class.update({
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
    return { success: true, data: updated as unknown as ClassRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error updating class:', error);
    return { success: false, error: 'Failed to update class' };
  }
}

export async function deleteClass(
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

    const hasChildren = await prisma.class.findFirst({
      where: { parentId: id },
    });

    if (hasChildren) {
      return {
        success: false,
        error: 'Cannot delete class with sub-classes. Remove or reassign them first.',
      };
    }
    await prisma.class.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error deleting class:', error);
    return { success: false, error: 'Failed to delete class' };
  }
}
