import type { Metadata } from 'next';
import { getInitialAccounts } from '@/components/accountant/plan/actions';
import AccountsPageClient from '@/components/accountant/plan/planAccountant';

// Metadata type
export const metadata: Metadata = {
  title: 'Accounts Plan',
  description: 'Manage your chart of accounts'
};

// Types for the query results

export default async function AccountsPage() {
  const accounts = await getInitialAccounts();

  return <AccountsPageClient initialAccounts={accounts} />;
}
