import { Metadata } from 'next';
import { EditCompanyForm } from '@/components/company/edit/edit-company-form';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCountry, countrySupportLevel } from '@/lib/countries/data';
import { getCountryIndependentFeatures } from '@/lib/countries/features';

export const metadata: Metadata = {
  title: 'Edit Company',
  description: 'Edit company information and settings'
};

export default async function EditCompanyPage() {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground">You need to be logged in with a company account to access this page.</p>
        </div>
      </div>
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: session.user.activeCompanyId },
    select: { countryCode: true, name: true, baseCurrency: true },
  });

  const code = company?.countryCode || 'TN';
  const level = countrySupportLevel(code);
  const country = getCountry(code);
  const isFullSupport = level === 'full';

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Company</h1>
        <p className="text-muted-foreground">Update your company information and settings</p>
      </div>

      {isFullSupport ? (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="font-semibold text-green-800">Full Support — {country?.nameEn || code}</h3>
          <p className="mt-1 text-sm text-green-700">
            All accounting, tax, and regulatory features are available for {country?.nameEn || 'your country'}.
          </p>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-800">Limited Support — {country?.nameEn || code}</h3>
          <p className="mt-1 text-sm text-amber-700">
            Full accounting and tax configuration for {country?.nameEn || 'your country'} is coming soon.
          </p>
          <p className="mt-2 text-sm font-medium text-amber-800">Available features:</p>
          <ul className="mt-1 list-disc list-inside text-sm text-amber-700">
            {getCountryIndependentFeatures().map(f => <li key={f}>{f}</li>)}
          </ul>
        </div>
      )}

      <EditCompanyForm companyId={session.user.activeCompanyId} />
    </div>
  );
}
