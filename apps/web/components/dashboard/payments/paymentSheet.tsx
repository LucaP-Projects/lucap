import { Calendar, CreditCard, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PaymentMethod } from '@/lib/generated/prisma/enums';
import {
  BaseSheet,
  CustomerInfo,
  DiscountInformation,
  formatCurrency,
  formatDate
} from '../base/baseSheet';

interface PaymentData {
  id: string;
  number: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  reference: string | null;
  discountType: string | null;
  discountValue: number | null;
  discountAmount: number;
  customer: {
    displayName: string;
    primaryEmail: string | null;
  };
  invoice: {
    id: string;
    number: string;
    amount: number;
    status: string;
  };
  createdAt: Date;
}

interface PaymentSheetProps {
  data?: PaymentData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
}

export const PaymentSheet = ({
  data,
  isOpen,
  onOpenChange,
  isLoading
}: PaymentSheetProps) => {
  if (!data && !isLoading) return null;

  const hasDiscountData = data?.discountAmount && data.discountAmount > 0;

  return (
    <BaseSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      title={data ? `Payment #${data.number}` : 'Loading...'}
    >
      {data && (
        <div className="space-y-6">
          <div className="bg-muted/20 border-border rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-primary h-4 w-4" />
                <span className="text-sm">
                  Payment Date: {formatDate(data.paymentDate)}
                </span>
              </div>
              <Badge className="border bg-green-500 px-3 py-1 text-base shadow-sm hover:bg-green-600">
                Completed
              </Badge>
            </div>
          </div>

          <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
            <CustomerInfo customer={data.customer} />
          </div>

          <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
            <h3 className="text-primary mb-3 flex items-center gap-2 text-base font-medium">
              <FileText className="h-4 w-4" />
              Invoice
            </h3>
            <div className="bg-muted/30 space-y-1 rounded-md p-3 text-sm">
              <p className="flex justify-between">
                <span className="font-medium">Invoice #:</span>
                <span>{data.invoice.number}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Invoice Amount:</span>
                <span>{formatCurrency(data.invoice.amount)}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Invoice Status:</span>
                <span>{data.invoice.status}</span>
              </p>
            </div>
          </div>

          <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
            <h3 className="text-primary mb-3 flex items-center gap-2 text-base font-medium">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </h3>
            <div className="bg-muted/30 space-y-1 rounded-md p-3 text-sm">
              <p className="flex justify-between">
                <span className="font-medium">Payment Method:</span>
                <span>{data.paymentMethod.replace(/_/g, ' ')}</span>
              </p>
              {data.reference && (
                <p className="flex justify-between">
                  <span className="font-medium">Reference:</span>
                  <span>{data.reference}</span>
                </p>
              )}
            </div>
          </div>

          {hasDiscountData && (
            <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
              <DiscountInformation
                discountType={data.discountType ?? undefined}
                discountValue={data.discountValue ?? undefined}
                discountAmount={data.discountAmount}
              />
            </div>
          )}

          <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
            <div className="border-border border-t pt-4 text-right">
              <p className="text-xl">
                Amount Paid:{' '}
                <span className="font-bold text-green-600">
                  {formatCurrency(data.amount)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </BaseSheet>
  );
};
