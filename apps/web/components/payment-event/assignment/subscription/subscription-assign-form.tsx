import React, { useEffect, useState } from 'react';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CalendarIcon,
  Clock,
  DollarSign,
  Search,
  Users
} from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { OneTimeAssignFormProps } from '@/types/payment-event/assignment';
import { FormattedCustomer } from '@/types/payment-event/table';
import { useSubscriptionDetails } from '../../hooks/useSubsciptionDetails';
import { checkCustomerAssignment } from '../one-time/assign-action';
import {
  CustomerItem,
  CustomerSkeleton
} from '../one-time/one-time-assign-form';
import { isFormValid, subPeriod, validateStartDate } from '../utils';
import { assignSubscription } from './assign-action';

export const SubscriptionAssignForm: React.FC<OneTimeAssignFormProps> = ({
  event,
  customers,
  onClose,
  isLoading: parentIsLoading
}) => {
  // Basic state
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<FormattedCustomer | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Date handling
  const today = new Date();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());

  // Price state
  const settings = event.currentVersion?.paymentSettings
    .settings as PrismaJson.SubscriptionSettings;
  const originalAmount = settings?.amount || 0;
  const [customAmount, setCustomAmount] = useState(originalAmount);
  const [reason, setReason] = useState('');

  // Initial fee state
  const initialFee = settings?.initialFee;
  const [customInitialFee, setCustomInitialFee] = useState(
    initialFee?.amount || 0
  );
  const [initialFeeReason, setInitialFeeReason] = useState('');

  // Partial period state

  const [partialAmountReason, setPartialAmountReason] = useState('');

  const loading = isLoading || parentIsLoading;
  const isPriceModified = customAmount !== originalAmount;
  const isInitialFeeModified: boolean = initialFee
    ? customInitialFee !== initialFee.amount
    : false;

  // Comprehensive subscription details calculation
  const subscriptionDetails = useSubscriptionDetails(
    settings,
    startDate,
    originalAmount,
    initialFee
  );
  const [customPartialAmount, setCustomPartialAmount] = useState(
    subscriptionDetails?.partialPeriodAmount || 0
  );
  const handleAssign = async () => {
    if (!selectedCustomer) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsLoading(true);
    try {
      const checkResult = await checkCustomerAssignment({
        paymentEventId: event.id,
        customerId: selectedCustomer.id
      });

      if (checkResult.exists) {
        setShowWarning(true);
      } else {
        await processAssignment();
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to check existing assignments'
      });
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };
  useEffect(
    () => () => {
      setSelectedCustomer(null);
      setStartDate(new Date());
      setCustomAmount(originalAmount);
      setReason('');
      setIsSubmitting(false);
    },
    []
  );
  const processAssignment = async () => {
    if (!selectedCustomer || !startDate) return;

    setIsLoading(true);
    try {
      const response = await assignSubscription({
        paymentEventId: event.id,
        customerId: selectedCustomer.id,
        assignmentDate: new Date(),
        startDate,
        regularAmount: customAmount,
        regularAmountReason: isPriceModified ? reason : undefined,
        initialFeeAmount: customInitialFee,
        initialFeeReason: isInitialFeeModified ? initialFeeReason : undefined,
        partialAmount: settings?.useAnchorDate
          ? customPartialAmount
          : undefined,
        partialAmountReason: settings?.useAnchorDate
          ? partialAmountReason
          : undefined,
        anchorDate: subscriptionDetails?.nextAnchorDate
          ? new Date(subscriptionDetails.nextAnchorDate)
          : undefined
      });

      if (!response.success) {
        throw new Error(
          response.error?.message || 'Failed to assign subscription'
        );
      }

      toast.success("Success",{
        description: 'Subscription assigned successfully'
      });
      onClose();
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to assign subscription',
      });
    } finally {
      setIsLoading(false);
      setShowWarning(false);
    }
  };
  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-6">
          {/* Customer Search Section */}
          <div className="bg-background sticky top-0 z-10 space-y-4 pb-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
              <Input
                placeholder="Search customers by name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {selectedCustomer && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-5 w-5" />
                      <span className="font-medium">
                        {selectedCustomer.displayName}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Customer List */}
          <Card>
            {loading ? (
              <CustomerSkeleton />
            ) : (
              <div className="divide-y">
                {customers.map((customer) => (
                  <CustomerItem
                    key={customer.id}
                    customer={customer}
                    selectedId={selectedCustomer?.id || null}
                    onSelect={setSelectedCustomer}
                    searchTerm={searchTerm}
                  />
                ))}
              </div>
            )}
          </Card>

          {selectedCustomer && subscriptionDetails && (
            <>
              {/* Assignment and Start Dates */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Assignment Date</Label>
                      <div className="border-input bg-muted text-muted-foreground flex h-10 items-center rounded-md border px-3">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(today, 'PPP')}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !startDate && 'text-muted-foreground'
                            )}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            {startDate
                              ? format(startDate, 'PPP')
                              : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date: Date | undefined) => {
                              // Only proceed if date is different from current startDate
                              if (
                                date &&
                                (!startDate || !isSameDay(date, startDate))
                              ) {
                                if (
                                  validateStartDate(date, settings.frequency)
                                ) {
                                  setStartDate(date);
                                } else {
                                  toast.error('Invalid Date', {
                                    description:
                                      'Start date cannot be earlier than one billing cycle'
                                  });
                                }
                              }
                            }}
                            disabled={(date) => {
                              const earliestAllowed = subPeriod(
                                startOfDay(new Date()),
                                settings.frequency
                              );
                              return startOfDay(date) < earliestAllowed;
                            }}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Regular Amount Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Regular Payment Amount</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Original Amount</Label>
                      <div className="bg-muted flex items-center rounded-md border p-2">
                        <DollarSign className="text-muted-foreground h-4 w-4" />
                        <span className="ml-1">
                          ${originalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Custom Amount</Label>
                      <div className="relative">
                        <DollarSign className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customAmount}
                          onChange={(e) =>
                            setCustomAmount(parseFloat(e.target.value) || 0)
                          }
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  {isPriceModified && (
                    <div className="space-y-2">
                      <Label>Reason for Price Change</Label>
                      <Input
                        placeholder="Please provide a reason..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Initial Fee Section */}
              {subscriptionDetails.hasInitialFee && initialFee && (
                <Card>
                  <CardHeader>
                    <CardTitle>Initial Fee</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Original Initial Fee</Label>
                        <div className="bg-muted flex items-center rounded-md border p-2">
                          <DollarSign className="text-muted-foreground h-4 w-4" />
                          <span className="ml-1">
                            ${initialFee.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Custom Initial Fee</Label>
                        <div className="relative">
                          <DollarSign className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={customInitialFee}
                            onChange={(e) =>
                              setCustomInitialFee(
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="pl-8"
                          />
                        </div>
                      </div>
                    </div>

                    {isInitialFeeModified && (
                      <div className="space-y-2">
                        <Label>Reason for Initial Fee Change</Label>
                        <Input
                          placeholder="Please provide a reason..."
                          value={initialFeeReason}
                          onChange={(e) => setInitialFeeReason(e.target.value)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Partial Period Section */}
              {settings?.useAnchorDate &&
                subscriptionDetails?.partialPeriodAmount && (
                  <Card>
                    <CardHeader>
                      <CardTitle>First Partial Period</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted/50 rounded-lg border p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">
                              Period Length:
                            </span>
                            <span>
                              {subscriptionDetails.partialPeriodDays} days
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">
                              Calculated Amount:
                            </span>
                            <span>
                              $
                              {subscriptionDetails.partialPeriodAmount.toFixed(
                                2
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Custom Partial Period Amount</Label>
                        <div className="relative">
                          <DollarSign className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={customPartialAmount}
                            onChange={(e) =>
                              setCustomPartialAmount(
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="pl-8"
                          />
                        </div>
                      </div>

                      {customPartialAmount !==
                        subscriptionDetails.partialPeriodAmount && (
                        <div className="space-y-2">
                          <Label>Reason for Partial Amount Change</Label>
                          <Input
                            placeholder="Please provide a reason..."
                            value={partialAmountReason}
                            onChange={(e) =>
                              setPartialAmountReason(e.target.value)
                            }
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

              {/* Payment Schedule Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Schedule Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Subscription Configuration Badge */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {subscriptionDetails.frequency.value}{' '}
                      {subscriptionDetails.frequency.unit.toLowerCase()}
                      {subscriptionDetails.frequency.value > 1 ? 's' : ''}
                    </Badge>
                    {subscriptionDetails.useAnchorDate &&
                      subscriptionDetails.anchorConfig && (
                        <Badge variant="outline" className="text-xs">
                          Anchor Date:{' '}
                          {subscriptionDetails.anchorConfig.type === 'monthly'
                            ? `Day ${subscriptionDetails.anchorConfig.day}`
                            : `Every ${
                                [
                                  'Sun',
                                  'Mon',
                                  'Tue',
                                  'Wed',
                                  'Thu',
                                  'Fri',
                                  'Sat'
                                ][subscriptionDetails.anchorConfig.day - 1]
                              }`}
                        </Badge>
                      )}
                    {subscriptionDetails.trialPeriodDays &&
                      subscriptionDetails.trialPeriodDays > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {subscriptionDetails.trialPeriodDays} day trial
                        </Badge>
                      )}
                    {subscriptionDetails.allowPause && (
                      <Badge variant="outline" className="text-xs">
                        Pause Allowed
                      </Badge>
                    )}
                  </div>

                  {/* Payment Timeline */}
                  <div className="space-y-3">
                    {/* Start Date if different from assignment */}
                    {startDate && (
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">Start Date</p>
                          <p className="text-muted-foreground text-sm">
                            {format(startDate, 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Initial Fee if applicable */}
                    {subscriptionDetails.hasInitialFee &&
                      customInitialFee > 0 && (
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">Initial Fee</p>
                            <p className="text-muted-foreground text-sm">
                              Due at start
                            </p>
                          </div>
                          <Badge variant="secondary">
                            ${customInitialFee.toFixed(2)}
                          </Badge>
                        </div>
                      )}

                    {/* Trial Period if applicable */}
                    {subscriptionDetails.trialPeriodDays &&
                      subscriptionDetails.trialPeriodDays > 0 && (
                        <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">Trial Period</p>
                            <p className="text-muted-foreground text-sm">
                              {format(new Date(startDate), 'MMM d')} -{' '}
                              {format(
                                addDays(
                                  new Date(startDate),
                                  subscriptionDetails.trialPeriodDays
                                ),
                                'MMM d, yyyy'
                              )}
                            </p>
                          </div>
                          <Badge variant="secondary">Free</Badge>
                        </div>
                      )}

                    {/* Partial Period if applicable */}
                    {subscriptionDetails.partialPeriodAmount &&
                      subscriptionDetails.nextAnchorDate && (
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">First Partial Period</p>
                            <p className="text-muted-foreground text-sm">
                              {format(startDate, 'MMM d')} -{' '}
                              {format(
                                new Date(subscriptionDetails.nextAnchorDate),
                                'MMM d, yyyy'
                              )}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            $
                            {(
                              customPartialAmount ||
                              subscriptionDetails.partialPeriodAmount
                            ).toFixed(2)}
                          </Badge>
                        </div>
                      )}

                    {/* First Regular Payment */}
                    <div className="bg-primary/5 flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">First Regular Payment</p>
                        <p className="text-muted-foreground text-sm">
                          {format(
                            new Date(subscriptionDetails.firstFullPaymentDate || startDate),
                            'MMM d, yyyy'
                          )}
                        </p>
                      </div>
                      <Badge variant="default">
                        ${customAmount.toFixed(2)}
                      </Badge>
                    </div>

                    {/* Future Payments */}
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Regular Payments</p>
                          <p className="text-muted-foreground text-sm">
                            Every {subscriptionDetails.frequency.value}{' '}
                            {subscriptionDetails.frequency.unit.toLowerCase()}
                            {subscriptionDetails.frequency.value > 1
                              ? 's'
                              : ''}{' '}
                            {subscriptionDetails.useAnchorDate &&
                              'on anchor dates'}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          ${customAmount.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="mt-auto border-t">
        <div className="flex justify-end gap-4 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              !isFormValid({
                selectedCustomer,
                startDate,
                settings,
                isPriceModified,
                reason,
                isInitialFeeModified,
                initialFeeReason,
                customPartialAmount,
                subscriptionDetails,
                partialAmountReason
              }) || loading
            }
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? 'Assigning...' : 'Assign Subscription'}
          </Button>
        </div>
      </div>

      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Confirm Assignment</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              {/* Customer Info */}
              <span className="flex flex-col rounded-lg border p-4">
                <span className="mb-2 font-medium">Assignment Details</span>
                <span className="flex flex-col gap-1 text-sm">
                  <span>
                    Customer:{' '}
                    <span className="font-medium">
                      {selectedCustomer?.displayName}
                    </span>
                  </span>
                  <span>
                    Start Date: {format(new Date(startDate), 'MMMM d, yyyy')}
                  </span>
                </span>
              </span>

              {/* Price Modifications */}
              {(isPriceModified ||
                isInitialFeeModified ||
                customPartialAmount !==
                  subscriptionDetails?.partialPeriodAmount) && (
                <span className="flex flex-col rounded-lg border p-4">
                  <span className="mb-2 font-medium">Price Modifications</span>
                  <span className="flex flex-col gap-3">
                    {isPriceModified && (
                      <span className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground">
                          Regular Amount
                        </span>
                        <span>Original: ${originalAmount.toFixed(2)}</span>
                        <span>Modified: ${customAmount.toFixed(2)}</span>
                        <span className="text-xs italic">Reason: {reason}</span>
                      </span>
                    )}
                    {isInitialFeeModified && (
                      <span className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground">
                          Initial Fee
                        </span>
                        <span>Original: ${initialFee?.amount.toFixed(2)}</span>
                        <span>Modified: ${customInitialFee.toFixed(2)}</span>
                        <span className="text-xs italic">
                          Reason: {initialFeeReason}
                        </span>
                      </span>
                    )}
                    {customPartialAmount !==
                      subscriptionDetails?.partialPeriodAmount && (
                      <span className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground">
                          Partial Period Amount
                        </span>
                        <span>
                          Calculated: $
                          {(subscriptionDetails?.partialPeriodAmount &&
                            subscriptionDetails?.partialPeriodAmount.toFixed(
                              2
                            )) ||
                            0}
                        </span>
                        <span>Modified: ${customPartialAmount.toFixed(2)}</span>
                        <span className="text-xs italic">
                          Reason: {partialAmountReason}
                        </span>
                      </span>
                    )}
                  </span>
                </span>
              )}

              <span className="font-medium">
                Are you sure you want to proceed with this assignment?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={processAssignment}
              className="bg-primary hover:bg-primary/90"
            >
              Confirm Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionAssignForm;
