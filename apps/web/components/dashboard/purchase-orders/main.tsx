'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  deletePurchaseOrders,
  getPurchaseOrderDetails,
  getPurchaseOrdersPage,
  getPurchaseOrderStats,
  PurchaseOrderBasic,
} from './actions';
import { createPurchaseOrderColumns } from './columns';
import { PurchaseOrderSheet } from './PurchaseOrderSheet';
import { PurchaseOrderStats } from './PurchaseOrderStats';
import { MobileCards } from './mobileCard';
import { DataTable } from '@/components/dashboard/base/table';

type PurchaseOrderMetadata = { total: number; page: number; pageSize: number; pageCount: number };
interface PurchaseOrderResponse { data: PurchaseOrderBasic[]; metadata: PurchaseOrderMetadata; }

interface PurchaseOrdersPageProps {
  initialData: PurchaseOrderResponse;
  initialStats: Awaited<ReturnType<typeof getPurchaseOrderStats>>;
  searchParams: { [key: string]: string | string[] | undefined };
}

const PO_STATUSES = ['ALL', 'OPEN', 'CLOSED', 'VOID'] as const;

export default function PurchaseOrdersPage({ initialData, initialStats, searchParams }: PurchaseOrdersPageProps) {
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [ordersData, setOrdersData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.page) || 1);
  const columns = createPurchaseOrderColumns();

  const fetchData = useCallback(async (page: number, status?: string, searchTerm?: string) => {
    const data = await getPurchaseOrdersPage(page, 10, {
      status: status && status !== 'ALL' ? status as any : undefined,
      search: searchTerm || undefined,
    });
    setOrdersData(data);
    const newStats = await getPurchaseOrderStats();
    setStats(newStats);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
    fetchData(1, statusFilter, value);
  }, [fetchData, statusFilter]);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    fetchData(1, value, search);
  }, [fetchData, search]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page, statusFilter, search);
  }, [fetchData, statusFilter, search]);

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) return { success: false, error: 'No purchase orders selected' };
    try {
      const result = await deletePurchaseOrders(selectedIds);
      if (result.success) {
        await fetchData(currentPage, statusFilter, search);
      }
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete purchase orders' };
    }
  }, [fetchData, currentPage, statusFilter, search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-900">Purchase Orders</h2>
          <p className="text-sm text-gray-600">Create and manage purchase orders</p>
        </div>
        <Button asChild>
          <Link href={`/${companySlug}/purchase-orders/new`}>New Purchase Order</Link>
        </Button>
      </div>
      <PurchaseOrderStats stats={stats} />
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by vendor..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {PO_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={ordersData.data}
        pageCount={ordersData.metadata.pageCount}
        initialPage={currentPage}
        onPageChange={handlePageChange}
        onDeleteSelected={handleDeleteSelected}
        getDetails={getPurchaseOrderDetails}
        MobileCards={MobileCards}
        DetailSheet={PurchaseOrderSheet}
      />
    </div>
  );
}