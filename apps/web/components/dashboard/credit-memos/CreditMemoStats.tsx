import { memo } from 'react';
import { CreditMemoStatus } from '@/lib/generated/prisma/client';
import { Card, CardContent } from '@/components/ui/card';

interface CreditMemoStatsProps {
  stats: {
    totalCreditMemos: number;
    totalAmount: number;
    statusBreakdown: Record<CreditMemoStatus, number>;
  };
}

export const CreditMemoStats = memo(function CreditMemoStats({
  stats
}: CreditMemoStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-purple-50 px-4 py-2">
          <h3 className="text-sm font-medium text-purple-700">
            Total Credit Memos
          </h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalCreditMemos}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Active:{' '}
                <span className="font-medium">
                  {stats.statusBreakdown[CreditMemoStatus.ISSUED] || 0}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-green-50 px-4 py-2">
          <h3 className="text-sm font-medium text-green-700">Total Credits</h3>
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
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totalAmount.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Across all credit memos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-blue-50 px-4 py-2">
          <h3 className="text-sm font-medium text-blue-700">Applied Credits</h3>
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.statusBreakdown[CreditMemoStatus.APPLIED] || 0}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Credits used on invoices
              </p>
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
                <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  Draft:
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {stats.statusBreakdown[CreditMemoStatus.DRAFT] || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Issued:
                </span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {stats.statusBreakdown[CreditMemoStatus.ISSUED] || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-gray-700">Void:</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {stats.statusBreakdown[CreditMemoStatus.VOID] || 0}
              </span>
            </div>

            <div className="mt-2 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Applied Rate
                </span>
                <span className="text-xs font-medium text-gray-900">
                  {stats.totalCreditMemos > 0
                    ? Math.round(
                        ((stats.statusBreakdown[CreditMemoStatus.APPLIED] ||
                          0) /
                          stats.totalCreditMemos) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${
                      stats.totalCreditMemos > 0
                        ? Math.round(
                            ((stats.statusBreakdown[CreditMemoStatus.APPLIED] ||
                              0) /
                              stats.totalCreditMemos) *
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
