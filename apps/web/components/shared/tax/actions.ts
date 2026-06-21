'use server';

import { TaxStatus, TaxType } from '@/lib/generated/prisma/client';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
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
    const session = await auth.api.getSession();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    const taxes = await db.taxRate.findMany({
      where: {
        companyId: session.user.companyId,
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
    const session = await auth.api.getSession();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    // Check if tax exists and belongs to the company
    const tax = await db.taxRate.findUnique({
      where: {
        id,
        companyId: session.user.companyId,
        isActive: true
      }
    });

    if (!tax) {
      return { success: false, error: 'Tax rate not found' };
    }

    // Check if the tax is being used in any documents
    const usageCount = await db
      .$transaction([
        db.invoice.count({ where: { taxId: id, isActive: true } }),
        db.estimate.count({ where: { taxId: id, isActive: true } }),
        db.salesReceipt.count({ where: { taxId: id, isActive: true } }),
        db.refundReceipt.count({ where: { taxId: id, isActive: true } }),
        db.creditMemo.count({ where: { taxId: id, isActive: true } }),
        db.delayedCharge.count({ where: { taxId: id, isActive: true } }),
        db.delayedCredit.count({ where: { taxId: id, isActive: true } })
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
    await db.taxRate.update({
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
