'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { DiscountType } from '@/lib/generated/prisma/enums';
import { prisma } from '@/lib/prisma';
import { handleItemImage } from '../shared/utils';
import { ItemFormValues } from './schema';
import { Prisma } from '@/lib/generated/prisma/browser';

export type CreateItemResponse = {
  success: boolean;
  error?: string;
  data?: any;
  duplicateItemInfo?:
    | {
        name: string;
        sku: string | null;
        id: string;
      }
    | undefined;
};

export async function createItem(
  data: ItemFormValues
): Promise<CreateItemResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }
    if (!data) {
      return { success: false, error: 'No data provided' };
    }

    // Server-side discount validation
    if (
      data.discountEnabled &&
      data.discountType &&
      typeof data.discountValue === 'number'
    ) {
      if (data.discountType === 'PERCENTAGE') {
        if (data.discountValue > 100) {
          return { success: false, error: 'Percentage cannot exceed 100%' };
        }
        if (data.discountValue < 0) {
          return { success: false, error: 'Percentage cannot be negative' };
        }
      } else if (data.discountType === 'FIXED_AMOUNT') {
        if (data.discountValue > (data.salesPrice ?? 0)) {
          return {
            success: false,
            error: 'Discount cannot exceed sales price'
          };
        }
        if (data.discountValue < 0) {
          return { success: false, error: 'Discount cannot be negative' };
        }
      }
    }

    const itemData = {
      companyId: session.user.activeCompanyId,
      type: data.type,
      name: data.name?.trim() || '',
      sku: data.sku?.trim() || null,
      categoryId: data.categoryId || null,
      description: data.description?.trim() || null,
      salesDescription: data.salesDescription?.trim() || null,
      purchaseDescription: data.purchaseDescription?.trim() || null,
      sellable: data.sellable ?? false,
      salesPrice: data.salesPrice ?? 0,
      salesTaxable: data.salesTaxable ?? false,
      incomeAccountId: data.incomeAccountId || null,
      purchasable: data.purchasable ?? false,
      cost: data.cost ?? 0,
      preferredVendorId: data.preferredVendorId || null,
      expenseAccountId: data.expenseAccountId || null,
      trackInventory: data.type === 'INVENTORY',
      ...(data.type === 'INVENTORY' && {
        quantityOnHand: data.initialQuantity ?? 0,
        reorderPoint: data.reorderPoint ?? 0,
        initialQuantity: data.initialQuantity ?? 0,
        asOfDate: data.asOfDate,
        inventoryAssetAccountId: data.inventoryAssetAccountId || null
      }),
      // Discount fields
      discountType: data.discountEnabled
        ? data.discountType
          ? (data.discountType as DiscountType)
          : null
        : null,
      discountValue: data.discountEnabled
        ? typeof data.discountValue === 'number'
          ? data.discountValue
          : null
        : null,
      discountAmount: data.discountEnabled
        ? typeof data.discountAmount === 'number'
          ? data.discountAmount
          : 0
        : 0,
      isActive: true // Add isActive field for soft delete
    };
    try {
      const item = await prisma.item.create({ data: itemData });

      if (data.image instanceof File) {
        try {
          const imageUrl = await handleItemImage(data.image);
          await prisma.item.update({
            where: { id: item.id },
            data: { imageUrl }
          });
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          return {
            success: true,
            data: item,
            error:
              'Item created but image upload failed. Please try uploading the image again.'
          };
        }
      }

      revalidatePath('/items');
      revalidatePath('/invoice');
      revalidatePath('/estimates');
      revalidatePath('/sales-orders');
      revalidatePath('/creditmemo');
      revalidatePath('/salesreceipt');
      revalidatePath('/refund-receipt');
      revalidatePath('/delayed-credits');
      revalidatePath('/delayed-charges');

      return {
        success: true,
        data: item
      };
    } catch (dbError) {
      console.error('DB error when creating item:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating item:', error ?? '[Unknown error]');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create item'
    };
  }
}

export type UpdateItemStatusResponse = {
  success: boolean;
  error?: string;
  data?: any;
};

export async function updateItemStatus(
  itemId: string,
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
): Promise<UpdateItemStatusResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        companyId: session.user.activeCompanyId,
        isActive: true // Filter out soft-deleted items
      }
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        status
      }
    });

    revalidatePath('/items');
    revalidatePath('/invoice');
    revalidatePath('/estimates');
    revalidatePath('/sales-orders');
    revalidatePath('/creditmemo');
    revalidatePath('/salesreceipt');
    revalidatePath('/refund-receipt');
    revalidatePath('/delayed-credits');
    revalidatePath('/delayed-charges');

    return {
      success: true,
      data: updatedItem
    };
  } catch (error) {
    console.error('Error updating item status:', error ?? '[Unknown error]');
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update item status'
    };
  }
}



export async function updateItem(
  itemId: string,
  data: ItemFormValues
): Promise<CreateItemResponse> {
  try {
    const session = await getSessionWithCompany();

    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }
    if (!data) {
      return { success: false, error: 'No data provided' };
    }

    // Server-side discount validation
    if (
      data.discountEnabled &&
      data.discountType &&
      typeof data.discountValue === 'number'
    ) {
      if (data.discountType === 'PERCENTAGE') {
        if (data.discountValue > 100) {
          return { success: false, error: 'Percentage cannot exceed 100%' };
        }
        if (data.discountValue < 0) {
          return { success: false, error: 'Percentage cannot be negative' };
        }
      } else if (data.discountType === 'FIXED_AMOUNT') {
        if (data.discountValue > (data.salesPrice ?? 0)) {
          return {
            success: false,
            error: 'Discount cannot exceed sales price'
          };
        }
        if (data.discountValue < 0) {
          return { success: false, error: 'Discount cannot be negative' };
        }
      }
    }

    const existingItem = await prisma.item.findFirst({
      where: {
        id: itemId,
        companyId: session.user.activeCompanyId,
        isActive: true // Filter out soft-deleted items
      }
    });

    if (!existingItem) {
      return { success: false, error: 'Item not found' };
    }
    const itemData = {
      type: data.type,
      name: data.name?.trim() || '',
      sku: data.sku?.trim() || null,
      categoryId: data.categoryId ?? null,
      description: data.description?.trim() ?? null,
      salesDescription: data.salesDescription?.trim() ?? null,
      purchaseDescription: data.purchaseDescription?.trim() ?? null,
      sellable: data.sellable ?? false,
      salesPrice: data.salesPrice ?? 0,
      salesTaxable: data.salesTaxable ?? false,
      incomeAccountId: data.incomeAccountId ?? null,
      purchasable: data.purchasable ?? false,
      cost: data.cost ?? 0,
      preferredVendorId: data.preferredVendorId ?? null,
      expenseAccountId: data.expenseAccountId ?? null,
      trackInventory: data.type === 'INVENTORY',
      ...(data.type === 'INVENTORY' && {
        quantityOnHand: data.initialQuantity ?? 0,
        reorderPoint: data.reorderPoint ?? 0,
        initialQuantity: data.initialQuantity ?? 0,
        asOfDate: data.asOfDate ?? null,
        inventoryAssetAccountId: data.inventoryAssetAccountId ?? null
      }),
      discountType: data.discountEnabled
        ? data.discountType
          ? (data.discountType as DiscountType)
          : null
        : null,
      discountValue: data.discountEnabled
        ? typeof data.discountValue === 'number'
          ? data.discountValue
          : null
        : null,
      discountAmount: data.discountEnabled
        ? typeof data.discountAmount === 'number'
          ? data.discountAmount
          : 0
        : 0,
      // Ensure status is synced with discount
      status: data.discountEnabled ? 'DISCONTINUED' : data.status || 'ACTIVE'
    };
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: itemData
    });
    if (data.image instanceof File) {
      try {
        const imageUrl = await handleItemImage(data.image);
        await prisma.item.update({
          where: { id: itemId },
          data: { imageUrl }
        });
      } catch (uploadError) {
        console.error('[updateItem] Image upload failed:', uploadError);
        return {
          success: true,
          data: updatedItem,
          error:
            'Item updated but image upload failed. Please try uploading the image again.'
        };
      }
    }

    revalidatePath('/items');
    revalidatePath('/invoice');
    revalidatePath('/estimates');
    revalidatePath('/sales-orders');
    revalidatePath('/creditmemo');
    revalidatePath('/salesreceipt');
    revalidatePath('/refund-receipt');
    revalidatePath('/delayed-credits');
    revalidatePath('/delayed-charges');

    return {
      success: true,
      data: updatedItem
    };
  } catch (error) {
    console.error(
      '[updateItem] Error updating item:',
      error ?? '[Unknown error]'
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update item'
    };
  }
}

export type GetItemsResponse = {
  success: boolean;
  error?: string;
  data?: ItemDetailed[];
  totalItems?: number;
  totalPages?: number;
};
export type ItemDetailed = Prisma.ItemGetPayload<{
  include: {
    category: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

export async function getItems(
  page: number = 1,
  pageSize: number = 10,
  search: string = ''
): Promise<GetItemsResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * pageSize;

    // Build where clause with search functionality
    const whereClause = {
      companyId: session.user.activeCompanyId,
      isActive: true, // Filter out soft-deleted items
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive' as const
            }
          },
          {
            description: {
              contains: search,
              mode: 'insensitive' as const
            }
          },
          {
            sku: {
              contains: search,
              mode: 'insensitive' as const
            }
          },
          {
            category: {
              name: {
                contains: search,
                mode: 'insensitive' as const
              }
            }
          }
        ]
      })
    };

    // Get total count for pagination
    const totalItems = await prisma.item.count({
      where: whereClause
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get paginated items
    const items = await prisma.item.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: pageSize
    });
    return {
      success: true,
      data: items,
      totalItems,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching items:', error ?? '[Unknown error]');
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

// Add a function to soft-delete items
export async function deleteItem(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Check if item exists and belongs to the company
    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        companyId: session.user.activeCompanyId,
        isActive: true
      }
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Check if item is used in any documents (invoices, estimates, etc.)
    const usageCount = await prisma
      .$transaction([
        prisma.invoiceItem.count({ where: { itemId, isActive: true } }),
        prisma.estimateItem.count({ where: { itemId, isActive: true } }),
        prisma.salesReceiptItem.count({ where: { itemId, isActive: true } }),
        prisma.refundReceiptItem.count({ where: { itemId, isActive: true } }),
        prisma.creditMemoItem.count({ where: { itemId, isActive: true } }),
        prisma.delayedChargeItem.count({ where: { itemId, isActive: true } }),
        prisma.delayedCreditItem.count({ where: { itemId, isActive: true } })
      ])
      .then((counts) => counts.reduce((sum, count) => sum + count, 0));

    if (usageCount > 0) {
      return {
        success: false,
        error:
          'Cannot delete item that is used in transactions. Consider marking it inactive instead.'
      };
    }

    // Perform soft delete
    await prisma.item.update({
      where: { id: itemId },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedByUserId: session.user.id,
        deactivationReason: 'Item deactivated by user'
      }
    });

    revalidatePath('/items');
    return { success: true };
  } catch (error) {
    console.error('Error deleting item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete item'
    };
  }
}
