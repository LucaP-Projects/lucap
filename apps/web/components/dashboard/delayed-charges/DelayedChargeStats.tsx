import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChargeStatus } from '@/lib/generated/prisma/client';

interface DelayedChargeStatsProps {
  stats: {
    totalCharges: number;
    totals: {
      subtotal: number;
      tax: number;
      total: number;
    };
    statusBreakdown: Record<ChargeStatus, { count: number; amount: number }>;
    pendingAmount: number;
  };
}

export const DelayedChargeStats = memo(function DelayedChargeStats({
  stats
}: DelayedChargeStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-teal-50 px-4 py-2">
          <h3 className="text-sm font-medium text-teal-700">Total Charges</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
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
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 15h0M7 11h0M7 7h0M15 15h2M15 11h2M15 7h2" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totals.total.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Count: <span className="font-medium">{stats.totalCharges}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-yellow-50 px-4 py-2">
          <h3 className="text-sm font-medium text-yellow-700">Pending Charges</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
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
                Count: <span className="font-medium">{stats.statusBreakdown[ChargeStatus.PENDING]?.count || 0}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-indigo-50 px-4 py-2">
          <h3 className="text-sm font-medium text-indigo-700">Tax Amount</h3>
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
                <path d="M4 10h12" />
                <path d="M4 14h9" />
                <path d="M4 18h6" />
                <path d="M18 13V6l3 3-3 3z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totals.tax.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Subtotal: <span className="font-medium">${stats.totals.subtotal.toFixed(2)}</span>
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
                <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Pending:</span>
              </div>
              <span className="text-sm font-bold text-yellow-600">
                ${stats.statusBreakdown[ChargeStatus.PENDING]?.amount.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">Invoiced:</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                ${stats.statusBreakdown[ChargeStatus.INVOICED]?.amount.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-gray-700">Canceled:</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                ${stats.statusBreakdown[ChargeStatus.CANCELED]?.amount.toFixed(2) || '0.00'}
              </span>
            </div>

            <div className="mt-2 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Conversion Rate</span>
                <span className="text-xs font-medium text-gray-900">
                  {stats.totalCharges > 0
                    ? Math.round(((stats.statusBreakdown[ChargeStatus.INVOICED]?.count || 0) / stats.totalCharges) * 100)
                    : 0}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${
                      stats.totalCharges > 0
                        ? Math.round(((stats.statusBreakdown[ChargeStatus.INVOICED]?.count || 0) / stats.totalCharges) * 100)
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
