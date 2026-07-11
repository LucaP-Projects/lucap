'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BudgetFormValues, BudgetRecord, BudgetWithEntries } from './schema';

export async function getBudgets(): Promise<{ success: boolean; data?: BudgetRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const budgets = await prisma.budget.findMany({
      where: { companyId: session.user.activeCompanyId },
      orderBy: { fiscalYear: 'desc' },
    });
    return { success: true, data: budgets as unknown as BudgetRecord[] };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Failed to fetch budgets' };
  }
}

export async function getBudgetById(id: string): Promise<{ success: boolean; data?: BudgetWithEntries; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: { entries: { include: { account: { select: { id: true, title: true, number: true } } } } },
    });
    if (!budget) return { success: false, error: 'Budget not found' };
    return { success: true, data: budget as unknown as BudgetWithEntries };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Failed to fetch budget' };
  }
}

export async function createBudget(
  data: BudgetFormValues
): Promise<{ success: boolean; error?: string; data?: BudgetRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const existing = await prisma.budget.findUnique({
      where: { name_companyId_fiscalYear: { name: data.name, companyId: session.user.activeCompanyId, fiscalYear: data.fiscalYear } },
    });
    if (existing) return { success: false, error: 'Budget with this name and fiscal year already exists' };

    const budget = await prisma.budget.create({
      data: {
        name: data.name,
        fiscalYear: data.fiscalYear,
        startDate: new Date(data.fiscalYear, 0, 1),
        endDate: new Date(data.fiscalYear, 11, 31),
        companyId: session.user.activeCompanyId,
        entries: {
          create: data.entries.map(e => ({ accountId: e.accountId, amount: e.amount })),
        },
      },
    });
    return { success: true, data: budget as unknown as BudgetRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Failed to create budget' };
  }
}

export async function deleteBudget(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    await prisma.budget.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Failed to delete budget' };
  }
}
