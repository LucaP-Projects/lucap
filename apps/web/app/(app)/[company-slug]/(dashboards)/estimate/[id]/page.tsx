// app/estimates/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { getCurrentCompany } from '@/components/base/company/actions';
import { getEstimate } from '@/components/estimate/actions';
import { EstimateForm } from '@/components/estimate/main';
interface EditEstimatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEstimatePage({
  params
}: EditEstimatePageProps) {
  const pageParams = await params;
  const [result, company] = await Promise.all([
    getEstimate(pageParams.id),
    getCurrentCompany()
  ]);

  if (!result.success) {
    notFound();
  }

  return (
    <EstimateForm mode="edit" initialData={result.data} company={company} />
  );
}
