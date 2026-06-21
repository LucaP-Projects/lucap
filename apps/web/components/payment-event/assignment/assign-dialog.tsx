'use client';
import { useState } from 'react';
import { Users } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  type FormattedCustomer,
  type PaymentEventWithRelations
} from '@/types/payment-event/table';
import { OneTimeAssignForm } from './one-time/one-time-assign-form';

import SubscriptionAssignForm from './subscription/subscription-assign-form';

export default function AssignDialog({
  event,
  customers
}: {
  event: PaymentEventWithRelations;
  customers: FormattedCustomer[];
}) {
  const [open, setOpen] = useState(false);

  const renderAssignmentForm = () => {
    switch (event.type) {
      case 'ONE_TIME':
        return (
          <OneTimeAssignForm
            event={event}
            customers={customers}
            onClose={() => setOpen(false)}
          />
        );
      case 'SUBSCRIPTION':
        return (
          <SubscriptionAssignForm
            event={event}
            customers={customers}
            onClose={() => setOpen(false)}
          />
        );
      case 'INSTALLMENTS':
        return <div>Installments Assignment Form (Coming Soon)</div>;
      default:
        return <div>Unknown payment type</div>;
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Assign
          </Button>
        </SheetTrigger>
        <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>
              Assign {event.currentVersion?.name || 'Payment Event'}
            </SheetTitle>
            <SheetDescription>
              Select a customer and configure payment details
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">{renderAssignmentForm()}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
