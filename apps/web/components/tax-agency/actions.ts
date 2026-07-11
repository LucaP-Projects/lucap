'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TaxAgencyFormValues, TaxAgencyRecord } from './schema';

export async function getTaxAgencies(
  search?: string
): Promise<{ success: boolean; data?: TaxAgencyRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const agencies = await prisma.taxAgency.findMany({
      where: {
        companyId: session.user.activeCompanyId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: agencies as unknown as TaxAgencyRecord[] };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching tax agencies:', error);
    return { success: false, error: 'Failed to fetch tax agencies' };
  }
}

export async function createTaxAgency(
  data: TaxAgencyFormValues
): Promise<{ success: boolean; error?: string; data?: TaxAgencyRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const existing = await prisma.taxAgency.findUnique({
      where: { name_companyId: { name: data.name, companyId: session.user.activeCompanyId } },
    });
    if (existing) {
      return { success: false, error: `Tax agency "${data.name}" already exists` };
    }
    const created = await prisma.taxAgency.create({
      data: {
        name: data.name,
        registrationNumber: data.registrationNumber || null,
        taxTrackedOnSales: data.taxTrackedOnSales,
        taxTrackedOnPurchases: data.taxTrackedOnPurchases,
        companyId: session.user.activeCompanyId,
      },
    });
    return { success: true, data: created as unknown as TaxAgencyRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error creating tax agency:', error);
    return { success: false, error: 'Failed to create tax agency' };
  }
}

export async function updateTaxAgency(
  id: string,
  data: TaxAgencyFormValues
): Promise<{ success: boolean; error?: string; data?: TaxAgencyRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const existing = await prisma.taxAgency.findFirst({
      where: { companyId: session.user.activeCompanyId, name: data.name, id: { not: id } },
    });
    if (existing) {
      return { success: false, error: `Tax agency "${data.name}" already exists` };
    }
    const updated = await prisma.taxAgency.update({
      where: { id },
      data: {
        name: data.name,
        registrationNumber: data.registrationNumber || null,
        taxTrackedOnSales: data.taxTrackedOnSales,
        taxTrackedOnPurchases: data.taxTrackedOnPurchases,
      },
    });
    return { success: true, data: updated as unknown as TaxAgencyRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error updating tax agency:', error);
    return { success: false, error: 'Failed to update tax agency' };
  }
}

export async function deleteTaxAgency(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    await prisma.taxAgency.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error deleting tax agency:', error);
    return { success: false, error: 'Failed to delete tax agency' };
  }
}
