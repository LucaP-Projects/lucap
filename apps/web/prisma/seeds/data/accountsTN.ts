import cuid from 'cuid';
import type { SeedModule } from '../types';
import { prisma } from '../utils/seedUtils';
import { pcg } from './planComptableGenerale';
type Account = {
  id?: string;
  title: string;
  is_custom: number;
  number: number;
  composed_number: number;
  children?: Account[];
};

const seedAccounts: SeedModule = {
  name: 'accounts',
  dependencies: [],
  seed: async (context) => {
    console.log('Creating account structure...');

    // Function to flatten the account hierarchy
    function flattenAccounts(
      accounts: Account[],
      parentId: string | null = null
    ): any[] {
      let flatAccounts: any[] = [];
      for (const account of accounts) {
        const { children, ...accountFields } = account;
        const accountId = account.id || cuid();

        // Convert number and composed_number to strings
        flatAccounts.push({
          ...accountFields,
          number: accountFields.number.toString(),
          composed_number: accountFields.composed_number.toString(),
          is_custom: accountFields.is_custom === 1,
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
