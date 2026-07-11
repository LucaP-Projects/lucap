'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TimeActivityFormValues, TimeActivityRecord } from './schema';

export async function getTimeActivities(): Promise<{ success: boolean; data?: TimeActivityRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const data = await prisma.timeActivity.findMany({
      where: { companyId: session.user.activeCompanyId },
      orderBy: { date: 'desc' },
      include: { employee: { select: { displayName: true } }, customer: { select: { displayName: true } } },
    });
    return { success: true, data: data as unknown as TimeActivityRecord[] };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Failed to fetch time activities' };
  }
}

export async function createTimeActivity(data: TimeActivityFormValues): Promise<{ success: boolean; error?: string; data?: TimeActivityRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const created = await prisma.timeActivity.create({
      data: {
        employeeId: data.employeeId,
        customerId: data.customerId || null,
        date: new Date(data.date),
        duration: data.duration,
        description: data.description || null,
        billable: data.billable,
        hourlyRate: data.hourlyRate ?? null,
        companyId: session.user.activeCompanyId,
      },
    });
    return { success: true, data: created as unknown as TimeActivityRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Failed to create time activity' };
  }
}

export async function deleteTimeActivity(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    await prisma.timeActivity.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Failed to delete time activity' };
  }
}
