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
import { CustomerDocumentSummary } from './types';

interface Props {
  title: string;
  description: string;
  companySlug: string;
  routeSegment: string;
  customers: CustomerDocumentSummary[];
}

export function CustomerSummaryList({
  title,
  description,
  companySlug,
  routeSegment,
  customers,
}: Props) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <Link
          href={`/${companySlug}/accountant-review`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to document types
        </Link>

        <div className="mt-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-blue-900">{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <div className="text-sm text-gray-500">
            {customers.length} customer{customers.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No customers with documents found.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link
                          href={`/${companySlug}/accountant-review/${routeSegment}/${customer.id}`}
                          className="font-medium text-blue-700 hover:underline"
                        >
                          {customer.displayName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.primaryEmail || '-'}
                      </TableCell>
                      <TableCell className="text-center">{customer.documentCount}</TableCell>
                      <TableCell className="text-center">
                        {customer.pendingCount > 0 ? (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700">
                            {customer.pendingCount}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/10 text-green-700">
                            0
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${customer.totalAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
