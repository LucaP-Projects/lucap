import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditStatus } from '@/lib/generated/prisma/client';

interface DelayedCreditStatsProps {
  stats: {
    totalCredits: number;
    totals: {
      subtotal: number;
      tax: number;
      total: number;
    };
    statusBreakdown: Record<CreditStatus, { count: number; amount: number }>;
    pendingAmount: number;
  };
}

export const DelayedCreditStats = memo(function DelayedCreditStats({
  stats
}: DelayedCreditStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-orange-50 px-4 py-2">
          <h3 className="text-sm font-medium text-orange-700">Total Credits</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
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
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totals.total.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Count: <span className="font-medium">{stats.totalCredits}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-amber-50 px-4 py-2">
          <h3 className="text-sm font-medium text-amber-700">Pending Credits</h3>
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
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.pendingAmount.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Count: <span className="font-medium">{stats.statusBreakdown[CreditStatus.PENDING]?.count || 0}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-green-50 px-4 py-2">
          <h3 className="text-sm font-medium text-green-700">Applied Credits</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.statusBreakdown[CreditStatus.CREDITED]?.amount.toFixed(2) || '0.00'}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Tax: <span className="font-medium">${stats.totals.tax.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
          <h3 className="text-sm font-medium text-gray-700">Status Breakdown</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-gray-700">Pending:</span>
              </div>
              <span className="text-sm font-bold text-amber-600">
                ${stats.statusBreakdown[CreditStatus.PENDING]?.amount.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">Credited:</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                ${stats.statusBreakdown[CreditStatus.CREDITED]?.amount.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-gray-700">Canceled:</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                ${stats.statusBreakdown[CreditStatus.CANCELED]?.amount.toFixed(2) || '0.00'}
              </span>
            </div>

            <div className="mt-2 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Application Rate</span>
                <span className="text-xs font-medium text-gray-900">
                  {stats.totalCredits > 0
                    ? Math.round(((stats.statusBreakdown[CreditStatus.CREDITED]?.count || 0) / stats.totalCredits) * 100)
                    : 0}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${
                      stats.totalCredits > 0
                        ? Math.round(((stats.statusBreakdown[CreditStatus.CREDITED]?.count || 0) / stats.totalCredits) * 100)
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
