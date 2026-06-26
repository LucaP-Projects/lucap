'use server';

import { Decimal } from 'decimal.js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import {
  CreditStatus,
  DiscountApplicationTime,
  DiscountType,
} from '@/lib/generated/prisma/enums';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';

import { prisma } from '@/lib/prisma';
import { generateUniqueNumber } from '@/lib/utils';
import { CustomizationSettingsInput } from '../base/sideBar/customize/types';
import { validateCustomer } from '../shared/file-action';
import { validateItems } from '../shared/utils';

// Types
interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface FileData {
  id: string;
  file: {
    name: string;
    type: string;
    size: number;
  };
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress?: number;
  error?: string;
  url?: string;
  key?: string;
}

interface CreateDelayedCreditData {
  customerId: string;
  dueDate: Date;
  status: CreditStatus;
  notes?: string;
  emailCustomer: string;
  ccEmail?: string | null;
  customerAddress: Address;
  discountType: DiscountType | null;
  discountValue: number;
  discountApplicationTime: DiscountApplicationTime;
  taxId?: string;
  taxRate: number;
  items: {
    productName: string;
    description?: string;
    quantity: number;
    rate: number;
    taxable: boolean;
    itemId: string;
    sku?: string | null;
  }[];
  files?: FileData[];
}

interface UpdateDelayedCreditData extends CreateDelayedCreditData {
  removedAttachmentIds?: string[];
  items: {
    id?: string;
    productName: string;
    description?: string;
    quantity: number;
    rate: number;
    taxable: boolean;
    itemId: string;
    sku?: string | null;
  }[];
}

interface DelayedCredit {
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
    creditId: string;
  }[];
  customer: {
    displayName: string | null;
    primaryEmail: string | null;
  };
  attachments: {
    id: string;
    fileId: string;
    creditId: string;
  }[];
  status: string;
  amount: number;
}

type CreateDelayedCreditResponse =
  | { success: true; data: DelayedCredit }
  | { success: false; error: string };

async function validateCreditNumber(
  tx: Prisma.TransactionClient,
  creditNumber: string,
  companyId: string
): Promise<void> {
  try {
    const existingCredit = await tx.delayedCredit.findUnique({
      where: {
        number_companyId: {
          // Fixed to use compound unique constraint
          number: creditNumber,
          companyId
        },
        isActive: true
      },
      select: { id: true }
    });

    if (existingCredit) {
      throw new Error('Credit number already exists');
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new Error('Duplicate credit number detected', { cause: error });
        case 'P2023':
          throw new Error('Invalid credit number or company ID format', { cause: error });
        default:
          throw new Error(`Database error: ${error.message}`, { cause: error });
      }
    }

    throw new Error(
      `Error validating credit number: ${error instanceof Error ? error.message : 'Unknown error'}`
    , { cause: error });
  }
}

// Main Action Function
export async function createDelayedCredit(
  data: CreateDelayedCreditData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<CreateDelayedCreditResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    const credit = await prisma.$transaction(async (tx) => {
      const creditNumber = `CR-${generateUniqueNumber()}`;
      await Promise.all([
        validateCustomer(tx, data.customerId, session.user.activeCompanyId),
        validateCreditNumber(tx, creditNumber, session.user.activeCompanyId)
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

      const credit = await tx.delayedCredit.create({
        data: {
          companyId: session.user.activeCompanyId,
          number: creditNumber,
          customerId: data.customerId,
          status: data.status || CreditStatus.PENDING,
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
            type: 'DELAYED_CREDIT',
            cc: data.ccEmail || '',
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

      // Handle file attachments
      if (data.files?.length) {
        for (const file of data.files) {
          const fileRecord = await tx.file.create({
            data: {
              filename: file.file.name,
              path: file.key!,
              mimetype: file.file.type,
              size: file.file.size,
              purpose: 'delayed_credit_attachment',
              companyId: session.user.activeCompanyId,
              isActive: true
            }
          });

          await tx.delayedCreditAttachment.create({
            data: {
              creditId: credit.id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      return credit;
    });

    revalidatePath('/delayedcredits');
    return { success: true, data: credit };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create credit'
    };
  }
}

// Retry file upload function

export async function getDelayedCredit(id: string) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }
    const credit = await prisma.delayedCredit.findUnique({
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
            // Remove the 'where' clause here since File model doesn't have 'isActive'
          }
        },
        customer: {
          select: {
            id: true,
            displayName: true,
            primaryEmail: true
          }
        }
      }
    });

    if (!credit) {
      return {
        success: false,
        error: 'Delayed credit not found'
      };
    }

    return {
      success: true,
      data: credit
    };
  } catch (error) {
    console.error('Error fetching delayed credit:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch delayed credit'
    };
  }
}

export async function updateDelayedCredit(
  id: string,
  data: UpdateDelayedCreditData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<CreateDelayedCreditResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    const credit = await prisma.$transaction(async (tx) => {
      await validateCustomer(tx, data.customerId, session.user.activeCompanyId);

      const existingCredit = await tx.delayedCredit.findUnique({
        where: {
          id,
          companyId: session.user.activeCompanyId,
          isActive: true
        },
        include: {
          items: { where: { isActive: true } },
          attachments: {
            where: { isActive: true },
            include: {
              file: true
            }
          }
        }
      });

      if (!existingCredit) {
        throw new Error('Credit not found');
      }

      const totalBeforeTax = validateItems(data.items);

      let discountAmount = 0;
      if (data.discountType !== null) {
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

      // Handle existing items
      const existingItems = await tx.delayedCreditItem.findMany({
        where: {
          creditId: id,
          isActive: true
        }
      });

      // Find items to soft delete
      const itemsToDelete = existingItems.filter(
        (ei) => !data.items.some((item) => item.id === ei.id)
      );

      // Soft delete removed items
      if (itemsToDelete.length > 0) {
        await tx.delayedCreditItem.updateMany({
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
            deactivationReason: 'Item removed during credit update'
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

          if (item.id && existingItems.some((ei) => ei.id === item.id)) {
            return tx.delayedCreditItem.update({
              where: { id: item.id },
              data: itemData
            });
          } else {
            return tx.delayedCreditItem.create({
              data: {
                ...itemData,
                creditId: id,
                isActive: true
              }
            });
          }
        })
      );

      // Handle removed attachments
      if (data.removedAttachmentIds?.length) {
        // Soft delete attachments
        await tx.delayedCreditAttachment.updateMany({
          where: {
            id: { in: data.removedAttachmentIds },
            creditId: id,
            credit: { companyId: session.user.activeCompanyId },
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'Attachment removed during credit update'
          }
        });

        // Get file IDs to soft delete
        const attachmentsToSoftDelete =
          await tx.delayedCreditAttachment.findMany({
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
            companyId: session.user.activeCompanyId,
            isActive: true
          },
          data: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByUserId: session.user.id,
            deactivationReason: 'File attachment removed from credit'
          }
        });
      }

      // Handle new files
      if (data.files?.length) {
        const existingFileKeys = existingCredit.attachments.map(
          (a) => a.file.path
        );

        const newFiles = data.files.filter(
          (file) => !existingFileKeys.includes(file.key!)
        );

        for (const file of newFiles) {
          const fileRecord = await tx.file.create({
            data: {
              filename: file.file.name,
              path: file.key!,
              mimetype: file.file.type,
              size: file.file.size,
              purpose: 'delayed_credit_attachment',
              companyId: session.user.activeCompanyId,
              isActive: true
            }
          });

          await tx.delayedCreditAttachment.create({
            data: {
              creditId: id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      // Update the main credit record
      const updatedCredit = await tx.delayedCredit.update({
        where: {
          id,
          isActive: true
        },
        data: {
          customerId: data.customerId,
          status: data.status,
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
            type: 'DELAYED_CREDIT',
            cc: data.ccEmail || '',
            snapshotTimestamp: new Date().toISOString(),
            amount: totalAmount,
            items: data.items.map((item) => ({
              ...item,
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

      return updatedCredit;
    });

    revalidatePath('/delayedcredits');
    return { success: true, data: credit };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update credit'
    };
  }
}

// Add a function to soft-delete delayed credits
export async function deleteDelayedCredit(id: string) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Check if the credit can be deleted
    const credit = await prisma.delayedCredit.findUnique({
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

    if (!credit) {
      return {
        success: false,
        error: 'Delayed credit not found'
      };
    }

    if (credit.status === 'CREDITED') {
      return {
        success: false,
        error: 'Cannot delete a delayed credit that has been processed'
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete credit attachments
      await tx.delayedCreditAttachment.updateMany({
        where: {
          creditId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent delayed credit deactivated'
        }
      });

      // 2. Soft delete credit items
      await tx.delayedCreditItem.updateMany({
        where: {
          creditId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent delayed credit deactivated'
        }
      });

      // 3. Soft delete the credit itself
      await tx.delayedCredit.update({
        where: {
          id,
          companyId: session.user.activeCompanyId
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Delayed credit deactivated by user'
        }
      });
    });

    revalidatePath('/delayedcredits');
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating delayed credit:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate delayed credit'
    };
  }
}
