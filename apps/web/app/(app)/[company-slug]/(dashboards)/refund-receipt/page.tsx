import { getDateRange } from '@/components/dashboard/base/utils';
import {
  getRefundReceiptsPage,
  getRefundReceiptStats
} from '@/components/dashboard/refund-receipts/actions';
import RefundPage from '@/components/dashboard/refund-receipts/main';
import { RefundStatus } from '@/lib/generated/prisma/enums';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status =
    params.status === 'null'
      ? undefined
      : (params.status as RefundStatus | undefined);
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

  const initialData = await getRefundReceiptsPage(page, 10, {
    status,
    search,
    dateFrom,
    dateTo
  });

  return (
    <RefundPage
      initialData={initialData}
      initialStats={await getRefundReceiptStats()}
      searchParams={params}
    />
  );
}
