import { format } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, CreditCard, FileText } from 'lucide-react';
import { getPaymentDetails } from '@/components/dashboard/payments/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface PaymentDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentDetailsPage({
  params
}: PaymentDetailsPageProps) {
  const { id } = await params;
  const payment = await getPaymentDetails(id);

  if (!payment) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-x-4 border-b px-4 py-2">
        <Link href="/payments">
          <Button variant="ghost" size="sm" className="h-8 gap-x-1">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Payment #{payment.number}
          </h1>
          <p className="text-muted-foreground text-sm">
            Received from {payment.customer.displayName}
          </p>
        </div>
        <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Date</span>
                <span className="font-medium">
                  {format(payment.paymentDate, 'PPP')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">
                  {payment.paymentMethod.replace(/_/g, ' ')}
                </span>
              </div>
              {payment.reference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-medium">{payment.reference}</span>
                </div>
              )}
              {payment.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-amber-600">
                    -{formatCurrency(payment.discountAmount)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice #</span>
                <Link
                  href={`/invoices/${payment.invoice.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {payment.invoice.number}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Amount</span>
                <span className="font-medium">
                  {formatCurrency(payment.invoice.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Status</span>
                <span className="font-medium">{payment.invoice.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">
                  {payment.customer.displayName}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
