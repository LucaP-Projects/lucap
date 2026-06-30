import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { getCustomerInvoicesForAccountant, AccountantInvoice } from '../actions';

interface PageProps {
  params: Promise<{ 'company-slug': string; customerId: string }>;
}

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-green-500/10 text-green-700',
  PENDING: 'bg-yellow-500/10 text-yellow-700',
  OVERDUE: 'bg-red-500/10 text-red-700',
  PARTIAL: 'bg-blue-500/10 text-blue-700',
  CANCELLED: 'bg-gray-500/10 text-gray-500',
};

export default async function CustomerInvoicesPage({ params }: PageProps) {
  const { 'company-slug': companySlug, customerId } = await params;
  const { customer, invoices } = await getCustomerInvoicesForAccountant(customerId);

  if (!customer) notFound();

  const pendingInvoices = invoices.filter(
    (inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED'
  );
  const resolvedInvoices = invoices.filter(
    (inv) => inv.status === 'PAID' || inv.status === 'CANCELLED'
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <Link
          href={`/${companySlug}/accountant-review/invoices`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>

        <div className="mt-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-blue-900">
              {customer.displayName}
            </h2>
            {customer.primaryEmail && (
              <p className="text-sm text-gray-500">{customer.primaryEmail}</p>
            )}
            {customer.companyName && (
              <p className="text-sm text-gray-400">{customer.companyName}</p>
            )}
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{invoices.length}</p>
              <p className="text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingInvoices.length}</p>
              <p className="text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{resolvedInvoices.length}</p>
              <p className="text-gray-500">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {pendingInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-yellow-700">
              Pending Invoices
              <span className="ml-2 text-sm font-normal text-yellow-600">
                ({pendingInvoices.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvoicesTable invoices={pendingInvoices} companySlug={companySlug} />
          </CardContent>
        </Card>
      )}

      {resolvedInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-600">
              Resolved Invoices
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({resolvedInvoices.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvoicesTable invoices={resolvedInvoices} companySlug={companySlug} />
          </CardContent>
        </Card>
      )}

      {invoices.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No invoices found for this customer.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InvoicesTable({
  invoices,
  companySlug,
}: {
  invoices: AccountantInvoice[];
  companySlug: string;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
            return (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Link
                    href={`/${companySlug}/invoices/${invoice.id}/edit`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {invoice.number}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={STATUS_STYLES[invoice.status] ?? STATUS_STYLES.CANCELLED}
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${invoice.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  ${paidAmount.toFixed(2)}
                </TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground">
                  {invoice.notes || '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
