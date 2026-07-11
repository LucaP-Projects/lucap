'use server';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TaxPaymentFormValues, TaxPaymentRecord } from './schema';

export async function getTaxPayments(): Promise<{ success: boolean; data?: TaxPaymentRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const data = await prisma.taxPayment.findMany({ where: { companyId: session.user.activeCompanyId }, orderBy: { paymentDate: 'desc' } });
    return { success: true, data: data as unknown as TaxPaymentRecord[] };
  } catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}

export async function createTaxPayment(data: TaxPaymentFormValues): Promise<{ success: boolean; error?: string; data?: TaxPaymentRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const created = await prisma.taxPayment.create({ data: { amount: data.amount, paymentDate: new Date(data.paymentDate), taxAgencyId: data.taxAgencyId || null, reference: data.reference || null, notes: data.notes || null, companyId: session.user.activeCompanyId } });
    return { success: true, data: created as unknown as TaxPaymentRecord };
  } catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}

export async function deleteTaxPayment(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try { await prisma.taxPayment.delete({ where: { id } }); return { success: true }; }
  catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}
