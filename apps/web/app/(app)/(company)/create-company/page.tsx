import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CreateCompanyForm } from '@/components/company/create/create-company-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { auth } from '@/lib/auth';

// This page exists for users with zero companies yet — it must not use
// getSessionWithCompany(), which would redirect them to /select-company
// (a dead end, since they have nothing to select either).
export default async function CreateCompanyPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/auth/login`);
  }

  return (
    <div className="container mx-auto max-w-2xl pt-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Company</CardTitle>
          <CardDescription>Set up your company profile</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <CreateCompanyForm />
        </CardContent>
      </Card>
    </div>
  );
}
