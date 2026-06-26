import { getCurrentCompanyForInvoice } from '@/components/base/company/actions';
import { CreditMemoForm } from '@/components/credit-memo/main';

export default async function CreditMemoPage() {
  const company = await getCurrentCompanyForInvoice();
  return <CreditMemoForm mode="create" company={company} />;
}
