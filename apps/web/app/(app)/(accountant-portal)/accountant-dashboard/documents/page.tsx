import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Building2, ChevronRight } from 'lucide-react';
import { getAccountantsForCurrentUser } from '@/components/accountant/actions';
import { selectCompany } from '@/components/company/select/actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getPendingDocumentCounts } from '@/lib/accountant-review-counts';

export default async function AccountantClientDocumentsPage() {
  const accountants = await getAccountantsForCurrentUser();

  const companiesById = new Map<string, { id: string; name: string; slug: string }>();
  for (const accountant of accountants as any[]) {
    for (const assignment of accountant.assignments ?? []) {
      companiesById.set(assignment.company.id, assignment.company);
    }
  }
  const companies = Array.from(companiesById.values());

  const companiesWithCounts = await Promise.all(
    companies.map(async (company) => ({
      company,
      pending: (await getPendingDocumentCounts(company.id)).total
    }))
  );

  companiesWithCounts.sort((a, b) => b.pending - a.pending || a.company.name.localeCompare(b.company.name));

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
      <div>
        <Link
          href="/accountant-dashboard"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Client Documents</h1>
        <p className="mt-1 text-muted-foreground">
          Pick a client company to review its invoices, payments, and other documents.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {companiesWithCounts.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No client companies assigned yet.
            </CardContent>
          </Card>
        )}

        {companiesWithCounts.map(({ company, pending }) => (
          <form
            key={company.id}
            action={async () => {
              'use server';
              await selectCompany(company.id);
              redirect(`/${company.slug}/accountant-review`);
            }}
          >
            <button type="submit" className="block w-full text-left">
              <Card className="transition-colors hover:border-primary/50 hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                      {pending > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
                      )}
                    </div>
                    <h3 className="font-semibold">{company.name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {pending > 0 && (
                      <Badge variant="destructive">{pending} new</Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
