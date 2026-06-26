
import { notFound } from 'next/navigation';
import { getCurrentCompanyForInvoice } from '@/components/base/company/actions';
import { getCreditMemo } from '@/components/credit-memo/actions';
import { CreditMemoForm } from '@/components/credit-memo/main';

interface EditCreditMemoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCreditMemoPage({
  params
}: EditCreditMemoPageProps) {
  const pageParams = await params;

  const [result, company] = await Promise.all([
    getCreditMemo(pageParams.id),
    getCurrentCompanyForInvoice()
  ]);
  if (!result.success) {
    notFound();
  }

  return (
    <CreditMemoForm mode="edit" initialData={result.data} company={company} />
  );
}
