import { redirect } from 'next/navigation';
import { CreateCompanyForm } from '@/components/company/create/create-company-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { getSessionWithCompany } from '@/lib/auth';


export default async function CreateCompanyPage() {
  const [session] = await Promise.all([getSessionWithCompany()]);

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
