import { getCurrentCompany } from '@/components/base/company/actions';
import { EstimateForm } from '@/components/estimate/main';

export default async function EstimatePage() {
  const company = await getCurrentCompany();
  return <EstimateForm mode="create" company={company} />;
}
