<<<<<<< HEAD
import { redirect } from 'next/navigation';
import { CreateCompanyForm } from '@/components/company/create/create-company-form';
=======
>>>>>>> feat/concierge-service-platform
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
<<<<<<< HEAD
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
=======
import { CompanyFormationWizard } from '@/components/company/wizard/wizard';


export default async function CreateCompanyPage() {
  return (
    <div className="container mx-auto max-w-3xl pt-10 pb-20">
      <Card>
        <CardHeader>
          <CardTitle>Form your Tunisian company</CardTitle>
          <CardDescription>
            LucaPacioli handles the full company registration process. Submit your details and an accountant will guide you through each step.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <CompanyFormationWizard />
>>>>>>> feat/concierge-service-platform
        </CardContent>
      </Card>
    </div>
  );
}
