import { getBillPaymentsPage, getBillPaymentStats } from '@/components/dashboard/bill-payments/actions';
import BillPaymentsPage from '@/components/dashboard/bill-payments/main';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  return (
    <BillPaymentsPage
      initialData={await getBillPaymentsPage(page, 10)}
      initialStats={await getBillPaymentStats()}
    />
  );
}
