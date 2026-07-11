'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CustomerTypeFormValues, CustomerTypeRecord } from './schema';

export async function getCustomerTypes(
  search?: string
): Promise<{ success: boolean; data?: CustomerTypeRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {

    const types = await prisma.customerType.findMany({
      where: {
        companyId: session.user.activeCompanyId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: types as unknown as CustomerTypeRecord[] };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching customer types:', error);
    return { success: false, error: 'Failed to fetch customer types' };
  }
}

export async function createCustomerType(
  data: CustomerTypeFormValues
): Promise<{ success: boolean; error?: string; data?: CustomerTypeRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {

    const existing = await prisma.customerType.findFirst({
      where: {
        companyId: session.user.activeCompanyId,
        name: { equals: data.name, mode: 'insensitive' },
      },
    });
    if (existing) {
      return { success: false, error: `A customer type named "${data.name}" already exists` };
    }

    const created = await prisma.customerType.create({
      data: { name: data.name, active: data.active, companyId: session.user.activeCompanyId },
    });

    return { success: true, data: created as unknown as CustomerTypeRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error creating customer type:', error);
    return { success: false, error: 'Failed to create customer type' };
  }
}

export async function updateCustomerType(
  id: string,
  data: CustomerTypeFormValues
): Promise<{ success: boolean; error?: string; data?: CustomerTypeRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {

    const existing = await prisma.customerType.findFirst({
      where: {
        companyId: session.user.activeCompanyId,
        name: { equals: data.name, mode: 'insensitive' },
        id: { not: id },
      },
    });
    if (existing) {
      return { success: false, error: `A customer type named "${data.name}" already exists` };
    }

    const updated = await prisma.customerType.update({
      where: { id },
      data: { name: data.name, active: data.active },
    });

    return { success: true, data: updated as unknown as CustomerTypeRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error updating customer type:', error);
    return { success: false, error: 'Failed to update customer type' };
  }
}

export async function deleteCustomerType(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {

    const inUse = await prisma.customer.findFirst({ where: { customerTypeId: id } });
    if (inUse) {
      return { success: false, error: 'Cannot delete: customer type is assigned to one or more customers.' };
    }

    await prisma.customerType.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error deleting customer type:', error);
    return { success: false, error: 'Failed to delete customer type' };
  }
}
