'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CompanyCurrencyFormValues, CompanyCurrencyRecord } from './schema';

export async function getCurrencies(
  search?: string
): Promise<{ success: boolean; data?: CompanyCurrencyRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const currencies = await prisma.companyCurrency.findMany({
      where: {
        companyId: session.user.activeCompanyId,
        ...(search ? { currency: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { currency: 'asc' },
    });
    return { success: true, data: currencies as unknown as CompanyCurrencyRecord[] };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching currencies:', error);
    return { success: false, error: 'Failed to fetch currencies' };
  }
}

export async function createCurrency(
  data: CompanyCurrencyFormValues
): Promise<{ success: boolean; error?: string; data?: CompanyCurrencyRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const existing = await prisma.companyCurrency.findUnique({
      where: { companyId_currency: { companyId: session.user.activeCompanyId, currency: data.currency } },
    });
    if (existing) {
      return { success: false, error: `Currency "${data.currency}" already exists` };
    }

    if (data.isDefault) {
      await prisma.companyCurrency.updateMany({
        where: { companyId: session.user.activeCompanyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const created = await prisma.companyCurrency.create({
      data: {
        currency: data.currency,
        name: data.name || null,
        active: data.active,
        isDefault: data.isDefault,
        companyId: session.user.activeCompanyId,
      },
    });
    return { success: true, data: created as unknown as CompanyCurrencyRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error creating currency:', error);
    return { success: false, error: 'Failed to create currency' };
  }
}

export async function updateCurrency(
  id: string,
  data: CompanyCurrencyFormValues
): Promise<{ success: boolean; error?: string; data?: CompanyCurrencyRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const existing = await prisma.companyCurrency.findFirst({
      where: {
        companyId: session.user.activeCompanyId,
        currency: data.currency,
        id: { not: id },
      },
    });
    if (existing) {
      return { success: false, error: `Currency "${data.currency}" already exists` };
    }

    if (data.isDefault) {
      await prisma.companyCurrency.updateMany({
        where: { companyId: session.user.activeCompanyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.companyCurrency.update({
      where: { id },
      data: { currency: data.currency, name: data.name || null, active: data.active, isDefault: data.isDefault },
    });
    return { success: true, data: updated as unknown as CompanyCurrencyRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error updating currency:', error);
    return { success: false, error: 'Failed to update currency' };
  }
}

export async function deleteCurrency(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    await prisma.companyCurrency.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error deleting currency:', error);
    return { success: false, error: 'Failed to delete currency' };
  }
}
