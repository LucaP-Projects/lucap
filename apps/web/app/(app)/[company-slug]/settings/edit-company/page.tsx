import { Metadata } from 'next';
import { EditCompanyForm } from '@/components/company/edit/edit-company-form';
import { getSessionWithCompany } from '@/lib/auth';

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
          <p className="text-muted-foreground">
            You need to be logged in with a company account to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Company</h1>
        <p className="text-muted-foreground">
          Update your company information and settings
        </p>
      </div>

      <EditCompanyForm
        companyId={session.user.activeCompanyId}
      />
    </div>
  );
}
