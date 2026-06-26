import { notFound } from 'next/navigation';
import { getCurrentCompanyForInvoice } from '@/components/base/company/actions';
import { getInvoice } from '@/components/invoice/actions';
import { InvoiceForm } from '@/components/invoice/main';

interface EditEstimatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEstimatePage({
  params
}: EditEstimatePageProps) {
  const pageParams = await params;
  const [invoiceResult, company] = await Promise.all([
    getInvoice(pageParams.id),
    getCurrentCompanyForInvoice()
  ]);

  if (!invoiceResult.success) {
    notFound();
  }
  return (
    <InvoiceForm
      mode="edit"
      initialData={invoiceResult.data}
      company={company}
    />
  );
}
