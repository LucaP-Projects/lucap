'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Account, AccountNode, AccountQueryResult } from './types';

type DeleteAccountResponse = {
  success: boolean;
  error?: string;
  redirect?: string;
};

export async function deleteAccount(
  id: string
): Promise<DeleteAccountResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    // Check if account exists and is custom
    const account = await db.account.findUnique({
      where: {
        id,
        companyId: session.user.companyId,
        isActive: true
      }
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    if (!account.is_custom) {
      return { success: false, error: 'Cannot delete template accounts' };
    }

    // Check for child accounts
    const hasChildren = await db.account.findFirst({
      where: {
        parent_id: id,
        companyId: session.user.companyId,
        isActive: true
      }
    });

    if (hasChildren) {
      return {
        success: false,
        error:
          'Cannot delete account with child accounts. Please delete or reassign child accounts first.'
      };
    }

    // Soft delete the account instead of hard delete
    await db.account.update({
      where: {
        id,
        companyId: session.user.companyId
      },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedByUserId: session.user.id,
        deactivationReason: 'Account deactivated by user'
      }
    });

    revalidatePath('/accounts');
    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}

type UpdateAccountResponse = {
  success: boolean;
  error?: string;
  redirect?: string;
};

export async function updateAccount(
  id: string,
  title: string
): Promise<UpdateAccountResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    // Check if account exists and is active
    const account = await db.account.findUnique({
      where: {
        id,
        companyId: session.user.companyId,
        isActive: true
      }
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Update the account
    await db.account.update({
      where: {
        id,
        companyId: session.user.companyId,
        isActive: true
      },
      data: { title }
    });

    revalidatePath('/accounts');
    return { success: true };
  } catch (error) {
    console.error('Error updating account:', error);
    return { success: false, error: 'Failed to update account' };
  }
}
export async function getInitialAccounts(): Promise<Account[]> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  if (!session?.user?.companyId) {
    redirect('/select-company');
  }

  // Using your recursive query from getAccountsForSelect
  const query = `
    WITH RECURSIVE account_hierarchy AS (
      -- Base case: root level accounts
      SELECT 
        id,
        title,
        number::text as number,
        composed_number::text as composed_number,
        is_custom,
        parent_id,
        0 as level,
        ARRAY[composed_number] as path
      FROM "Account"
      WHERE "companyId" = $1 AND parent_id IS NULL AND "isActive" = true
      
      UNION ALL
      
      -- Recursive case: child accounts
      SELECT 
        a.id,
        a.title,
        a.number::text,
        a.composed_number::text,
        a.is_custom,
        a.parent_id,
        h.level + 1,
        h.path || a.composed_number
      FROM "Account" a
      INNER JOIN account_hierarchy h ON a.parent_id = h.id
      WHERE a."companyId" = $1 AND a."isActive" = true
    )
    SELECT 
      id,
      title,
      number,
      composed_number,
      is_custom,
      parent_id,
      level
    FROM account_hierarchy
    ORDER BY composed_number::numeric;
  `;

  const results = await db.$queryRawUnsafe<AccountQueryResult[]>(
    query,
    session.user.companyId
  );

  // Convert flat structure to hierarchy
  const accountMap = new Map<string, AccountNode>();
  const rootAccounts: AccountNode[] = [];

  // First pass: Create all account objects
  results.forEach((account: AccountQueryResult) => {
    accountMap.set(account.id, {
      id: account.id,
      title: account.title,
      number: account.number,
      composed_number: account.composed_number,
      is_custom: account.is_custom,
      parent_id: account.parent_id,
      subAccounts: []
    });
  });

  // Second pass: Build hierarchy
  results.forEach((account: AccountQueryResult) => {
    const accountData = accountMap.get(account.id);
    if (account.parent_id) {
      const parent = accountMap.get(account.parent_id);
      if (parent && accountData) {
        parent.subAccounts.push(accountData);
      }
    } else if (accountData) {
      rootAccounts.push(accountData);
    }
  });

  return rootAccounts;
}
