'use server';
import {
  ChargeStatus,
  DiscountApplicationTime,
  DiscountType,
  Prisma
} from '@/lib/generated/prisma/client';
import { Decimal } from 'decimal.js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueNumber } from '@/lib/utils';
import { CustomizationSettingsInput } from '../base/sideBar/customize/types';
import { validateCustomer } from '../shared/file-action';
import { validateItems } from '../shared/utils';
import { DelayedCharge } from './types';

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

interface CreateDelayedChargeData {
  customerId: string;
  dueDate: Date;
  status: ChargeStatus;
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

interface UpdateDelayedChargeData extends CreateDelayedChargeData {
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

type CreateDelayedChargeResponse =
  | { success: true; data: DelayedCharge }
  | { success: false; error: string };

async function validateChargeNumber(
  tx: Prisma.TransactionClient,
  chargeNumber: string,
  companyId: string
): Promise<void> {
  try {
    const existingCharge = await tx.delayedCharge.findUnique({
      where: {
        number_companyId: {
          number: chargeNumber,
          companyId
        },
        isActive: true
      },
      select: { id: true }
    });

    if (existingCharge) {
      throw new Error('Charge number already exists');
    }
  } catch (error) {
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors by their error codes
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          throw new Error('Duplicate charge number detected');
        case 'P2023': // Inconsistent column data
          throw new Error('Invalid charge number or company ID format');
        default:
          throw new Error(`Database error: ${error.message}`);
      }
    }

    // Re-throw unknown errors with a more user-friendly message
    throw new Error(
      `Error validating charge number: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function createDelayedCharge(
  data: CreateDelayedChargeData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<CreateDelayedChargeResponse> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    const charge = await prisma.$transaction(async (tx) => {
      const chargeNumber = `CH-${generateUniqueNumber()}`;
      await Promise.all([
        validateCustomer(tx, data.customerId, session.user.companyId),
        validateChargeNumber(tx, chargeNumber, session.user.companyId)
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

      const charge = await tx.delayedCharge.create({
        data: {
          companyId: session.user.companyId,
          number: chargeNumber,
          customerId: data.customerId,
          status: data.status || ChargeStatus.PENDING,
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
            customPdfSettings: settings,
            color: color,
            customer: {
              name: data.emailCustomer || '',
              type: 'individual',
              address: data.customerAddress
            },
            type: 'DelayedCharge',
            cc: data.ccEmail || '',
            snapshotTimestamp: new Date().toISOString(),
            amount: totalAmount,
            taxId: data.taxId,
            discountType: data.discountType,
            discountValue: data.discountValue,
            discountAmount,
            taxAmount,
            taxRate,
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
              itemId: item.itemId,
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
              id: true,
              level: true,
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
              purpose: 'delayed_charge_attachment',
              companyId: session.user.companyId,
              isActive: true
            }
          });

          await tx.chargeAttachment.create({
            data: {
              chargeId: charge.id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      return charge;
    });

    revalidatePath('/delayedcharges');
    return { success: true, data: charge };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create charge'
    };
  }
}

// Keep existing getDelayedCharge function
export async function getDelayedCharge(id: string) {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }
    const charge = await prisma.delayedCharge.findUnique({
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
        }
      }
    });

    if (!charge) {
      return {
        success: false,
        error: 'Delayed charge not found'
      };
    }

    return {
      success: true,
      data: charge
    };
  } catch (error) {
    console.error('Error fetching delayed charge:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch delayed charge'
    };
  }
}

export async function updateDelayedCharge(
  id: string,
  data: UpdateDelayedChargeData,
  settings: CustomizationSettingsInput,
  color: string
): Promise<CreateDelayedChargeResponse> {
  try {
    if (!data || !id) {
      throw new Error('Missing required update data or charge ID');
    }
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    const charge = await prisma.$transaction(async (tx) => {
      // Validate inputs
      await validateCustomer(tx, data.customerId, session.user.companyId);
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

      const existingItems = await tx.delayedChargeItem.findMany({
        where: {
          chargeId: id,
          isActive: true
        }
      });
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
        await tx.chargeAttachment.updateMany({
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
            deactivationReason: 'Attachment removed from delayed charge'
          }
        });
      }

      // Update existing items
      await Promise.all(
        itemsToUpdate.map((item) =>
          tx.delayedChargeItem.update({
            where: { id: item.id },
            data: {
              productName: item.productName.trim(),
              description: item.description?.trim(),
              quantity: item.quantity,
              rate: item.rate,
              amount: new Decimal(item.quantity).mul(item.rate).toNumber(),
              taxable: item.taxable,
              sku: item.sku || null,
              itemId: item.itemId || null
            }
          })
        )
      );

      // Soft delete removed items
      if (itemsToDelete.length > 0) {
        await tx.delayedChargeItem.updateMany({
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
            deactivationReason: 'Item removed from delayed charge'
          }
        });
      }

      // Create new items
      if (itemsToCreate.length > 0) {
        await tx.delayedChargeItem.createMany({
          data: itemsToCreate.map((item) => ({
            chargeId: id,
            productName: item.productName.trim(),
            description: item.description?.trim(),
            quantity: item.quantity,
            rate: item.rate,
            amount: new Decimal(item.quantity).mul(item.rate).toNumber(),
            taxable: item.taxable,
            sku: item.sku || null,
            itemId: item.itemId || null,
            isActive: true
          }))
        });
      }

      // Handle new file attachments
      if (data.files?.length) {
        for (const file of data.files) {
          // Skip files that are already attached to the charge
          if (file.key && !file.key.startsWith('temp-')) continue;

          const fileRecord = await tx.file.create({
            data: {
              filename: file.file.name,
              path: file.key!,
              mimetype: file.file.type,
              size: file.file.size,
              purpose: 'delayed_charge_attachment',
              companyId: session.user.companyId,
              isActive: true
            }
          });

          await tx.chargeAttachment.create({
            data: {
              chargeId: id,
              fileId: fileRecord.id,
              isActive: true
            }
          });
        }
      }

      return await tx.delayedCharge.update({
        where: {
          id,
          companyId: session.user.companyId,
          isActive: true
        },
        data: {
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
            type: 'DelayedCharge',
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
          customerId: data.customerId,
          dueDate: data.dueDate,
          status: data.status,
          amount: totalAmount,
          notes: data.notes?.trim(),
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount,
          discountApplicationTime: data.discountApplicationTime,
          taxRate,
          taxId: data.taxId || null,
          taxAmount,
          emailCustomer: data.emailCustomer?.toLowerCase().trim()
        },
        include: {
          tax: true,
          items: true,
          attachments: {
            include: {
              file: true
            }
          },
          customer: {
            select: {
              displayName: true,
              primaryEmail: true,
              level: true,
              id: true
            }
          }
        }
      });
    });

    revalidatePath('/delayed-charges');
    return { success: true, data: charge };
  } catch (error) {
    console.error('Error updating delayed charge:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update delayed charge'
    };
  }
}

// Add a function to soft-delete a delayed charge
export async function deleteDelayedCharge(id: string) {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    // Check if the charge can be deleted
    const charge = await prisma.delayedCharge.findUnique({
      where: {
        id,
        companyId: session.user.companyId,
        isActive: true
      },
      select: {
        id: true,
        status: true,
        number: true
      }
    });

    if (!charge) {
      return {
        success: false,
        error: 'Delayed charge not found'
      };
    }

    if (charge.status === 'INVOICED') {
      return {
        success: false,
        error: 'Cannot delete a delayed charge that has been invoiced'
      };
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete charge attachments
      await tx.chargeAttachment.updateMany({
        where: {
          chargeId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent delayed charge deactivated'
        }
      });

      // 2. Soft delete charge items
      await tx.delayedChargeItem.updateMany({
        where: {
          chargeId: id,
          isActive: true
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Parent delayed charge deactivated'
        }
      });

      // 3. Soft delete the charge itself
      await tx.delayedCharge.update({
        where: {
          id,
          companyId: session.user.companyId
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedByUserId: session.user.id,
          deactivationReason: 'Delayed charge deactivated by user'
        }
      });
    });

    revalidatePath('/delayed-charges');
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deactivating delayed charge:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deactivate delayed charge'
    };
  }
}
