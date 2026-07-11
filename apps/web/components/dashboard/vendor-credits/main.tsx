'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dashboard/base/table';
import { getVendorCreditsPage, getVendorCreditDetails, deleteVendorCredits, VendorCreditBasic, VendorCreditWithRelations } from './actions';
import { createVendorCreditColumns } from './columns';
import { VendorCreditStats } from './VendorCreditStats';
import { VendorCreditSheet } from './VendorCreditSheet';
import { VendorCreditMobileCards } from './mobileCard';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchParams {
  page?: string;
  status?: string;
  search?: string;
}

export default function VendorCreditsPage({ initialData, searchParams }: any) {
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [data, setData] = React.useState(initialData);
  const [search, setSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(Number(searchParams?.page) || 1);
  const [selectedCredit, setSelectedCredit] = React.useState<VendorCreditBasic | null>(null);
  const [detailData, setDetailData] = React.useState<VendorCreditWithRelations | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const columns = React.useMemo(() => createVendorCreditColumns(), []);

  const fetchData = React.useCallback(async (page: number, searchTerm?: string) => {
    try {
      const result = await getVendorCreditsPage(page, 10, { search: searchTerm });
      setData(result);
    } catch (error) {
      console.error('Error fetching vendor credits:', error);
    }
  }, []);

  const handleSearch = React.useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
    fetchData(1, value);
  }, [fetchData]);

  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page, debouncedSearch);
  }, [fetchData, debouncedSearch]);

  const handleDeleteSelected = React.useCallback(async (ids: string[]) => {
    const result = await deleteVendorCredits(ids);
    if (result.success) fetchData(currentPage, debouncedSearch);
    return result;
  }, [fetchData, currentPage, debouncedSearch]);

  const handleOpenSheet = React.useCallback(async (credit: VendorCreditBasic) => {
    setSelectedCredit(credit);
    setSheetOpen(true);
    setDetailLoading(true);
    try {
      const details = await getVendorCreditDetails(credit.id);
      setDetailData(details);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Vendor Credits</h1>
        <Link href={`/${companySlug}/vendor-credits/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Vendor Credit
          </Button>
        </Link>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search by vendor name..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.metadata?.pageCount || 0}
        initialPage={currentPage}
        onPageChange={handlePageChange}
        onDeleteSelected={handleDeleteSelected}
        getDetails={getVendorCreditDetails}
        MobileCards={VendorCreditMobileCards}
        DetailSheet={VendorCreditSheet as any}
      />
    </div>
  );
}