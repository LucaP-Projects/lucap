import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentStatus } from '@/lib/generated/prisma/client';

interface InvoiceStatsProps {
  stats: {
    totalInvoices: number;
    totalAmount: number;
    totalPaid: number;
    outstandingAmount: number;
    statusBreakdown: Record<PaymentStatus, { count: number; amount: number }>;
    estimateConversions: {
      count: number;
      rate: number;
    };
  };
}

export const InvoiceStats = memo(function InvoiceStats({
  stats
}: InvoiceStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-blue-50 px-4 py-2">
          <h3 className="text-sm font-medium text-blue-700">Total Invoiced</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-8c1-.5 2-1 2-2.5S20.5 5 19 5z" />
                <path d="M2 9v1c0 1.1.9 2 2 2h1" />
                <path d="M16 11h0" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totalAmount.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Count:{' '}
                <span className="font-medium">{stats.totalInvoices}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-amber-50 px-4 py-2">
          <h3 className="text-sm font-medium text-amber-700">
            Outstanding Balance
          </h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.outstandingAmount.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Paid:{' '}
                <span className="font-medium text-green-600">
                  ${stats.totalPaid.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-red-50 px-4 py-2">
          <h3 className="text-sm font-medium text-red-700">Overdue Invoices</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">
                $
                {stats.statusBreakdown[PaymentStatus.OVERDUE]?.amount.toFixed(
                  2
                ) || '0.00'}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Count:{' '}
                <span className="font-medium">
                  {stats.statusBreakdown[PaymentStatus.OVERDUE]?.count || 0}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-green-50 px-4 py-2">
          <h3 className="text-sm font-medium text-green-700">Payment Status</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">Paid:</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                ${stats.totalPaid.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  Pending:
                </span>
              </div>
              <span className="text-sm font-bold text-yellow-600">
                ${stats.outstandingAmount.toFixed(2)}
              </span>
            </div>

            <div className="mt-2 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Collection Rate
                </span>
                <span className="text-xs font-medium text-gray-900">
                  {stats.totalAmount > 0
                    ? Math.round((stats.totalPaid / stats.totalAmount) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${
                      stats.totalAmount > 0
                        ? Math.round(
                            (stats.totalPaid / stats.totalAmount) * 100
                          )
                        : 0
                    }%`
                  }}
                 />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
