import { getCurrentCompany } from '@/components/base/company/actions';
import { DelayedChargeForm } from '@/components/delayed-charges/main';
export default async function DelayedChargePage() {
  const company = await getCurrentCompany();
  return <DelayedChargeForm mode="create" company={company} />;
}
