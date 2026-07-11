import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface VendorStatsProps {
  stats: {
    totalVendors: number;
    activeVendors: number;
    totalBalance: number;
    totalBills: number;
  };
}

export const VendorStats = memo(function VendorStats({ stats }: VendorStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
        <div className="border-b border-gray-100 bg-blue-50 px-4 py-2">
          <h3 className="text-sm font-medium text-blue-700">Total Vendors</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900">{stats.totalVendors}</div>
            <p className="text-sm text-gray-600">Active: <span className="font-medium text-green-600">{stats.activeVendors}</span></p>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
        <div className="border-b border-gray-100 bg-amber-50 px-4 py-2">
          <h3 className="text-sm font-medium text-amber-700">Total Outstanding</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalBalance)}</div>
          <p className="mt-1 text-sm text-gray-600">Total owed to vendors</p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
        <div className="border-b border-gray-100 bg-green-50 px-4 py-2">
          <h3 className="text-sm font-medium text-green-700">Total Bills</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="text-3xl font-bold text-gray-900">{stats.totalBills}</div>
          <p className="mt-1 text-sm text-gray-600">Across all vendors</p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg py-0">
        <div className="border-b border-gray-100 bg-purple-50 px-4 py-2">
          <h3 className="text-sm font-medium text-purple-700">Avg per Vendor</h3>
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalVendors > 0 ? formatCurrency(stats.totalBalance / stats.totalVendors) : formatCurrency(0)}
          </div>
          <p className="mt-1 text-sm text-gray-600">Average balance</p>
        </CardContent>
      </Card>
    </div>
  );
});
