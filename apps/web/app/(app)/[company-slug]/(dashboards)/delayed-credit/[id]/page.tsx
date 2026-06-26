import { notFound } from 'next/navigation';
import { getCurrentCompanyForInvoice } from '@/components/base/company/actions';
import { getDelayedCredit } from '@/components/delayed-credits/actions';
import { DelayedCreditForm } from '@/components/delayed-credits/main';
interface EditDelayedCreditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditDelayedCreditPage({
  params
}: EditDelayedCreditPageProps) {
  const pageParams = await params;

  const [result, company] = await Promise.all([
    getDelayedCredit(pageParams.id),
    getCurrentCompanyForInvoice()
  ]);
  if (!result.success) {
    notFound();
  }

  return (
    <DelayedCreditForm
      mode="edit"
      initialData={result.data}
      company={company}
    />
  );
}
