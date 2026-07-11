import { getVendorCreditsPage, getVendorCreditStats } from '@/components/dashboard/vendor-credits/actions';
import VendorCreditsPage from '@/components/dashboard/vendor-credits/main';
import { getDateRange } from '@/components/dashboard/base/utils';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    dateRange?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status === 'null' ? undefined : params.status;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const dateRange = params.dateRange as string | undefined;

  const { from: dateFrom, to: dateTo } = dateRange
    ? getDateRange(dateRange)
    : params.dateFrom && params.dateTo
      ? { from: new Date(params.dateFrom), to: new Date(params.dateTo) }
      : { from: undefined, to: undefined };

  const [initialData, initialStats] = await Promise.all([
    getVendorCreditsPage(page, 10, { status: status as any, search, dateFrom, dateTo }),
    getVendorCreditStats(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <VendorCreditsPage
        initialData={initialData}
        initialStats={initialStats}
        searchParams={params}
      />
    </div>
  );
}
