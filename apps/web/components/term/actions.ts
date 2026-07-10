'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TermFormValues, TermRecord } from './schema';

export async function getTerms(
  search?: string
): Promise<{ success: boolean; data?: TermRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {

    const terms = await prisma.term.findMany({
      where: {
        companyId: session.user.activeCompanyId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: terms as unknown as TermRecord[] };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching terms:', error);
    return { success: false, error: 'Failed to fetch terms' };
  }
}

export async function createTerm(
  data: TermFormValues
): Promise<{ success: boolean; error?: string; data?: TermRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {

    const existing = await prisma.term.findFirst({
      where: {
        companyId: session.user.activeCompanyId,
        name: { equals: data.name, mode: 'insensitive' },
      },
    });
    if (existing) {
      return { success: false, error: `A term named "${data.name}" already exists` };
    }

    const created = await prisma.term.create({
      data: {
        name: data.name,
        dueDays: data.dueDays ?? null,
        discountDays: data.discountDays ?? null,
        discountPercent: data.discountPercent ?? null,
        active: data.active,
        companyId: session.user.activeCompanyId,
      },
    });

    return { success: true, data: created as unknown as TermRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error creating term:', error);
    return { success: false, error: 'Failed to create term' };
  }
}

export async function updateTerm(
  id: string,
  data: TermFormValues
): Promise<{ success: boolean; error?: string; data?: TermRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {

    const existing = await prisma.term.findFirst({
      where: {
        companyId: session.user.activeCompanyId,
        name: { equals: data.name, mode: 'insensitive' },
        id: { not: id },
      },
    });
    if (existing) {
      return { success: false, error: `A term named "${data.name}" already exists` };
    }

    const updated = await prisma.term.update({
      where: { id },
      data: {
        name: data.name,
        dueDays: data.dueDays ?? null,
        discountDays: data.discountDays ?? null,
        discountPercent: data.discountPercent ?? null,
        active: data.active,
      },
    });

    return { success: true, data: updated as unknown as TermRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error updating term:', error);
    return { success: false, error: 'Failed to update term' };
  }
}

export async function deleteTerm(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {

    await prisma.term.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error deleting term:', error);
    return { success: false, error: 'Failed to delete term' };
  }
}