import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefundStatus } from '@/lib/generated/prisma/client';

interface RefundReceiptStatsProps {
  stats: {
    totalRefunds: number;
    totals: {
      subtotal: number;
      tax: number;
      total: number;
    };
    statusBreakdown: Record<RefundStatus, { count: number; amount: number }>;
  };
}

export const RefundReceiptStats = memo(function RefundReceiptStats({
  stats
}: RefundReceiptStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-violet-50 px-4 py-2">
          <h3 className="text-sm font-medium text-violet-700">Total Refunds</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
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
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
                <line x1="17" y1="2" x2="7" y2="12" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totals.total.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Count: <span className="font-medium">{stats.totalRefunds}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-amber-50 px-4 py-2">
          <h3 className="text-sm font-medium text-amber-700">Pending Refunds</h3>
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
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.statusBreakdown[RefundStatus.PENDING]?.amount.toFixed(2) || '0.00'}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Count: <span className="font-medium">{stats.statusBreakdown[RefundStatus.PENDING]?.count || 0}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-green-50 px-4 py-2">
          <h3 className="text-sm font-medium text-green-700">Processed Refunds</h3>
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.statusBreakdown[RefundStatus.PROCESSED]?.amount.toFixed(2) || '0.00'}
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
                {stats.statusBreakdown[RefundStatus.PENDING]?.count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">Processed:</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {stats.statusBreakdown[RefundStatus.PROCESSED]?.count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-gray-700">Rejected:</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {stats.statusBreakdown[RefundStatus.REJECTED]?.count || 0}
              </span>
            </div>

            <div className="mt-2 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Processing Rate</span>
                <span className="text-xs font-medium text-gray-900">
                  {stats.totalRefunds > 0
                    ? Math.round(((stats.statusBreakdown[RefundStatus.PROCESSED]?.count || 0) / stats.totalRefunds) * 100)
                    : 0}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${
                      stats.totalRefunds > 0
                        ? Math.round(((stats.statusBreakdown[RefundStatus.PROCESSED]?.count || 0) / stats.totalRefunds) * 100)
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
