import { notFound } from 'next/navigation';
import { getCurrentCompany } from '@/components/base/company/actions';
import { getSalesReceipt } from '@/components/sales-receipt/actions';
import { SalesReceiptForm } from '@/components/sales-receipt/main';

interface EditSalesReceiptPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSalesReceiptPage({
  params
}: EditSalesReceiptPageProps) {
  const pageParams = await params;

  const [result, company] = await Promise.all([
    getSalesReceipt(pageParams.id),
    getCurrentCompany()
  ]);
  if (!result.success) {
    notFound();
  }

  return (
    <SalesReceiptForm mode="edit" initialData={result.data} company={company} />
  );
}
