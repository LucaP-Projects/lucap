'use server';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdjustmentFormValues, AdjustmentRecord } from './schema';

export async function getAdjustments(): Promise<{ success: boolean; data?: AdjustmentRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const data = await prisma.inventoryAdjustment.findMany({ where: { companyId: session.user.activeCompanyId }, orderBy: { date: 'desc' }, include: { item: { select: { name: true } } } });
    return { success: true, data: data as unknown as AdjustmentRecord[] };
  } catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}

export async function createAdjustment(data: AdjustmentFormValues): Promise<{ success: boolean; error?: string; data?: AdjustmentRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const created = await prisma.$transaction(async (tx) => {
      const adj = await tx.inventoryAdjustment.create({ data: { docNumber: data.docNumber || null, itemId: data.itemId, quantity: data.quantity, adjustAccountId: data.adjustAccountId || null, privateNote: data.privateNote || null, date: new Date(data.date), companyId: session.user.activeCompanyId } });
      await tx.item.update({ where: { id: data.itemId }, data: { quantityOnHand: { increment: data.quantity } } });
      return adj;
    });
    return { success: true, data: created as unknown as AdjustmentRecord };
  } catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}

export async function deleteAdjustment(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const adj = await prisma.inventoryAdjustment.findUnique({ where: { id } });
    if (adj) await prisma.item.update({ where: { id: adj.itemId }, data: { quantityOnHand: { decrement: adj.quantity } } });
    await prisma.inventoryAdjustment.delete({ where: { id } });
    return { success: true };
  } catch (error) { if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error; return { success: false, error: 'Failed' }; }
}
