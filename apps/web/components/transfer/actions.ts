'use server';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TransferFormValues, TransferRecord } from './schema';

export async function getTransfers(): Promise<{ success: boolean; data?: TransferRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const data = await prisma.transfer.findMany({ where: { companyId: session.user.activeCompanyId }, orderBy: { transferDate: 'desc' } });
    return { success: true, data: data as unknown as TransferRecord[] };
  } catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}

export async function createTransfer(data: TransferFormValues): Promise<{ success: boolean; error?: string; data?: TransferRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const created = await prisma.transfer.create({
      data: { amount: data.amount, transferDate: new Date(data.transferDate), fromAccountId: data.fromAccountId, toAccountId: data.toAccountId, memo: data.memo || null, companyId: session.user.activeCompanyId },
    });
    return { success: true, data: created as unknown as TransferRecord };
  } catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}

export async function deleteTransfer(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try { await prisma.transfer.delete({ where: { id } }); return { success: true }; }
  catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}
