'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { DocumentFilters } from '@/components/dashboard/base/DocumentFilters';
import { DataTable } from '@/components/dashboard/base/table';
import { useFilters } from '@/components/dashboard/base/useFilters';
import { Button } from '@/components/ui/button';
import { RefundStatus } from '@/lib/generated/prisma/client';
import {
  deleteRefundReceipts,
  getRefundReceiptsPage,
  getRefundReceiptStats,
  getRefundReceiptDetails,
  RefundReceiptWithRelations,
  RefundReceiptBasic
} from './actions';
import { columns } from './columns';
import { MobileCards } from './mobileCard';
import { RefundReceiptStats } from './RefundReceiptStats';
import { RefundReceiptSheet } from './refundSheet';

interface RefundPageProps {
  initialData: Awaited<ReturnType<typeof getRefundReceiptsPage>>;
  initialStats: Awaited<ReturnType<typeof getRefundReceiptStats>>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function RefundPage({
  initialData,
  initialStats,
  searchParams
}: RefundPageProps) {
  const [refundsData, setRefundsData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);

  const handleDataFetched = useCallback(async (newData: any) => {
    setRefundsData(newData);
    const newStats = await getRefundReceiptStats();
    setStats(newStats);
  }, []);

  const fetchData = useCallback(
    async (params: any) =>
      await getRefundReceiptsPage(params.page, 10, {
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
      entityType: 'refund'
    });

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) {
      return { success: false, error: 'No refunds selected for deletion' };
    }

    try {
      const result = await deleteRefundReceipts(selectedIds);
      if (result.success) {
        const newData = await getRefundReceiptsPage(1, 10);
        setRefundsData(newData);
        const newStats = await getRefundReceiptStats();
        setStats(newStats);
      }
      return result;
    } catch (error) {
      console.error('Error deleting refunds:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete refunds'
      };
    }
  }, []);

  const typedFilters = {
    ...filters,
    status: filters.status ? (filters.status as RefundStatus) : undefined
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-violet-900">
            Refund Receipts
          </h2>
          <p className="text-sm text-gray-600">
            Process and track customer refunds
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/refundreceipt">
            <Button className="bg-violet-600 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-violet-700">
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
              Process New Refund
            </Button>
          </Link>
        </div>
      </div>

      <RefundReceiptStats stats={stats} />

      <div className="mt-2 space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">
          Refund Management
        </h3>

        <DocumentFilters<RefundStatus>
          documentType="REFUND_RECEIPT"
          filters={typedFilters}
          search={search}
          isLoading={isLoading}
          statusEnum={RefundStatus}
          onSearchChange={setSearch}
          onStatusChange={(value) =>
            updateFilters({
              status: value === 'ALL' ? undefined : (value as RefundStatus)
            })
          }
          onDateRangeChange={(value) => updateFilters({ dateRange: value })}
        />

        <DataTable<RefundReceiptBasic, RefundReceiptWithRelations>
          columns={columns}
          data={refundsData.data}
          pageCount={refundsData.metadata.pageCount}
          initialPage={Number(searchParams.page) || 1}
          onPageChange={(page) => updatePage(page)}
          onDeleteSelected={handleDeleteSelected}
          getDetails={getRefundReceiptDetails}
          MobileCards={MobileCards}
          DetailSheet={RefundReceiptSheet}
        />
      </div>
    </div>
  );
}
