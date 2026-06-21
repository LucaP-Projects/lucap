'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PaymentEventDrawer from '../create/payment-event-create-form';

export function CreatePaymentEventDialog() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setIsDrawerOpen(true)}>
        Create Payment Event
      </Button>
      <PaymentEventDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </div>
  );
}

export default CreatePaymentEventDialog;
