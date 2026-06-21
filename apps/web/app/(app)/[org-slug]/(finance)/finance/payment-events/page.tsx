import { Suspense } from 'react';

import { Card } from '@/components/ui/card';
import CreatePaymentEventDialog from '@/components/payment-event/shared/payment-event-button';
import PaymentEventsTable from '@/components/payment-event/shared/payment-event-table';

export default async function PaymentEventsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-1 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Payment Events
            </h1>
            <p className="text-muted-foreground text-[0.925rem]">
              Manage your payment events and fee structures with ease
            </p>
          </div>
          <CreatePaymentEventDialog />
        </div>
      </div>

      {/* Table Section - Matching dashboard content area */}
      <Card className="bg-card flex-1 border">
        <Suspense fallback={<PaymentEventsTableSkeleton />}>
          <PaymentEventsTable />
        </Suspense>
      </Card>
    </div>
  );
}

function PaymentEventsTableSkeleton() {
  return (
    <div className="p-6">
      {/* Table Header Skeleton */}
      <div className="border-b pb-4">
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`header-${i}`}
              className="bg-muted h-4 animate-pulse rounded"
            />
          ))}
        </div>
      </div>

      {/* Table Rows Skeleton */}
      <div className="pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`row-${i}`} className="border-b py-4 last:border-0">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div
                  key={`cell-${i}-${j}`}
                  className="bg-muted/50 h-4 animate-pulse rounded"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
