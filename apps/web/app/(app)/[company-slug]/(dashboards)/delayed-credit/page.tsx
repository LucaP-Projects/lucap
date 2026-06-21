import { getCurrentCompany } from '@/components/base/company/actions';
import { DelayedCreditForm } from '@/components/delayed-credits/main';

export default async function Page() {
  const company = await getCurrentCompany();
  return <DelayedCreditForm mode="create" company={company} />;
}
