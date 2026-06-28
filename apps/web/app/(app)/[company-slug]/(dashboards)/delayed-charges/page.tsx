import { getDateRange } from '@/components/dashboard/base/utils';

import {
  getDelayedChargesPage,
  getDelayedChargeStats
} from '@/components/dashboard/delayed-charges/actions';
import DelayedChargesPage from '@/components/dashboard/delayed-charges/main';
import { ChargeStatus } from '@/lib/generated/prisma/enums';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status =
    params.status === 'null'
      ? undefined
      : (params.status as ChargeStatus | undefined);
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

  return (
    <DelayedChargesPage
      initialData={await getDelayedChargesPage(page, 10, {
        status,
        search,
        dateFrom,
        dateTo
      })}
      initialStats={await getDelayedChargeStats()}
      searchParams={params}
    />
  );
}
