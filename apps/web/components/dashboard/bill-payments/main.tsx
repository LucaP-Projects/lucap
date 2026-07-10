'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  deleteBillPayments,
  getBillPaymentDetails,
  getBillPaymentsPage,
  getBillPaymentStats,
  BillPaymentBasic,
  BillPaymentWithRelations,
} from './actions';
import { createBillPaymentColumns } from './columns';
import { BillPaymentStats } from './BillPaymentStats';
import { DataTable } from '@/components/dashboard/base/table';
import { BaseSheet } from '@/components/dashboard/base/baseSheet';

type BPMetadata = { total: number; page: number; pageSize: number; pageCount: number };
interface BPResponse { data: BillPaymentBasic[]; metadata: BPMetadata; }

interface BillPaymentsPageProps {
  initialData: BPResponse;
  initialStats: Awaited<ReturnType<typeof getBillPaymentStats>>;
}

function BillPaymentDetailSheet({ data, isOpen, onOpenChange, isLoading }: any) {
  if (!data) return null;
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  return (
    <BaseSheet isOpen={isOpen} onOpenChange={onOpenChange} isLoading={isLoading}
      title={`Payment to ${data.vendor?.displayName || 'Vendor'}`}
    >
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-2xl font-bold text-green-600">{fmt(data.amount)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Payment Date</p>
          <p className="font-medium">{new Date(data.paymentDate).toLocaleDateString()}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Method</p>
          <p className="font-medium">{data.paymentMethod?.replace(/_/g, ' ')}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Reference</p>
          <p className="font-medium">{data.reference || '—'}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Bills Paid</p>
          <div className="space-y-2 mt-2">
            {data.allocations?.map((a: any) => (
              <div key={a.id} className="flex justify-between text-sm">
                <span>Bill #{a.bill?.number || 'N/A'}</span>
                <span className="font-medium">{fmt(a.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        {data.notes && (
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Notes</p>
            <p className="mt-1">{data.notes}</p>
          </div>
        )}
      </div>
    </BaseSheet>
  );
}

const MobileCards = ({ table, onSelect, onOpenSheet }: any) => null;

export default function BillPaymentsPage({ initialData, initialStats }: BillPaymentsPageProps) {
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [data, setData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);
  const [currentPage, setCurrentPage] = useState(1);
  const columns = createBillPaymentColumns();

  const fetchData = useCallback(async (page: number) => {
    const result = await getBillPaymentsPage(page, 10);
    setData(result);
    const newStats = await getBillPaymentStats();
    setStats(newStats);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page);
  }, [fetchData]);

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) return { success: false, error: 'No payments selected' };
    try {
      const result = await deleteBillPayments(selectedIds);
      if (result.success) await fetchData(currentPage);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete payments' };
    }
  }, [fetchData, currentPage]);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-900">Bill Payments</h2>
          <p className="text-sm text-gray-600">Record payments made to vendors</p>
        </div>
        <Button asChild>
          <Link href={`/${companySlug}/bill-payments/new`}>New Payment</Link>
        </Button>
      </div>
      <BillPaymentStats stats={stats} />
      <DataTable
        columns={columns}
        data={data.data}
        pageCount={data.metadata.pageCount}
        initialPage={currentPage}
        onPageChange={handlePageChange}
        onDeleteSelected={handleDeleteSelected}
        getDetails={getBillPaymentDetails}
        MobileCards={MobileCards}
        DetailSheet={BillPaymentDetailSheet}
      />
    </div>
  );
}
