'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';

import {
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  toast
} from '@silknexus/ui';
import {
  CustomerSelect,
  CustomerSelectData
} from '../shared/customer/customer-selection';

import { createPayment, getCustomerInvoices } from './action';

import { InvoiceSelection } from './InvoiceSelection';
import { PaymentAmount } from './payment-amount';
import { PaymentDetails } from './paymentdetail';
import { paymentFormSchema, PaymentFormValues } from './schema';

export function PaymentForm() {
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSelectData | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxAmount, setMaxAmount] = useState(0);
  const router = useRouter();
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema as any),
    defaultValues: {
      customerId: '',
      invoiceIds: [],
      amount: 0,
      paymentDate: new Date(),
      paymentMethod: 'CASH',
      reference: '',
      notes: ''
    }
  });

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
      toast({
        title: 'Error',
        description: 'Failed to fetch customer invoices',
        variant: 'destructive'
      });
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
        toast({
          title: 'Error',
          description: result.error || 'Failed to process payment',
          variant: 'destructive'
        });
        return;
      }

      // Handle success
      form.reset();
      toast({
        title: 'Success',
        description: 'Payment processed successfully'
      });

      // Redirect and refresh
      router.push('/payments');
      router.refresh();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="mb-8">
          <h1 className="text-primary flex items-center gap-2 text-3xl font-bold">
            Receive Payment
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            Record payments received from customers
          </p>
        </div>
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <CustomerSelect
                onSelect={handleCustomerSelect}
                selectedCustomerId={field.value}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedCustomer && (
          <InvoiceSelection
            invoices={invoices}
            selectedInvoices={selectedInvoices}
            onInvoiceSelect={handleInvoiceSelect}
          />
        )}

        {selectedInvoices.length > 0 && (
          <>
            <PaymentAmount
              form={form}
              invoices={invoices}
              selectedInvoices={selectedInvoices}
            />
            <PaymentDetails form={form} />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Process Payment'}
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
