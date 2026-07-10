import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface BillPaymentStatsProps {
  stats: { totalPayments: number; totalAmount: number; paymentCount: number };
}

export const BillPaymentStats = memo(function BillPaymentStats({ stats }: BillPaymentStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
        <div className="border-b border-gray-100 bg-blue-50 px-4 py-2">
          <h3 className="text-sm font-medium text-blue-700">Total Paid</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="text-3xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</div>
          <p className="mt-1 text-sm text-gray-600">Across all vendors</p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
        <div className="border-b border-gray-100 bg-green-50 px-4 py-2">
          <h3 className="text-sm font-medium text-green-700">Payments Made</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="text-3xl font-bold text-gray-900">{stats.paymentCount}</div>
          <p className="mt-1 text-sm text-gray-600">Total transactions</p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
        <div className="border-b border-gray-100 bg-purple-50 px-4 py-2">
          <h3 className="text-sm font-medium text-purple-700">Avg Payment</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="text-3xl font-bold text-gray-900">
            {stats.paymentCount > 0 ? `$${(stats.totalAmount / stats.paymentCount).toFixed(2)}` : '$0.00'}
          </div>
          <p className="mt-1 text-sm text-gray-600">Per transaction</p>
        </CardContent>
      </Card>
    </div>
  );
});
