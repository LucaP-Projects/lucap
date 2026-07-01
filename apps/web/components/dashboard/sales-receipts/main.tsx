'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { DocumentFilters } from '@/components/dashboard/base/DocumentFilters';
import { DataTable } from '@/components/dashboard/base/table';
import { useFilters } from '@/components/dashboard/base/useFilters';
import { Button } from '@/components/ui/button';
import { ReceiptStatus } from '@/lib/generated/prisma/enums';
import {
  deleteSalesReceipts,
  getSalesReceiptDetails,
  getSalesReceiptsPage,
  getSalesReceiptStats,
  SalesReceiptBasic,
  SalesReceiptWithRelations
} from './actions';
import { columns } from './columns';
import { MobileCards } from './mobileCard';
import { SalesReceiptSheet } from './salesReceiptSheet';
import { SalesReceiptStats } from './SalesReceiptStats';



export interface SalesReceiptStats {
  totalReceipts: number;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  statusBreakdown: Record<
    ReceiptStatus,
    {
      count: number;
      amount: number;
    }
  >;
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}
interface SalesReceiptsPageProps {
  initialData: Awaited<ReturnType<typeof getSalesReceiptsPage>>;
  initialStats: Awaited<ReturnType<typeof getSalesReceiptStats>>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SalesReceiptsPage({
  initialData,
  initialStats,
  searchParams
}: SalesReceiptsPageProps) {
  const [receiptsData, setReceiptsData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);

  const handleDataFetched = useCallback(async (data: any) => {
    setReceiptsData(data);
    try {
      const newStats = await getSalesReceiptStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchData = useCallback(
    async (params: any) =>
      getSalesReceiptsPage(params.page, 10, {
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
      entityType: 'receipt'
    });

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) {
      return { success: false, error: 'No receipts selected for deletion' };
    }

    try {
      const result = await deleteSalesReceipts(selectedIds);
      if (result.success) {
        const newData = await getSalesReceiptsPage(1, 10);
        setReceiptsData(newData);
        const newStats = await getSalesReceiptStats();
        setStats(newStats);
      }
      return result;
    } catch (error) {
      console.error('Error deleting receipts:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete receipts'
      };
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-cyan-900">Sales Receipts</h2>
          <p className="text-sm text-gray-600">
            Track and manage completed sales transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/salesreceipt">
            <Button className="bg-cyan-600 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-cyan-700">
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
              Create Receipt
            </Button>
          </Link>
        </div>
      </div>

      {stats && <SalesReceiptStats stats={stats} />}

      <div className="mt-2 space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">Sales Receipt Management</h3>

        <DocumentFilters<ReceiptStatus>
          documentType="SALES_RECEIPT"
          filters={{
            status:
              filters.status === 'ALL'
                ? undefined
                : (filters.status as ReceiptStatus),
            dateRange: filters.dateRange || '',
            search: search || ''
          }}
          search={search}
          isLoading={isLoading}
          statusEnum={ReceiptStatus}
          onSearchChange={setSearch}
          onStatusChange={(value) => {
            if (value === 'ALL') {
              updateFilters({ status: undefined });
            } else {
              updateFilters({ status: value as ReceiptStatus });
            }
          }}
          onDateRangeChange={(value) => updateFilters({ dateRange: value })}
        />

        <DataTable<SalesReceiptBasic, SalesReceiptWithRelations>
          columns={columns}
          data={receiptsData.data}
          pageCount={receiptsData.metadata.pageCount}
          initialPage={Number(searchParams.page) || 1}
          onPageChange={(page) => updatePage(page)}
          onDeleteSelected={handleDeleteSelected}
          getDetails={getSalesReceiptDetails}
          MobileCards={MobileCards}
          DetailSheet={SalesReceiptSheet}
        />
      </div>
    </div>
  );
}
