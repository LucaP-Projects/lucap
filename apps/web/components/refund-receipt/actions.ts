'use server';

import { Decimal } from 'decimal.js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { RefundStatus } from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';
import { generateUniqueNumber } from '@/lib/utils';
import { CustomizationSettingsInput } from '../base/sideBar/customize/types';
import { validateCustomer } from '../shared/file-action';
import { validateItems } from '../shared/utils';
import {
  CreateRefundReceiptData,
  CreateRefundReceiptResponse,
  RefundReceiptAction
} from './types';

async function validateRefundNumber(
  tx: Prisma.TransactionClient,
  companyId: string,
  refundNumber: string
): Promise<void> {
  try {
    const existingRefund = await tx.refundReceipt.findUnique({
      where: {
        number_companyId: {
          companyId,
          number: refundNumber
        },
        isActive: true
      },
      select: { id: true }
    });

    if (existingRefund) {
      throw new Error('Refund number already exists');
    }
  } catch (error) {
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors by their error codes
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          throw new Error('Duplicate refund number detected', { cause: error });
        case 'P2023': // Inconsistent column data
          throw new Error('Invalid refund number format', { cause: error });
        default:
          throw new Error(`Database error: ${error.message}`, { cause: error });
      }
    }

    // Re-throw unknown errors with a more user-friendly message
    throw new Error(
      `Error validating refund number: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error }
    );
  }
}

export async function createRefundReceipt(
  data: CreateRefundReceiptData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<CreateRefundReceiptResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Create refund receipt and handle file uploads in transaction
    const refund = await prisma.$transaction(async (tx) => {
      // Step 1: Generate refund number and validate inputs
      const refundNumber = `RF-${generateUniqueNumber()}`;

      await Promise.all([
        validateCustomer(tx, data.customerId, session.user.activeCompanyId),
        validateRefundNumber(tx, session.user.activeCompanyId, refundNumber)
      ]);

      // Step 2: Calculate totals
      const totalBeforeTax = validateItems(data.items);

      // Step 3: Calculate discount
      let discountAmount = 0;
      if (data.discountType && data.discountValue) {
        discountAmount =
          data.discountType === 'PERCENTAGE'
            ? totalBeforeTax * (data.discountValue / 100)
            : Math.min(data.discountValue, totalBeforeTax);
      }

      const subtotalAfterDiscount = totalBeforeTax - discountAmount;

      // Step 4: Calculate tax
      let taxAmount = 0;
      let taxRate = data.taxRate || 0;
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

      // Step 5: Create the refund receipt
      const refund = await tx.refundReceipt.create({
        data: {
          companyId: session.user.activeCompanyId,
          number: refundNumber,
          customerId: data.customerId,

          refundMethod: data.refundMethod,
          originalPaymentMethod: data.originalPaymentMethod,
          refundRef: data.refundRef?.trim(),
          reason: data.reason,
          status: data.status,

          taxAmount,
          amount: totalAmount,
          discountType: data.discountType,
          discountValue: data.discountValue || 0,
          discountAmount,
          discountApplicationTime: data.discountApplicationTime,
          taxRate,
          taxId: data.taxId || null,
          dueDate: data.dueDate,
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
            type: 'REFUND_RECEIPT',
            cc: data.ccEmail,
            snapshotTimestamp: new Date().toISOString(),
            amount: totalAmount,
            items: data.items.map((item) => ({
              productName: item.productName,
              description: item.description || undefined, // Convert null to undefined
              quantity: item.quantity,
              rate: item.rate,
              taxable: item.taxable,
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
              itemId: item.itemId,
              isActive: true
            }))
          },
          isActive: true
        },
        include: {
          items: true,
          attachments: true,
          customer: {
            select: {
              displayName: true,
              primaryEmail: true
            }
          },
          tax: true
        }
      });

      // Step 6: Handle file attachments
      if (data.files?.length) {
        for (const file of data.files) {
          const fileRecord = await tx.file.create({
            data: {
              filename: file.file.name,
              path: file.key!,
              mimetype: file.file.type,
              size: file.file.size,
              purpose: 'refund_attachment',
              companyId: session.user.activeCompanyId,
              isActive: true
            }
          });

          await tx.refundAttachment.create({
            data: {
              refundReceiptId: refund.id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      return refund;
    });

    revalidatePath('/refund-receipt');

    // Convert the complete refund to RefundReceiptAction type before returning
    const refundAction: RefundReceiptAction = {
      id: refund.id,
      number: refund.number,
      refundMethod: refund.refundMethod,
      originalPaymentMethod: refund.originalPaymentMethod,
      reason: refund.reason,
      status: refund.status,
      discountType: refund.discountType,
      discountValue: refund.discountValue,
      discountApplicationTime: refund.discountApplicationTime,
      discountAmount: refund.discountAmount,
      taxId: refund.taxId,
      tax: refund.tax,
      taxAmount: refund.taxAmount,
      items: refund.items,
      customer: {
        displayName: refund.customer.displayName,
        primaryEmail: refund.customer.primaryEmail
      },
      attachments: refund.attachments.map((a) => ({
        id: a.id,
        fileId: a.fileId,
        refundReceiptId: refund.id
      })),
      amount: refund.amount
    };

    return { success: true, data: refundAction };
  } catch (error) {
    console.error('Error creating refund receipt:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create refund receipt'
    };
  }
}

export async function getRefundReceipt(id: string) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    const refund = await prisma.refundReceipt.findUnique({
      where: {
        id,
        companyId: session.user.activeCompanyId,
        isActive: true
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

    if (!refund) {
      return {
        success: false,
        error: 'Refund receipt not found'
      };
    }

    return {
      success: true,
      data: refund
    };
  } catch (error) {
    console.error('Error fetching refund receipt:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch refund receipt'
    };
  }
}

export async function updateRefundReceipt(
  id: string,
  data: CreateRefundReceiptData,
  settings: CustomizationSettingsInput,
  color: string
) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    if (!data || !id) {
      throw new Error('Missing required update data or refund ID');
    }

    const refund = await prisma.$transaction(async (tx) => {
      // Step 1: Validate customer and fetch existing refund
      await validateCustomer(tx, data.customerId, session.user.activeCompanyId);

      const existingRefund = await tx.refundReceipt.findUnique({
        where: {
          id,
          companyId: session.user.activeCompanyId,
          isActive: true
        },
        include: {
          items: { where: { isActive: true } },
          attachments: {
            where: { isActive: true },
            include: { file: true }
          }
        }
      });

      if (!existingRefund) {
        throw new Error('Refund receipt not found');
      }

      // Step 2: Calculate totals
      const totalBeforeTax = validateItems(data.items);

      // Step 3: Calculate discount
      let discountAmount = 0;
      if (data.discountType !== null) {
        discountAmount =
          data.discountType === 'PERCENTAGE'
            ? totalBeforeTax * (data.discountValue / 100)
            : Math.min(data.discountValue, totalBeforeTax);
      }

      const subtotalAfterDiscount = totalBeforeTax - discountAmount;

      // Step 4: Calculate tax
      let taxAmount = 0;
      let taxRate = data.taxRate || 0;
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

      // Step 5: Handle items with granular updates
      const existingItems = await tx.refundReceiptItem.findMany({
        where: {
          refundReceiptId: id,
          isActive: true
        }
      });

      // Find items to soft delete
      const itemsToDelete = existingItems.filter(
        (ei) => !data.items.some((item) => item.id === ei.id)
      );

      // Soft delete removed items
      if (itemsToDelete.length > 0) {
        await tx.refundReceiptItem.updateMany({
          where: {
            id: {
              in: itemsToDelete.map((i) => i.id)
            },
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'Item removed during refund update'
          }
        });
      }

      // Update or create items
      await Promise.all(
        data.items.map((item) => {
          const itemData = {
            productName: item.productName.trim(),
            description: item.description?.trim(),
            quantity: item.quantity,
            rate: item.rate,
            amount: new Decimal(item.quantity).mul(item.rate).toNumber(),
            taxable: item.taxable,
            itemId: item.itemId
          };

          if (existingItems.some((ei) => ei.id === item.id)) {
            return tx.refundReceiptItem.update({
              where: { id: item.id },
              data: itemData
            });
          } else {
            return tx.refundReceiptItem.create({
              data: {
                ...itemData,
                refundReceiptId: id,
                isActive: true
              }
            });
          }
        })
      );

      // Step 6: Update refund receipt
      const updatedRefund = await tx.refundReceipt.update({
        where: {
          id,
          companyId: session.user.activeCompanyId,
          isActive: true
        },
        data: {
          customerId: data.customerId,

          // Refund-specific fields
          refundMethod: data.refundMethod,
          originalPaymentMethod: data.originalPaymentMethod,
          refundRef: data.refundRef?.trim(),
          reason: data.reason,
          status: data.status,

          taxAmount,
          amount: totalAmount,
          discountType: data.discountType,
          discountValue: data.discountValue || 0,
          discountAmount,
          discountApplicationTime: data.discountApplicationTime,
          taxRate,
          taxId: data.taxId || null,
          dueDate: data.dueDate,
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
            type: 'REFUND_RECEIPT',
            cc: data.ccEmail,
            snapshotTimestamp: new Date().toISOString(),
            amount: totalAmount,
            items: data.items.map((item) => ({
              productName: item.productName,
              description: item.description || undefined,
              quantity: item.quantity,
              rate: item.rate,
              taxable: item.taxable,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber()
            })),
            dueDate: data.dueDate.toISOString(),
            taxId: data.taxId
          }
        },
        include: {
          items: {
            where: { isActive: true }
          },
          attachments: {
            where: { isActive: true }
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

      // Step 7: Handle file attachments
      if (data.removedAttachmentIds?.length) {
        // Soft delete attachments and associated files
        const attachmentsToRemove = await tx.refundAttachment.findMany({
          where: {
            id: { in: data.removedAttachmentIds },
            refundReceiptId: id,
            refundReceipt: { companyId: session.user.activeCompanyId },
            isActive: true
          },
          select: {
            fileId: true,
            id: true
          }
        });

        // Soft delete the attachments
        await tx.refundAttachment.updateMany({
          where: {
            id: { in: data.removedAttachmentIds },
            refundReceiptId: id,
            refundReceipt: { companyId: session.user.activeCompanyId },
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'Attachment removed during refund update'
          }
        });

        // Soft delete associated files
        await tx.file.updateMany({
          where: {
            id: { in: attachmentsToRemove.map((a) => a.fileId) },
            companyId: session.user.activeCompanyId,
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'File attachment removed from refund'
          }
        });
      }

      // Handle new files with validation
      if (data.files?.length) {
        // Get existing file keys
        const existingFileKeys = existingRefund.attachments.map(
          (a) => a.file.path
        );

        // Filter out files that already exist - fix the undefined key issue
        const newFiles = data.files.filter(
          (file) =>
            file.key && !existingFileKeys.includes(file.key) && !file.fileId
        );

        // Create new file records and attachments only for new files
        for (const file of newFiles) {
          if (
            !file.key ||
            !file.file?.name ||
            !file.file?.type ||
            !file.file?.size
          ) {
            throw new Error(
              `Invalid file data for ${file.file?.name || 'unknown file'}`
            );
          }

          const fileRecord = await tx.file.create({
            data: {
              filename: file.file.name,
              path: file.key,
              mimetype: file.file.type,
              size: file.file.size,
              purpose: 'refund_attachment',
              companyId: session.user.activeCompanyId,
              isActive: true
            }
          });

          await tx.refundAttachment.create({
            data: {
              refundReceiptId: id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      return updatedRefund;
    });

    // Convert to RefundReceiptAction before returning
    const refundAction: RefundReceiptAction = {
      id: refund.id,
      number: refund.number,
      refundMethod: refund.refundMethod,
      originalPaymentMethod: refund.originalPaymentMethod,
      reason: refund.reason,
      status: refund.status,
      discountType: refund.discountType,
      discountValue: refund.discountValue,
      discountApplicationTime: refund.discountApplicationTime,
      discountAmount: refund.discountAmount,
      taxId: refund.taxId,
      tax: refund.tax,
      taxAmount: refund.taxAmount,
      items: refund.items,
      customer: {
        displayName: refund.customer.displayName,
        primaryEmail: refund.customer.primaryEmail
      },
      attachments: refund.attachments.map((a) => ({
        id: a.id,
        fileId: a.fileId,
        refundReceiptId: refund.id
      })),
      amount: refund.amount
    };

    revalidatePath('/refund-receipt');
    return { success: true, data: refundAction };
  } catch (error) {
    console.error('Error updating refund receipt:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update refund receipt'
    };
  }
}

// Add a function to soft-delete refund receipts
export async function deleteRefundReceipt(
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

    // Check if the refund can be deleted
    const refund = await prisma.refundReceipt.findUnique({
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

    if (!refund) {
      return {
        success: false,
        error: 'Refund receipt not found'
      };
    }

    // Don't allow deletion of processed refunds
    if (refund.status === RefundStatus.PROCESSED) {
      return {
        success: false,
        error: 'Cannot delete a refund that has been processed'
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete refund attachments
      await tx.refundAttachment.updateMany({
        where: {
          refundReceiptId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent refund receipt deactivated'
        }
      });

      // 2. Soft delete refund items
      await tx.refundReceiptItem.updateMany({
        where: {
          refundReceiptId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent refund receipt deactivated'
        }
      });

      // 3. Soft delete the refund receipt itself
      await tx.refundReceipt.update({
        where: {
          id,
          companyId: session.user.activeCompanyId
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Refund receipt deactivated by user'
        }
      });
    });

    revalidatePath('/refund-receipt');
    return { success: true };
  } catch (error) {
    console.error('Error deactivating refund receipt:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate refund receipt'
    };
  }
}
