'use server';

import { Decimal } from 'decimal.js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';
import { generateUniqueNumber } from '@/lib/utils';
import { CustomizationSettingsInput } from '../base/sideBar/customize/types';
import { validateCustomer } from '../shared/file-action';
import { validateItems } from '../shared/utils';
import {
  CreateSalesReceiptData,
  CreateSalesReceiptResponse,
  SalesReceiptAction,
  UpdateSalesReceiptData
} from './types';

async function validateReceiptNumber(
  tx: Prisma.TransactionClient,
  companyId: string,
  receiptNumber: string
): Promise<void> {
  try {
    const existingReceipt = await tx.salesReceipt.findUnique({
      where: {
        number_companyId: {
          companyId,
          number: receiptNumber
        },
        isActive: true
      },
      select: { id: true }
    });

    if (existingReceipt) {
      throw new Error('Sales receipt number already exists');
    }
  } catch (error) {
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors by their error codes
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          throw new Error('Duplicate sales receipt number detected', { cause: error });
        case 'P2023': // Inconsistent column data
          throw new Error('Invalid sales receipt number format', { cause: error });
        default:
          throw new Error(`Database error: ${error.message}`, { cause: error });
      }
    }

    // Re-throw unknown errors with a more user-friendly message
    throw new Error(
      `Error validating sales receipt number: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error }
    );
  }
}

export async function createSalesReceipt(
  data: CreateSalesReceiptData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<CreateSalesReceiptResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Create sales receipt and handle file uploads in transaction
    const receipt = await prisma.$transaction(async (tx) => {
      // Step 1: Generate receipt number and validate inputs
      const receiptNumber = `SR-${generateUniqueNumber()}`;

      await Promise.all([
        validateCustomer(tx, data.customerId, session.user.activeCompanyId),
        validateReceiptNumber(tx, session.user.activeCompanyId, receiptNumber)
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

      // Step 5: Create the sales receipt
      const receipt = await tx.salesReceipt.create({
        data: {
          company: { connect: { id: session.user.activeCompanyId }},
          number: receiptNumber,
          customer: { connect: { id: data.customerId } },

          paymentMethod: data.paymentMethod,
          status: data.status,
          
          taxAmount,
          amount: totalAmount,
          discountType: data.discountType,
          discountValue: data.discountValue || 0,
          discountAmount,
          discountApplicationTime: data.discountApplicationTime,
          taxRate,
          tax: data.taxId ? { connect: { id: data.taxId } } : undefined,
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
            type: 'SALES_RECEIPT',
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
            tax: data.taxId ? { connect: { id: data.taxId } } : undefined
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
              purpose: 'sales_receipt_attachment',
              companyId: session.user.activeCompanyId,
              isActive: true
            }
          });

          await tx.receiptAttachment.create({
            data: {
              receiptId: receipt.id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      return receipt;
    });

    revalidatePath('/salesreceipts');

    // Convert the complete receipt to SalesReceiptAction type before returning
    const receiptAction: SalesReceiptAction = {
      id: receipt.id,
      number: receipt.number,
      paymentMethod: receipt.paymentMethod,
      status: receipt.status,
      discountType: receipt.discountType,
      discountValue: receipt.discountValue,
      discountApplicationTime: receipt.discountApplicationTime,
      discountAmount: receipt.discountAmount,
      taxId: receipt.taxId,
      tax: receipt.tax,
      taxAmount: receipt.taxAmount,
      items: receipt.items.map((item) => ({
        ...item,
        salesReceiptId: receipt.id // Add the required salesReceiptId field
      })),
      customer: {
        displayName: receipt.customer.displayName,
        primaryEmail: receipt.customer.primaryEmail
      },
      attachments: receipt.attachments.map((a) => ({
        id: a.id,
        fileId: a.fileId,
        salesReceiptId: receipt.id
      })),
      amount: receipt.amount
    };

    return { success: true, data: receiptAction };
  } catch (error) {
    console.error('Error creating sales receipt:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create sales receipt'
    };
  }
}

export async function getSalesReceipt(id: string) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    const receipt = await prisma.salesReceipt.findUnique({
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

    if (!receipt) {
      return {
        success: false,
        error: 'Sales receipt not found'
      };
    }

    return {
      success: true,
      data: receipt
    };
  } catch (error) {
    console.error('Error fetching sales receipt:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch sales receipt'
    };
  }
}

export async function updateSalesReceipt(
  id: string,
  data: UpdateSalesReceiptData,
  settings: CustomizationSettingsInput,
  color: string
) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    if (!data || !id) {
      throw new Error('Missing required update data or receipt ID');
    }

    const receipt = await prisma.$transaction(async (tx) => {
      // Step 1: Validate customer and fetch existing receipt
      await validateCustomer(tx, data.customerId, session.user.activeCompanyId);

      const existingReceipt = await tx.salesReceipt.findUnique({
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

      if (!existingReceipt) {
        throw new Error('Sales receipt not found');
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
      const existingItems = await tx.salesReceiptItem.findMany({
        where: {
          receiptId: id,
          isActive: true
        }
      });

      // Find items to delete
      const itemsToDelete = existingItems.filter(
        (ei) => !data.items.some((item) => item.id === ei.id)
      );

      // Soft delete removed items
      if (itemsToDelete.length > 0) {
        await tx.salesReceiptItem.updateMany({
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
            deactivationReason: 'Item removed during sales receipt update'
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
            return tx.salesReceiptItem.update({
              where: { id: item.id },
              data: itemData
            });
          } else {
            return tx.salesReceiptItem.create({
              data: {
                ...itemData,
                receiptId: id,
                isActive: true
              }
            });
          }
        })
      );

      // Step 6: Update receipt
      const updatedReceipt = await tx.salesReceipt.update({
        where: {
          id,
          companyId: session.user.activeCompanyId,
          isActive: true
        },
        data: {
          customerId: data.customerId,

          // Sales-specific fields
          paymentMethod: data.paymentMethod,
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
            type: 'SALES_RECEIPT',
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

      // Handle removed attachments - change from hard delete to soft delete
      if (data.removedAttachmentIds?.length) {
        const attachmentsToRemove = await tx.receiptAttachment.findMany({
          where: {
            id: { in: data.removedAttachmentIds },
            receiptId: id,
            receipt: { companyId: session.user.activeCompanyId },
            isActive: true
          },
          select: {
            fileId: true,
            id: true
          }
        });

        // Soft delete the attachments
        await tx.receiptAttachment.updateMany({
          where: {
            id: { in: data.removedAttachmentIds },
            receiptId: id,
            receipt: { companyId: session.user.activeCompanyId },
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'Attachment removed during sales receipt update'
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
            deactivationReason: 'File attachment removed from sales receipt'
          }
        });
      }

      // Handle new files with validation
      if (data.files?.length) {
        // Get existing file keys
        const existingFileKeys = existingReceipt.attachments.map(
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
              purpose: 'sales_receipt_attachment',
              companyId: session.user.activeCompanyId,
              isActive: true
            }
          });

          await tx.receiptAttachment.create({
            data: {
              receiptId: receipt.id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      return updatedReceipt;
    });

    // Convert to SalesReceiptAction before returning
    const receiptAction: SalesReceiptAction = {
      id: receipt.id,
      number: receipt.number,
      paymentMethod: receipt.paymentMethod,
      status: receipt.status,
      discountType: receipt.discountType,
      discountValue: receipt.discountValue,
      discountApplicationTime: receipt.discountApplicationTime,
      discountAmount: receipt.discountAmount,
      taxId: receipt.taxId,
      tax: receipt.tax,
      taxAmount: receipt.taxAmount,
      items: receipt.items.map((item) => ({
        ...item,
        salesReceiptId: receipt.id
      })),
      customer: {
        displayName: receipt.customer.displayName,
        primaryEmail: receipt.customer.primaryEmail
      },
      attachments: receipt.attachments.map((a) => ({
        id: a.id,
        fileId: a.fileId,
        salesReceiptId: receipt.id
      })),
      amount: receipt.amount
    };

    revalidatePath('/salesreceipts');
    return { success: true, data: receiptAction };
  } catch (error) {
    console.error('Error updating sales receipt:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update sales receipt'
    };
  }
}

// Add a function to delete sales receipt (soft delete)
export async function deleteSalesReceipt(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Check if the receipt can be deleted
    const receipt = await prisma.salesReceipt.findUnique({
      where: {
        id,
        companyId: session.user.activeCompanyId,
        isActive: true
      },
      include: {
        transactions: {
          select: { id: true }
        }
      }
    });

    if (!receipt) {
      return {
        success: false,
        error: 'Sales receipt not found'
      };
    }

    // Don't allow deletion of receipts with transactions
    if (receipt.transactions && receipt.transactions.length > 0) {
      return {
        success: false,
        error: 'Cannot delete a sales receipt that has associated transactions'
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      if (!session.user.activeCompanyId) {
        return { success: false, error: 'User is not associated with a company' };
      }
      // 1. Soft delete receipt attachments
      await tx.receiptAttachment.updateMany({
        where: {
          receiptId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent sales receipt deactivated'
        }
      });

      // 2. Soft delete receipt items
      await tx.salesReceiptItem.updateMany({
        where: {
          receiptId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent sales receipt deactivated'
        }
      });

      // 3. Soft delete the receipt itself
      await tx.salesReceipt.update({
        where: {
          id,
          companyId: session.user.activeCompanyId
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Sales receipt deactivated by user'
        }
      });
    });

    revalidatePath('/salesreceipts');
    return { success: true };
  } catch (error) {
    console.error('Error deactivating sales receipt:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate sales receipt'
    };
  }
}
