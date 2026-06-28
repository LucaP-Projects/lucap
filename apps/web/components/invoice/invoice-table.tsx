'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface InvoiceListItem {
  id: string;
  number: string;
  amount: number;
  status: string;
  dueDate: Date;
  createdAt: Date;
  customer: { displayName: string | null; primaryEmail: string | null };
}

interface InvoiceTableProps {
  invoices: InvoiceListItem[];
  offset: number;
  total: number;
}

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  OVERDUE: 'bg-red-100 text-red-800',
  PARTIAL: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-800'
};

export function InvoiceTable({ invoices, offset, total }: InvoiceTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ 'company-slug': string }>();
  const companySlug = params['company-slug'];
  const [pageSize] = useState(50);

  const currentSearch = searchParams.get('search') ?? '';

  const handleSearch = (value: string) => {
    const p = new URLSearchParams(searchParams);
    p.set('search', value || '');
    p.set('offset', '0');
    router.push(`/${companySlug}/invoice?${p.toString()}`);
  };

  const handlePageChange = (newOffset: number) => {
    const p = new URLSearchParams(searchParams);
    p.set('offset', newOffset.toString());
    router.push(`/${companySlug}/invoice?${p.toString()}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Manage and track your invoices</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/${companySlug}/invoice/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
            <Input
              placeholder="Search invoices..."
              value={currentSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="uppercase text-black">
                <TableHead className="text-xs">Invoice #</TableHead>
                <TableHead className="text-xs">Customer</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Due Date</TableHead>
                <TableHead className="text-xs">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/${companySlug}/invoice/${invoice.id}`)}
                  >
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>
                      {invoice.customer.displayName ?? invoice.customer.primaryEmail ?? '—'}
                    </TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[invoice.status] ?? 'bg-gray-100 text-gray-800'}`}
                      >
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Showing {total === 0 ? 0 : offset + 1}–{Math.min(offset + pageSize, total)} of {total} invoices
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(offset - pageSize)}
            disabled={offset === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(offset + pageSize)}
            disabled={offset + pageSize >= total}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
