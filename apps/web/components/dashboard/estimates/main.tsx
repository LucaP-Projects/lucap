'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { DocumentFilters } from '@/components/dashboard/base/DocumentFilters';
import { DataTable } from '@/components/dashboard/base/table';
import { useFilters } from '@/components/dashboard/base/useFilters';
import { Button } from '@/components/ui/button';
import { EstimateStatus } from '@/lib/generated/prisma/client';
import {
  deleteEstimates,
  getEstimatesPage,
  getEstimateStats,
  getEstimateDetails,
  EstimateWithRelations,
  EstimateBasic
} from './actions';
import { columns } from './columns';
import { EstimateSheet } from './estimateSheet';
import { EstimateStats } from './EstimateStats';
import { MobileCards } from './mobileCard';

interface EstimatesPageProps {
  initialData: Awaited<ReturnType<typeof getEstimatesPage>>;
  initialStats: Awaited<ReturnType<typeof getEstimateStats>>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function EstimatesPage({
  initialData,
  initialStats,
  searchParams
}: EstimatesPageProps) {
  const [estimatesData, setEstimatesData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);

  const handleDataFetched = useCallback(async (newData: any) => {
    setEstimatesData(newData);
    const newStats = await getEstimateStats();
    setStats(newStats);
  }, []);

  const fetchData = useCallback(
    async (params: any) =>
      await getEstimatesPage(params.page, 10, {
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
      entityType: 'estimate'
    });

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) {
      return { success: false, error: 'No estimates selected for deletion' };
    }

    try {
      const result = await deleteEstimates(selectedIds);
      if (result.success) {
        const newData = await getEstimatesPage(1, 10);
        setEstimatesData(newData);
        const newStats = await getEstimateStats();
        setStats(newStats);
      }
      return result;
    } catch (error) {
      console.error('Error deleting estimates:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete estimates'
      };
    }
  }, []);

  const typedFilters = {
    ...filters,
    status: filters.status ? (filters.status as EstimateStatus) : undefined
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-pink-900">
            Estimates
          </h2>
          <p className="text-sm text-gray-600">
            Create proposals and quotes for your customers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/estimate">
            <Button className="bg-pink-600 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-pink-700">
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
              Create Estimate
            </Button>
          </Link>
        </div>
      </div>

      <EstimateStats stats={stats} />

      <div className="mt-2 space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">
          Estimate Management
        </h3>

        <DocumentFilters<EstimateStatus>
          documentType="ESTIMATE"
          filters={typedFilters}
          search={search}
          isLoading={isLoading}
          statusEnum={EstimateStatus}
          onSearchChange={setSearch}
          onStatusChange={(value) =>
            updateFilters({
              status: value === 'ALL' ? undefined : (value as EstimateStatus)
            })
          }
          onDateRangeChange={(value) => updateFilters({ dateRange: value })}
        />

        <DataTable<EstimateBasic, EstimateWithRelations>
          columns={columns}
          data={estimatesData.data}
          pageCount={estimatesData.metadata.pageCount}
          initialPage={Number(searchParams.page) || 1}
          onPageChange={(page) => updatePage(page)}
          onDeleteSelected={handleDeleteSelected}
          getDetails={getEstimateDetails}
          MobileCards={MobileCards}
          DetailSheet={EstimateSheet}
        />
      </div>
    </div>
  );
}
