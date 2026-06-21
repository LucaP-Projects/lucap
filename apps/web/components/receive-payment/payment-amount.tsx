'use client';

import { UseFormReturn } from 'react-hook-form';
import {
  Card,
  CardContent,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from '@silknexus/ui';
import { formatCurrency } from '@/lib/utils';
import { PaymentFormValues } from './schema';
import {
  calculateMaxPaymentAmount,
  calculateRemainingAmount,
  distributePayment
} from './utils';

// export function calculateRemainingAmount(invoice: Invoice): number {
//   const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
//   return invoice.amount - paidAmount;
// }

// export function distributePayment(amount: number, invoices: Invoice[]) {
//   let remainingPayment = amount;
//   const payments: { invoiceId: string; amount: number }[] = [];

//   for (const invoice of invoices) {
//     const remainingInvoiceAmount = calculateRemainingAmount(invoice);

//     if (remainingPayment <= 0) break;

//     const paymentForInvoice = Math.min(
//       remainingInvoiceAmount,
//       remainingPayment
//     );
//     if (paymentForInvoice > 0) {
//       payments.push({
//         invoiceId: invoice.id,
//         amount: paymentForInvoice
//       });
//       remainingPayment -= paymentForInvoice;
//     }
//   }

//   return payments;
// }

// export function calculateMaxPaymentAmount(invoices: Invoice[]): number {
//   return invoices.reduce(
//     (sum, invoice) => sum + calculateRemainingAmount(invoice),
//     0
//   );
// }
interface PaymentAmountProps {
  form: UseFormReturn<PaymentFormValues>;
  invoices: any[];
  selectedInvoices: string[];
}

export function PaymentAmount({
  form,
  invoices,
  selectedInvoices
}: PaymentAmountProps) {
  const selectedInvoiceDetails = invoices.filter((inv) =>
    selectedInvoices.includes(inv.id)
  );
  const maxAmount = calculateMaxPaymentAmount(selectedInvoiceDetails);
  const distributedPayments = distributePayment(
    form.watch('amount') || 0,
    selectedInvoiceDetails
  );

  return (
    <>
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Amount</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={maxAmount}
                {...field}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value > maxAmount) {
                    field.onChange(maxAmount);
                  } else {
                    field.onChange(value);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Card>
        <CardContent className="pt-6">
          <h4 className="mb-4 font-medium">Payment Distribution</h4>
          <div className="space-y-2">
            {selectedInvoiceDetails.map((invoice) => {
              const payment = distributedPayments.find(
                (p) => p.invoiceId === invoice.id
              );
              const remainingAmount = calculateRemainingAmount(invoice);

              return (
                <div key={invoice.id} className="flex justify-between text-sm">
                  <span>Invoice #{invoice.number}</span>
                  <div className="text-right">
                    <p>{payment ? formatCurrency(payment.amount) : '$0.00'}</p>
                    <p className="text-muted-foreground text-xs">
                      of {formatCurrency(remainingAmount)} remaining
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-medium">
              <span>Total Payment</span>
              <span>{formatCurrency(form.watch('amount') || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
