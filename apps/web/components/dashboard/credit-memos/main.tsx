'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DocumentFilters } from '@/components/dashboard/base/DocumentFilters';
import { DataTable } from '@/components/dashboard/base/table';
import { useFilters } from '@/components/dashboard/base/useFilters';
import { Button } from '@/components/ui/button';
import { CreditMemoStatus } from '@/lib/generated/prisma/enums';
import {
  deleteCreditMemos,
  getCreditMemoDetails,
  getCreditMemosPage,
  getCreditMemoStats,
  CreditMemoBasic,
  CreditMemoWithRelations
} from './actions';
import { columns } from './columns';
import { CreditMemoSheet } from './creditMemoSheet';
import { CreditMemoStats } from './CreditMemoStats';
import { MobileCards } from './mobileCard';

type CreditMemoMetadata = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

interface CreditMemoResponse {
  data: CreditMemoBasic[];
  metadata: CreditMemoMetadata;
}

export interface CreditMemoStats {
  totalCreditMemos: number;
  totalAmount: number;
  statusBreakdown: Record<CreditMemoStatus, number>;
}

interface CreditMemosPageProps {
  initialData: CreditMemoResponse;
  initialStats: CreditMemoStats;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function CreditMemosPage({
  initialData,
  initialStats,
  searchParams
}: CreditMemosPageProps) {
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [memosData, setMemosData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);

  const handleDataFetched = useCallback(async (newData: any) => {
    setMemosData(newData);
    try {
      const newStats = await getCreditMemoStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchData = useCallback(
    async (params: any) =>
      await getCreditMemosPage(params.page, 10, {
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
      entityType: 'creditMemo'
    });

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) {
      return { success: false, error: 'No credit memos selected for deletion' };
    }

    try {
      const result = await deleteCreditMemos(selectedIds);
      if (result.success) {
        const newData = await getCreditMemosPage(1, 10);
        setMemosData(newData);
        const newStats = await getCreditMemoStats();
        setStats(newStats);
      }
      return result;
    } catch (error) {
      console.error('Error deleting credit memos:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete credit memos'
      };
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-purple-900">
            Credit Memos
          </h2>
          <p className="text-sm text-gray-600">
            Manage your credits and refunds
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/${companySlug}/credit-memos/new`}>
            <Button className="bg-purple-600 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-purple-700">
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
              Create Credit Memo
            </Button>
          </Link>
        </div>
      </div>

      {stats && <CreditMemoStats stats={stats} />}

      <div className="mt-2 space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">
          Credit Memo Management
        </h3>

        <DocumentFilters<CreditMemoStatus>
          documentType="CREDIT_MEMO"
          filters={{
            status:
              filters.status === 'ALL'
                ? undefined
                : (filters.status as CreditMemoStatus),
            dateRange: filters.dateRange || '',
            search: search || ''
          }}
          search={search}
          isLoading={isLoading}
          statusEnum={CreditMemoStatus}
          onSearchChange={setSearch}
          onStatusChange={(value) => {
            if (value === 'ALL') {
              updateFilters({ status: undefined });
            } else {
              updateFilters({ status: value as CreditMemoStatus });
            }
          }}
          onDateRangeChange={(value) => updateFilters({ dateRange: value })}
        />

        <DataTable<CreditMemoBasic, CreditMemoWithRelations>
          columns={columns}
          data={memosData.data}
          pageCount={memosData.metadata.pageCount}
          initialPage={Number(searchParams.page) || 1}
          onPageChange={(page) => updatePage(page)}
          onDeleteSelected={handleDeleteSelected}
          getDetails={getCreditMemoDetails}
          MobileCards={MobileCards}
          DetailSheet={CreditMemoSheet}
        />
      </div>
    </div>
  );
}
