'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface InvoicesTableProps {
  invoices: Array<{
    id: string;
    number: string;
    amount: number;
    status: string;
    dueDate: Date;
    notes: string | null;
  }>;
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      PAID: 'bg-green-500/10 text-green-500',
      PENDING: 'bg-yellow-500/10 text-yellow-500',
      OVERDUE: 'bg-red-500/10 text-red-500',
      CANCELLED: 'bg-gray-500/10 text-gray-500'
    };
    return colors[status as keyof typeof colors] || colors.CANCELLED;
  };

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No invoices found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.number}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(invoice.status)}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>{invoice.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
