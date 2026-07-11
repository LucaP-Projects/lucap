'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getPreferences() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  const company = await prisma.company.findUnique({ where: { id: session.user.activeCompanyId } });
  return { baseCurrency: company?.baseCurrency || 'TND', ...((company?.settings as Record<string, unknown>) || {}) };
}

export async function savePreferences(data: { baseCurrency?: string }) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  await prisma.company.update({
    where: { id: session.user.activeCompanyId },
    data: { baseCurrency: data.baseCurrency },
  });
  return { success: true };
}
