import { memo } from 'react';
import { ReceiptStatus } from '@/lib/generated/prisma/client';
import { Card, CardContent } from '@/components/ui/card';

interface SalesReceiptStatsProps {
  stats: {
    totalReceipts: number;
    totals: {
      subtotal: number;
      tax: number;
      total: number;
    };
    statusBreakdown: Record<ReceiptStatus, { count: number; amount: number }>;
    paymentMethods: Array<{
      method: string;
      count: number;
      amount: number;
    }>;
  };
}

export const SalesReceiptStats = memo(function SalesReceiptStats({
  stats
}: SalesReceiptStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-cyan-50 px-4 py-2">
          <h3 className="text-sm font-medium text-cyan-700">Total Sales</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
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
                <path d="M9 14V9h-6v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2z" />
                <path d="M21 9h-6v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9z" />
                <path d="M7 14h10" />
                <path d="M9 18v3" />
                <path d="M15 18v3" />
                <path d="M12 14v7" />
                <path d="M9 2v7" />
                <path d="M15 2v7" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totals.total.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Count:{' '}
                <span className="font-medium">{stats.totalReceipts}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-indigo-50 px-4 py-2">
          <h3 className="text-sm font-medium text-indigo-700">Tax Collected</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
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
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
                <path d="M7 14h.01" />
                <path d="M12 14h.01" />
                <path d="M17 14h.01" />
                <path d="M7 18h.01" />
                <path d="M12 18h.01" />
                <path d="M17 18h.01" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totals.tax.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Subtotal:{' '}
                <span className="font-medium">
                  ${stats.totals.subtotal.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-emerald-50 px-4 py-2">
          <h3 className="text-sm font-medium text-emerald-700">
            Top Payment Method
          </h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
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
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.paymentMethods[0]?.method?.replace(/_/g, ' ') || 'N/A'}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-medium">
                  {stats.paymentMethods[0]?.count || 0}
                </span>{' '}
                transactions
              </p>
            </div>
          </div>
          {stats.paymentMethods[0]?.amount > 0 && (
            <div className="mt-2 text-sm font-medium text-emerald-600">
              ${stats.paymentMethods[0]?.amount.toFixed(2)} collected
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
          <h3 className="text-sm font-medium text-gray-700">Status Overview</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Completed:
                </span>
              </div>
              <span className="text-sm font-bold text-green-600">
                $
                {stats.statusBreakdown[ReceiptStatus.COMPLETED]?.amount.toFixed(
                  2
                ) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-orange-500" />
                <span className="text-sm font-medium text-gray-700">
                  Refunded:
                </span>
              </div>
              <span className="text-sm font-bold text-orange-600">
                $
                {stats.statusBreakdown[ReceiptStatus.REFUNDED]?.amount.toFixed(
                  2
                ) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-gray-700">
                  Voided:
                </span>
              </div>
              <span className="text-sm font-bold text-red-600">
                $
                {stats.statusBreakdown[ReceiptStatus.VOIDED]?.amount.toFixed(
                  2
                ) || '0.00'}
              </span>
            </div>

            <div className="mt-2 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Completion Rate
                </span>
                <span className="text-xs font-medium text-gray-900">
                  {stats.totalReceipts > 0
                    ? Math.round(
                        ((stats.statusBreakdown[ReceiptStatus.COMPLETED]
                          ?.count || 0) /
                          stats.totalReceipts) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${
                      stats.totalReceipts > 0
                        ? Math.round(
                            ((stats.statusBreakdown[ReceiptStatus.COMPLETED]
                              ?.count || 0) /
                              stats.totalReceipts) *
                              100
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
