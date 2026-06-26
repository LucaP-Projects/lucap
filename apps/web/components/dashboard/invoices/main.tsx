'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { DocumentFilters } from '@/components/dashboard/base/DocumentFilters';
import { DataTable } from '@/components/dashboard/base/table';
import { useFilters } from '@/components/dashboard/base/useFilters';
import { Button } from '@/components/ui/button';
import  { PaymentStatus } from '@/lib/generated/prisma/enums';
import {
  deleteInvoices,
  getInvoiceDetails,
  getInvoicesPage,
  getInvoiceStats,
  InvoiceBasic,
  InvoiceWithRelations
} from './actions';
import { columns } from './columns';
import { InvoiceSheet } from './invoiceSheet';
import { InvoiceStats } from './InvoiceStats';

import { MobileCards } from './mobileCard';
import { InvoiceRefreshProvider } from './useInvoiceRefresh';

type InvoiceMetadata = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

interface InvoiceResponse {
  data: InvoiceBasic[];
  metadata: InvoiceMetadata;
}

interface InvoicesPageProps {
  initialData: InvoiceResponse;
  initialStats: Awaited<ReturnType<typeof getInvoiceStats>>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function InvoicesPage({
  initialData,
  initialStats,
  searchParams
}: InvoicesPageProps) {
  const [invoicesData, setInvoicesData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);

  const handleDataFetched = useCallback(async (newData: any) => {
    setInvoicesData(newData);
    try {
      const newStats = await getInvoiceStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  // Callback to update stats when refreshed through context
  const handleStatsRefreshed = useCallback((newStats: any) => {
    setStats(newStats);
  }, []);

  const fetchData = useCallback(
    async (params: any) =>
      await getInvoicesPage(params.page, 10, {
        status: params.status,
        search: params.search,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo
      }),
    []
  );

  const { filters, search, setSearch, isLoading, updateFilters, updatePage } =
    useFilters({
      onDataFetched: handleDataFetched,
      fetchData,
      entityType: 'invoice'
    });

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) {
      return { success: false, error: 'No invoices selected for deletion' };
    }

    try {
      const result = await deleteInvoices(selectedIds);
      if (result.success) {
        const newData = await getInvoicesPage(1, 10);
        setInvoicesData(newData);
        const newStats = await getInvoiceStats();
        setStats(newStats);
      }
      return result;
    } catch (error) {
      console.error('Error deleting invoices:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete invoices'
      };
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-900">
            Invoices
          </h2>
          <p className="text-sm text-gray-600">
            Track and manage your invoice payments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/invoice">
            <Button className="bg-blue-600 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-blue-700">
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {stats && <InvoiceStats stats={stats} />}

      <div className="mt-2 space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">
          Invoice Management
        </h3>

        <DocumentFilters<PaymentStatus>
          documentType="INVOICE"
          filters={{
            status:
              filters.status === 'ALL'
                ? undefined
                : (filters.status as PaymentStatus),
            dateRange: filters.dateRange || '',
            search: search || ''
          }}
          search={search}
          isLoading={isLoading}
          statusEnum={PaymentStatus}
          onSearchChange={setSearch}
          onStatusChange={(value) => {
            if (value === 'ALL') {
              updateFilters({ status: undefined });
            } else {
              updateFilters({ status: value as PaymentStatus });
            }
          }}
          onDateRangeChange={(value) => updateFilters({ dateRange: value })}
        />

        <InvoiceRefreshProvider onStatsRefreshed={handleStatsRefreshed}>
          <DataTable<InvoiceBasic, InvoiceWithRelations>
            columns={columns}
            data={invoicesData.data}
            pageCount={invoicesData.metadata.pageCount}
            initialPage={Number(searchParams.page) || 1}
            onPageChange={(page) => updatePage(page)}
            onDeleteSelected={handleDeleteSelected}
            getDetails={getInvoiceDetails}
            MobileCards={MobileCards}
            DetailSheet={InvoiceSheet}
          />
        </InvoiceRefreshProvider>
      </div>
    </div>
  );
}
