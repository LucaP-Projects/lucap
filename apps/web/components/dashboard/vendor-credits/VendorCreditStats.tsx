'use client';

import { DollarSign, FileText, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface VendorCreditStatsData {
  totalCredits: number;
  totalAmount: number;
  statusBreakdown: Record<string, { count: number; amount: number }>;
}

export function VendorCreditStats({ stats }: { stats: VendorCreditStatsData | null }) {
  if (!stats) return null;

  const statsCards = [
    {
      title: 'Total Credits',
      value: formatCurrency(stats.totalAmount),
      icon: TrendingDown,
      description: `${stats.totalCredits} credit(s)`,
    },
    {
      title: 'Open Credits',
      value: formatCurrency(stats.statusBreakdown?.OPEN?.amount || 0),
      icon: FileText,
      description: `${stats.statusBreakdown?.OPEN?.count || 0} open`,
    },
    {
      title: 'Partially Applied',
      value: formatCurrency(stats.statusBreakdown?.PARTIALLY_APPLIED?.amount || 0),
      icon: FileText,
      description: `${stats.statusBreakdown?.PARTIALLY_APPLIED?.count || 0} pending`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statsCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-muted-foreground text-xs">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}