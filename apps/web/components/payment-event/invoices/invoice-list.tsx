'use client';

import React, { useState } from 'react';
import { Invoice, PaymentMethod } from '@/lib/generated/prisma/client';
import { useRouter } from 'next/navigation';
import { Badge, Receipt } from 'lucide-react';

import { processPayment } from './invoice-action';
import InvoicePaymentSheet from './invoice-payment-sheet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface InvoiceListProps {
  event: any;
  paymentStatusColorMap: Record<string, string>;
}
export interface PaymentFormData {
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  invoiceId: string;
}
const InvoicesList: React.FC<InvoiceListProps> = ({
  event,
  paymentStatusColorMap
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    // Only clear the selected invoice after the sheet closes
    setTimeout(() => setSelectedInvoice(null), 300);
  };

  const handlePaymentSubmit = async (paymentData: PaymentFormData) => {
    try {
      setLoading(true);
      // Pass the event path for revalidation
      await processPayment(paymentData, `/finance/payment-events/${event.id}`);
      toast.success('Payment processed successfully');
      handleSheetClose();
      router.refresh();
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabsContent value="invoices" className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            All invoices generated for this payment event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full sm:h-[600px]">
            <div className="space-y-4">
              {event.customerPaymentEvents.flatMap((mpe: any) =>
                mpe.invoices.map((invoice: Invoice) => (
                  <div
                    key={invoice.id}
                    onClick={() => handleInvoiceClick(invoice)}
                    className="flex cursor-pointer flex-col justify-between space-y-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:space-y-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{mpe.customer?.displayName}</p>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Receipt className="h-4 w-4 shrink-0" />
                        <span>Invoice #{invoice.id.slice(-6)}</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="min-w-[80px] text-center">
                        <Badge
                          className={paymentStatusColorMap[invoice.status]}
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedInvoice && (
        <InvoicePaymentSheet
          invoice={selectedInvoice}
          isOpen={isSheetOpen}
          onClose={handleSheetClose}
          onSubmitPayment={handlePaymentSubmit}
          isProcessing={loading}
        />
      )}
    </TabsContent>
  );
};

export default InvoicesList;
