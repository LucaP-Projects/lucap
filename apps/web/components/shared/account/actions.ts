'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type AccountSelectData = {
  id: string;
  title: string;
  number: string;
  composed_number: string;
  is_custom: boolean;
  parent_id: string | null;
  subAccounts?: AccountSelectData[];
};

interface AccountQueryResult {
  id: string;
  title: string;
  number: string;
  composed_number: string;
  is_custom: boolean;
  parent_id: string | null;
  level: number;
}

type AccountResponse = {
  success: boolean;
  data?: AccountSelectData[];
  error?: string;
  redirect?: string;
};

async function getAccountsWithHierarchy(
  companyId: string,
  search?: string
): Promise<AccountSelectData[]> {
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
      WHERE "companyId" = $1 AND parent_id IS NULL
      
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
      WHERE a."companyId" = $1
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
    WHERE 
      ${search
      ? `
        (
          title ILIKE $2 
          OR CAST(number AS TEXT) ILIKE $2
          OR EXISTS (
            SELECT 1 
            FROM account_hierarchy ah 
            WHERE ah.path[1:array_length(account_hierarchy.path, 1)] = account_hierarchy.path 
            AND (ah.title ILIKE $2 OR CAST(ah.number AS TEXT) ILIKE $2)
          )
        )
      `
      : 'true'
    }
    ORDER BY composed_number::numeric;
  `;

  const searchParams = search ? [`${companyId}`, `%${search}%`] : [companyId];
  const results = await prisma.$queryRawUnsafe<AccountQueryResult[]>(
    query,
    ...searchParams
  );

  // Convert flat structure to hierarchy
  const accountMap = new Map<string, AccountSelectData>();
  const rootAccounts: AccountSelectData[] = [];

  // First pass: Create all account objects
  results.forEach((account) => {
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
  results.forEach((account) => {
    const accountData = accountMap.get(account.id)!;
    if (account.parent_id) {
      const parent = accountMap.get(account.parent_id);
      if (parent) {
        parent.subAccounts!.push(accountData);
      }
    } else {
      rootAccounts.push(accountData);
    }
  });

  return rootAccounts;
}

export async function getAccountsForSelect(
  search?: string
): Promise<AccountResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.companyId) {
      redirect('/select-company');
    }

    const accounts = await getAccountsWithHierarchy(
      session.user.companyId,
      search
    );
    return { success: true, data: accounts };
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return { success: false, error: 'Failed to fetch accounts' };
  }
}
