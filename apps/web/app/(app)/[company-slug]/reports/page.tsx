'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Star, 
  Search, 
  MoreVertical, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ReportBase {
  title: string;
  slug: string;
  isFavorite?: boolean;
}

interface ReportCategory {
  title: string;
  reports: ReportBase[];
}

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    title: 'Business Overview',
    reports: [
      { title: 'Audit Log', slug: 'audit-log' },
      { title: 'Balance Sheet', slug: 'balance-sheet', isFavorite: true },
      { title: 'Balance Sheet Comparison', slug: 'balance-sheet-comparison' },
      { title: 'Balance Sheet Detail', slug: 'balance-sheet-detail' },
      { title: 'Balance Sheet Summary', slug: 'balance-sheet-summary' },
      { title: 'Statement of Cash Flows', slug: 'cash-flow' },
      { title: 'Business Snapshot', slug: 'snapshot' },
      { title: 'Profit and Loss', slug: 'profit-loss', isFavorite: true },
      { title: 'Profit and Loss by Customer', slug: 'profit-loss-customer' },
      { title: 'Profit and Loss by Month', slug: 'profit-loss-month' },
      { title: 'Profit and Loss by Tag Group', slug: 'profit-loss-tag' },
      { title: 'Profit and Loss Comparison', slug: 'profit-loss-comparison' },
      { title: 'Profit and Loss Detail', slug: 'profit-loss-detail' },
      { title: 'Profit and Loss % of total income', slug: 'profit-loss-percent' },
      { title: 'Profit and Loss YTD comparison', slug: 'profit-loss-ytd' },
      { title: 'Project Profitability Summary', slug: 'project-profitability' },
      { title: 'Quarterly Profit and Loss Summary', slug: 'quarterly-profit-loss' },
    ]
  },
  {
    title: 'Who Owes You',
    reports: [
      { title: 'Accounts receivable aging summary', slug: 'ar-aging-summary', isFavorite: true },
      { title: 'Accounts receivable aging detail', slug: 'ar-aging-detail' },
      { title: 'Collections Report', slug: 'collections' },
      { title: 'Customer Balance Summary', slug: 'customer-balance-summary' },
      { title: 'Customer Balance Detail', slug: 'customer-balance-detail' },
      { title: 'Invoice List', slug: 'invoices' },
      { title: 'Invoices and Received Payments', slug: 'invoices-payments' },
      { title: 'Open Invoices', slug: 'open-invoices' },
      { title: 'Statement List', slug: 'statements' },
      { title: 'Terms List', slug: 'terms' },
      { title: 'Unbilled charges', slug: 'unbilled-charges' },
      { title: 'Unbilled time', slug: 'unbilled-time' },
    ]
  },
  {
    title: 'Sales and customers',
    reports: [
      { title: 'Sales by Customer Type Detail', slug: 'sales-customer-type' },
      { title: 'Estimates & Progress Invoicing Summary by Customer', slug: 'estimates-progress' },
      { title: 'Customer Contact List', slug: 'customer-contacts' },
      { title: 'Income by Customer Summary', slug: 'income-customer-summary' },
      { title: 'Customer Phone List', slug: 'customer-phones' },
      { title: 'Sales by Customer Summary', slug: 'sales-customer-summary' },
      { title: 'Sales by Customer Detail', slug: 'sales-customer-detail' },
      { title: 'Deposit Detail', slug: 'deposits' },
      { title: 'Estimates by Customer', slug: 'estimates-customer' },
      { title: 'Product/Service List', slug: 'product-service-list' },
      { title: 'Sales by Product/Service Summary', slug: 'sales-product-summary' },
      { title: 'Sales by Product/Service Detail', slug: 'sales-product-detail' },
      { title: 'Payment Method List', slug: 'payment-methods' },
      { title: 'Time Activities by Customer Detail', slug: 'time-activities-customer' },
      { title: 'Transaction List by Customer', slug: 'transactions-customer' },
      { title: 'Transaction List by Tag Group', slug: 'transactions-tag' },
    ]
  },
  {
    title: 'Inventory',
    reports: [
      { title: 'Inventory Valuation Detail', slug: 'inventory-valuation-detail' },
      { title: 'Inventory Valuation Summary', slug: 'inventory-valuation-summary' },
      { title: 'Open Purchase Order Detail', slug: 'open-po-detail' },
      { title: 'Open Purchase Order List', slug: 'open-po-list' },
      { title: 'Physical Inventory Worksheet', slug: 'inventory-worksheet' },
    ]
  }
];

export default function ReportsPage() {
  const { 'company-slug': companySlug } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Business Overview', 'Favorites', 'Custom report builder']);

  const toggleCategory = (title: string) => {
    setExpandedCategories(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const favoriteReports = REPORT_CATEGORIES.flatMap(cat => cat.reports).filter(r => r.isFavorite);

  const filteredCategories = REPORT_CATEGORIES.map(cat => ({
    ...cat,
    reports: cat.reports.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.reports.length > 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline">Management reports</Button>
          <Button variant="outline">Custom reports</Button>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          className="pl-10 h-10 bg-white" 
          placeholder="Find report by name" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {/* Favorites */}
        {!searchQuery && (
          <CollapsibleSection 
            title="Favorites" 
            isOpen={expandedCategories.includes('Favorites')}
            onToggle={() => toggleCategory('Favorites')}
          >
            <div className="divide-y border rounded-lg bg-white overflow-hidden shadow-sm">
              {favoriteReports.map((report) => (
                <ReportRow key={report.slug} report={report} companySlug={companySlug as string} />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Custom report builder */}
        {!searchQuery && (
          <CollapsibleSection 
            title="Custom report builder" 
            isOpen={expandedCategories.includes('Custom report builder')}
            onToggle={() => toggleCategory('Custom report builder')}
          >
            <Card className="border shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Check out a new way to build and view reports in LucaP. Customize these popular reports or start from scratch with {' '}
                  <Link href={`/${companySlug}/reports/builder`} className="text-blue-600 hover:underline">
                    Create new report
                  </Link>
                </p>
                <div className="divide-y border rounded-lg overflow-hidden">
                   <ReportRow 
                    report={{ title: 'Bill Approval Status', slug: 'bill-approval', isFavorite: false }} 
                    companySlug={companySlug as string} 
                  />
                  <ReportRow 
                    report={{ title: 'Product/Item Profitability by Customer', slug: 'profit-product-customer', isFavorite: false }} 
                    companySlug={companySlug as string} 
                  />
                  <ReportRow 
                    report={{ title: 'Invoice Approval Status', slug: 'invoice-approval', isFavorite: false }} 
                    companySlug={companySlug as string} 
                  />
                </div>
              </CardContent>
            </Card>
          </CollapsibleSection>
        )}

        {/* Categories */}
        {filteredCategories.map((cat) => (
          <CollapsibleSection 
            key={cat.title}
            title={cat.title} 
            isOpen={expandedCategories.includes(cat.title)}
            onToggle={() => toggleCategory(cat.title)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border rounded-lg bg-white p-2 shadow-sm">
              <div className="divide-y">
                {cat.reports.slice(0, Math.ceil(cat.reports.length / 2)).map((report) => (
                  <ReportRow key={report.slug} report={report} companySlug={companySlug as string} />
                ))}
              </div>
              <div className="divide-y">
                {cat.reports.slice(Math.ceil(cat.reports.length / 2)).map((report) => (
                  <ReportRow key={report.slug} report={report} companySlug={companySlug as string} />
                ))}
              </div>
            </div>
          </CollapsibleSection>
        ))}
      </div>
    </div>
  );
}

function CollapsibleSection({ title, isOpen, onToggle, children }: { title: string, isOpen: boolean, onToggle: () => void, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <button 
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors uppercase tracking-wider"
      >
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        {title}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

function ReportRow({ report, companySlug }: { report: ReportBase, companySlug: string }) {
  return (
    <div className="group flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
      <Link 
        href={`/${companySlug}/reports/${report.slug}`}
        className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline flex-grow"
      >
        {report.title}
      </Link>
      <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <button className={cn("p-1.5 rounded-full hover:bg-gray-200 transition-colors", report.isFavorite ? "text-green-600 opacity-100" : "text-gray-400")}>
          <Star className={cn("h-4 w-4", report.isFavorite && "fill-current")} />
        </button>
        <button className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-400">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
