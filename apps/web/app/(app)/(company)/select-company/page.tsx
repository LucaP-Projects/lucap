import { Card, CardContent } from '@/components/ui/card';
import { getUserCompanies } from '@/components/company/select/actions';
import { auth } from '@/lib/auth';
import { SelectCompanyForm } from './form';

interface PageProps {
  params: Promise<{ lng: string }>;
}

export default async function SelectCompanyPage({ params }: PageProps) {
  const pageParams = await params;
  const session = await auth();

  const companies = await getUserCompanies();

  return (
    <div className="container mx-auto max-w-2xl pt-10">
      <Card>
        <CardContent className="pt-6">
          {companies.length === 0 ? (
            <>
              <h2 className="mb-1 text-2xl font-semibold tracking-tight">
                Welcome!
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Get started by creating your first company
              </p>
            </>
          ) : (
            <>
              <h2 className="mb-1 text-2xl font-semibold tracking-tight">
                Select Company
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Choose a company to work with
              </p>
            </>
          )}

          <SelectCompanyForm
            key={`${companies.length}-${session?.user?.id}`}
            companies={companies}
            lng={pageParams.lng}
          />
        </CardContent>
      </Card>
    </div>
  );
}
