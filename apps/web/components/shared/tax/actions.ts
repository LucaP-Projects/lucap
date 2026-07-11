'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { TaxStatus, TaxType } from '@/lib/generated/prisma/enums';
import { prisma } from '@/lib/prisma';

export type TaxSelectData = {
  id: string;
  name: string;
  description: string | null;
  agencyName: string;
  type: TaxType;
  rate: number;
  status: TaxStatus;
};

export type TaxResponse = {
  success: boolean;
  data?: TaxSelectData[];
  error?: string;
  redirect?: string;
};

export async function getTaxesForSelect(search?: string): Promise<TaxResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    const taxes = await prisma.taxRate.findMany({
      where: {
        companyId: session.user.activeCompanyId,
        status: TaxStatus.ACTIVE,
        isActive: true,
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: 'insensitive'
                  }
                },
                {
                  agencyName: {
                    contains: search,
                    mode: 'insensitive'
                  }
                }
              ]
            }
          : {})
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        agencyName: true,
        type: true,
        rate: true,
        status: true
      }
    });

    return { success: true, data: taxes };
  } catch (error) {
    console.error('Error fetching taxes:', error);
    return { success: false, error: 'Failed to fetch taxes' };
  }
}

// Add a function to handle tax deletion (soft delete)
export async function deleteTax(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Check if tax exists and belongs to the company
    const tax = await prisma.taxRate.findUnique({
      where: {
        id,
        companyId: session.user.activeCompanyId,
        isActive: true
      }
    });

    if (!tax) {
      return { success: false, error: 'Tax rate not found' };
    }

    // Check if the tax is being used in any documents
    const usageCount = await prisma
      .$transaction([
        prisma.invoice.count({ where: { taxId: id, isActive: true } }),
        prisma.estimate.count({ where: { taxId: id, isActive: true } }),
        prisma.salesReceipt.count({ where: { taxId: id, isActive: true } }),
        prisma.refundReceipt.count({ where: { taxId: id, isActive: true } }),
        prisma.creditMemo.count({ where: { taxId: id, isActive: true } }),
        prisma.delayedCharge.count({ where: { taxId: id, isActive: true } }),
        prisma.delayedCredit.count({ where: { taxId: id, isActive: true } })
      ])
      .then((counts) => counts.reduce((sum, count) => sum + count, 0));

    if (usageCount > 0) {
      return {
        success: false,
        error:
          'Cannot delete tax rate that is used in documents. Consider setting it to inactive instead.'
      };
    }

    // Perform soft delete
    await prisma.taxRate.update({
      where: { id },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedByUserId: session.user.id,
        deactivationReason: 'Tax rate deactivated by user',
        status: TaxStatus.INACTIVE // Also update the tax-specific status field
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting tax rate:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete tax rate'
    };
  }
}
