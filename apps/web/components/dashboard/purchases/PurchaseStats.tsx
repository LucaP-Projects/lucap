import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PurchaseStatsProps {
  stats: {
    totalPurchases: number;
    totalAmount: number;
    statusBreakdown: Record<string, { count: number; amount: number }>;
  };
}

export const PurchaseStats = memo(function PurchaseStats({ stats }: PurchaseStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
        <div className="border-b border-gray-100 bg-blue-50 px-4 py-2">
          <h3 className="text-sm font-medium text-blue-700">Total Purchases</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.totalAmount.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Count: <span className="font-medium">{stats.totalPurchases}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.entries(stats.statusBreakdown).map(([status, data]) => (
        <Card key={status} className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
          <div className="border-b border-gray-100 bg-amber-50 px-4 py-2">
            <h3 className="text-sm font-medium text-amber-700">{status.charAt(0) + status.slice(1).toLowerCase()}</h3>
          </div>
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  ${data.amount.toFixed(2)}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Count: <span className="font-medium">{data.count}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});