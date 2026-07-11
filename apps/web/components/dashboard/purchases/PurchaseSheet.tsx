'use client';

import { Calendar, DollarSign } from 'lucide-react';
import { BaseSheet, Notes } from '@/components/dashboard/base/baseSheet';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface LineItem {
  id: string;
  description?: string | null;
  amount: number;
  account?: { id: string; title: string; number: string } | null;
}

interface PurchaseData {
  id: string;
  number: string;
  status: string;
  paymentType: string;
  credit: boolean;
  vendor: { id: string; displayName: string; primaryEmail: string | null; primaryPhone: string | null };
  amount: number;
  txnDate: Date;
  privateNote?: string | null;
  notes?: string | null;
  lineItems: LineItem[];
  createdAt: Date;
}

interface PurchaseSheetProps {
  data: PurchaseData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    OPEN: 'bg-blue-500', CLOSED: 'bg-green-500', VOID: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
};

export function PurchaseSheet({ data, isOpen, onOpenChange, isLoading }: PurchaseSheetProps) {
  if (!data && !isLoading) return null;

  return (
    <BaseSheet isOpen={isOpen} onOpenChange={onOpenChange} isLoading={isLoading}
      title={data ? `Purchase #${data.number}` : 'Loading...'}
    >
      {data && (
        <div className="space-y-6">
          <div className="bg-muted/20 border-border rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary h-4 w-4" />
                  <span className="text-sm">Date: {formatDate(data.txnDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Payment: {data.paymentType.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <Badge className={`${getStatusColor(data.status)} border px-3 py-1 text-base shadow-sm`}>
                {data.status.charAt(0) + data.status.slice(1).toLowerCase()}
                {data.credit && ' (Credit)'}
              </Badge>
            </div>
          </div>

          <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
            <h3 className="text-primary mb-2 font-medium">Vendor</h3>
            <p className="font-medium">{data.vendor.displayName}</p>
            {data.vendor.primaryEmail && <p className="text-muted-foreground text-sm">{data.vendor.primaryEmail}</p>}
            {data.vendor.primaryPhone && <p className="text-muted-foreground text-sm">{data.vendor.primaryPhone}</p>}
          </div>

          <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
            <h3 className="text-primary mb-4 flex items-center gap-2 font-medium">
              <DollarSign className="h-4 w-4" />
              Line Items
            </h3>
            <div className="space-y-3">
              {data.lineItems.map((item) => (
                <div key={item.id} className="border-border bg-background hover:bg-muted/10 rounded-md border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      {item.description && <p className="font-medium">{item.description}</p>}
                      {item.account && <p className="text-muted-foreground text-sm">{item.account.title} ({item.account.number})</p>}
                    </div>
                    <p className="font-medium">{formatCurrency(item.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-border mt-4 border-t pt-4">
              <div className="text-right">
                <p className="text-xl font-bold">Total: {formatCurrency(data.amount)}</p>
              </div>
            </div>
          </div>

          {data.privateNote && <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm"><Notes notes={data.privateNote} /></div>}
          {data.notes && <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm"><Notes notes={data.notes} /></div>}
        </div>
      )}
    </BaseSheet>
  );
}