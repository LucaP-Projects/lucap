import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { getSessionWithCompany } from '@/lib/auth';
import { CompanyFormationWizard } from '@/components/company/wizard/wizard';


export default async function CreateCompanyPage() {
  const [session] = await Promise.all([getSessionWithCompany()]);

  if (!session) {
    redirect(`/auth/login`);
  }

  return (
    <div className="container mx-auto max-w-3xl pt-10 pb-20">
      <Card>
        <CardHeader>
          <CardTitle>Form your Tunisian company</CardTitle>
          <CardDescription>
            Set up your legally-optimized company structure in minutes. We will generate the chart of accounts and tax configuration automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <CompanyFormationWizard />
        </CardContent>
      </Card>
    </div>
  );
}
