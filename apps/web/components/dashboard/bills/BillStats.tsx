import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface BillStatsProps {
  stats: {
    totalBills: number;
    totalAmount: number;
    totalPaid: number;
    outstandingAmount: number;
    overdueAmount: number;
  };
}

export const BillStats = memo(function BillStats({ stats }: BillStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
        <div className="border-b border-gray-100 bg-blue-50 px-4 py-2">
          <h3 className="text-sm font-medium text-blue-700">Total Billed</h3>
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
                Count: <span className="font-medium">{stats.totalBills}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
        <div className="border-b border-gray-100 bg-amber-50 px-4 py-2">
          <h3 className="text-sm font-medium text-amber-700">Outstanding</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.outstandingAmount.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Paid: <span className="font-medium text-green-600">${stats.totalPaid.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
        <div className="border-b border-gray-100 bg-red-50 px-4 py-2">
          <h3 className="text-sm font-medium text-red-700">Overdue</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">
                ${stats.overdueAmount.toFixed(2)}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Due & past due
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
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
              <span className="text-sm font-bold text-green-600">${stats.totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Outstanding:</span>
              </div>
              <span className="text-sm font-bold text-yellow-600">${stats.outstandingAmount.toFixed(2)}</span>
            </div>
            <div className="mt-2 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Paid %</span>
                <span className="text-xs font-medium text-gray-900">
                  {stats.totalAmount > 0 ? Math.round((stats.totalPaid / stats.totalAmount) * 100) : 0}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-green-500" style={{
                  width: `${stats.totalAmount > 0 ? Math.round((stats.totalPaid / stats.totalAmount) * 100) : 0}%`
                }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
