import { format } from 'date-fns';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Repeat,
  XCircle
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { VersionStatus } from '@/lib/generated/prisma/enums';
import { formatCurrency } from '@/lib/utils';

export const statusColorMap: Record<VersionStatus, string> = {
  DRAFT: 'bg-gray-500',
  ACTIVE: 'bg-green-500',
  DEPRECATED: 'bg-yellow-500',
  PENDING_ACTIVATION: 'bg-cyan-500'
};

function PaymentEventOverview({ event }: { event: any }) {
  // Function to get the correct amount based on payment type
  const getVersionAmount = () => {
    const settings = event.currentVersion?.paymentSettings?.settings;
    if (!settings) return 0;

    switch (event.type) {
      case 'ONE_TIME':
        return settings.amount || 0;
      case 'SUBSCRIPTION':
        return settings.amount || 0;
      case 'INSTALLMENTS':
        return settings.totalAmount || 0;
      default:
        return 0;
    }
  };

  const getTypeSpecificInfo = () => {
    const settings = event.currentVersion?.paymentSettings?.settings;
    if (!settings) return null;

    switch (event.type) {
      case 'ONE_TIME':
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Due Date
              </p>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {settings.defaultDueDate
                    ? format(new Date(settings.defaultDueDate), 'PPP')
                    : 'Not set'}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Generate Invoice Now
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    settings.generateInvoiceNow ? 'default' : 'secondary'
                  }
                >
                  {settings.generateInvoiceNow ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        );

      case 'SUBSCRIPTION':
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Frequency
              </p>
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                <span>
                  Every {settings.frequency.value}{' '}
                  {settings.frequency.unit.toLowerCase()}
                  {settings.frequency.value > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {settings.initialFee && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">
                  Initial Fee
                </p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>{formatCurrency(settings.initialFee.amount)}</span>
                </div>
              </div>
            )}
            {settings.trialPeriodDays && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">
                  Trial Period
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{settings.trialPeriodDays} days</span>
                </div>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Anchor Date
              </p>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{settings.useAnchorDate ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        );

      case 'INSTALLMENTS':
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Total Amount
              </p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>{formatCurrency(settings.totalAmount)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Installments
              </p>
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                <span>{settings.numberOfInstallments}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Frequency
              </p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Every {settings.frequency.value}{' '}
                  {settings.frequency.unit.toLowerCase()}
                  {settings.frequency.value > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {settings.downPayment && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">
                  Down Payment
                </p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>{formatCurrency(settings.downPayment.amount)}</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>
          General information about this payment event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">Status</p>
            <div className="flex items-center gap-2">
              {event.active ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>{event.active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">Type</p>
            <Badge variant="default">{event.currentVersion?.type}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">Amount</p>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(getVersionAmount())}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">Version</p>
            <div className="flex items-center gap-2">
              <Badge
                className={
                  statusColorMap[
                    (event.currentVersion?.status as VersionStatus) || 'DRAFT'
                  ]
                }
              >
                v{event.currentVersion?.version}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Type-specific Information */}
        {getTypeSpecificInfo()}

        <Separator />

        {/* Description */}
        <div className="space-y-2">
          <h4 className="font-medium">Description</h4>
          <p className="text-muted-foreground text-sm">
            {event.currentVersion?.description || 'No description provided'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentEventOverview;
