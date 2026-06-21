'use client';

import { Payment } from '@/lib/generated/prisma/client';
import { format } from 'date-fns';
import { Card, CardContent, Checkbox } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface InvoiceSelectionProps {
  invoices: any[];
  selectedInvoices: string[];
  onInvoiceSelect: (invoiceId: string, checked: boolean) => void;
}

export function InvoiceSelection({
  invoices,
  selectedInvoices,
  onInvoiceSelect
}: InvoiceSelectionProps) {
  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800">
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-semibold dark:text-gray-100">
          Select Invoices
        </h3>
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const paidAmount = invoice.payments.reduce(
              (sum: number, p: Payment) => sum + p.amount,
              0
            );
            const remainingAmount = invoice.amount - paidAmount;

            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedInvoices.includes(invoice.id)}
                    onCheckedChange={(checked) =>
                      onInvoiceSelect(invoice.id, checked as boolean)
                    }
                  />
                  <div>
                    <p className="font-medium dark:text-gray-100">
                      {invoice.number}
                    </p>
                    <p className="text-muted-foreground text-sm dark:text-gray-400">
                      Due: {format(new Date(invoice.dueDate), 'PP')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium dark:text-gray-100">
                    {formatCurrency(remainingAmount)}
                  </p>
                  <p className="text-muted-foreground text-sm dark:text-gray-400">
                    of {formatCurrency(invoice.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
