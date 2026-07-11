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
  deletePurchases,
  getPurchaseDetails,
  getPurchasesPage,
  getPurchaseStats,
  PurchaseBasic,
} from './actions';
import { createPurchaseColumns } from './columns';
import { PurchaseSheet } from './PurchaseSheet';
import { PurchaseStats } from './PurchaseStats';
import { MobileCards } from './mobileCard';
import { DataTable } from '@/components/dashboard/base/table';

type PurchaseMetadata = { total: number; page: number; pageSize: number; pageCount: number };
interface PurchaseResponse { data: PurchaseBasic[]; metadata: PurchaseMetadata; }

interface PurchasesPageProps {
  initialData: PurchaseResponse;
  initialStats: Awaited<ReturnType<typeof getPurchaseStats>>;
  searchParams: { [key: string]: string | string[] | undefined };
}

const PURCHASE_STATUSES = ['ALL', 'OPEN', 'CLOSED', 'VOID'] as const;

export default function PurchasesPage({ initialData, initialStats, searchParams }: PurchasesPageProps) {
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [purchasesData, setPurchasesData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.page) || 1);
  const columns = createPurchaseColumns();

  const fetchData = useCallback(async (page: number, status?: string, searchTerm?: string) => {
    const data = await getPurchasesPage(page, 10, {
      status: status && status !== 'ALL' ? status as any : undefined,
      search: searchTerm || undefined,
    });
    setPurchasesData(data);
    const newStats = await getPurchaseStats();
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
    if (!selectedIds.length) return { success: false, error: 'No purchases selected' };
    try {
      const result = await deletePurchases(selectedIds);
      if (result.success) {
        await fetchData(currentPage, statusFilter, search);
      }
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete purchases' };
    }
  }, [fetchData, currentPage, statusFilter, search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-900">Purchases</h2>
          <p className="text-sm text-gray-600">Track and manage your expense purchases</p>
        </div>
        <Button asChild>
          <Link href={`/${companySlug}/purchases/new`}>New Purchase</Link>
        </Button>
      </div>
      <PurchaseStats stats={stats} />
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search purchases by vendor..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {PURCHASE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={purchasesData.data}
        pageCount={purchasesData.metadata.pageCount}
        initialPage={currentPage}
        onPageChange={handlePageChange}
        onDeleteSelected={handleDeleteSelected}
        getDetails={getPurchaseDetails}
        MobileCards={MobileCards}
        DetailSheet={PurchaseSheet}
      />
    </div>
  );
}