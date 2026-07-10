'use client';

import { BaseSheet } from '@/components/dashboard/base/baseSheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import { VendorCreditWithRelations } from './actions';

interface Props {
  data: VendorCreditWithRelations | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
}

export function VendorCreditSheet({ data, isOpen, onOpenChange, isLoading }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'default';
      case 'CLOSED': return 'secondary';
      case 'PARTIALLY_APPLIED': return 'outline';
      case 'VOID': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <BaseSheet
      title={data?.number || 'Vendor Credit'}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
    >
      {data && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vendor</p>
              <p className="font-medium">{data.vendor?.displayName}</p>
            </div>
            <Badge variant={getStatusColor(data.status) as any}>{data.status.replace(/_/g, ' ')}</Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Credit Date</p>
              <p className="font-medium">{formatDate(data.creditDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">{formatCurrency(data.amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining Credit</p>
              <p className="font-medium">{formatCurrency(data.remainingCredit)}</p>
            </div>
          </div>

          {data.reason && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="text-sm">{data.reason}</p>
              </div>
            </>
          )}

          {data.lineItems && data.lineItems.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Line Items</p>
                <div className="space-y-2">
                  {data.lineItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.description || item.account?.title || 'Line item'}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {data.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
              </div>
            </>
          )}
        </div>
      )}
    </BaseSheet>
  );
}