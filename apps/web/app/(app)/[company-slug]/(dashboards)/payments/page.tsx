import { getDateRange } from '@/components/dashboard/base/utils';
import { PaymentMethod } from '@/lib/generated/prisma/enums';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  // const page = Number(params.page) || 1;
  // const method =
  //   params.method === 'null'
  //     ? undefined
  //     : (params.method as PaymentMethod | undefined);
  // const search = typeof params.search === 'string' ? params.search : undefined;
  // const dateRange = params.dateRange as string | undefined;

  // const { from: dateFrom, to: dateTo } = dateRange
  //   ? getDateRange(dateRange)
  //   : params.dateFrom && params.dateTo
  //     ? {
  //         from: new Date(params.dateFrom as string),
  //         to: new Date(params.dateTo as string)
  //       }
  //     : { from: undefined, to: undefined };

  return null;
  // return (
  //   <PaymentsPage
  //     initialData={await getPaymentsPage(page, 10, {
  //       method,
  //       search,
  //       dateFrom,
  //       dateTo,
  //     })}
  //     initialStats={await getPaymentStats()}
  //     searchParams={params}
  //   />
  // );
}
