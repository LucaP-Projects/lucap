import { getDateRange } from '@/components/dashboard/base/utils';
import {
  getDelayedCreditsPage,
  getDelayedCreditStats
} from '@/components/dashboard/delayed-credits/actions';
import DelayedCreditsPage from '@/components/dashboard/delayed-credits/main';
import { CreditStatus } from '@/lib/generated/prisma/enums';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status =
    params.status === 'null'
      ? undefined
      : (params.status as CreditStatus | undefined);
  const search = typeof params.search === 'string' ? params.search : undefined;
  const dateRange = params.dateRange as string | undefined;

  const { from: dateFrom, to: dateTo } = dateRange
    ? getDateRange(dateRange)
    : params.dateFrom && params.dateTo
      ? {
          from: new Date(params.dateFrom as string),
          to: new Date(params.dateTo as string)
        }
      : { from: undefined, to: undefined };

  const rawData = await getDelayedCreditsPage(page, 10, {
    status,
    search,
    dateFrom,
    dateTo
  });

  const initialData = {
    data: rawData.data,
    metadata: {
      total: rawData.metadata.total,
      page: rawData.metadata.currentPage,
      pageSize: 10,
      pageCount: rawData.metadata.pageCount
    }
  };

  return (
    <DelayedCreditsPage
      initialData={initialData}
      initialStats={await getDelayedCreditStats()}
      searchParams={params}
    />
  );
}
