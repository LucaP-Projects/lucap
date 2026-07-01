import Link from 'next/link';
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
import { AccountantDocument, CustomerForAccountant } from './types';

const QUALIFICATION_STYLES: Record<string, string> = {
  VALIDATED: 'bg-green-500/10 text-green-700',
  REJECTED: 'bg-red-500/10 text-red-700',
};

interface Props {
  customer: CustomerForAccountant;
  documents: AccountantDocument[];
  companySlug: string;
  routeSegment: string;
  backHref: string;
  documentNumberLabel: string;
}

export function CustomerDocumentsList({
  customer,
  documents,
  companySlug,
  routeSegment,
  backHref,
  documentNumberLabel,
}: Props) {
  const pendingDocuments = documents.filter((d) => !d.qualificationStatus);
  const resolvedDocuments = documents.filter((d) => !!d.qualificationStatus);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <Link
          href={backHref}
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
              <p className="text-2xl font-bold text-gray-800">{documents.length}</p>
              <p className="text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingDocuments.length}</p>
              <p className="text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{resolvedDocuments.length}</p>
              <p className="text-gray-500">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {pendingDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-yellow-700">
              Pending
              <span className="ml-2 text-sm font-normal text-yellow-600">
                ({pendingDocuments.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentsTable
              documents={pendingDocuments}
              companySlug={companySlug}
              routeSegment={routeSegment}
              customerId={customer.id}
              documentNumberLabel={documentNumberLabel}
            />
          </CardContent>
        </Card>
      )}

      {resolvedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-600">
              Resolved
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({resolvedDocuments.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentsTable
              documents={resolvedDocuments}
              companySlug={companySlug}
              routeSegment={routeSegment}
              customerId={customer.id}
              documentNumberLabel={documentNumberLabel}
            />
          </CardContent>
        </Card>
      )}

      {documents.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No documents found for this customer.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DocumentsTable({
  documents,
  companySlug,
  routeSegment,
  customerId,
  documentNumberLabel,
}: {
  documents: AccountantDocument[];
  companySlug: string;
  routeSegment: string;
  customerId: string;
  documentNumberLabel: string;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{documentNumberLabel}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <Link
                  href={`/${companySlug}/accountant-review/${routeSegment}/${customerId}/${doc.id}`}
                  className="font-medium text-blue-700 hover:underline"
                >
                  {doc.number}
                </Link>
              </TableCell>
              <TableCell>
                {doc.qualificationStatus ? (
                  <Badge
                    variant="outline"
                    className={QUALIFICATION_STYLES[doc.qualificationStatus]}
                  >
                    {doc.qualificationStatus}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-500/10 text-gray-500">
                    Not reviewed
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                ${doc.amount.toFixed(2)}
              </TableCell>
              <TableCell>{formatDate(doc.dueDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
