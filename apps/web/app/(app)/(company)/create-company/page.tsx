import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { CreateCompanyForm } from '@/components/company/create/create-company-form';
import { auth } from '@/lib/auth';

interface PageProps {
  params: Promise<{ lng: string }>;
}
export default async function CreateCompanyPage({ params }: PageProps) {
  const pageParams = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${pageParams.lng}/login`);
  }
  await headers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Company</CardTitle>
        <CardDescription>Set up your company profile</CardDescription>
      </CardHeader>
      <CardContent>
        <CreateCompanyForm lng={pageParams.lng} />
      </CardContent>
    </Card>
  );
}
