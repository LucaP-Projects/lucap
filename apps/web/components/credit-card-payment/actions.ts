'use server';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CCPaymentFormValues, CCPaymentRecord } from './schema';

export async function getCCPayments(): Promise<{ success: boolean; data?: CCPaymentRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const data = await prisma.creditCardPayment.findMany({ where: { companyId: session.user.activeCompanyId }, orderBy: { txnDate: 'desc' } });
    return { success: true, data: data as unknown as CCPaymentRecord[] };
  } catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}

export async function createCCPayment(data: CCPaymentFormValues): Promise<{ success: boolean; error?: string; data?: CCPaymentRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const created = await prisma.creditCardPayment.create({
      data: { txnDate: new Date(data.txnDate), amount: data.amount, bankAccountId: data.bankAccountId, creditCardAccountId: data.creditCardAccountId, vendorId: data.vendorId || null, privateNote: data.privateNote || null, companyId: session.user.activeCompanyId },
    });
    return { success: true, data: created as unknown as CCPaymentRecord };
  } catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}

export async function deleteCCPayment(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try { await prisma.creditCardPayment.delete({ where: { id } }); return { success: true }; }
  catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}
