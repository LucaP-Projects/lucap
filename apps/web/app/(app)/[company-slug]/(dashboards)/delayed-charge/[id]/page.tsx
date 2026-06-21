import { notFound } from 'next/navigation';
import { getCurrentCompany } from '@/components/base/company/actions';
import { getDelayedCharge } from '@/components/delayed-charges/actions';
import { DelayedChargeForm } from '@/components/delayed-charges/main';
interface EditDelayedChargePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditDelayedChargePage({
  params
}: EditDelayedChargePageProps) {
  const pageParams = await params;

  const [result, company] = await Promise.all([
    getDelayedCharge(pageParams.id),
    getCurrentCompany()
  ]);
  if (!result.success) {
    notFound();
  }

  return (
    <DelayedChargeForm
      mode="edit"
      initialData={result.data}
      company={company}
    />
  );
}
