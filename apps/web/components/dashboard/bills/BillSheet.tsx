'use client';

import { Calendar, Clock, DollarSign } from 'lucide-react';
import { BaseSheet, Notes } from '@/components/dashboard/base/baseSheet';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface LineItem {
  id: string;
  description?: string | null;
  amount: number;
  account?: { id: string; title: string; number: string } | null;
}

interface Allocation {
  id: string;
  amount: number;
  billPayment: {
    id: string;
    paymentDate: Date;
    paymentMethod: string;
    reference?: string | null;
  };
}

interface BillData {
  id: string;
  number: string;
  status: string;
  vendor: { id: string; displayName: string; primaryEmail: string | null; primaryPhone: string | null };
  amount: number;
  billDate: Date;
  dueDate: Date;
  notes?: string | null;
  memo?: string | null;
  taxRate: number;
  taxAmount: number;
  lineItems: LineItem[];
  allocations: Allocation[];
  createdAt: Date;
}

interface BillSheetProps {
  data: BillData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-500', OPEN: 'bg-blue-500', OVERDUE: 'bg-red-500',
    PAID: 'bg-green-500', PARTIALLY_PAID: 'bg-yellow-500', VOID: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
};

export function BillSheet({ data, isOpen, onOpenChange, isLoading }: BillSheetProps) {
  if (!data && !isLoading) return null;

  const totalPaid = data?.allocations.reduce((sum, a) => sum + a.amount, 0) ?? 0;
  const remainingAmount = data ? data.amount - totalPaid : 0;

  return (
    <BaseSheet isOpen={isOpen} onOpenChange={onOpenChange} isLoading={isLoading}
      title={data ? `Bill #${data.number}` : 'Loading...'}
    >
      {data && (
        <div className="space-y-6">
          <div className="bg-muted/20 border-border rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary h-4 w-4" />
                  <span className="text-sm">Bill Date: {formatDate(data.billDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${new Date() > data.dueDate ? 'text-red-500' : 'text-primary'}`} />
                  <span className="text-sm">Due: {formatDate(data.dueDate)}</span>
                </div>
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
              <div className="space-y-1 text-right">
                {data.taxAmount > 0 && (
                  <p className="text-muted-foreground text-sm">Tax ({data.taxRate}%): {formatCurrency(data.taxAmount)}</p>
                )}
                <p className="text-xl font-bold">Total: {formatCurrency(data.amount)}</p>
                {totalPaid > 0 && (
                  <>
                    <p className="text-muted-foreground text-sm">Paid: <span className="text-green-600">{formatCurrency(totalPaid)}</span></p>
                    <p className="text-lg font-bold">Remaining: <span className={remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(remainingAmount)}</span></p>
                  </>
                )}
              </div>
            </div>
          </div>

          {data.allocations.length > 0 && (
            <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
              <h3 className="text-primary mb-3 font-medium">Payment History</h3>
              <div className="space-y-3">
                {data.allocations.map((alloc) => (
                  <div key={alloc.id} className="border-border bg-background hover:bg-muted/10 rounded-md border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{formatDate(alloc.billPayment.paymentDate)}</p>
                        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                          {alloc.billPayment.paymentMethod.replace(/_/g, ' ')}
                          {alloc.billPayment.reference && ` - Ref: ${alloc.billPayment.reference}`}
                        </p>
                      </div>
                      <p className="font-medium text-green-600">{formatCurrency(alloc.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.memo && <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm"><Notes notes={data.memo} /></div>}
          {data.notes && <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm"><Notes notes={data.notes} /></div>}
        </div>
      )}
    </BaseSheet>
  );
}
