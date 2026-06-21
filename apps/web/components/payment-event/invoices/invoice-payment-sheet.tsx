import React, { useEffect, useState } from 'react';
import { Controller, Form, useForm } from 'react-hook-form';
import { Calendar, InfoIcon, Receipt } from 'lucide-react';

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { PaymentMethod, PaymentStatus } from '@/lib/generated/prisma/client';
import { handleNumberInput } from '@/lib/utils';
import { Field, FieldLabel } from '@/components/ui/field';

interface PaymentFormData {
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  invoiceId: string;
}

interface Invoice {
  id: string;
  number: string;
  customerId: string;
  paymentEventId: string | null;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  notes: string | null;
  emailCustomer: string | null;
  paymentEventSnapshot: PrismaJson.PaymentEventSnapshot;
  createdAt: Date;
  updatedAt: Date;
  isLinkedToVersion: boolean;
}

interface InvoicePaymentSheetProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSubmitPayment: (payment: PaymentFormData) => Promise<void> | void;
  isProcessing?: boolean;
}

const InvoicePaymentSheet: React.FC<InvoicePaymentSheetProps> = ({
  invoice,
  isOpen,
  onClose,
  onSubmitPayment,
  isProcessing
}) => {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [invoiceData, setInvoiceData] = useState(invoice);

  // Update the invoice data whenever the prop changes
  useEffect(() => {
    setInvoiceData(invoice);
  }, [invoice]);

  const calculateTotals = () => {
    const baseAmount = invoiceData.paymentEventSnapshot.snapshotData
      ?.isPartialPeriod
      ? invoiceData.paymentEventSnapshot.snapshotData.partialAmount || 0
      : invoiceData.paymentEventSnapshot.snapshotData?.customAmount ||
      invoiceData.paymentEventSnapshot.amount;

    const initialFee =
      invoiceData.paymentEventSnapshot?.initialFee?.amount || 0;

    const paymentTracking = invoiceData.paymentEventSnapshot?.paymentTracking;
    const totalPaid = paymentTracking?.totalPaid || 0;

    const totalAmount = baseAmount + initialFee;
    const remaining =
      invoiceData.status === 'PAID' ? 0 : Math.max(0, totalAmount - totalPaid);

    return {
      baseAmount,
      initialFee,
      partialAmount:
        invoiceData.paymentEventSnapshot.snapshotData?.partialAmount || 0,
      totalAmount,
      totalPaid,
      remaining
    };
  };

  const getDefaultAmount = () => {
    const paymentTracking = invoiceData.paymentEventSnapshot?.paymentTracking;

    // If no payments made yet (first payment)
    if (!paymentTracking || paymentTracking.numberOfPayments === 0) {
      // If it's a partial period, use partialAmount
      const baseAmount = invoiceData.paymentEventSnapshot.snapshotData
        ?.isPartialPeriod
        ? invoiceData.paymentEventSnapshot.snapshotData.partialAmount || 0
        : invoiceData.paymentEventSnapshot.snapshotData?.customAmount ||
        invoiceData.paymentEventSnapshot.amount;

      // Add initial fee for first payment only
      const initialFee =
        invoiceData.paymentEventSnapshot?.initialFee?.amount || 0;
      return baseAmount + initialFee;
    }

    // For subsequent payments, use remaining balance from payment tracking
    return invoiceData.status === 'PAID'
      ? 0
      : paymentTracking.remainingBalance || 0;
  };

  const totals = calculateTotals();

  const form = useForm<PaymentFormData>({
    defaultValues: {
      amount: getDefaultAmount(),

      paymentMethod: PaymentMethod.CASH,
      reference: '',
      invoiceId: invoiceData.id
    }
  });

  // Reset the form when isOpen changes or invoice data changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        amount: getDefaultAmount(),
        paymentMethod: PaymentMethod.CASH,
        reference: '',
        invoiceId: invoiceData.id
      });
    }
  }, [isOpen, invoiceData, form]);

  const onSubmit = (data: PaymentFormData) => {
    if (data.amount > totals.remaining) {
      form.setError('amount', {
        type: 'manual',
        message: 'Payment amount cannot exceed remaining balance'
      });
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmedPayment = () => {
    const data = form.getValues();
    onSubmitPayment(data);
    setShowConfirmation(false);
  };

  return (
    <>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col overflow-hidden p-0 sm:max-w-lg"
        >
          <SheetHeader className="p-6">
            <SheetTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Process Payment for Invoice #{invoiceData.number}
            </SheetTitle>
            <SheetDescription>Enter payment details below</SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 p-1">
              {/* Invoice Details */}
              <Card>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payment Type:</span>
                    <span className="text-sm">
                      {invoiceData.paymentEventSnapshot.type}
                    </span>
                  </div>

                  {invoiceData.paymentEventSnapshot.frequency && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Frequency:</span>
                      <span className="text-sm">
                        {invoiceData.paymentEventSnapshot.frequency.value}{' '}
                        {invoiceData.paymentEventSnapshot.frequency.unit.toLowerCase()}
                        (s)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Due Date:</span>
                    <span className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(invoiceData.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  {invoiceData.paymentEventSnapshot.snapshotData
                    ?.isPartialPeriod && (
                      <AlertDialog>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDialogDescription>
                          Partial period:{' '}
                          {
                            invoiceData.paymentEventSnapshot.snapshotData
                              .partialPeriodDays
                          }{' '}
                          days
                        </AlertDialogDescription>
                      </AlertDialog>
                    )}
                </CardContent>
              </Card>
              {/* Payment History */}
              {invoiceData.paymentEventSnapshot.paymentTracking &&
                invoiceData.paymentEventSnapshot.paymentTracking?.paymentHistory
                  .length > 0 && (
                  <Card>
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-sm font-medium">
                          Payment History
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {
                            invoiceData.paymentEventSnapshot.paymentTracking
                              .numberOfPayments
                          }{' '}
                          payments
                        </span>
                      </div>

                      <div className="space-y-3">
                        {invoiceData.paymentEventSnapshot.paymentTracking.paymentHistory.map(
                          (payment) => (
                            <div
                              key={payment.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">
                                  ${payment.amount.toFixed(2)}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {new Date(payment.date).toLocaleDateString()}{' '}
                                  - {payment.paymentMethod.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-muted-foreground text-xs">
                                  Balance after payment
                                </span>
                                <span className="block font-medium text-blue-600">
                                  ${payment.balance.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              {/* Payment Summary */}
              <Card>
                <CardContent className="space-y-2 p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Base Amount:
                    </span>
                    <span className="font-medium">
                      ${invoiceData.amount.toFixed(2)}
                    </span>
                  </div>

                  {totals.initialFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Initial Fee:
                      </span>
                      <span className="font-medium">
                        ${totals.initialFee.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {totals.partialAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Partial Amount:
                      </span>
                      <span className="font-medium">
                        ${totals.partialAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Total Paid:
                    </span>
                    <span className="font-medium text-green-600">
                      ${totals.totalPaid.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">
                      Remaining Balance:
                    </span>
                    <span className="font-medium text-blue-600">
                      ${totals.remaining.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              {invoiceData.status !== 'PAID' && (
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <Controller
                    control={form.control}
                    name="amount"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Payment Amount</FieldLabel>
                          <div className="relative">
                            <span className="text-muted-foreground absolute left-3 top-2.5">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={totals.remaining}
                              className="pl-7"
                              {...field}
                              value={field.value}
                              onChange={(e) =>
                                handleNumberInput(
                                  e.target.value,
                                  field.onChange
                                )
                              }
                              disabled={invoiceData.status === 'PAID'}
                              placeholder={
                                invoiceData.status === 'PAID'
                                  ? 'Invoice is fully paid'
                                  : `0.00 (max: $${totals.remaining.toFixed(2)})`
                              }
                            />
                          </div>
                        <FormMessage />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="paymentMethod"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Payment Method</FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={
                            isProcessing || invoiceData.status === 'PAID'
                          }
                        >
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CREDIT_CARD">
                              Credit Card
                            </SelectItem>
                            <SelectItem value="BANK_TRANSFER">
                              Bank Transfer
                            </SelectItem>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="CHECK">Check</SelectItem>
                            <SelectItem value="DIGITAL_WALLET">
                              Digital Wallet
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="reference"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Reference (Optional)</FieldLabel>
                          <Input
                            {...field}
                            disabled={
                              isProcessing || invoiceData.status === 'PAID'
                            }
                            placeholder="Enter reference number or description"
                          />
                        <FormMessage />
                      </Field>
                    )}
                  />
                </form>
              )}
            </div>
          </ScrollArea>

          <div className="mt-6 border-t p-6">
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={
                  isProcessing ||
                  !form.getValues().amount ||
                  invoiceData.status === 'PAID'
                }
              >
                {isProcessing
                  ? 'Processing...'
                  : invoiceData.status === 'PAID'
                    ? 'Invoice Paid'
                    : 'Process Payment'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Payment Details Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-6">
              <span className="block">
                Are you sure you want to process this payment?
              </span>
              <span className="bg-muted block space-y-3 rounded-lg p-4">
                <span className="flex items-center justify-between">
                  <span className="text-sm font-medium">Amount to Pay:</span>
                  <span className="font-semibold text-green-600">
                    ${form.getValues().amount}
                  </span>
                </span>
                <span className="flex items-center justify-between">
                  <span className="text-sm font-medium">Using:</span>
                  <span className="font-medium">
                    {form.getValues().paymentMethod.replace('_', ' ')}
                  </span>
                </span>
                <span className="block border-t pt-3">
                  <span className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Balance After Payment:
                    </span>
                    <span className="font-semibold text-blue-600">
                      ${(totals.remaining - form.getValues().amount).toFixed(2)}
                    </span>
                  </span>
                </span>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedPayment}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Processing...' : 'Confirm Payment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InvoicePaymentSheet;
