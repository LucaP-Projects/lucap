'use server';

import { TaxRate, TaxStatus, TaxType } from '@/lib/generated/prisma/client';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TaxFormValues } from './schema';

export type TaxRateData = {
  id: string;
  name: string;
  description: string | null;
  agencyName: string;
  type: TaxType;
  rate: number;
  status: TaxStatus;
  effectiveDate: string;
  endDate: string | null;
  isUsed: boolean;
};

export type TaxRateResponse = {
  success: boolean;
  data?: TaxRateData[];
  error?: string;
  redirect?: string;
};

export async function getTaxRates(search?: string): Promise<TaxRateResponse> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    const taxRates = await prisma.taxRate.findMany({
      where: {
        companyId: session.user.companyId,
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
                },
                {
                  description: {
                    contains: search,
                    mode: 'insensitive'
                  }
                }
              ]
            }
          : {})
      },
      orderBy: [
        { status: 'asc' }, // Active first
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        description: true,
        agencyName: true,
        type: true,
        rate: true,
        status: true,
        effectiveDate: true,
        endDate: true,
        // Check if tax rate is used in any documents
        Invoice: {
          select: { id: true },
          take: 1,
          where: { isActive: true }
        },
        Estimate: {
          select: { id: true },
          take: 1,
          where: { isActive: true }
        },
        CreditMemo: {
          select: { id: true },
          take: 1,
          where: { isActive: true }
        },
        SalesReceipt: {
          select: { id: true },
          take: 1,
          where: { isActive: true }
        },
        RefundReceipt: {
          select: { id: true },
          take: 1,
          where: { isActive: true }
        },
        DelayedCharge: {
          select: { id: true },
          take: 1,
          where: { isActive: true }
        },
        DelayedCredit: {
          select: { id: true },
          take: 1,
          where: { isActive: true }
        }
      }
    });

    const formattedTaxRates = taxRates.map((taxRate) => ({
      id: taxRate.id,
      name: taxRate.name,
      description: taxRate.description,
      agencyName: taxRate.agencyName,
      type: taxRate.type,
      rate: taxRate.rate,
      status: taxRate.status,
      effectiveDate: taxRate.effectiveDate.toISOString(),
      endDate: taxRate.endDate?.toISOString() || null,
      isUsed: !!(
        taxRate.Invoice.length ||
        taxRate.Estimate.length ||
        taxRate.CreditMemo.length ||
        taxRate.SalesReceipt.length ||
        taxRate.RefundReceipt.length ||
        taxRate.DelayedCharge.length ||
        taxRate.DelayedCredit.length
      )
    }));

    return { success: true, data: formattedTaxRates };
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    return { success: false, error: 'Failed to fetch tax rates' };
  }
}

export async function createTax(data: TaxFormValues): Promise<{
  success: boolean;
  error?: string;
  data?: TaxRate;
}> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    return await prisma.$transaction(async (tx) => {
      // Check for existing tax rate within transaction
      const existingTax = await tx.taxRate.findFirst({
        where: {
          companyId: session.user.companyId,
          name: {
            equals: data.name,
            mode: 'insensitive'
          }
        }
      });

      if (existingTax) {
        return {
          success: false,
          error: `A tax rate with the name "${data.name}" already exists`
        };
      }

      const createdTax = await prisma.taxRate.create({
        data: {
          companyId: session.user.companyId,
          name: data.name,
          description: data.description,
          agencyName: data.agencyName,
          type: data.type,
          rate: data.rate
        }
      });

      return {
        success: true,
        data: createdTax
      };
    });
  } catch (error) {
    console.error('Error creating tax rate:', error);
    return {
      success: false,
      error: 'Failed to create tax rate. Please try again.'
    };
  }
}

export async function updateTax(
  id: string,
  data: TaxFormValues
): Promise<{
  success: boolean;
  error?: string;
  data?: TaxRate;
}> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    return await prisma.$transaction(async (tx) => {
      const existingTax = await tx.taxRate.findUnique({
        where: {
          id,
          companyId: session.user.companyId,
          isActive: true
        }
      });

      if (!existingTax) {
        return {
          success: false,
          error: 'Tax rate not found'
        };
      }

      const duplicateTax = await tx.taxRate.findFirst({
        where: {
          companyId: session.user.companyId,
          name: {
            equals: data.name,
            mode: 'insensitive'
          },
          id: {
            not: id
          },
          isActive: true
        }
      });

      if (duplicateTax) {
        return {
          success: false,
          error: `A tax rate with the name "${data.name}" already exists`
        };
      }

      const updatedTax = await tx.taxRate.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          agencyName: data.agencyName,
          type: data.type,
          rate: data.rate
        }
      });

      return {
        success: true,
        data: updatedTax
      };
    });
  } catch (error) {
    console.error('Error updating tax rate:', error);
    return {
      success: false,
      error: 'Failed to update tax rate. Please try again.'
    };
  }
}

export async function deleteTaxRate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }
    const tax = await prisma.taxRate.findUnique({
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
    await prisma.taxRate.update({
      where: { id },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedByUserId: session.user.id,
        deactivationReason: 'Tax rate deleted by user',
        status: TaxStatus.INACTIVE
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
