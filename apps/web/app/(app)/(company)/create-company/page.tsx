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

interface PageProps {
  params: Promise<{ lng: string }>;
}
export default async function CreateCompanyPage({ params }: PageProps) {
  const [pageParams, session] = await Promise.all([params, auth.api.getSession({headers: await headers()})]);

  if (!session) {
    redirect(`/${pageParams.lng}/login`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Company</CardTitle>
        <CardDescription>Set up your company profile</CardDescription>
      </CardHeader>
      <CardContent>
        <CreateCompanyForm  />
      </CardContent>
    </Card>
  );
}
