'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TaxCodeFormValues, TaxCodeRecord } from './schema';

export async function getTaxCodes(
  search?: string
): Promise<{ success: boolean; data?: TaxCodeRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const codes = await prisma.taxCode.findMany({
      where: {
        companyId: session.user.activeCompanyId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: codes as unknown as TaxCodeRecord[] };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching tax codes:', error);
    return { success: false, error: 'Failed to fetch tax codes' };
  }
}

export async function createTaxCode(
  data: TaxCodeFormValues
): Promise<{ success: boolean; error?: string; data?: TaxCodeRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const existing = await prisma.taxCode.findUnique({
      where: { name_companyId: { name: data.name, companyId: session.user.activeCompanyId } },
    });
    if (existing) {
      return { success: false, error: `Tax code "${data.name}" already exists` };
    }
    const created = await prisma.taxCode.create({
      data: { name: data.name, description: data.description || null, taxGroup: data.taxGroup, taxable: data.taxable, active: data.active, companyId: session.user.activeCompanyId },
    });
    return { success: true, data: created as unknown as TaxCodeRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error creating tax code:', error);
    return { success: false, error: 'Failed to create tax code' };
  }
}

export async function updateTaxCode(
  id: string,
  data: TaxCodeFormValues
): Promise<{ success: boolean; error?: string; data?: TaxCodeRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const existing = await prisma.taxCode.findFirst({
      where: { companyId: session.user.activeCompanyId, name: data.name, id: { not: id } },
    });
    if (existing) {
      return { success: false, error: `Tax code "${data.name}" already exists` };
    }
    const updated = await prisma.taxCode.update({
      where: { id },
      data: { name: data.name, description: data.description || null, taxGroup: data.taxGroup, taxable: data.taxable, active: data.active },
    });
    return { success: true, data: updated as unknown as TaxCodeRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error updating tax code:', error);
    return { success: false, error: 'Failed to update tax code' };
  }
}

export async function deleteTaxCode(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    await prisma.taxCode.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error deleting tax code:', error);
    return { success: false, error: 'Failed to delete tax code' };
  }
}
