import {
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RefundStatus, PaymentMethod, RefundReason } from '@/lib/generated/prisma/client';
import {
  BaseSheet,
  CustomerInfo,
  Attachments,
  Notes,
  formatCurrency,
  formatDate,
  CustomerAddressInfo,
  TaxInformation,
  DiscountInformation,
  CustomerAddress
} from '../base/baseSheet';
import { STATUS_COLORS } from '../base/utils';

interface RefundReceiptData {
  id: string;
  number: string;
  status: RefundStatus;
  customer: {
    displayName: string;
    primaryEmail: string | null;
  };
  taxAmount: number;
  taxRate?: number;
  taxId?: string;
  amount: number;
  refundMethod: PaymentMethod;
  originalPaymentMethod?: PaymentMethod | null;
  refundRef?: string | null;
  reason: RefundReason;
  items: Array<{
    id: string;
    productName: string;
    description?: string | null;
    amount: number;
    quantity: number;
    rate: number;
    taxable: boolean;
  }>;
  notes?: string | null;
  attachments: Array<{
    fileId: string;
    file: {
      filename: string;
      path: string;
    };
  }>;
  createdAt: Date;
  paymentEventSnapshot?: {
    customer?: {
      name?: string;
      address?: CustomerAddress;
      type?: string;
    };
    taxRate?: number;
    taxAmount?: number;
    discountType?: string;
    discountValue?: number;
    discountAmount?: number;
    discountApplicationTime?: string;
  };
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  discountApplicationTime?: string;
  emailCustomer?: string;
}

interface RefundReceiptSheetProps {
  data?: RefundReceiptData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
}

export const RefundReceiptSheet = ({
  data,
  isOpen,
  onOpenChange,
  isLoading
}: RefundReceiptSheetProps) => {
  if (!data && !isLoading) return null;

  // Check if we have address data
  const hasAddressData =
    data?.paymentEventSnapshot?.customer?.address &&
    Object.values(data.paymentEventSnapshot.customer.address).some(
      (val) => val
    );

  // Check if we have tax data
  const hasTaxData =
    data?.taxRate ||
    data?.paymentEventSnapshot?.taxRate ||
    data?.taxAmount ||
    data?.paymentEventSnapshot?.taxAmount;

  // Check if we have discount data
  const hasDiscountData =
    (data?.discountAmount && data.discountAmount > 0) ||
    (data?.paymentEventSnapshot?.discountAmount &&
      data.paymentEventSnapshot.discountAmount > 0);

  // Calculate subtotal accounting for discount
  const calculateSubtotal = () => {
    if (!data) return 0;
    return data.amount - (data.taxAmount || 0) + (data.discountAmount || 0);
  };

  const renderRefundItem = (item: RefundReceiptData['items'][0]) => (
    <div
      key={item.id}
      className="border-border bg-card/50 hover:bg-card rounded-md border p-4 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{item.productName}</p>
          {item.description && (
            <p className="text-muted-foreground mt-1 text-sm">
              {item.description}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-medium">{formatCurrency(item.amount)}</p>
          <p className="text-muted-foreground text-sm">
            {item.quantity} × {formatCurrency(item.rate)}
          </p>
        </div>
      </div>
      {item.taxable && (
        <Badge
          variant="secondary"
          className="mt-2 border border-blue-200 bg-blue-50 text-blue-700"
        >
          Taxable
        </Badge>
      )}
    </div>
  );

  return (
    <BaseSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      title={data ? `Refund Receipt #${data.number}` : 'Loading...'}
    >
      {data && (
        <div className="space-y-6">
          {/* Header with improved styling */}
          <div className="bg-muted/20 border-border rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-primary h-4 w-4" />
                <span className="text-sm">
                  Refund Date: {formatDate(data.createdAt)}
                </span>
              </div>
              <Badge
                className={`${STATUS_COLORS[data.status]} border px-3 py-1 text-base shadow-sm`}
              >
                {data.status.charAt(0) + data.status.slice(1).toLowerCase()}
              </Badge>
            </div>
          </div>

          {/* Customer info section */}
          <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
            <CustomerInfo
              customer={data.customer}
              parentEmail={
                data.paymentEventSnapshot?.customer?.name || data.emailCustomer
              }
            />
          </div>

          {/* Address info - only show if we have data */}
          {hasAddressData ? (
            <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
              <CustomerAddressInfo
                address={data.paymentEventSnapshot?.customer?.address}
              />
            </div>
          ) : null}

          {/* Financial details sections - only show if we have data */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {hasTaxData ? (
              <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
                <TaxInformation
                  taxRate={data.taxRate || data.paymentEventSnapshot?.taxRate}
                  taxAmount={
                    data.taxAmount || data.paymentEventSnapshot?.taxAmount
                  }
                  taxId={data.taxId ?? undefined}
                />
              </div>
            ) : (
              <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
                <div className="text-muted-foreground flex items-center gap-2 p-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>No tax details available</span>
                </div>
              </div>
            )}

            {hasDiscountData ? (
              <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
                <DiscountInformation
                  discountType={
                    data.discountType || data.paymentEventSnapshot?.discountType
                  }
                  discountValue={
                    data.discountValue ||
                    data.paymentEventSnapshot?.discountValue
                  }
                  discountAmount={
                    data.discountAmount ||
                    data.paymentEventSnapshot?.discountAmount
                  }
                  discountApplicationTime={
                    data.discountApplicationTime ||
                    data.paymentEventSnapshot?.discountApplicationTime
                  }
                />
              </div>
            ) : (
              <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
                <div className="text-muted-foreground flex items-center gap-2 p-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>No discounts applied</span>
                </div>
              </div>
            )}
          </div>

          {/* Refund Information with enhanced styling */}
          <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
            <h3 className="text-primary mb-3 flex items-center gap-2 text-base font-medium">
              <CreditCard className="h-4 w-4" />
              Refund Information
            </h3>
            <div className="bg-muted/30 space-y-1 rounded-md p-3 text-sm">
              <p className="flex justify-between">
                <span className="font-medium">Refund Method:</span>
                <span>{data.refundMethod.replace(/_/g, ' ')}</span>
              </p>
              {data.originalPaymentMethod && (
                <p className="flex justify-between">
                  <span className="font-medium">Original Payment Method:</span>
                  <span>{data.originalPaymentMethod.replace(/_/g, ' ')}</span>
                </p>
              )}
              {data.refundRef && (
                <p className="flex justify-between">
                  <span className="font-medium">Reference:</span>
                  <span>{data.refundRef}</span>
                </p>
              )}
            </div>
          </div>

          {/* Reason Section with enhanced styling */}
          <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
            <h3 className="text-primary mb-3 flex items-center gap-2 text-base font-medium">
              <RotateCcw className="h-4 w-4" />
              Refund Reason
            </h3>
            <div className="bg-muted/30 rounded-md p-3">
              <p className="text-sm">{data.reason.replace(/_/g, ' ')}</p>
            </div>
          </div>

          {/* Items Section with enhanced styling */}
          <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
            <h3 className="text-primary mb-4 flex items-center gap-2 font-medium">
              <DollarSign className="h-4 w-4" />
              Refunded Items
            </h3>
            <div className="space-y-3">{data.items.map(renderRefundItem)}</div>

            {/* Financial summary with enhanced styling */}
            <div className="border-border mt-4 border-t pt-4">
              <div className="space-y-1 text-right">
                <p className="text-muted-foreground text-sm">
                  Subtotal: {formatCurrency(calculateSubtotal())}
                </p>

                {data.discountAmount && data.discountAmount > 0 && (
                  <p className="text-muted-foreground text-sm">
                    Discount:{' '}
                    <span className="text-amber-600">
                      -{formatCurrency(data.discountAmount)}
                    </span>
                  </p>
                )}

                {data.taxAmount > 0 && (
                  <p className="text-muted-foreground text-sm">
                    Tax {data.taxRate ? `(${data.taxRate}%)` : ''}:{' '}
                    {formatCurrency(data.taxAmount)}
                  </p>
                )}

                <p className="border-border mt-1 border-t pt-2 text-xl">
                  Total Refund:{' '}
                  <span className="font-bold text-red-600">
                    {formatCurrency(data.amount)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Only render attachments if they exist */}
          {data.attachments.length > 0 && (
            <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
              <Attachments attachments={data.attachments} />
            </div>
          )}

          {/* Only render notes if they exist */}
          {data.notes && data.notes.trim() !== '' && (
            <div className="border-border bg-card/50 rounded-lg border p-4 shadow-sm">
              <Notes notes={data.notes} />
            </div>
          )}
        </div>
      )}
    </BaseSheet>
  );
};
