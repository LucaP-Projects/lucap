'use server';

import { Prisma } from '@/lib/generated/prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { accountFormSchema } from './schema';
type CreateAccountResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function createAccount(
  data: z.infer<typeof accountFormSchema>
): Promise<CreateAccountResponse> {
  try {
    const validatedData = accountFormSchema.parse(data);
    const session = await auth.api.getSession();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    // Check if the number already exists in the company
    const existingNumber = await db.account.findFirst({
      where: {
        companyId: session.user.companyId,
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

    const createData: Prisma.AccountCreateInput = {
      title: validatedData.title,
      number: validatedData.number,
      composed_number: validatedData.number,
      is_custom: true,
      is_active: true,
      company: {
        connect: {
          id: session.user.companyId
        }
      }
    };

    if (validatedData.parentId) {
      // Check for circular reference
      if (
        await hasCircularReference(
          validatedData.parentId,
          session.user.companyId
        )
      ) {
        return { success: false, error: 'Circular reference detected' };
      }

      // Find parent account
      const parentAccount = await db.account.findUnique({
        where: {
          id: validatedData.parentId,
          companyId: session.user.companyId
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
      const existingComposed = await db.account.findFirst({
        where: {
          companyId: session.user.companyId,
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
    const account = await db.account.create({
      data: createData
    });

    revalidatePath('/accounts');
    return { success: true, data: account };
  } catch (error) {
    console.error('Error creating account:', error);

    // Handle Prisma unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', ')
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

  const parent = await db.account.findUnique({
    where: { id: parentId, companyId },
    select: { parent_id: true }
  });

  if (!parent || !parent.parent_id) {
    return false;
  }

  return hasCircularReference(parent.parent_id, companyId, checkedIds);
}
