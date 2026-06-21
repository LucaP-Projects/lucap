import React from 'react';
import { format } from 'date-fns';
import {
  Users,
  ClipboardList,
  CalendarDays,
  Clock,
  DollarSign,
  Receipt,
  AlertCircle,
  CheckCircle
} from 'lucide-react';


import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { PaymentStatusBreakdown } from '../shared/payment-status-breakdown';

function PaymentEventStatistics({ event }: { event: any }) {
  const calculateFinancials = () =>
    event.customerPaymentEvents.reduce(
      (acc: any, cpe: any) => {
        // Get total amount from progress
        const totalAmount = cpe.progress?.totalAmount || 0;

        // Calculate payments from both progress and invoices
        let totalPaid = 0;

        // Check payments from invoices first
        if (cpe.invoices && cpe.invoices.length > 0) {
          totalPaid = cpe.invoices.reduce((sum: number, invoice: any) => {
            // Sum up all payments for this invoice
            const invoicePaid =
              invoice.payments?.reduce(
                (pSum: number, payment: any) => pSum + (payment.amount || 0),
                0
              ) || 0;
            return sum + invoicePaid;
          }, 0);
        }

        // Fallback to progress tracking if no invoice payments found
        if (totalPaid === 0) {
          totalPaid = cpe.progress?.totalPaid || 0;
        }

        return {
          totalAmount: acc.totalAmount + totalAmount,
          totalPaid: acc.totalPaid + totalPaid
        };
      },
      { totalAmount: 0, totalPaid: 0 }
    );

  const { totalAmount, totalPaid } = calculateFinancials();
  const totalDue = totalAmount - totalPaid;

  // Calculate payment statistics
  const paymentStats = event.customerPaymentEvents.reduce(
    (stats: any, cpe: any) => {
      stats[cpe.status] = (stats[cpe.status] || 0) + 1;
      return stats;
    },
    {}
  );

  // Get type-specific statistics
  const getTypeSpecificStats = () => {
    switch (event.type) {
      case 'SUBSCRIPTION': {
        const activeSubscriptions = event.customerPaymentEvents.filter(
          (cpe: any) => cpe.progress?.subscriptionStatus === 'ACTIVE'
        ).length;
        const pausedSubscriptions = event.customerPaymentEvents.filter(
          (cpe: any) => cpe.progress?.subscriptionStatus === 'PAUSED'
        ).length;

        return (
          <>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Active Subscriptions
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{activeSubscriptions}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Paused Subscriptions
              </p>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>{pausedSubscriptions}</span>
              </div>
            </div>
          </>
        );
      }
      case 'INSTALLMENTS': {
        const totalInstallments = event.customerPaymentEvents.reduce(
          (sum: any, cpe: any) => sum + (cpe.progress?.totalInstallments || 0),
          0
        );
        const completedInstallments = event.customerPaymentEvents.reduce(
          (sum: any, cpe: any) => sum + (cpe.progress?.currentInstallment || 0),
          0
        );

        return (
          <>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Total Installments
              </p>
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span>{totalInstallments}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Completed Installments
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{completedInstallments}</span>
              </div>
            </div>
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
        <CardDescription>Payment event metrics and insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Total Assignments
            </p>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{event.customerPaymentEvents.length}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Total Versions
            </p>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span>{event.versions.length}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Created Date
            </p>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>{format(event.createdAt, 'PPP')}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Last Updated
            </p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{format(event.updatedAt, 'PPP')}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Total Amount
            </p>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Amount Paid
            </p>
            <div className="flex items-center gap-2 text-green-600">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(totalPaid)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Amount Due
            </p>
            <div className="flex items-center gap-2 text-yellow-600">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(totalDue)}</span>
            </div>
          </div>
        </div>

        {/* Type Specific Stats */}
        {getTypeSpecificStats() && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {getTypeSpecificStats()}
            </div>
          </>
        )}

        <Separator />

        {/* Payment Status Breakdown */}
        <PaymentStatusBreakdown
          customerPaymentEvents={event.customerPaymentEvents}
        />
      </CardContent>
    </Card>
  );
}

export default PaymentEventStatistics;
