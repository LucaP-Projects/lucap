'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EmployeeFormValues, EmployeeRecord } from './schema';

export async function getEmployees(search?: string): Promise<{ success: boolean; data?: EmployeeRecord[]; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const employees = await prisma.employee.findMany({
      where: { companyId: session.user.activeCompanyId, ...(search ? { displayName: { contains: search, mode: 'insensitive' } } : {}) },
      orderBy: { displayName: 'asc' },
    });
    return { success: true, data: employees as unknown as EmployeeRecord[] };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Failed to fetch employees' };
  }
}

export async function createEmployee(data: EmployeeFormValues): Promise<{ success: boolean; error?: string; data?: EmployeeRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const created = await prisma.employee.create({
      data: { ...data, billRate: data.billRate ?? null, companyId: session.user.activeCompanyId },
    });
    return { success: true, data: created as unknown as EmployeeRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Failed to create employee' };
  }
}

export async function updateEmployee(id: string, data: EmployeeFormValues): Promise<{ success: boolean; error?: string; data?: EmployeeRecord }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    const updated = await prisma.employee.update({
      where: { id },
      data: { ...data, billRate: data.billRate ?? null },
    });
    return { success: true, data: updated as unknown as EmployeeRecord };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Failed to update employee' };
  }
}

export async function deleteEmployee(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithCompany();
  if (!session?.user?.id) redirect('/auth/login');
  if (!session?.user?.activeCompanyId) redirect('/select-company');
  try {
    await prisma.employee.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Failed to delete employee' };
  }
}
