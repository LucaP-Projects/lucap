'use server';

import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type CategorySelectData = {
  id: string;
  name: string;
  description: string | null;
  level: number;
  subCategories: CategorySelectData[];
};

export type CategoryResponse = {
  success: boolean;
  data?: CategorySelectData[];
  error?: string;
  redirect?: string;
};

async function fetchCategoriesRecursively(
  parentId: string | null,
  companyId: string,
  level: number = 0,
  search?: string
): Promise<CategorySelectData[]> {
  if (level >= 5) return [];

  const categories = await prisma.category.findMany({
    where: {
      parentId,
      companyId, // Add company ID filter
      active: true,
      ...(search
        ? {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        : {})
    },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      level: true
    }
  });

  const results = [];
  for (const category of categories) {
    const subCategories = await fetchCategoriesRecursively(
      category.id,
      companyId,
      level + 1
    );
    results.push({
      ...category,
      subCategories: subCategories || []
    });
  }

  return results;
}

export async function getCategoriesForSelect(
  search?: string
): Promise<CategoryResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }
    const categories = await fetchCategoriesRecursively(
      null,
      session.user.activeCompanyId,
      0,
      search
    );
    return { success: true, data: categories };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

// Add a function to soft-delete a category
export async function deleteCategory(
  categoryId: string
): Promise<CategoryResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/auth/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Check if category exists and belongs to company
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId: session.user.activeCompanyId,
        active: true
      },
      include: {
        // Check for subcategories
        subCategories: {
          where: { active: true }
        },
        // Check for items using this category
        items: true
      }
    });

    if (!category) {
      return { success: false, error: 'Category not found' };
    }

    // Don't allow deletion if there are subcategories
    if (category.subCategories.length > 0) {
      return {
        success: false,
        error:
          'Cannot delete category with subcategories. Please delete subcategories first.'
      };
    }

    // Don't allow deletion if there are items in the category
    if (category.items.length > 0) {
      return {
        success: false,
        error:
          'Cannot delete category with items. Please move or remove items first.'
      };
    }

    // Soft delete the category
    await prisma.category.update({
      where: {
        id: categoryId,
        companyId: session.user.activeCompanyId
      },
      data: {
        active: false, // The category model uses 'active' instead of 'isActive'
        deactivatedAt: new Date(),
        deactivatedByUserId: session.user.id,
        deactivationReason: 'Category deactivated by user'
      }
    });

    return { success: true };
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Error deleting category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}
