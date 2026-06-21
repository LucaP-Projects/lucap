'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CategoryResponse, CategoryWithItems } from './types';

// Define the response type

// Modified fetch function
export async function fetchCategoriesRecursively(
  parentId: string | null,
  companyId: string,
  level: number = 0,
  search?: string
): Promise<CategoryWithItems[]> {
  if (level >= 5) return [];

  const categories = await db.category.findMany({
    where: {
      parentId,
      companyId,
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
      parentId: true,
      description: true,
      level: true,
      active: true,
      sortOrder: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          name: true,
          type: true,
          salesPrice: true,
          quantityOnHand: true
        }
      }
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
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }
    const categories = await fetchCategoriesRecursively(
      null,
      session.user.companyId,
      0,
      search
    );
    return { success: true, data: categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}
export async function deleteCategory(
  categoryId: string
): Promise<{ success: boolean; error?: string; redirect?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, redirect: '/login' };
    }
    if (!session?.user?.companyId) {
      return { success: false, redirect: '/select-company' };
    }

    // Check if category exists and belongs to company
    const category = await db.category.findFirst({
      where: {
        id: categoryId,
        companyId: session.user.companyId,
        active: true
      },
      include: {
        subCategories: {
          where: { active: true }
        },
        items: true
      }
    });

    if (!category) {
      return { success: false, error: 'Category not found' };
    }

    // Check if category has subcategories
    if (category.subCategories.length > 0) {
      return {
        success: false,
        error:
          'Cannot delete category with subcategories. Please delete subcategories first.'
      };
    }

    // Check if category has items
    if (category.items.length > 0) {
      return {
        success: false,
        error:
          'Cannot delete category with items. Please remove or reassign items first.'
      };
    }

    // Soft delete the category instead of hard delete
    await db.category.update({
      where: {
        id: categoryId,
        companyId: session.user.companyId
      },
      data: {
        active: false, // The category model already uses 'active' instead of 'isActive'
        deactivatedAt: new Date(),
        deactivatedByUserId: session.user.id,
        deactivationReason: 'Category deactivated by user'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}
