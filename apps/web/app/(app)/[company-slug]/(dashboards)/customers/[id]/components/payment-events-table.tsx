'use client';

import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface PaymentEventsTableProps {
  paymentEvents: Array<{
    id: string;
    status: string;
    startDate: Date;
    endDate: Date | null;
    renewsAt: Date | null;
    paymentEvent: {
      versions: Array<{
        name: string;
        amount: number;
      }>;
    };
  }>;
}

export function PaymentEventsTable({ paymentEvents }: PaymentEventsTableProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      PAID: 'bg-green-500/10 text-green-500',
      PENDING: 'bg-yellow-500/10 text-yellow-500',
      OVERDUE: 'bg-red-500/10 text-red-500',
      CANCELLED: 'bg-gray-500/10 text-gray-500'
    };
    return colors[status as keyof typeof colors] || colors.CANCELLED;
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Payment Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Renewal Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.paymentEvent.versions?.[0]?.name ?? '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(event.status)}
                    >
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${(event.paymentEvent.versions?.[0]?.amount ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{formatDate(event.startDate)}</TableCell>
                  <TableCell>
                    {event.endDate ? formatDate(event.endDate) : '-'}
                  </TableCell>
                  <TableCell>
                    {event.renewsAt ? formatDate(event.renewsAt) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
