import { notFound } from 'next/navigation';
import { getCurrentCompany } from '@/components/base/company/actions';
import { getRefundReceipt } from '@/components/refund-receipt/actions';
import { RefundReceiptForm } from '@/components/refund-receipt/main';

interface EditRefundReceiptPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRefundReceiptPage({
  params
}: EditRefundReceiptPageProps) {
  const pageParams = await params;
  const [result, company] = await Promise.all([
    getRefundReceipt(pageParams.id),
    getCurrentCompany()
  ]);
  if (!result.success) {
    notFound();
  }

  return (
    <RefundReceiptForm
      mode="edit"
      initialData={result.data}
      company={company}
    />
  );
}
