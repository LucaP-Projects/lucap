'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  deleteVendors,
  getVendorDetails,
  getVendorsPage,
  getVendorStats,
  VendorBasic,
  VendorWithRelations,
} from './actions';
import { createVendorColumns } from './columns';
import { VendorStats } from './VendorStats';
import { DataTable } from '@/components/dashboard/base/table';
import { BaseSheet } from '@/components/dashboard/base/baseSheet';

type VendorMetadata = { total: number; page: number; pageSize: number; pageCount: number };
interface VendorResponse { data: VendorBasic[]; metadata: VendorMetadata; }

interface VendorsPageProps {
  initialData: VendorResponse;
  initialStats: Awaited<ReturnType<typeof getVendorStats>>;
  searchParams: { [key: string]: string | string[] | undefined };
}

function VendorSheet({ data, isOpen, onOpenChange, isLoading }: any) {
  if (!data) return null;
  return (
    <BaseSheet isOpen={isOpen} onOpenChange={onOpenChange} isLoading={isLoading}
      title={data.displayName}
    >
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Company</p>
          <p className="font-medium">{data.companyName || '—'}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{data.primaryEmail || '—'}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Phone</p>
          <p className="font-medium">{data.primaryPhone || '—'}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-lg font-bold">${data.balance?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Tax ID</p>
          <p className="font-medium">{data.taxId || '—'}</p>
        </div>
      </div>
    </BaseSheet>
  );
}

const MobileCards = ({ table, onSelect, onOpenSheet }: any) => null;

export default function VendorsPage({ initialData, initialStats }: VendorsPageProps) {
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [data, setData] = useState(initialData);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const columns = createVendorColumns();

  const fetchData = useCallback(async (page: number, searchTerm?: string) => {
    const result = await getVendorsPage(page, 10, { search: searchTerm || undefined });
    setData(result);
    const newStats = await getVendorStats();
    setStats(newStats);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
    fetchData(1, value);
  }, [fetchData]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page, search);
  }, [fetchData, search]);

  const handleDeleteSelected = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) return { success: false, error: 'No vendors selected' };
    try {
      const result = await deleteVendors(selectedIds);
      if (result.success) await fetchData(currentPage, search);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete vendors' };
    }
  }, [fetchData, currentPage, search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-900">Vendors</h2>
          <p className="text-sm text-gray-600">Manage your suppliers and contractors</p>
        </div>
        <Button asChild>
          <Link href={`/${companySlug}/vendors/new`}>New Vendor</Link>
        </Button>
      </div>
      <VendorStats stats={stats} />
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <DataTable
        columns={columns}
        data={data.data}
        pageCount={data.metadata.pageCount}
        initialPage={currentPage}
        onPageChange={handlePageChange}
        onDeleteSelected={handleDeleteSelected}
        getDetails={getVendorDetails}
        MobileCards={MobileCards}
        DetailSheet={VendorSheet}
      />
    </div>
  );
}
