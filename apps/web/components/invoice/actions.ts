'use server';

import { Prisma } from '@/lib/generated/prisma/client';
import { Decimal } from 'decimal.js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { generateUniqueNumber } from '@/lib/utils';
import { CustomizationSettingsInput } from '../base/sideBar/customize/types';
import { validateCustomer } from '../shared/file-action';
import { validateItems } from '../shared/utils';
import {
  CreateInvoiceData,
  CreateInvoiceResponse,
  UpdateInvoiceData
} from './types';

async function validateInvoiceNumber(
  tx: Prisma.TransactionClient,
  invoiceNumber: string,
  companyId: string
): Promise<void> {
  try {
    const existingInvoice = await tx.invoice.findUnique({
      where: {
        number_companyId: {
          number: invoiceNumber,
          companyId
        },
        isActive: true
      },
      select: { id: true }
    });

    if (existingInvoice) {
      throw new Error('Invoice number already exists');
    }
  } catch (error) {
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new Error('Duplicate invoice number detected');
        case 'P2023':
          throw new Error('Invalid invoice number or company ID format');
        default:
          throw new Error(`Database error: ${error.message}`);
      }
    }

    throw new Error(
      `Error validating invoice number: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function createInvoice(
  data: CreateInvoiceData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<CreateInvoiceResponse> {
  try {
    const session = await auth.api.getSession({headers: await headers()});

    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const invoiceNumber = `IN-${generateUniqueNumber()}`;

      await Promise.all([
        validateCustomer(tx, data.customerId, session.user.companyId),
        validateInvoiceNumber(tx, invoiceNumber, session.user.companyId)
      ]);

      const totalBeforeTax = validateItems(data.items);

      let discountAmount = 0;
      if (data.discountType && data.discountValue) {
        discountAmount =
          data.discountType === 'PERCENTAGE'
            ? totalBeforeTax * (data.discountValue / 100)
            : Math.min(data.discountValue, totalBeforeTax);
      }

      const subtotalAfterDiscount = totalBeforeTax - discountAmount;

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

      const invoice = await tx.invoice.create({
        data: {
          companyId: session.user.companyId,
          number: invoiceNumber,
          customerId: data.customerId,
          discountType: data.discountType,
          discountValue: data.discountValue || 0,
          discountAmount,
          discountApplicationTime: data.discountApplicationTime,
          taxRate,
          dueDate: data.dueDate,
          amount: totalAmount,
          taxId: data.taxId || null,
          taxAmount,
          notes: data.notes?.trim(),
          emailCustomer: data.emailCustomer?.toLowerCase().trim(),
          status: 'PENDING',
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
            type: 'Individual_invoice',
            cc: data.ccEmail,
            snapshotTimestamp: new Date().toISOString(),
            amount: totalAmount,
            items: data.items.map((item) => ({
              productName: item.productName,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber(),
              taxable: item.taxable,
              sku: item.sku || undefined
            })),
            generateInvoiceNow: true,
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
          tax: true,
          customer: {
            select: {
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
              purpose: 'invoice_attachment',
              companyId: session.user.companyId,
              isActive: true
            }
          });

          await tx.invoiceAttachment.create({
            data: {
              invoiceId: invoice.id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      return invoice;
    });

    revalidatePath('/invoices');
    return { success: true, data: invoice };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create invoice'
    };
  }
}

export async function getInvoice(id: string) {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    const invoice = await prisma.invoice.findUnique({
      where: {
        id,
        companyId: session.user.companyId,
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

    if (!invoice) {
      return {
        success: false,
        error: 'Invoice not found'
      };
    }

    return {
      success: true,
      data: invoice
    };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoice'
    };
  }
}
export async function updateInvoice(
  id: string,
  data: UpdateInvoiceData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<CreateInvoiceResponse> {
  try {
    const session = await auth.api.getSession({headers: await headers()});

    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    const invoice = await prisma.$transaction(async (tx) => {
      // Step 1: Validate customer and fetch existing invoice
      await validateCustomer(tx, data.customerId, session.user.companyId);

      const existingInvoice = await tx.invoice.findUnique({
        where: {
          id,
          companyId: session.user.companyId,
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

      if (!existingInvoice) {
        throw new Error('Invoice not found');
      }

      // Step 2: Calculate totals
      const totalBeforeTax = validateItems(data.items);

      // Step 3: Calculate discount (matching create logic)
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

      // Step 5: Handle items with granular updates
      const existingItems = await tx.invoiceItem.findMany({
        where: {
          invoiceId: id,
          isActive: true
        }
      });

      // Find items to soft delete
      const itemsToDelete = existingItems.filter(
        (ei) => !data.items.some((item) => item.id === ei.id)
      );

      // Soft delete removed items
      if (itemsToDelete.length > 0) {
        await tx.invoiceItem.updateMany({
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
            deactivationReason: 'Item removed during invoice update'
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
            return tx.invoiceItem.update({
              where: { id: item.id },
              data: itemData
            });
          } else {
            return tx.invoiceItem.create({
              data: {
                ...itemData,
                invoiceId: id,
                isActive: true
              }
            });
          }
        })
      );

      // Step 6: Update invoice
      const updatedInvoice = await tx.invoice.update({
        where: {
          id,
          companyId: session.user.companyId,
          isActive: true
        },
        data: {
          customerId: data.customerId,
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
            type: 'Individual_invoice',
            cc: data.ccEmail,
            snapshotTimestamp: new Date().toISOString(),
            amount: totalAmount,
            items: data.items.map((item) => ({
              productName: item.productName,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber(),
              taxable: item.taxable,
              sku: item.sku || undefined // Convert null to undefined
            })),
            generateInvoiceNow: true,
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
        // Soft delete attachments instead of hard delete
        await tx.invoiceAttachment.updateMany({
          where: {
            id: { in: data.removedAttachmentIds },
            invoiceId: id,
            invoice: { companyId: session.user.companyId },
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'Attachment removed during invoice update'
          }
        });

        // Get file IDs to soft delete
        const attachmentsToSoftDelete = await tx.invoiceAttachment.findMany({
          where: {
            id: { in: data.removedAttachmentIds },
            isActive: false
          },
          select: { fileId: true }
        });

        // Soft delete associated files
        await tx.file.updateMany({
          where: {
            id: { in: attachmentsToSoftDelete.map((a) => a.fileId) },
            companyId: session.user.companyId,
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'File attachment removed from invoice'
          }
        });
      }

      // Handle removed attachments (soft delete instead of hard delete)
      if (data.removedAttachmentIds?.length) {
        // First get the file IDs associated with the attachments with security check
        const attachmentsToRemove = await tx.invoiceAttachment.findMany({
          where: {
            id: { in: data.removedAttachmentIds },
            invoiceId: id,
            invoice: { companyId: session.user.companyId },
            isActive: true
          },
          select: {
            fileId: true,
            id: true
          }
        });

        // Soft delete the attachments
        await tx.invoiceAttachment.updateMany({
          where: {
            id: { in: data.removedAttachmentIds },
            invoiceId: id,
            invoice: { companyId: session.user.companyId },
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'Attachment removed during invoice update'
          }
        });

        // Soft delete the files
        await tx.file.updateMany({
          where: {
            id: { in: attachmentsToRemove.map((a) => a.fileId) },
            companyId: session.user.companyId,
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'File attachment removed from invoice'
          }
        });
      }

      // Handle new files with validation - preserving all the important validation
      if (data.files?.length) {
        // Get existing file keys
        const existingFileKeys = existingInvoice.attachments.map(
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
              purpose: 'invoice_attachment',
              companyId: session.user.companyId,
              isActive: true
            }
          });

          await tx.invoiceAttachment.create({
            data: {
              invoiceId: id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      return updatedInvoice;
    });

    revalidatePath('/invoices');
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update invoice'
    };
  }
}

// Add delete invoice function
export async function deleteInvoice(
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

    // Check if the invoice can be deleted
    const invoice = await prisma.invoice.findUnique({
      where: {
        id,
        companyId: session.user.companyId,
        isActive: true
      },
      include: {
        payments: {
          where: { isActive: true }
        }
      }
    });

    if (!invoice) {
      return {
        success: false,
        error: 'Invoice not found'
      };
    }

    // Don't allow deletion of paid or partially paid invoices
    if (
      invoice.status === 'PAID' ||
      invoice.status === 'PARTIAL' ||
      invoice.payments.length > 0
    ) {
      return {
        success: false,
        error: 'Cannot delete an invoice that has payments'
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete invoice attachments
      await tx.invoiceAttachment.updateMany({
        where: {
          invoiceId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent invoice deactivated'
        }
      });

      // 2. Soft delete invoice items
      await tx.invoiceItem.updateMany({
        where: {
          invoiceId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent invoice deactivated'
        }
      });

      // 3. If the invoice was converted from an estimate, update the estimate
      if (invoice.convertedFromEstimate && invoice.estimateId) {
        await tx.estimate.update({
          where: {
            id: invoice.estimateId
          },
          data: {
            convertedToInvoice: false,
            invoiceId: null
          }
        });
      }

      // 4. Soft delete the invoice itself
      await tx.invoice.update({
        where: {
          id,
          companyId: session.user.companyId
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Invoice deactivated by user'
        }
      });
    });

    revalidatePath('/invoices');
    return { success: true };
  } catch (error) {
    console.error('Error deactivating invoice:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to deactivate invoice'
    };
  }
}
