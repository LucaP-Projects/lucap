'use client';

import { Calendar, DollarSign, Clock } from 'lucide-react';
import { BaseSheet, Notes } from '@/components/dashboard/base/baseSheet';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface LineItem {
  id: string;
  description?: string | null;
  amount: number;
  account?: { id: string; title: string; number: string } | null;
}

interface PurchaseOrderData {
  id: string;
  number: string;
  status: string;
  vendor: { id: string; displayName: string; primaryEmail: string | null; primaryPhone: string | null };
  amount: number;
  txnDate: Date;
  dueDate?: Date | null;
  memo?: string | null;
  poEmail?: string | null;
  lineItems: LineItem[];
  createdAt: Date;
}

interface PurchaseOrderSheetProps {
  data: PurchaseOrderData | null;
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

export function PurchaseOrderSheet({ data, isOpen, onOpenChange, isLoading }: PurchaseOrderSheetProps) {
  if (!data && !isLoading) return null;

  return (
    <BaseSheet isOpen={isOpen} onOpenChange={onOpenChange} isLoading={isLoading}
      title={data ? `Purchase Order #${data.number}` : 'Loading...'}
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
                {data.dueDate && (
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${new Date() > data.dueDate ? 'text-red-500' : 'text-primary'}`} />
                    <span className="text-sm">Due: {formatDate(data.dueDate)}</span>
                  </div>
                )}
              </div>
              <Badge className={`${getStatusColor(data.status)} border px-3 py-1 text-base shadow-sm`}>
                {data.status.charAt(0) + data.status.slice(1).toLowerCase()}
              </Badge>
            </div>
          </div>

          <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
            <h3 className="text-primary mb-2 font-medium">Vendor</h3>
            <p className="font-medium">{data.vendor.displayName}</p>
            {data.vendor.primaryEmail && <p className="text-muted-foreground text-sm">{data.vendor.primaryEmail}</p>}
            {data.poEmail && <p className="text-muted-foreground text-sm">PO Email: {data.poEmail}</p>}
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

          {data.memo && <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm"><Notes notes={data.memo} /></div>}
        </div>
      )}
    </BaseSheet>
  );
}