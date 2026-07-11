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
  deleteBills,
  getBillDetails,
  getBillsPage,
  getBillStats,
  BillBasic,
  BillWithRelations,
} from './actions';
import { createBillColumns } from './columns';
import { BillSheet } from './BillSheet';
import { BillStats } from './BillStats';
import { MobileCards } from './mobileCard';
import { DataTable } from '@/components/dashboard/base/table';

type BillMetadata = { total: number; page: number; pageSize: number; pageCount: number };
interface BillResponse { data: BillBasic[]; metadata: BillMetadata; }

interface BillsPageProps {
  initialData: BillResponse;
  initialStats: Awaited<ReturnType<typeof getBillStats>>;
  searchParams: { [key: string]: string | string[] | undefined };
}

const BILL_STATUSES = ['ALL', 'DRAFT', 'OPEN', 'OVERDUE', 'PAID', 'PARTIALLY_PAID', 'VOID'] as const;

export default function BillsPage({ initialData, initialStats, searchParams }: BillsPageProps) {
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [billsData, setBillsData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.page) || 1);
  const columns = createBillColumns();

  const fetchData = useCallback(async (page: number, status?: string, searchTerm?: string) => {
    const data = await getBillsPage(page, 10, {
      status: status && status !== 'ALL' ? status as any : undefined,
      search: searchTerm || undefined,
    });
    setBillsData(data);
    const newStats = await getBillStats();
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
    if (!selectedIds.length) return { success: false, error: 'No bills selected' };
    try {
      const result = await deleteBills(selectedIds);
      if (result.success) {
        await fetchData(currentPage, statusFilter, search);
      }
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete bills' };
    }
  }, [fetchData, currentPage, statusFilter, search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-900">Bills</h2>
          <p className="text-sm text-gray-600">Track and manage your accounts payable</p>
        </div>
        <Button asChild>
          <Link href={`/${companySlug}/bills/new`}>New Bill</Link>
        </Button>
      </div>
      <BillStats stats={stats} />
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search bills by vendor..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {BILL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={billsData.data}
        pageCount={billsData.metadata.pageCount}
        initialPage={currentPage}
        onPageChange={handlePageChange}
        onDeleteSelected={handleDeleteSelected}
        getDetails={getBillDetails}
        MobileCards={MobileCards}
        DetailSheet={BillSheet}
      />
    </div>
  );
}
