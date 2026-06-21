import { Metadata } from 'next';
import { EditCompanyForm } from '@/components/company/edit/edit-company-form';
import { auth } from '@/lib/auth';
interface PageProps {
  params: Promise<{ lng: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Company',
  description: 'Edit company information and settings'
};

export default async function EditCompanyPage({ params }: PageProps) {
  const [session, pageParams] = await Promise.all([
    auth.api.getSession({headers: await headers()}),
    params
  ]);

  if (!session?.user?.companyId) {
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
        lng={pageParams.lng}
        companyId={session.user.companyId}
      />
    </div>
  );
}
