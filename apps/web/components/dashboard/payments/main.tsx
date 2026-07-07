'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DocumentFilters } from '@/components/dashboard/base/DocumentFilters';
import { DataTable } from '@/components/dashboard/base/table';
import { useFilters } from '@/components/dashboard/base/useFilters';
import { Button } from '@/components/ui/button';
import { PaymentMethod } from '@/lib/generated/prisma/enums';
import {
  deletePayments,
  getPaymentsPage,
  getPaymentStats,
  getPaymentDetails,
  PaymentBasic,
  PaymentWithRelations
} from './actions';
import { columns } from './columns';
import { MobileCards } from './mobileCard';
import { PaymentStats } from './PaymentStats';
import { PaymentSheet } from './paymentSheet';

interface PaymentsPageProps {
  initialData: Awaited<ReturnType<typeof getPaymentsPage>>;
  initialStats: Awaited<ReturnType<typeof getPaymentStats>>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function PaymentsPage({
  initialData,
  initialStats,
  searchParams
}: PaymentsPageProps) {
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [paymentsData, setPaymentsData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);

  const handleDataFetched = useCallback(async (newData: any) => {
    setPaymentsData(newData);
    const newStats = await getPaymentStats();
    setStats(newStats);
  }, []);

  const fetchData = useCallback(
    async (params: any) =>
      await getPaymentsPage(params.page, 10, {
        method: params.status,
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
      entityType: 'payment'
    });

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) {
      return { success: false, error: 'No payments selected for deletion' };
    }

    try {
      const result = await deletePayments(selectedIds);
      if (result.success) {
        const newData = await getPaymentsPage(1, 10);
        setPaymentsData(newData);
        const newStats = await getPaymentStats();
        setStats(newStats);
      }
      return result;
    } catch (error) {
      console.error('Error deleting payments:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete payments'
      };
    }
  }, []);

  const typedFilters = {
    ...filters,
    status: filters.status ? (filters.status as PaymentMethod) : undefined
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-900">
            Payments
          </h2>
          <p className="text-sm text-gray-600">
            Track payments received from customers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/${companySlug}/receive-payment`}>
            <Button className="bg-emerald-600 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-emerald-700">
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
              Receive Payment
            </Button>
          </Link>
        </div>
      </div>

      <PaymentStats stats={stats} />

      <div className="mt-2 space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-gray-800">
          Payment Management
        </h3>

        <DocumentFilters<PaymentMethod>
          documentType="PAYMENT"
          filters={typedFilters}
          search={search}
          isLoading={isLoading}
          statusEnum={PaymentMethod}
          onSearchChange={setSearch}
          onStatusChange={(value) =>
            updateFilters({
              status: value === 'ALL' ? undefined : (value as PaymentMethod)
            })
          }
          onDateRangeChange={(value) => updateFilters({ dateRange: value })}
        />

        <DataTable<PaymentBasic, PaymentWithRelations>
          columns={columns}
          data={paymentsData.data}
          pageCount={paymentsData.metadata.pageCount}
          initialPage={Number(searchParams.page) || 1}
          onPageChange={(page) => updatePage(page)}
          onDeleteSelected={handleDeleteSelected}
          getDetails={getPaymentDetails}
          MobileCards={MobileCards}
          DetailSheet={PaymentSheet}
        />
      </div>
    </div>
  );
}
