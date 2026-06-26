'use client';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { DocumentFilters } from '@/components/dashboard/base/DocumentFilters';
import { DataTable } from '@/components/dashboard/base/table';
import { useFilters } from '@/components/dashboard/base/useFilters';
import { Button } from '@/components/ui/button';
import { CreditStatus } from '@/lib/generated/prisma/enums';
import {
  deleteDelayedCredits,
  getDelayedCreditDetails,
  getDelayedCreditsPage,
  getDelayedCreditStats,
  DelayedCreditWithRelations
} from './actions';
import { columns } from './columns';
import { DelayedCreditStats } from './DelayedCreditStats';
import { DelayedCreditSheet } from './delyedCreditSheet';
import { MobileCards } from './mobileCard';
import { DelayedCreditBasicCustom, DelayedCreditResponseCustom } from './types';

interface DelayedCreditsPageProps {
  initialData: DelayedCreditResponseCustom;
  initialStats: Awaited<ReturnType<typeof getDelayedCreditStats>>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function DelayedCreditsPage({
  initialData,
  initialStats,
  searchParams
}: DelayedCreditsPageProps) {
  const [creditsData, setCreditsData] =
    useState<DelayedCreditResponseCustom>(initialData);
  const [stats, setStats] = useState({
    ...initialStats,
    pendingAmount:
      initialStats.statusBreakdown[CreditStatus.PENDING]?.amount || 0
  });

  const handleDataFetched = useCallback(async (newData: any) => {
    setCreditsData(newData as unknown as DelayedCreditResponseCustom);
    try {
      const newStats = await getDelayedCreditStats();
      setStats({
        ...newStats,
        pendingAmount:
          newStats.statusBreakdown[CreditStatus.PENDING]?.amount || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchData = useCallback(
    async (params: any) =>
      await getDelayedCreditsPage(params.page, 10, {
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
      entityType: 'credit'
    });

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) {
      return { success: false, error: 'No credits selected for deletion' };
    }

    try {
      const result = await deleteDelayedCredits(selectedIds);
      if (result.success) {
        const newData = await getDelayedCreditsPage(1, 10);
        setCreditsData(newData as unknown as DelayedCreditResponseCustom);
        const newStats = await getDelayedCreditStats();
        setStats({
          ...newStats,
          pendingAmount:
            newStats.statusBreakdown[CreditStatus.PENDING]?.amount || 0
        });
      }
      return result;
    } catch (error) {
      console.error('Error deleting credits:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete credits'
      };
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-orange-900">
            Delayed Credits
          </h2>
          <p className="text-sm text-gray-600">
            Manage future credits for customer accounts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/delayedcredit">
            <Button className="bg-orange-600 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-orange-700">
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
              Create Delayed Credit
            </Button>
          </Link>
        </div>
      </div>

      {stats && <DelayedCreditStats stats={stats} />}

      <div className="mt-2 space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">
          Delayed Credit Management
        </h3>

        <DocumentFilters<CreditStatus>
          documentType="DELAYED_CREDIT"
          filters={{
            status:
              filters.status === 'ALL'
                ? undefined
                : (filters.status as CreditStatus),
            dateRange: filters.dateRange || '',
            search: search || ''
          }}
          search={search}
          isLoading={isLoading}
          statusEnum={CreditStatus}
          onSearchChange={setSearch}
          onStatusChange={(value) => {
            if (value === 'ALL') {
              updateFilters({ status: undefined });
            } else {
              updateFilters({ status: value as CreditStatus });
            }
          }}
          onDateRangeChange={(value) => updateFilters({ dateRange: value })}
        />

        <DataTable<DelayedCreditBasicCustom, DelayedCreditWithRelations>
          columns={columns}
          data={creditsData.data}
          pageCount={creditsData.metadata.pageCount}
          initialPage={Number(searchParams.page) || 1}
          onPageChange={(page) => updatePage(page)}
          onDeleteSelected={handleDeleteSelected}
          getDetails={getDelayedCreditDetails}
          MobileCards={MobileCards}
          DetailSheet={DelayedCreditSheet}
        />
      </div>
    </div>
  );
}
