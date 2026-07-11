import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { model, nameField, nameValue } = await request.json();

  const modelMap: Record<string, any> = {
    term: prisma.term, class: prisma.class, department: prisma.department,
    taxCode: prisma.taxCode, taxAgency: prisma.taxAgency, employee: prisma.employee,
    companyCurrency: prisma.companyCurrency, customerType: prisma.customerType,
    category: prisma.category, budget: prisma.budget,
  };

  const m = modelMap[model];
  if (!m) return NextResponse.json({ error: 'Unknown model' }, { status: 400 });

  await m.deleteMany({ where: { [nameField || 'name']: { contains: nameValue } } });
  return NextResponse.json({ success: true });
}
