'use server';

import { Decimal } from 'decimal.js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { CreditMemoStatus } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';
import { generateUniqueNumber } from '@/lib/utils';
import { CustomizationSettingsInput } from '../base/sideBar/customize/types';
import { validateCustomer } from '../shared/file-action';
import { validateItems } from '../shared/utils';
import {
  CreditMemo,
  CreateCreditMemoData,
  CreateCreditMemoResponse,
  UpdateCreditMemoData
} from './types';

async function validateCreditMemoNumber(
  tx: Prisma.TransactionClient,
  creditMemoNumber: string,
  companyId: string
): Promise<void> {
  try {
    const existingCreditMemo = await tx.creditMemo.findUnique({
      where: {
        number_companyId: {
          number: creditMemoNumber,
          companyId
        },
        isActive: true
      },
      select: { id: true }
    });

    if (existingCreditMemo) {
      throw new Error('Credit memo number already exists');
    }
  } catch (error) {
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors by their error codes
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          throw new Error('Duplicate credit memo number detected', { cause: error });
        case 'P2023': // Inconsistent column data
          throw new Error('Invalid credit memo number or company ID format', { cause: error });
        default:
          throw new Error(`Database error: ${error.message}`, { cause: error });
      }
    }

    // Re-throw unknown errors with a more user-friendly message
    throw new Error(
      `Error validating credit memo number: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error }
    );
  }
}

async function validateOriginalInvoice(
  tx: Prisma.TransactionClient,
  companyId: string,
  invoiceId?: string
) {
  if (!invoiceId) return;

  const invoice = await tx.invoice.findUnique({
    where: {
      id: invoiceId,
      companyId,
      isActive: true
    },
    select: { id: true, status: true }
  });

  if (!invoice) {
    throw new Error('Original invoice not found');
  }

  if (invoice.status === 'CANCELLED') {
    throw new Error(
      'Cannot create credit memo for voided or cancelled invoice'
    );
  }
}

// Main Action Function
export async function createCreditMemo(
  data: CreateCreditMemoData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<CreateCreditMemoResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) redirect('/login');
    if (!session?.user?.activeCompanyId) redirect('/select-company');

    // Process originalInvoiceId - convert empty string to null
    const originalInvoiceId =
      data.originalInvoiceId && data.originalInvoiceId.trim() !== ''
        ? data.originalInvoiceId
        : null;

    const creditMemo = await prisma.$transaction(async (tx) => {
      const creditMemoNumber = `CM-${generateUniqueNumber()}`;
      await Promise.all([
        validateCustomer(tx, data.customerId, session.user.activeCompanyId),
        validateCreditMemoNumber(tx, creditMemoNumber, session.user.activeCompanyId)
      ]);

      // Validate original invoice if provided
      if (originalInvoiceId) {
        await validateOriginalInvoice(
          tx,
          session.user.activeCompanyId,
          originalInvoiceId
        );
      }

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
            companyId: session.user.activeCompanyId,
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

      const creditMemo = await tx.creditMemo.create({
        data: {
          companyId: session.user.activeCompanyId,
          number: creditMemoNumber,
          customerId: data.customerId,
          status: data.status,
          reason: data.reason,
          dueDate: data.dueDate,
          issueDate: data.issueDate,
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
            customPdfSettings: settings,
            color: color,
            customer: {
              name: data.emailCustomer || '',
              type: 'individual',
              address: data.customerAddress
            },
            type: 'CREDIT_MEMO',
            cc: data.ccEmail || '',
            snapshotTimestamp: new Date().toISOString(),
            amount: totalAmount,
            items: data.items.map((item) => ({
              ...item,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber()
            })),
            issueDate: data.issueDate.toISOString(),
            dueDate: data.dueDate
              ? data.dueDate.toISOString()
              : data.issueDate.toISOString(),
            taxId: data.taxId,
            discountType: data.discountType,
            discountValue: data.discountValue,
            discountAmount,
            taxAmount,
            taxRate
          },
          items: {
            create: data.items.map((item) => ({
              productName: item.productName.trim(),
              description: item.description?.trim() || null,
              quantity: item.quantity,
              rate: item.rate,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber(),
              taxable: item.taxable,
              itemId: item.itemId,
              sku: item.sku || null,
              isActive: true
            }))
          },
          isActive: true
        },
        include: {
          items: true,
          attachments: {
            include: {
              file: true
            }
          },
          tax: true,
          customer: {
            select: {
              displayName: true,
              primaryEmail: true
            }
          }
        }
      });

      // Handle APPLIED status
      if (data.status === CreditMemoStatus.APPLIED) {
        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            balance: {
              decrement: totalAmount
            }
          }
        });

        if (originalInvoiceId) {
          await tx.invoice.update({
            where: { id: originalInvoiceId },
            data: {
              amount: {
                decrement: totalAmount
              }
            }
          });
        }
      }

      if (data.files?.length) {
        for (const file of data.files) {
          const fileRecord = await tx.file.create({
            data: {
              filename: file.file.name,
              path: file.key!,
              mimetype: file.file.type,
              size: file.file.size,
              purpose: 'credit_memo_attachment',
              companyId: session.user.activeCompanyId,
              isActive: true
            }
          });

          await tx.creditMemoAttachment.create({
            data: {
              creditMemoId: creditMemo.id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      return creditMemo;
    });

    revalidatePath('/creditmemos');
    return { success: true, data: creditMemo };
  } catch (error) {
    console.error('Error in createCreditMemo:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create credit memo'
    };
  }
}

export async function updateCreditMemo(
  id: string,
  data: UpdateCreditMemoData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<
  { success: true; data: CreditMemo } | { success: false; error: string }
> {
  try {
    if (!data || !id) {
      throw new Error('Missing required update data or credit memo ID');
    }
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    const creditMemo = await prisma.$transaction(async (tx) => {
      // Validate inputs
      await validateCustomer(tx, data.customerId, session.user.activeCompanyId);

      // Validate original invoice if provided
      if (data.originalInvoiceId) {
        await validateOriginalInvoice(
          tx,
          session.user.activeCompanyId,
          data.originalInvoiceId
        );
      }

      // Calculate total amount
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
            companyId: session.user.activeCompanyId,
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

      // Find existing items
      const existingItems = await tx.creditMemoItem.findMany({
        where: {
          creditMemoId: id,
          isActive: true
        }
      });

      // Identify items to update, create, and delete
      const itemsToUpdate = data.items.filter((item) =>
        existingItems.some((ei) => ei.id === item.id)
      );

      const itemsToCreate = data.items.filter(
        (item) => !existingItems.some((ei) => ei.id === item.id)
      );

      const itemsToDelete = existingItems.filter(
        (ei) => !data.items.some((item) => item.id === ei.id)
      );

      // Handle removed attachments
      if (data.removedAttachmentIds?.length) {
        await tx.creditMemoAttachment.updateMany({
          where: {
            id: {
              in: data.removedAttachmentIds
            },
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'Attachment removed from credit memo'
          }
        });
      }

      // Update existing items
      await Promise.all(
        itemsToUpdate.map((item) =>
          tx.creditMemoItem.update({
            where: { id: item.id },
            data: {
              productName: item.productName.trim(),
              description: item.description?.trim(),
              quantity: item.quantity,
              rate: item.rate,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber(),
              taxable: item.taxable
            }
          })
        )
      );

      // Soft delete removed items
      if (itemsToDelete.length > 0) {
        await tx.creditMemoItem.updateMany({
          where: {
            id: {
              in: itemsToDelete.map((item) => item.id)
            },
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'Item removed from credit memo'
          }
        });
      }

      // Create new items
      if (itemsToCreate.length > 0) {
        await tx.creditMemoItem.createMany({
          data: itemsToCreate.map((item) => ({
            creditMemoId: id,
            productName: item.productName.trim(),
            description: item.description?.trim(),
            quantity: item.quantity,
            rate: item.rate,
            amount: new Decimal(item.quantity).mul(item.rate).toNumber(),
            taxable: item.taxable,
            itemId: item.itemId,
            isActive: true
          }))
        });
      }

      // Update credit memo
      const updatedCreditMemo = await tx.creditMemo.update({
        where: {
          id,
          companyId: session.user.activeCompanyId,
          isActive: true
        },
        data: {
          customerId: data.customerId,
          status: data.status,
          reason: data.reason,
          issueDate: data.issueDate,
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
            customPdfSettings: settings,
            color: color,
            customer: {
              name: data.emailCustomer || '',
              type: 'individual',
              address: data.customerAddress
            },
            type: 'CREDIT_MEMO',
            cc: data.ccEmail || '',
            snapshotTimestamp: new Date().toISOString(),
            amount: totalAmount,
            items: data.items.map((item) => ({
              ...item,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber()
            })),
            issueDate: data.issueDate.toISOString(),
            dueDate: data.dueDate.toISOString(),
            taxId: data.taxId,
            discountType: data.discountType,
            discountValue: data.discountValue,
            discountAmount,
            taxAmount,
            taxRate
          }
        },
        include: {
          items: {
            where: { isActive: true }
          },
          attachments: {
            where: { isActive: true },
            include: {
              file: true
            }
          },
          tax: true,
          customer: {
            select: {
              id: true,
              level: true,
              displayName: true,
              primaryEmail: true
            }
          }
        }
      });

      if (data.files?.length) {
        for (const file of data.files) {
          const fileRecord = await tx.file.create({
            data: {
              filename: file.file.name,
              path: file.key!,
              mimetype: file.file.type,
              size: file.file.size,
              purpose: 'credit_memo_attachment',
              companyId: session.user.activeCompanyId,
              isActive: true
            }
          });

          await tx.creditMemoAttachment.create({
            data: {
              creditMemoId: id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      return updatedCreditMemo;
    });

    revalidatePath('/creditmemos');
    return {
      success: true,
      data: creditMemo
    };
  } catch (error) {
    console.error('Error updating credit memo:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update credit memo'
    };
  }
}

export async function getCreditMemo(id: string) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }
    const creditMemo = await prisma.creditMemo.findUnique({
      where: {
        id,
        companyId: session.user.activeCompanyId,
        isActive: true
      },
      include: {
        tax: true,
        items: {
          where: { isActive: true }
        },
        attachments: {
          where: { isActive: true },
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
        }
      }
    });

    if (!creditMemo) {
      return {
        success: false,
        error: 'Credit memo not found'
      };
    }
    return {
      success: true,
      data: creditMemo
    };
  } catch (error) {
    console.error('Error fetching credit memo:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch credit memo'
    };
  }
}

// Add a function to soft-delete credit memo
export async function deleteCreditMemo(id: string) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Check if the credit memo can be deleted
    const creditMemo = await prisma.creditMemo.findUnique({
      where: {
        id,
        companyId: session.user.activeCompanyId,
        isActive: true
      },
      select: {
        id: true,
        status: true,
        number: true
      }
    });

    if (!creditMemo) {
      return {
        success: false,
        error: 'Credit memo not found'
      };
    }

    if (creditMemo.status === 'APPLIED') {
      return {
        success: false,
        error: 'Cannot delete a credit memo that has been applied'
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete credit memo attachments
      await tx.creditMemoAttachment.updateMany({
        where: {
          creditMemoId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent credit memo deactivated'
        }
      });

      // 2. Soft delete credit memo items
      await tx.creditMemoItem.updateMany({
        where: {
          creditMemoId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent credit memo deactivated'
        }
      });

      // 3. Soft delete the credit memo itself
      await tx.creditMemo.update({
        where: {
          id,
          companyId: session.user.activeCompanyId
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Credit memo deactivated by user'
        }
      });
    });

    revalidatePath('/creditmemos');
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating credit memo:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate credit memo'
    };
  }
}
