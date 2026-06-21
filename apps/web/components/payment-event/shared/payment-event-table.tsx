import { Suspense } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

import Loading from '@/components/shared/loading';
import {
  DesktopViewProps,
  PaymentEventWithRelations
} from '@/types/payment-event/table';

import {
  getCustomersWithHierarchy,
  getPaymentEventsWithRelations
} from '../assignment/one-time/assign-action';
import { PaymentEventCard, PaymentEventRow } from './payment-event-card';

export default async function PaymentEventsTable() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">
            <Loading size="sm" />
          </div>
        </div>
      }
    >
      <PaymentEventsContent />
    </Suspense>
  );
}

async function PaymentEventsContent() {
  const [paymentEvents, customers] = await Promise.all([
    getPaymentEventsWithRelations(),
    getCustomersWithHierarchy()
  ]);
  return (
    <div className="space-y-4">
      <DesktopView paymentEvents={paymentEvents} customers={customers} />
      <MobileView paymentEvents={paymentEvents} customers={customers} />
    </div>
  );
}

function DesktopView({ paymentEvents, customers }: DesktopViewProps) {
  return (
    <div className="hidden rounded-md border lg:block">
      <div className="relative">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-white">
            <TableRow>
              <TableHead style={{ width: '30%' }}>Name</TableHead>
              <TableHead style={{ width: '10%' }}>Type</TableHead>
              <TableHead style={{ width: '10%' }}>Amount</TableHead>
              <TableHead style={{ width: '10%' }}>Status</TableHead>
              <TableHead style={{ width: '10%' }}>Assignments</TableHead>
              <TableHead style={{ width: '15%' }}>Pending Invoices</TableHead>
              <TableHead style={{ width: '15%' }} className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>

        <ScrollArea className="h-[calc(100vh-280px)]">
          <Table>
            <TableBody>
              {paymentEvents.map((event: PaymentEventWithRelations) => (
                <PaymentEventRow
                  key={event.id}
                  event={event}
                  customers={customers}
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}

function MobileView({ paymentEvents, customers }: DesktopViewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
      {paymentEvents.map((event) => (
        <PaymentEventCard key={event.id} event={event} customers={customers} />
      ))}
    </div>
  );
}
