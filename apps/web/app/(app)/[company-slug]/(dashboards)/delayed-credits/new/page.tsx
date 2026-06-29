import { getCurrentCompanyForInvoice } from '@/components/base/company/actions';
import { DelayedCreditForm } from '@/components/delayed-credits/main';

export default async function Page() {
  const company = await getCurrentCompanyForInvoice();
  return <DelayedCreditForm mode="create" company={company} />;
}
