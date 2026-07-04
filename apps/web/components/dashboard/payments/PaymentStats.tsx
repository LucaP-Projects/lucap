import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentMethod } from '@/lib/generated/prisma/enums';

interface PaymentStatsProps {
  stats: {
    totalPayments: number;
    totalAmount: number;
    averagePayment: number;
    methodBreakdown: Record<PaymentMethod, { count: number; amount: number }>;
  };
}

const formatMethodLabel = (method: string) =>
  method
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');

export const PaymentStats = memo(function PaymentStats({
  stats
}: PaymentStatsProps) {
  const topMethod = (
    Object.entries(stats.methodBreakdown) as [
      PaymentMethod,
      { count: number; amount: number }
    ][]
  ).sort((a, b) => b[1].amount - a[1].amount)[0];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-emerald-50 px-4 py-2">
          <h3 className="text-sm font-medium text-emerald-700">
            Total Collected
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
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totalAmount.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Count: <span className="font-medium">{stats.totalPayments}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-blue-50 px-4 py-2">
          <h3 className="text-sm font-medium text-blue-700">
            Average Payment
          </h3>
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
                <path d="M3 3v18h18" />
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.averagePayment.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">Per payment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-amber-50 px-4 py-2">
          <h3 className="text-sm font-medium text-amber-700">
            Top Payment Method
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
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {topMethod && topMethod[1].count > 0
                  ? formatMethodLabel(topMethod[0])
                  : 'N/A'}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {topMethod ? `$${topMethod[1].amount.toFixed(2)}` : '$0.00'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
          <h3 className="text-sm font-medium text-gray-700">
            Method Breakdown
          </h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex flex-col space-y-2">
            {(
              Object.entries(stats.methodBreakdown) as [
                PaymentMethod,
                { count: number; amount: number }
              ][]
            )
              .filter(([, value]) => value.count > 0)
              .map(([method, value]) => (
                <div
                  key={method}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {formatMethodLabel(method)}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {value.count}
                  </span>
                </div>
              ))}
            {stats.totalPayments === 0 && (
              <span className="text-sm text-gray-500">No payments yet</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
