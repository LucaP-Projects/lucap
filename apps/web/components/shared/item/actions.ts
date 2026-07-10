'use server';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type ItemSelectData = {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  salesPrice: number;
  type: string;
  status?: string;
  discountType?: string | null;
  discountValue?: number | null;
  sellable?: boolean;
};

type ItemResponse = {
  success: boolean;
  data?: ItemSelectData[];
  error?: string;
  redirect?: string;
};

export async function getItemsForSelect(
  search?: string
): Promise<ItemResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }
    const items = await prisma.item.findMany({
      where: {
        companyId: session.user.activeCompanyId,
        isActive: true,
        status: { in: ['ACTIVE', 'DISCONTINUED'] },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } }
              ]
            }
          : {})
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        salesPrice: true,
        type: true,
        status: true,
        discountType: true,
        discountValue: true,
        sellable: true
      }
    });
    return { success: true, data: items };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching items:', error);
    return { success: false, error: 'Failed to fetch items' };
  }
}

// Add a function for soft deleting items
export async function deleteItem(
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

    // Check if item exists and belongs to company
    const item = await prisma.item.findFirst({
      where: {
        id,
        companyId: session.user.activeCompanyId,
        isActive: true
      }
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Soft delete the item
    await prisma.item.update({
      where: { id },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedByUserId: session.user.id,
        deactivationReason: 'Item deactivated by user'
      }
    });

    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error deleting item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete item'
    };
  }
}
