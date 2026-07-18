import { headers } from 'next/headers';
import { getUserCompanies } from '@/components/company/select/actions';
import { Card, CardContent } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { SelectCompanyForm } from './form';

export const dynamic = 'force-dynamic';

export default async function SelectCompanyPage() {
  // This page exists specifically for users without an active company yet,
  // so it must not use getSessionWithCompany() — that redirects back here
  // whenever activeCompanyId is unset, i.e. it would redirect to itself.
  const [session, companies] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
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
