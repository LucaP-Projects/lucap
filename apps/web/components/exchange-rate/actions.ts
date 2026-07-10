'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ExchangeRateFormValues, ExchangeRateRecord } from './schema';

export async function getExchangeRates(
  search?: string
): Promise<{ success: boolean; data?: ExchangeRateRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  try {
    const rates = await prisma.exchangeRate.findMany({
      where: search
        ? {
            OR: [
              { sourceCurrency: { contains: search, mode: 'insensitive' } },
              { targetCurrency: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { asOfDate: 'desc' },
    });
    return { success: true, data: rates as unknown as ExchangeRateRecord[] };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching exchange rates:', error);
    return { success: false, error: 'Failed to fetch exchange rates' };
  }
}

export async function createExchangeRate(
  data: ExchangeRateFormValues
): Promise<{ success: boolean; error?: string; data?: ExchangeRateRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  try {
    const created = await prisma.exchangeRate.create({
      data: {
        sourceCurrency: data.sourceCurrency,
        targetCurrency: data.targetCurrency,
        rate: data.rate,
        asOfDate: new Date(data.asOfDate),
      },
    });
    return { success: true, data: created as unknown as ExchangeRateRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error creating exchange rate:', error);
    return { success: false, error: 'Failed to create exchange rate' };
  }
}

export async function updateExchangeRate(
  id: string,
  data: ExchangeRateFormValues
): Promise<{ success: boolean; error?: string; data?: ExchangeRateRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  try {
    const updated = await prisma.exchangeRate.update({
      where: { id },
      data: {
        sourceCurrency: data.sourceCurrency,
        targetCurrency: data.targetCurrency,
        rate: data.rate,
        asOfDate: new Date(data.asOfDate),
      },
    });
    return { success: true, data: updated as unknown as ExchangeRateRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error updating exchange rate:', error);
    return { success: false, error: 'Failed to update exchange rate' };
  }
}

export async function deleteExchangeRate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  try {
    await prisma.exchangeRate.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error deleting exchange rate:', error);
    return { success: false, error: 'Failed to delete exchange rate' };
  }
}
