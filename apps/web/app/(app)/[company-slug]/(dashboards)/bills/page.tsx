import { getDateRange } from '@/components/dashboard/base/utils';
import { getBillsPage, getBillStats } from '@/components/dashboard/bills/actions';
import BillsPage from '@/components/dashboard/bills/main';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status === 'null' ? undefined : (params.status as string | undefined);
  const search = typeof params.search === 'string' ? params.search : undefined;
  const dateRange = params.dateRange as string | undefined;

  const { from: dateFrom, to: dateTo } = dateRange
    ? getDateRange(dateRange)
    : params.dateFrom && params.dateTo
      ? { from: new Date(params.dateFrom as string), to: new Date(params.dateTo as string) }
      : { from: undefined, to: undefined };

  return (
    <BillsPage
      initialData={await getBillsPage(page, 10, { status: status as any, search, dateFrom, dateTo })}
      initialStats={await getBillStats()}
      searchParams={params}
    />
  );
}
