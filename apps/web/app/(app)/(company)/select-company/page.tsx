import { getUserCompanies } from '@/components/company/select/actions';
import { Card, CardContent } from '@/components/ui/card';
import { getSessionWithCompany } from '@/lib/auth';
import { SelectCompanyForm } from './form';

export default async function SelectCompanyPage() {
  const [session, companies] = await Promise.all([
    getSessionWithCompany(),
    getUserCompanies()
  ]);

  return (
    <div className="container mx-auto max-w-2xl pt-10">
      <Card>
        <CardContent className="pt-6">
          <SelectCompanyForm
            key={`${companies.length}-${session?.user?.id}`}
            companies={companies}
          />
        </CardContent>
      </Card>
    </div>
  );
}
