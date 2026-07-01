import cuid from 'cuid';
import type { SeedModule } from '../types';
import { prisma } from '../utils/seedUtils';
import { pcg } from './planComptableGenerale';

type Account = {
  id?: string;
  title: string;
  number: string;
  composed_number: string;
  is_custom?: boolean;
  children?: Account[];
  parent_id?: string | null;
};

const seedAccounts: SeedModule = {
  name: 'accounts',
  dependencies: [],
  seed: async () => {
    console.log('Creating account structure...');

    // Function to flatten the account hierarchy
    function flattenAccounts(
      accounts: Account[],
      parentId: string | null = null
    ): Account[] {
      let flatAccounts: Account[] = [];
      for (const account of accounts) {
        const { children, ...accountFields } = account;
        const accountId = account.id || cuid();

        // Convert number and composed_number to strings
        flatAccounts.push({
          ...accountFields,
          number: accountFields.number,
          composed_number: accountFields.composed_number,
          is_custom: accountFields.is_custom ?? false,
          id: accountId,
          parent_id: parentId
        });

        if (children && children.length > 0) {
          flatAccounts = flatAccounts.concat(
            flattenAccounts(children, accountId)
          );
        }
      }
      return flatAccounts;
    }

    try {
      const flattenedAccounts = flattenAccounts(pcg, null);

      // Use createMany for bulk insertion
      await prisma.accountTemplate.createMany({
        data: flattenedAccounts,
        skipDuplicates: false
      });

      console.log('✓ Created account structure');
    } catch (error) {
      console.error('Error creating account structure:', error);
      throw error;
    }

    return { success: true };
  }
};

export default seedAccounts;
