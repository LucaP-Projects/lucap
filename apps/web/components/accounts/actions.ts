'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getSessionWithCompany } from '@/lib/auth';
import { AccountCreateInput, PrismaClientKnownRequestError } from '@/lib/generated/prisma/internal/prismaNamespace';
import { prisma } from '@/lib/prisma';
import { accountFormSchema } from './schema';

export async function createAccount(
  data: z.infer<typeof accountFormSchema>
) {
  try {
    const validatedData = accountFormSchema.parse(data);
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }

    // Check if the number already exists in the company
    const existingNumber = await prisma.account.findFirst({
      where: {
        companyId: session.user.activeCompanyId,
        number: validatedData.number
      }
    });

    if (existingNumber) {
      return {
        success: false,
        error: `Account number ${validatedData.number} already exists in your chart of accounts`
      };
    }

    // Initialize the base account data
    let composedNumber = validatedData.number;

    const createData: AccountCreateInput = {
      title: validatedData.title,
      number: validatedData.number,
      composed_number: validatedData.number,
      is_custom: true,
      is_active: true,
      company: {
        connect: {
          id: session.user.activeCompanyId
        }
      }
    };

    if (validatedData.parentId) {
      // Check for circular reference
      if (
        await hasCircularReference(
          validatedData.parentId,
          session.user.activeCompanyId
        )
      ) {
        return { success: false, error: 'Circular reference detected' };
      }

      // Find parent account
      const parentAccount = await prisma.account.findUnique({
        where: {
          id: validatedData.parentId,
          companyId: session.user.activeCompanyId
        }
      });

      if (!parentAccount) {
        return { success: false, error: 'Parent account not found' };
      }

      // Set parent and compose the number
      createData.parent = {
        connect: {
          id: parentAccount.id
        }
      };
      composedNumber = `${parentAccount.composed_number}${validatedData.number}`;
      createData.composed_number = composedNumber;

      // Check if composed number is unique within company
      const existingComposed = await prisma.account.findFirst({
        where: {
          companyId: session.user.activeCompanyId,
          composed_number: composedNumber
        }
      });

      if (existingComposed) {
        return {
          success: false,
          error: `This account number would create a duplicate in the hierarchy (${composedNumber})`
        };
      }
    }

    // Create the account
    const account = await prisma.account.create({
      data: createData
    });

    revalidatePath('/accounts');
    return { success: true, data: account };
  } catch (error) {
    console.error('Error creating account:', error);

    // Handle Prisma unique constraint violations
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const field = error.meta?.target as string[];
        if (field?.includes('number')) {
          return {
            success: false,
            error: 'This account number is already in use'
          };
        } else if (field?.includes('composed_number')) {
          return {
            success: false,
            error:
              'This account number would create a duplicate in the hierarchy'
          };
        }
      }
    }

    // Handle Zod validation errors
    if (error) {
      return {
        success: false,
        error: (error as any).errors.map((e: any) => e.message).join(', ')
      };
    }

    // Handle other errors
    return {
      success: false,
      error: 'Failed to create account. Please try again.'
    };
  }
}

// Helper function to check for circular references
async function hasCircularReference(
  parentId: string,
  companyId: string,
  checkedIds: Set<string> = new Set()
): Promise<boolean> {
  if (checkedIds.has(parentId)) {
    return true;
  }

  checkedIds.add(parentId);

  const parent = await prisma.account.findUnique({
    where: { id: parentId, companyId },
    select: { parent_id: true }
  });

  if (!parent || !parent.parent_id) {
    return false;
  }

  return hasCircularReference(parent.parent_id, companyId, checkedIds);
}
