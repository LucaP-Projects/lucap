'use server';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DepositFormValues, DepositRecord } from './schema';

export async function getDeposits(): Promise<{ success: boolean; data?: DepositRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const data = await prisma.deposit.findMany({ where: { companyId: session.user.activeCompanyId }, orderBy: { depositDate: 'desc' } });
    return { success: true, data: data as unknown as DepositRecord[] };
  } catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}

export async function createDeposit(data: DepositFormValues): Promise<{ success: boolean; error?: string; data?: DepositRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const created = await prisma.deposit.create({
      data: { depositNumber: data.depositNumber || null, amount: data.amount, depositDate: new Date(data.depositDate), memo: data.memo || null, companyId: session.user.activeCompanyId },
    });
    return { success: true, data: created as unknown as DepositRecord };
  } catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}

export async function deleteDeposit(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try { await prisma.deposit.delete({ where: { id } }); return { success: true }; }
  catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}
