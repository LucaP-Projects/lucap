import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  FileMinus,
  FilePlus,
  FileText,
  Receipt,
  ReceiptText,
  Undo2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getPendingDocumentCounts, PendingDocumentCounts } from '@/lib/accountant-review-counts';
import { getSessionWithCompany } from '@/lib/auth';

const DOCUMENT_TYPES: {
  key: keyof Omit<PendingDocumentCounts, 'total'>;
  label: string;
  segment: string;
  icon: typeof FileText;
}[] = [
  { key: 'invoices', label: 'Invoices', segment: 'invoices', icon: FileText },
  { key: 'payments', label: 'Payments', segment: 'payments', icon: CreditCard },
  { key: 'estimates', label: 'Estimates', segment: 'estimates', icon: FilePlus },
  { key: 'creditMemos', label: 'Credit Memos', segment: 'credit-memos', icon: FileMinus },
  { key: 'salesReceipts', label: 'Sales Receipts', segment: 'sales-receipts', icon: Receipt },
  { key: 'delayedCharges', label: 'Delayed Charges', segment: 'delayed-charges', icon: ReceiptText },
  { key: 'delayedCredits', label: 'Delayed Credits', segment: 'delayed-credits', icon: ReceiptText },
  { key: 'refundReceipts', label: 'Refund Receipts', segment: 'refund-receipts', icon: Undo2 }
];

export default async function AccountantReviewIndexPage() {
  const session = await getSessionWithCompany();

  if (!session.activeCompany) {
    redirect('/select-company');
  }

  const counts = await getPendingDocumentCounts(session.activeCompany.companyId);
  const slug = session.activeCompany.slug;

  const types = DOCUMENT_TYPES.map((t) => ({ ...t, pending: counts[t.key] })).sort(
    (a, b) => b.pending - a.pending
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
      <div>
        <Link
          href="/accountant-dashboard/documents"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to client companies
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{session.activeCompany.name}</h1>
        <p className="mt-1 text-muted-foreground">
          Choose a document type to review pending items.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {types.map(({ key, label, segment, icon: Icon, pending }) => (
          <Link key={key} href={`/${slug}/accountant-review/${segment}`}>
            <Card className="transition-colors hover:border-primary/50 hover:shadow-md">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                    {pending > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
                    )}
                  </div>
                  <h3 className="font-semibold">{label}</h3>
                </div>
                <div className="flex items-center gap-3">
                  {pending > 0 && <Badge variant="destructive">{pending} new</Badge>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
