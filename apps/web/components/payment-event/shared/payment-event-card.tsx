'use client';

import { VersionStatus } from '@/lib/generated/prisma/client';
import { useRouter } from 'next/navigation';
import {
  CalendarClock,
  CheckCircle2,
  DollarSign,
  Users,
  XCircle
} from 'lucide-react';

import { Badge, Card, TableCell, TableRow } from '@silknexus/ui';
import {
  PaymentEventRowProps,
  PaymentEventVersionBasic
} from '@/types/payment-event/table';
import AssignDialog from '../assignment/assign-dialog';
import { PaymentEventActions } from './payment-event-actions';

export function getPaymentEventAmount(
  version: PaymentEventVersionBasic | null
): number {
  if (!version?.paymentSettings) return 0;

  const { settings } = version.paymentSettings;

  if ('amount' in settings) {
    return settings.amount;
  }

  return 0;
}
export function PaymentEventRow({ event, customers }: PaymentEventRowProps) {
  const router = useRouter();
  const pendingInvoices = event.customerPaymentEvents.reduce(
    (acc, cpe) => acc + cpe.invoices.length,
    0
  );
  const handleRowClick = () => {
    router.push(`/finance/payment-events/${event.id}`);
  };
  const amount = event.currentVersion?.paymentSettings
    ? getPaymentEventAmount(event.currentVersion)
    : 0;

  return (
    <TableRow
      className="hover:bg-muted/50 cursor-pointer"
      onClick={handleRowClick}
    >
      <TableCell style={{ width: '30%' }}>
        <div className="flex items-center gap-2">
          <span className="font-medium">{event.currentVersion?.name}</span>
        </div>
      </TableCell>
      <TableCell style={{ width: '10%' }}>
        <Badge variant="outline">{event.currentVersion?.type}</Badge>
      </TableCell>
      <TableCell style={{ width: '10%' }}>${amount.toFixed(2)}</TableCell>
      <TableCell style={{ width: '10%' }}>
        <StatusBadge
          active={event.active}
          status={event.currentVersion?.status}
        />
      </TableCell>
      <TableCell style={{ width: '10%' }}>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{event.customerPaymentEvents.length}</span>
        </div>
      </TableCell>
      <TableCell style={{ width: '15%' }}>{pendingInvoices}</TableCell>
      <TableCell style={{ width: '15%' }}>
        <div className="flex justify-end gap-2">
          <AssignDialog customers={customers} event={event} />
          <PaymentEventActions event={event} />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function PaymentEventCard({ event, customers }: PaymentEventRowProps) {
  const router = useRouter();
  const pendingInvoices = event.customerPaymentEvents.reduce(
    (acc, cpe) => acc + cpe.invoices.length,
    0
  );

  const amount = event.currentVersion?.paymentSettings
    ? getPaymentEventAmount(event.currentVersion)
    : 0;
  const handleRowClick = () => {
    router.push(`/finance/payment-events/${event.id}`);
  };
  return (
    <Card
      className="hover:bg-muted/50 cursor-pointer overflow-hidden p-4"
      onClick={handleRowClick}
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-medium">
              {event.currentVersion?.name}
            </h3>
            <StatusBadge
              active={event.active}
              status={event.currentVersion?.status}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{event.currentVersion?.type}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            <span>${amount.toFixed(2)}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{event.customerPaymentEvents.length} Assigned</span>
          </div>
          <div className="text-muted-foreground col-span-2 flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4" />
            <span>{pendingInvoices} Pending Invoices</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-3">
          <AssignDialog customers={customers} event={event} />
          <PaymentEventActions event={event} />
        </div>
      </div>
    </Card>
  );
}

export function StatusBadge({
  active,
  status
}: {
  active: boolean;
  status?: VersionStatus;
}) {
  if (!active) {
    return (
      <Badge variant="destructive" className="whitespace-nowrap">
        <XCircle className="mr-1 h-3 w-3" />
        Inactive
      </Badge>
    );
  }

  if (status === 'DRAFT') {
    return (
      <Badge variant="outline" className="whitespace-nowrap">
        Draft
      </Badge>
    );
  }

  if (status === 'PENDING_ACTIVATION') {
    return (
      <Badge
        variant={'nohover'}
        className="whitespace-nowrap bg-yellow-100 text-yellow-800"
      >
        Pending
      </Badge>
    );
  }

  if (status === 'DEPRECATED') {
    return (
      <Badge variant="secondary" className="whitespace-nowrap">
        Deprecated
      </Badge>
    );
  }

  return (
    <Badge
      variant={'nohover'}
      className="whitespace-nowrap bg-green-100 text-green-800"
    >
      <CheckCircle2 className="mr-1 h-3 w-3" />
      Active
    </Badge>
  );
}
