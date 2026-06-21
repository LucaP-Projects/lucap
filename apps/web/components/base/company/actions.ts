// app/actions/company.ts
'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getCurrentCompany() {
  const session = await auth.api.getSession();
  if (!session?.user?.id) {
    redirect('/login');
  }
  if (!session?.user?.companyId) {
    redirect('/select-company');
  }

  return prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: {
      name: true,
      legalName: true,
      taxId: true,
      email: true,
      phone: true,
      website: true,
      address: true,
      logo: true
    }
  });
}
