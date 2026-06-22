'use server';

import { Decimal } from 'decimal.js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Prisma } from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { generateUniqueNumber } from '@/lib/utils';
import { CustomizationSettingsInput } from '../base/sideBar/customize/types';
import { validateCustomer } from '../shared/file-action';
import { validateItems } from '../shared/utils';

import {
  CreateEstimateData,
  CreateEstimateResponse,
  UpdateEstimateData
} from './types';
import { headers } from 'next/headers';

type EstimateStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED';
interface EstimateItemInput {
  id?: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  taxable: boolean;
  itemId?: string | null;
}
interface Estimate {
  id: string;
  number: string;
  items: {
    id: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
    productName: string;
    description: string | null;
    quantity: number;
    rate: number;
    taxable: boolean;
    itemId: string | null;
    estimateId: string;
  }[];
  customer: {
    displayName: string | null;
    primaryEmail: string | null;
  };
  attachments: {
    id: string;
    fileId: string;
    estimateId: string;
  }[];
  status: EstimateStatus;
  amount: number;
  validUntil: Date | null;
  dueDate: Date;
}

async function validateEstimateNumber(
  tx: Prisma.TransactionClient,
  estimateNumber: string,
  companyId: string
) {
  try {
    const existingEstimate = await tx.estimate.findUnique({
      where: {
        number_companyId: {
          number: estimateNumber,
          companyId
        }
      },
      select: { id: true }
    });

    if (existingEstimate) {
      throw new Error('Estimate number already exists');
    }
  } catch (error) {
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors by their error codes
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          throw new Error('Duplicate estimate number detected');
        case 'P2023': // Inconsistent column data
          throw new Error('Invalid estimate number or company ID format');
        default:
          throw new Error(`Database error: ${error.message}`);
      }
    }

    // Re-throw unknown errors with a more user-friendly message
    throw new Error(
      `Error validating estimate number: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
// Main Action Function
export async function createEstimate(
  data: CreateEstimateData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<CreateEstimateResponse> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }
    const estimate = await prisma.$transaction(async (tx) => {
      const estimateNumber = `EST-${generateUniqueNumber()}`;

      await Promise.all([
        validateCustomer(tx, data.customerId, session.user.companyId),
        validateEstimateNumber(tx, estimateNumber, session.user.companyId)
      ]);

      const totalBeforeTax = validateItems(data.items);

      // Calculate discount
      let discountAmount = 0;
      if (data.discountType && data.discountValue) {
        discountAmount =
          data.discountType === 'PERCENTAGE'
            ? totalBeforeTax * (data.discountValue / 100)
            : Math.min(data.discountValue, totalBeforeTax);
      }

      const subtotalAfterDiscount = totalBeforeTax - discountAmount;

      // Calculate tax
      let taxAmount = 0;
      let taxRate = 0;
      if (data.taxId) {
        const tax = await tx.taxRate.findUnique({
          where: {
            id: data.taxId,
            companyId: session.user.companyId,
            status: 'ACTIVE'
          }
        });

        if (tax) {
          taxRate = tax.rate;
          const taxableAmount = data.items.reduce(
            (sum, item) => sum + (item.taxable ? item.quantity * item.rate : 0),
            0
          );

          const adjustedTaxableAmount =
            data.discountApplicationTime === 'BEFORE_TAX'
              ? taxableAmount * (subtotalAfterDiscount / totalBeforeTax)
              : taxableAmount;

          taxAmount = adjustedTaxableAmount * (tax.rate / 100);
        }
      }

      const totalAmount =
        data.discountApplicationTime === 'BEFORE_TAX'
          ? subtotalAfterDiscount + taxAmount
          : totalBeforeTax + taxAmount - discountAmount;

      // Create estimate with all fields
      const estimate = await tx.estimate.create({
        data: {
          companyId: session.user.companyId,
          number: estimateNumber,
          customerId: data.customerId,
          status: data.status,
          validUntil: data.validUntil,
          dueDate: data.dueDate,
          amount: totalAmount,
          discountType: data.discountType,
          discountValue: data.discountValue || 0,
          discountAmount,
          discountApplicationTime: data.discountApplicationTime,
          taxRate,
          taxId: data.taxId || null,
          taxAmount,
          notes: data.notes?.trim(),
          emailCustomer: data.emailCustomer?.toLowerCase().trim(),
          paymentEventSnapshot: {
            discountType: data.discountType,
            discountValue: data.discountValue,
            discountAmount,
            taxAmount,
            taxRate,
            customPdfSettings: settings,
            color: color,
            customer: {
              name: data.emailCustomer || '',
              type: 'individual',
              address: data.customerAddress
            },
            type: 'Estimate',
            cc: data.ccEmail,
            snapshotTimestamp: new Date().toISOString(),
            amount: totalAmount,
            items: data.items.map((item) => ({
              ...item,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber()
            })),

            dueDate: data.dueDate.toISOString()
          },
          items: {
            create: data.items.map((item) => ({
              productName: item.productName.trim(),
              description: item.description?.trim(),
              quantity: item.quantity,
              rate: item.rate,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber(),
              taxable: item.taxable,
              itemId: item.itemId
            }))
          }
        },
        include: {
          items: true,
          attachments: true,
          tax: true,
          customer: {
            select: {
              displayName: true,
              primaryEmail: true
            }
          }
        }
      });

      // Handle file attachments
      if (data.files?.length) {
        for (const file of data.files) {
          const fileRecord = await tx.file.create({
            data: {
              filename: file.file.name,
              path: file.key!,
              mimetype: file.file.type,
              size: file.file.size,
              purpose: 'estimate_attachment',
              companyId: session.user.companyId
            }
          });

          await tx.estimateAttachment.create({
            data: {
              estimateId: estimate.id,
              fileId: fileRecord.id
            }
          });
        }
      }

      return estimate;
    });

    revalidatePath('/estimates');
    return { success: true, data: estimate };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create estimate'
    };
  }
}

export async function updateEstimate(
  id: string,
  data: UpdateEstimateData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<CreateEstimateResponse> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }
    // Validate that we have required data
    if (!data || !id) {
      throw new Error('Missing required update data or estimate ID');
    }

    const estimate = await prisma.$transaction(async (tx) => {
      await validateCustomer(tx, data.customerId, session.user.companyId);

      const existingEstimate = await tx.estimate.findUnique({
        where: { id, companyId: session.user.companyId },
        include: { items: true, attachments: { include: { file: true } } }
      });

      if (!existingEstimate) throw new Error('Estimate not found');

      // Calculate totals (same as create)
      const totalBeforeTax = validateItems(data.items);
      let discountAmount = 0;
      if (data.discountType !== null) {
        discountAmount =
          data.discountType === 'PERCENTAGE'
            ? totalBeforeTax * (data.discountValue / 100)
            : Math.min(data.discountValue, totalBeforeTax);
      }

      const subtotalAfterDiscount = totalBeforeTax - discountAmount;

      // Calculate tax
      let taxAmount = 0;
      let taxRate = 0;
      if (data.taxId) {
        const tax = await tx.taxRate.findUnique({
          where: {
            id: data.taxId,
            companyId: session.user.companyId,
            status: 'ACTIVE'
          }
        });

        if (tax) {
          taxRate = tax.rate;
          const taxableAmount = data.items.reduce(
            (sum, item) => sum + (item.taxable ? item.quantity * item.rate : 0),
            0
          );

          const adjustedTaxableAmount =
            data.discountApplicationTime === 'BEFORE_TAX'
              ? taxableAmount * (subtotalAfterDiscount / totalBeforeTax)
              : taxableAmount;

          taxAmount = adjustedTaxableAmount * (tax.rate / 100);
        }
      }

      const totalAmount =
        data.discountApplicationTime === 'BEFORE_TAX'
          ? subtotalAfterDiscount + taxAmount
          : totalBeforeTax + taxAmount - discountAmount;

      // Update estimate with all fields
      const updatedEstimate = await tx.estimate.update({
        where: { id },
        data: {
          customerId: data.customerId,
          status: data.status,
          validUntil: data.validUntil,
          dueDate: data.dueDate,
          amount: totalAmount,
          discountType: data.discountType,
          discountValue: data.discountValue || 0,
          discountAmount,
          discountApplicationTime: data.discountApplicationTime,
          taxRate,
          taxId: data.taxId || null,
          taxAmount,
          notes: data.notes?.trim(),
          emailCustomer: data.emailCustomer?.toLowerCase().trim(),
          paymentEventSnapshot: {
            discountType: data.discountType,
            discountValue: data.discountValue,
            discountAmount,
            taxAmount,
            taxRate,
            customPdfSettings: settings,
            color: color,
            customer: {
              name: data.emailCustomer || '',
              type: 'individual',
              address: data.customerAddress
            },
            type: 'ESTIMATE',
            cc: data.ccEmail,
            snapshotTimestamp: new Date().toISOString(),
            amount: totalAmount,
            items: data.items.map((item) => ({
              ...item,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber()
            })),

            dueDate: data.dueDate.toISOString(),

            taxId: data.taxId
          },
          items: {
            create: data.items.map((item) => ({
              productName: item.productName.trim(),
              description: item.description?.trim(),
              quantity: item.quantity,
              rate: item.rate,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber(),
              taxable: item.taxable,
              itemId: item.itemId
            }))
          }
        },
        include: {
          items: true,
          attachments: true,
          tax: true,
          customer: {
            select: {
              displayName: true,
              primaryEmail: true
            }
          }
        }
      });

      // Handle file attachments
      if (data.files?.length) {
        for (const file of data.files) {
          const fileRecord = await tx.file.create({
            data: {
              filename: file.file.name,
              path: file.key!,
              mimetype: file.file.type,
              size: file.file.size,
              purpose: 'estimate_attachment',
              companyId: session.user.companyId
            }
          });

          await tx.estimateAttachment.create({
            data: {
              estimateId: updatedEstimate.id,
              fileId: fileRecord.id
            }
          });
        }
      }

      return updatedEstimate;
    });

    revalidatePath('/estimates');
    return { success: true, data: estimate };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update estimate'
    };
  }
}

export async function convertEstimateToInvoice(estimateId: string) {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }
    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId, companyId: session.user.companyId },
      include: {
        items: true,
        attachments: true
      }
    });

    if (!estimate) {
      return {
        success: false,
        error: 'Estimate not found'
      };
    }

    const invoice = await prisma.$transaction(async (tx) => {
      // Create new invoice from estimate data
      const invoice = await tx.invoice.create({
        data: {
          companyId: session.user.companyId,
          number: `IN-EST-${estimate.number.split('-')[1]}`,
          customerId: estimate.customerId,
          dueDate: estimate.dueDate,
          amount: estimate.amount,
          notes: estimate.notes,
          emailCustomer: estimate.emailCustomer,
          status: 'PENDING',
          convertedFromEstimate: true,
          estimateId: estimate.id,
          paymentEventSnapshot: {
            type: 'INDIVIDUAL_INVOICE',
            snapshotTimestamp: new Date().toISOString(),
            amount: estimate.amount,
            items: estimate.items.map((item) => ({
              productName: item.productName,
              description: item.description || '',
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
              taxable: item.taxable
            })),
            generateInvoiceNow: true,
            dueDate: estimate.dueDate.toISOString(),
            discountType: estimate.discountType,
            discountValue: estimate.discountValue || 0,
            discountAmount: estimate.discountAmount,
            taxRate: estimate.taxRate,
            taxAmount: estimate.taxAmount,
            customPdfSettings: estimate.paymentEventSnapshot.customPdfSettings,
            color: estimate.paymentEventSnapshot.color,
            customer: {
              name: estimate.emailCustomer || '',
              type: 'individual',
              address: estimate.paymentEventSnapshot.customer?.address
            },
            cc: estimate.paymentEventSnapshot.cc
          },
          items: {
            create: estimate.items.map((item) => ({
              productName: item.productName,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
              taxable: item.taxable
            }))
          },
          attachments:
            estimate.attachments.length > 0
              ? {
                  create: estimate.attachments.map((attachment) => ({
                    fileId: attachment.fileId
                  }))
                }
              : undefined
        },
        include: {
          items: true,
          attachments: true,
          customer: {
            select: {
              displayName: true,
              primaryEmail: true
            }
          }
        }
      });

      // Update estimate status to CONVERTED
      await tx.estimate.update({
        where: { id: estimateId },
        data: {
          status: 'CONVERTED'
        }
      });

      return invoice;
    });

    revalidatePath('/estimates');
    revalidatePath('/invoices');

    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error converting estimate to invoice:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to convert estimate to invoice'
    };
  }
}

export async function getEstimate(id: string) {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }
    const estimate = await prisma.estimate.findUnique({
      where: { id, companyId: session.user.companyId },
      include: {
        items: true,
        attachments: {
          include: {
            file: true
          }
        },
        customer: {
          select: {
            id: true,
            displayName: true,
            primaryEmail: true,
            level: true
          }
        },

        tax: {
          select: {
            id: true,
            name: true,
            rate: true,
            agencyName: true,
            description: true
          }
        }
      }
    });

    if (!estimate) {
      return {
        success: false,
        error: 'Estimate not found'
      };
    }

    return {
      success: true,
      data: estimate
    };
  } catch (error) {
    console.error('Error fetching estimate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch estimate'
    };
  }
}
