import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentEventNotFound() {
  return (
    <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4">
      <div className="text-muted-foreground flex items-center gap-2">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-lg font-medium">Payment Event Not Found</h2>
      </div>
      <p className="text-muted-foreground text-sm">
        The payment event you&apos;re looking for doesn&apos;t exist or has been
        deleted.
      </p>
      <Button asChild>
        <Link href="/finance/payment-events">Return to Payment Events</Link>
      </Button>
    </div>
  );
}
