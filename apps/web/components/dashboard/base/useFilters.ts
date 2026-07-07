import { useState, useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { getDateRange } from './utils';

export type StatusType =
  | 'ALL'
  // Estimate
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED'
  // Credit Memo
  | 'ISSUED'
  | 'APPLIED'
  | 'VOID'
  // Receipt
  | 'COMPLETED'
  | 'VOIDED'
  | 'REFUNDED'
  // Refund
  | 'PENDING'
  | 'PROCESSED'
  | 'REJECTED'
  | 'CANCELLED'
  // Charge
  | 'INVOICED'
  | 'CANCELED'
  // Credit
  | 'CREDITED'
  // Payment/Invoice
  | 'PAID'
  | 'OVERDUE'
  | 'PARTIAL'
  // Payment method (used as the Payments module's filter dimension)
  | 'CASH'
  | 'CREDIT_CARD'
  | 'BANK_TRANSFER'
  | 'CHECK'
  | 'DIGITAL_WALLET'
  | 'MOBILE_PAYMENT'
  | 'OTHER';

export interface FilterParams {
  status?: StatusType | 'ALL';
  dateRange: string;
  search: string;
  page: number;
}
export type FilterStatus = StatusType | 'ALL';
interface UseFiltersProps {
  onDataFetched: (data: any) => void;
  fetchData: (params: any) => Promise<any>;
  entityType:
    | 'estimate'
    | 'creditMemo'
    | 'receipt'
    | 'refund'
    | 'charge'
    | 'credit'
    | 'invoice'
    | 'payment';
}

export function useFilters({
  onDataFetched,
  fetchData,
  entityType
}: UseFiltersProps) {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialFilters = {
    status:
      searchParams.get('status') === 'null'
        ? 'ALL'
        : (searchParams.get('status') as StatusType | 'ALL') || 'ALL',
    dateRange: searchParams.get('dateRange') || 'all_time',
    search: searchParams.get('search') || '',
    page: Number(searchParams.get('page')) || 1
  };

  const [filters, setFilters] = useState<FilterParams>(initialFilters);
  const [searchText, setSearchText] = useState(initialFilters.search);
  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch
    }));
  }, [debouncedSearch]);

  const updateUrl = useCallback(
    (newFilters: FilterParams) => {
      const { from, to } = getDateRange(newFilters.dateRange);
      const params = new URLSearchParams();

      if (newFilters.status && newFilters.status !== 'ALL') {
        params.set('status', newFilters.status as string);
      } else {
        params.set('status', 'null');
      }
      if (newFilters.page > 1) params.set('page', String(newFilters.page));
      params.set('dateRange', newFilters.dateRange);
      if (from) params.set('dateFrom', (from as Date).toISOString().split('T')[0] || '');
      if (to) params.set('dateTo', (to as Date).toISOString().split('T')[0] || '');
      if (newFilters.search) params.set('search', newFilters.search);

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const dateRange = getDateRange(filters.dateRange);
        const data = await fetchData({
          status: filters.status === 'ALL' ? null : filters.status,
          search: filters.search,
          dateFrom: dateRange.from || null,
          dateTo: dateRange.to || null,
          page: filters.page,
          entityType
        });
        onDataFetched(data);
      } catch (error) {
        console.error(`Error fetching ${entityType}s:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    updateUrl(filters);
    fetchItems();
  }, [filters, fetchData, onDataFetched, updateUrl, entityType]);

  const updateFilters = useCallback((newFilters: Partial<FilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  return {
    filters,
    search: searchText,
    setSearch: setSearchText,
    isLoading,
    updateFilters,
    updatePage: (newPage: number) =>
      setFilters((prev) => ({ ...prev, page: newPage }))
  };
}
// Usage example:
/*
// For Estimates
const {
  filters: estimateFilters,
  search: estimateSearch,
  setSearch: setEstimateSearch,
  isLoading: isLoadingEstimates,
  updateFilters: updateEstimateFilters,
  updatePage: updateEstimatePage,
} = useFilters({
  onDataFetched: (data) => setEstimates(data),
  fetchData: fetchEstimates,
  entityType: 'estimate',
});

// For Credit Memos
const {
  filters: creditMemoFilters,
  search: creditMemoSearch,
  setSearch: setCreditMemoSearch,
  isLoading: isLoadingCreditMemos,
  updateFilters: updateCreditMemoFilters,
  updatePage: updateCreditMemoPage,
} = useFilters({
  onDataFetched: (data) => setCreditMemos(data),
  fetchData: fetchCreditMemos,
  entityType: 'creditMemo',
});
*/
