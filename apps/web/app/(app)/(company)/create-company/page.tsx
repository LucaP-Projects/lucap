import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
        </CardContent>
      </Card>
    </div>
  );
}
