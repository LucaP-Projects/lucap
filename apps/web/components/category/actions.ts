'use server';

import { redirect } from 'next/navigation';
import { CategoryWithItems } from '@/components/dashboard/categories/types';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CategoryFormValues } from './schema';
import { headers } from 'next/headers';

export async function createCategory(data: CategoryFormValues): Promise<{
  success: boolean;
  error?: string;
  data?: CategoryWithItems;
}> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    return await prisma.$transaction(async (tx) => {
      // Check for existing category within transaction
      const existingCategory = await tx.category.findFirst({
        where: {
          companyId: session.user.companyId,
          name: {
            equals: data.name,
            mode: 'insensitive'
          }
        }
      });

      if (existingCategory) {
        return {
          success: false,
          error: `A category with the name "${data.name}" already exists`
        };
      }

      let level = 0;
      if (data.parentId) {
        const parent = await tx.category.findUnique({
          where: { id: data.parentId, companyId: session.user.companyId }
        });
        if (parent) {
          level = parent.level + 1;
        }
      }

      const createdCategory = await prisma.category.create({
        data: {
          companyId: session.user.companyId,
          name: data.name,
          description: data.description,
          parentId: data.parentId,
          active: data.active,
          sortOrder: data.sortOrder,
          level
        },
        include: {
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

      return {
        success: true,
        data: {
          ...createdCategory,
          subCategories: []
        }
      };
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: 'Failed to create category. Please try again.'
    };
  }
}

export async function updateCategory(
  categoryId: string,
  data: CategoryFormValues
): Promise<{
  success: boolean;
  error?: string;
  data?: CategoryWithItems;
}> {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    return await prisma.$transaction(async (tx) => {
      // Check for existing category with same name (excluding current category)
      const existingCategory = await tx.category.findFirst({
        where: {
          companyId: session.user.companyId,
          name: {
            equals: data.name,
            mode: 'insensitive'
          },
          id: {
            not: categoryId
          }
        }
      });

      if (existingCategory) {
        return {
          success: false,
          error: `A category with the name "${data.name}" already exists`
        };
      }

      let level = 0;
      if (data.parentId) {
        const parent = await tx.category.findUnique({
          where: { id: data.parentId, companyId: session.user.companyId }
        });
        if (parent) {
          level = parent.level + 1;
        }
      }

      const updatedCategory = await tx.category.update({
        where: {
          id: categoryId,
          companyId: session.user.companyId
        },
        data: {
          name: data.name,
          description: data.description,
          parentId: data.parentId,
          active: data.active,
          sortOrder: data.sortOrder,
          level
        },
        include: {
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

      return {
        success: true,
        data: {
          ...updatedCategory,
          subCategories: []
        }
      };
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: 'Failed to update category. Please try again.'
    };
  }
}
