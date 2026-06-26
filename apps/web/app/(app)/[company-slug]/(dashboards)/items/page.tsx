import React from 'react';
import { Metadata } from 'next';
import { getItems } from '@/components/items/actions';
import { ItemsTable } from '@/components/items/section/items-table';
import { getSessionWithCompany } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Items & Services',
  description: 'Manage your inventory, products and services'
};

export default async function ItemsPage() {
  const session = await getSessionWithCompany();
  const companyId = session?.user?.activeCompanyId;

  if (!companyId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <h1 className="mb-2 text-2xl font-semibold">No Company Selected</h1>
        <p className="text-muted-foreground">
          Please select a company to view items.
        </p>
      </div>
    );
  }

  // Use the existing paginated getItems function with empty search initially
  const { data: items = [], totalPages = 1 } = await getItems(1, 10, '');

  return <ItemsTable initialItems={items} initialTotalPages={totalPages} />;
}
