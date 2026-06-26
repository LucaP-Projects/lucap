'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { DocumentFilters } from '@/components/dashboard/base/DocumentFilters';
import { DataTable } from '@/components/dashboard/base/table';
import { useFilters } from '@/components/dashboard/base/useFilters';
import { Button } from '@/components/ui/button';
import { ChargeStatus } from '@/lib/generated/prisma/enums';
import {
  deleteDelayedCharges,
  getDelayedChargeDetails,
  getDelayedChargesPage,
  getDelayedChargeStats,
  DelayedChargeBasic,
  DelayedChargeWithRelations
} from './actions';
import { columns } from './columns';
import { DelayedChargeSheet } from './delayedChargeSheet';
import { DelayedChargeStats } from './DelayedChargeStats';
import { MobileCards } from './mobileCard';

type DelayedChargeMetadata = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

interface DelayedChargeResponse {
  data: DelayedChargeBasic[];
  metadata: DelayedChargeMetadata;
}

interface DelayedChargesPageProps {
  initialData: DelayedChargeResponse;
  initialStats: Awaited<ReturnType<typeof getDelayedChargeStats>>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function DelayedChargesPage({
  initialData,
  initialStats,
  searchParams
}: DelayedChargesPageProps) {
  const [chargesData, setChargesData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);

  const handleDataFetched = useCallback(async (newData: any) => {
    setChargesData(newData);
    try {
      const newStats = await getDelayedChargeStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchData = useCallback(
    async (params: any) =>
      await getDelayedChargesPage(params.page, 10, {
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
      entityType: 'charge'
    });

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) {
      return { success: false, error: 'No charges selected for deletion' };
    }

    try {
      const result = await deleteDelayedCharges(selectedIds);
      if (result.success) {
        const newData = await getDelayedChargesPage(1, 10);
        setChargesData(newData);
        const newStats = await getDelayedChargeStats();
        setStats(newStats);
      }
      return result;
    } catch (error) {
      console.error('Error deleting charges:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete charges'
      };
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-teal-900">
            Delayed Charges
          </h2>
          <p className="text-sm text-gray-600">
            Manage charges to be invoiced at a later date
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/delayedcharge">
            <Button className="bg-teal-600 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-teal-700">
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
              Create Delayed Charge
            </Button>
          </Link>
        </div>
      </div>

      {stats && <DelayedChargeStats stats={stats} />}

      <div className="mt-2 space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">
          Delayed Charge Management
        </h3>

        <DocumentFilters<ChargeStatus>
          documentType="DELAYED_CHARGE"
          filters={{
            status:
              filters.status === 'ALL'
                ? undefined
                : (filters.status as ChargeStatus),
            dateRange: filters.dateRange || '',
            search: search || ''
          }}
          search={search}
          isLoading={isLoading}
          statusEnum={ChargeStatus}
          onSearchChange={setSearch}
          onStatusChange={(value) => {
            if (value === 'ALL') {
              updateFilters({ status: undefined });
            } else {
              updateFilters({ status: value as ChargeStatus });
            }
          }}
          onDateRangeChange={(value) => updateFilters({ dateRange: value })}
        />

        <DataTable<DelayedChargeBasic, DelayedChargeWithRelations>
          columns={columns}
          data={chargesData.data}
          pageCount={chargesData.metadata.pageCount}
          initialPage={Number(searchParams.page) || 1}
          onPageChange={(page) => updatePage(page)}
          onDeleteSelected={handleDeleteSelected}
          getDetails={getDelayedChargeDetails}
          MobileCards={MobileCards}
          DetailSheet={DelayedChargeSheet}
        />
      </div>
    </div>
  );
}
