'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Controller, FormProvider } from 'react-hook-form';


import { toast } from 'sonner';
import { useUploadStore } from '@/stores/useViewStore';
import {
  CustomerSelect,
  CustomerSelectData
} from '../shared/customer/customer-selection';

import { Button } from '../ui/button';
import { Field, FieldError } from '../ui/field';
import { createPayment, getCustomerInvoices } from './action';

import { InvoiceSelection } from './Invoice-selection';
import { PaymentAmountField, PaymentDistributionSummary } from './payment-amount';
import { PaymentDetails } from './payment-detail';
import { PaymentFormValues } from './schema';
import { usePaymentForm } from './usePaymentForm';

export function PaymentForm() {
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSelectData | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [maxAmount, setMaxAmount] = useState(0);
  const router = useRouter();
  const isSubmitting = useUploadStore((state) => state.isUploading);
  const setIsSubmitting = useUploadStore((state) => state.setUploading);
  const form = usePaymentForm();

  const handleCustomerSelect = async (customer: CustomerSelectData) => {
    try {
      setSelectedCustomer(customer);
      form.setValue('customerId', customer.id);
      const customerInvoices = await getCustomerInvoices(customer.id);
      setInvoices(customerInvoices);
      setSelectedInvoices([]);
      form.setValue('invoiceIds', []);
      form.setValue('amount', 0);
      setMaxAmount(0);
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
      toast.error('Failed to fetch customer invoices');
    }
  };

  const handleInvoiceSelect = (invoiceId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedInvoices, invoiceId]
      : selectedInvoices.filter((id) => id !== invoiceId);

    setSelectedInvoices(newSelection);
    form.setValue('invoiceIds', newSelection);

    const selectedInvoiceDetails = invoices.filter((inv) =>
      newSelection.includes(inv.id)
    );

    const total = selectedInvoiceDetails.reduce((sum, inv) => {
      const paidAmount = inv.payments.reduce(
        (paid: number, p: any) => paid + p.amount,
        0
      );
      return sum + (inv.amount - paidAmount);
    }, 0);

    setMaxAmount(total);
    form.setValue('amount', total);
  };

  async function onSubmit(data: PaymentFormValues) {
    if (data.amount > maxAmount) {
      form.setError('amount', {
        type: 'manual',
        message: 'Amount exceeds total due'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createPayment(data);

      if (!result.success) {
        // Handle other errors
        toast.error(result.error || 'Failed to process payment');
        return;
      }

      // Handle success
      form.reset();
      toast.success('Payment processed successfully');

      // Redirect and refresh
      router.push('/payments');
      router.refresh();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormProvider {...form}>
      <div className="relative flex h-full flex-col overflow-hidden">
        <form
          id="receive-payment-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto w-full max-w-4xl flex-1 space-y-6 overflow-auto p-6"
        >
          <div className="mb-2">
            <h1 className="text-primary flex items-center gap-2 text-3xl font-bold">
              Receive Payment
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              Record payments received from customers
            </p>
          </div>

          <div className="space-y-4 rounded-lg border border-gray-200 p-6 transition-colors dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Customer
            </h3>
            <Controller
              control={form.control}
              name="customerId"
              render={({ field, fieldState }) => (
                <Field>
                  <CustomerSelect
                    onSelect={handleCustomerSelect}
                    selectedCustomerId={field.value}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {selectedCustomer && (
            <InvoiceSelection
              invoices={invoices}
              selectedInvoices={selectedInvoices}
              onInvoiceSelect={handleInvoiceSelect}
            />
          )}

          {selectedInvoices.length > 0 && (
            <>
              <div className="space-y-4 rounded-lg border border-gray-200 p-6 transition-colors dark:border-gray-700 dark:bg-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <PaymentAmountField
                    form={form}
                    invoices={invoices}
                    selectedInvoices={selectedInvoices}
                  />
                  <PaymentDetails form={form} />
                </div>
              </div>

              <PaymentDistributionSummary
                form={form}
                invoices={invoices}
                selectedInvoices={selectedInvoices}
              />
            </>
          )}
        </form>

        <div className="border-t bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
            <div className="flex w-full gap-3 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="receive-payment-form"
                disabled={isSubmitting || selectedInvoices.length === 0}
                className={`flex-1 sm:flex-none ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {isSubmitting ? 'Processing...' : 'Process Payment'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
