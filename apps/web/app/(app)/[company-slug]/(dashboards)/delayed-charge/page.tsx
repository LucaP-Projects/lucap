import { getCurrentCompanyForInvoice } from '@/components/base/company/actions';
import { DelayedChargeForm } from '@/components/delayed-charges/main';
export default async function DelayedChargePage() {
  const company = await getCurrentCompanyForInvoice();
  return <DelayedChargeForm mode="create" company={company} />;
}
