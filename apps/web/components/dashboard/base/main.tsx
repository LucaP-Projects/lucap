'use client';

import { useCallback, useState } from 'react';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ChargeStatus,
  CreditMemoStatus,
  CreditStatus,
  EstimateStatus,
  PaymentStatus,
  RefundStatus
} from '@/lib/generated/prisma/enums';
import { DataTable } from './table';
import { FilterStatus, useFilters } from './useFilters';
type StatusType =
  | PaymentStatus
  | EstimateStatus
  | CreditMemoStatus
  | RefundStatus
  | ChargeStatus
  | CreditStatus
  | undefined;
export const DOCUMENT_TYPES = {
  ESTIMATE: 'Estimate',
  INVOICE: 'Invoice',
  DELAYED_CREDIT: 'Delayed Credit',
  DELAYED_CHARGE: 'Delayed Charge',
  CREDIT_MEMO: 'Credit Memo',
  REFUND_RECEIPT: 'Refund Receipt',
  SALES_RECEIPT: 'Sales Receipt'
} as const;
interface EntityPageProps<TBasic, TDetailed, TStatus, TStats> {
  documentType: keyof typeof DOCUMENT_TYPES;
  initialData: {
    data: TBasic[];
    metadata: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
  initialStats: TStats;
  searchParams: { [key: string]: string | string[] | undefined };
  entityType:
    | 'credit'
    | 'receipt'
    | 'estimate'
    | 'creditMemo'
    | 'refund'
    | 'charge';
  entityName: {
    singular: string;
    plural: string;
  };
  columns: ColumnDef<TBasic, any>[];
  createPath: string;
  StatsComponent: React.ComponentType<{ stats: TStats }>;
  FiltersComponent: React.ComponentType<{
    filters: any;
    search: string;
    isLoading: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onDateRangeChange: (value: string) => void;
  }>;
  fetchData: (params: any) => Promise<any>;
  getStats: () => Promise<TStats>;
  deleteItems: (ids: string[]) => Promise<{ success: boolean; error?: string }>;
  statusEnum: { [key: string]: TStatus };
  getDetails: (id: string) => Promise<TDetailed | null>;
  MobileCards: React.ComponentType<{
    table: any;
    onSelect: (item: TBasic) => void;
    onOpenSheet: () => void;
  }>;
  DetailSheet: React.ComponentType<{
    data: TDetailed;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isLoading: boolean;
  }>;
}

export default function EntityPage<
  TBasic extends { id: string },
  TDetailed,
  TStatus extends StatusType,
  TStats
>({
  initialData,
  initialStats,
  searchParams,
  entityType,
  entityName,
  columns,
  createPath,
  StatsComponent,
  FiltersComponent,
  fetchData,
  getStats,
  deleteItems,
  statusEnum,
  getDetails,
  MobileCards,
  DetailSheet
}: EntityPageProps<TBasic, TDetailed, TStatus, TStats>) {
  const [data, setData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);

  const handleDataFetched = useCallback(
    async (newData: any) => {
      setData(newData);
      const newStats = await getStats();
      setStats(newStats);
    },
    [getStats]
  );

  const wrappedFetchData = useCallback(
    async (params: any) =>
      await fetchData({
        ...params,
        status:
          params.status === 'ALL' ? undefined : (params.status as StatusType)
      }),
    [fetchData]
  );

  const { filters, search, setSearch, isLoading, updateFilters, updatePage } =
    useFilters({
      onDataFetched: handleDataFetched,
      fetchData: wrappedFetchData,
      entityType
    });

  const handleDeleteSelected = useCallback(
    async (selectedIds: string[]) => {
      if (!selectedIds.length) {
        return {
          success: false,
          error: `No ${entityName.plural.toLowerCase()} selected for deletion`
        };
      }

      try {
        const result = await deleteItems(selectedIds);
        if (result.success) {
          const newData = await fetchData({ page: 1 });
          setData(newData);
          const newStats = await getStats();
          setStats(newStats);
        }
        return result;
      } catch (error) {
        console.error(
          `Error deleting ${entityName.plural.toLowerCase()}:`,
          error
        );
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : `Failed to delete ${entityName.plural.toLowerCase()}`
        };
      }
    },
    [entityName.plural, fetchData, getStats, deleteItems]
  );

  const typedFilters = {
    ...filters,
    status: filters.status === 'ALL' ? undefined : filters.status
  };
  const handleStatusChange = (value: string) => {
    updateFilters({
      status: (value === '' ? 'ALL' : value) as FilterStatus
    });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {entityName.plural}
          </h2>
          <p className="text-muted-foreground">
            Create and manage {entityName.plural.toLowerCase()} for your
            customers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={createPath}>
            <Button className="bg-green-600 hover:bg-green-700">
              Create {entityName.singular}
            </Button>
          </Link>
        </div>
      </div>

      <StatsComponent stats={stats} />

      <div className="space-y-4">
        <FiltersComponent
          filters={typedFilters}
          search={search}
          isLoading={isLoading}
          onSearchChange={setSearch}
          onStatusChange={handleStatusChange}
          onDateRangeChange={(value) => updateFilters({ dateRange: value })}
        />

        <DataTable
          columns={columns}
          data={data.data}
          pageCount={data.metadata.pageCount}
          initialPage={Number(searchParams.page) || 1}
          onPageChange={(page) => updatePage(page)}
          onDeleteSelected={handleDeleteSelected}
          getDetails={getDetails}
          MobileCards={MobileCards}
          DetailSheet={DetailSheet}
        />
      </div>
    </div>
  );
}

// export default async function Page({ searchParams }: PageProps) {
//   return (
//     <EntityPage
//       initialData={await getEstimatesPage(1, 10)}
//       initialStats={await getEstimateStats()}
//       searchParams={searchParams}
//       entityType="estimate"
//       entityName={{ singular: "Estimate", plural: "Estimates" }}
//       columns={estimateColumns}
//       createPath="/estimate"
//       StatsComponent={EstimateStats}
//       FiltersComponent={EstimateFilters}
//       fetchData={getEstimatesPage}
//       getStats={getEstimateStats}
//       deleteItems={deleteEstimates}
//       statusEnum={EstimateStatus}
//     />
//   );
// }

// // creditMemos/page.tsx
// export default async function Page({ searchParams }: PageProps) {
//   return (
//     <EntityPage
//       initialData={await getCreditMemosPage(1, 10)}
//       initialStats={await getCreditMemoStats()}
//       searchParams={searchParams}
//       entityType="creditMemo"
//       entityName={{ singular: "Credit Memo", plural: "Credit Memos" }}
//       columns={creditMemoColumns}
//       createPath="/credit-memo"
//       StatsComponent={CreditMemoStats}
//       FiltersComponent={CreditMemoFilters}
//       fetchData={getCreditMemosPage}
//       getStats={getCreditMemoStats}
//       deleteItems={deleteCreditMemos}
//       statusEnum={CreditMemoStatus}
//     />
//   );
// }

// // invoices/page.tsx
// export default async function Page({ searchParams }: PageProps) {
//   return (
//     <EntityPage
//       initialData={await getInvoicesPage(1, 10)}
//       initialStats={await getInvoiceStats()}
//       searchParams={searchParams}
//       entityType="invoice"
//       entityName={{ singular: "Invoice", plural: "Invoices" }}
//       columns={invoiceColumns}
//       createPath="/invoice"
//       StatsComponent={InvoiceStats}
//       FiltersComponent={InvoiceFilters}
//       fetchData={getInvoicesPage}
//       getStats={getInvoiceStats}
//       deleteItems={deleteInvoices}
//       statusEnum={PaymentStatus}
//     />
//   );
// }
