import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EstimateStatus } from '@/lib/generated/prisma/client';

interface EstimateStatsProps {
  stats: {
    totalEstimates: number;
    totalAmount: number;
    conversionRate: number;
    statusBreakdown: Record<EstimateStatus, number>;
  };
}

export const EstimateStats = memo(function EstimateStats({
  stats
}: EstimateStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-pink-50 px-4 py-2">
          <h3 className="text-sm font-medium text-pink-700">Total Estimates</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-700">
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
                <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
                <circle cx="18" cy="18" r="3" />
                <path d="M18 15v1.5" />
                <path d="M18 19.5V21" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalEstimates}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Active:{' '}
                <span className="font-medium">
                  {stats.statusBreakdown[EstimateStatus.SENT] || 0}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-blue-50 px-4 py-2">
          <h3 className="text-sm font-medium text-blue-700">Total Value</h3>
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
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totalAmount.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">Across all estimates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-green-50 px-4 py-2">
          <h3 className="text-sm font-medium text-green-700">
            Conversion Rate
          </h3>
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
                {stats.conversionRate.toFixed(1)}%
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Converted to invoices
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${stats.conversionRate}%` }}
               />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
          <h3 className="text-sm font-medium text-gray-700">
            Status Breakdown
          </h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Accepted:
                </span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {stats.statusBreakdown[EstimateStatus.ACCEPTED] || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-gray-700">
                  Rejected:
                </span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {stats.statusBreakdown[EstimateStatus.REJECTED] || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  Draft:
                </span>
              </div>
              <span className="text-sm font-bold text-yellow-600">
                {stats.statusBreakdown[EstimateStatus.DRAFT] || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-gray-700">Sent:</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {stats.statusBreakdown[EstimateStatus.SENT] || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
