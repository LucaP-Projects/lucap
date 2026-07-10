'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  RefreshCcw,
  Printer,
  Mail,
  FileDown,
  Settings
} from 'lucide-react';
import { 
  getBalanceSheetData, 
  getProfitAndLossData,
  getARAgingSummaryData,
  getProfitAndLossByCustomerData,
  getCashFlowData,
  getAuditLogData,
  getSnapshotData,
  getInventoryValuationData,
  getTrialBalanceData,
  getGeneralLedgerData,
  getAPAgingSummaryData,
  getSalesByCustomerData,
  getSalesByProductData,
  getVendorBalanceData,
  getTaxSummaryData,
  getSalesByClassData,
  getSalesByDepartmentData,
  getTransactionListData,
  getTransactionListByCustomerData,
  getTransactionListByVendorData,
  getReportFilters
} from '@/app/(app)/[company-slug]/reports/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CustomizeReportModal, CustomizeReportSettings } from './customize-report-modal';

interface ReportRow {
  id: string;
  label: string;
  amount?: number;
  isHeader?: boolean;
  isTotal?: boolean;
  children?: ReportRow[];
  level: number;
}

export function ReportViewer({ 
  title, 
  companyName, 
  companySlug,
  reportType = 'balance-sheet'
}: { 
  title: string, 
  companyName: string, 
  companySlug: string,
  reportType?: string
}) {
  const [reportPeriod, setReportPeriod] = useState('This year to date');
  const [accountingMethod, setAccountingMethod] = useState<'Accrual' | 'Cash'>('Accrual');
  const [data, setData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<string[]>(['assets', 'liabilities-equity', 'liabilities', 'equity', 'operating', 'investing', 'financing', 'ar-summary', 'pnl-customer', 'audit-log', 'snapshot', 'inventory-valuation', 'income', 'expenses', 'other-income', 'other-expenses']);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{ accounts: { id: string; label: string }[]; customers: { id: string; label: string }[] }>({ accounts: [], customers: [] });
  const [settings, setSettings] = useState<CustomizeReportSettings>({
    filters: [],
    divideBy1000: false,
    showCurrency: true,
    negativeNumbers: '-100',
    showRed: false,
    decimals: 2,
    showRows: 'active',
    showColumns: 'active',
    sectionTitles: {
      'Assets': 'Assets',
      'Current Assets': 'Current Assets',
      'Bank Accounts': 'Bank Accounts',
      'Accounts Receivable': 'Accounts Receivable',
      'Other Current Assets': 'Other Current Assets',
      'Fixed Assets': 'Fixed Assets',
      'Other Assets': 'Other Assets',
      'Liabilities and Equity': 'Liabilities and Equity',
      'Liabilities': 'Liabilities',
      'Current Liabilities': 'Current Liabilities',
      'Accounts Payable': 'Accounts Payable',
      'Credit Cards': 'Credit Cards',
      'Other Current Liabilities': 'Other Current Liabilities',
      'Income': 'Income',
      'Expenses': 'Expenses',
    },
    header: {
      logo: false,
      period: true,
      name: true,
      alignment: 'center',
      layout: 'name-first',
    },
    footer: {
      date: true,
      time: true,
      basis: true,
      alignment: 'center',
    },
    bandedRows: false,
    showTotal: true,
    emptyCellDisplay: 'blank',
    borders: 'default',
  });

  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const options = await getReportFilters();
        setFilterOptions(options);
      } catch (err) {
        console.error("Failed to load options", err);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let result: ReportRow[] = [];
        const currentToDate = toDate ? new Date(toDate) : new Date();
        const currentFromDate = fromDate ? new Date(fromDate) : new Date(new Date().getFullYear(), 0, 1);

        if (reportType === 'balance-sheet') {
          result = await getBalanceSheetData(currentToDate, accountingMethod, settings);
        } else if (reportType === 'profit-loss') {
          result = await getProfitAndLossData(currentFromDate, currentToDate, settings);
        } else if (reportType === 'ar-aging-summary') {
          result = await getARAgingSummaryData(currentToDate, settings);
        } else if (reportType === 'profit-loss-customer') {
          result = await getProfitAndLossByCustomerData(currentFromDate, currentToDate, settings);
        } else if (reportType === 'cash-flow') {
          result = await getCashFlowData(currentFromDate, currentToDate, settings);
        } else if (reportType === 'audit-log') {
          result = await getAuditLogData();
        } else if (reportType === 'snapshot') {
          result = await getSnapshotData();
        } else if (reportType === 'inventory-valuation-summary') {
          result = await getInventoryValuationData();
        } else if (reportType === 'trial-balance') {
          result = await getTrialBalanceData(currentToDate, settings);
        } else if (reportType === 'general-ledger') {
          result = await getGeneralLedgerData(currentFromDate, currentToDate, settings);
        } else if (reportType === 'ap-aging-summary') {
          result = await getAPAgingSummaryData(currentToDate, settings);
        } else if (reportType === 'sales-customer-summary') {
          result = await getSalesByCustomerData(currentFromDate, currentToDate, settings);
        } else if (reportType === 'sales-product-summary') {
          result = await getSalesByProductData(currentFromDate, currentToDate, settings);
        } else if (reportType === 'vendor-balance-summary') {
          result = await getVendorBalanceData(settings);
        } else if (reportType === 'tax-summary') {
          result = await getTaxSummaryData(currentFromDate, currentToDate);
        } else if (reportType === 'sales-class-summary') {
          result = await getSalesByClassData(currentFromDate, currentToDate);
        } else if (reportType === 'sales-dept-summary') {
          result = await getSalesByDepartmentData(currentFromDate, currentToDate);
        } else if (reportType === 'transaction-list') {
          result = await getTransactionListData(currentFromDate, currentToDate);
        } else if (reportType === 'transactions-customer') {
          result = await getTransactionListByCustomerData(currentFromDate, currentToDate);
        } else if (reportType === 'transactions-vendor') {
          result = await getTransactionListByVendorData(currentFromDate, currentToDate);
        }
        setData(result);
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reportType, accountingMethod, toDate, fromDate, settings]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const formatAmount = (amount?: number) => {
    if (amount === undefined) return "";
    
    let value = amount;
    if (settings.divideBy1000) value /= 1000;
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: settings.showCurrency ? 'currency' : 'decimal',
      currency: 'USD',
      minimumFractionDigits: settings.decimals,
      maximumFractionDigits: settings.decimals,
    }).format(Math.abs(value));

    if (value < 0) {
      if (settings.negativeNumbers === '(100)') {
        return `(${formatted})`;
      }
      return `-${formatted}`;
    }
    
    return formatted;
  };

  const renderRow = (row: ReportRow) => {
    const isExpanded = expandedRows.includes(row.id);
    const hasChildren = row.children && row.children.length > 0;

    return (
      <React.Fragment key={row.id}>
        <tr 
          className={cn(
            "group hover:bg-gray-50/50 transition-colors border-b last:border-0 h-9",
            row.isHeader && "bg-transparent",
            row.isTotal && "font-semibold bg-gray-50/30",
            settings.bandedRows && row.level % 2 === 0 && "bg-blue-50/5"
          )}
        >
          <td className="py-1 px-4 text-sm" style={{ paddingLeft: `${row.level * 20 + 16}px` }}>
            <div className="flex items-center gap-1">
              {hasChildren ? (
                <button onClick={() => toggleRow(row.id)} className="p-0.5 hover:bg-gray-200 rounded">
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <span className={cn(row.isHeader && "font-bold", row.isTotal && "font-semibold uppercase text-[11px] text-gray-500 tracking-wider")}>
                {settings.sectionTitles[row.label] || row.label}
              </span>
            </div>
          </td>
          <td className={cn(
            "py-1 px-4 text-sm text-right tabular-nums",
            row.amount !== undefined && row.amount < 0 && settings.showRed && "text-red-500"
          )}>
            {row.amount !== undefined ? (
              <span className={cn(row.isTotal && "border-t border-gray-900 pt-0.5")}>
                {formatAmount(row.amount)}
              </span>
            ) : (settings.emptyCellDisplay === 'dash' ? '-' : null)}
          </td>
        </tr>
        {isExpanded && row.children?.map(child => renderRow(child))}
      </React.Fragment>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Filter Bar */}
      <div className="border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
           <Link 
            href={`/${companySlug}/reports`}
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to standard reports
          </Link>
          
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-gray-500">Report period</label>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="This week">This week</SelectItem>
                <SelectItem value="This month">This month</SelectItem>
                <SelectItem value="This year to date">This year to date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-500">From</label>
              <Input 
                type="date" 
                className="h-8 text-xs w-[120px]" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-500">To</label>
              <Input 
                type="date" 
                className="h-8 text-xs w-[120px]" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-gray-500">Accounting method</label>
            <div className="flex border rounded overflow-hidden">
               <button 
                onClick={() => setAccountingMethod('Cash')}
                className={cn("px-3 h-8 text-xs font-medium transition-colors border-r hover:bg-gray-100", 
                  accountingMethod === 'Cash' ? "bg-white text-navy font-bold" : "bg-gray-50 text-gray-500")}
              >
                Cash
              </button>
              <button 
                onClick={() => setAccountingMethod('Accrual')}
                className={cn("px-3 h-8 text-xs font-medium transition-colors hover:bg-gray-100", 
                  accountingMethod === 'Accrual' ? "bg-white text-navy font-bold" : "bg-gray-50 text-gray-500")}
              >
                Accrual
              </button>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 pb-0.5">
            <Button 
              variant="outline" 
              className="h-8 px-3 text-xs border-green-600 text-green-700 hover:bg-green-50"
              onClick={() => setIsCustomizeModalOpen(true)}
            >
              Customize
            </Button>
            <Button className="h-8 px-3 text-xs bg-green-700 hover:bg-green-800 text-white border-0">
              Save As
            </Button>
          </div>
        </div>
      </div>

      <CustomizeReportModal 
        isOpen={isCustomizeModalOpen} 
        onClose={() => setIsCustomizeModalOpen(false)}
        onSave={(newSettings) => {
          setSettings(newSettings);
          setIsCustomizeModalOpen(false);
        }}
        initialSettings={settings}
        filterOptions={filterOptions}
      />

      {/* Main Report Area */}
      <div className="flex-1 bg-gray-100/50 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-[1000px] border relative">
          
          {/* Action Icons */}
          <div className="absolute top-4 right-4 flex items-center gap-4 text-gray-400">
             <button className="hover:text-gray-600 transition-colors"><RefreshCcw className="h-4 w-4" /></button>
             <button className="hover:text-gray-600 transition-colors"><Printer className="h-4 w-4" /></button>
             <button className="hover:text-gray-600 transition-colors"><Mail className="h-4 w-4" /></button>
             <button className="hover:text-gray-600 transition-colors"><FileDown className="h-4 w-4" /></button>
             <button className="hover:text-gray-600 transition-colors"><Settings className="h-4 w-4" /></button>
             <Separator orientation="vertical" className="h-4" />
             <div className="flex items-center gap-0.5 text-[10px] font-bold">
               Compact | 100% <ChevronDown className="h-2.5 w-2.5 ml-1" />
             </div>
          </div>

          {/* Report Header */}
          <div className={cn(
            "py-10 space-y-1 border-b px-10",
            settings.header.alignment === 'center' && "text-center",
            settings.header.alignment === 'left' && "text-left",
            settings.header.alignment === 'right' && "text-right"
          )}>
            {settings.header.layout === 'name-first' ? (
              <>
                {settings.header.name && <h2 className="text-xl font-bold font-serif text-gray-900">{companyName}</h2>}
                <h3 className="text-sm font-bold text-gray-600">{title}</h3>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-gray-600">{title}</h3>
                {settings.header.name && <h2 className="text-xl font-bold font-serif text-gray-900">{companyName}</h2>}
              </>
            )}
            
            {settings.header.period && (
              reportType === 'balance-sheet' || reportType === 'ar-aging-summary' ? (
                <p className="text-xs text-gray-500">As of {toDate ? new Date(toDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              ) : (
                <p className="text-xs text-gray-500">
                  {fromDate ? new Date(fromDate).toLocaleDateString() : new Date(new Date().getFullYear(), 0, 1).toLocaleDateString()} - 
                  {toDate ? new Date(toDate).toLocaleDateString() : new Date().toLocaleDateString()}
                </p>
              )
            )}
          </div>

          {/* Report Table */}
          <table className={cn(
            "w-full border-collapse",
            settings.borders === 'none' && "border-0",
            settings.borders === 'compact' && "scale-95 origin-top"
          )}>
            <thead>
              <tr className="border-b divide-x text-[10px] font-bold uppercase text-gray-500 bg-gray-50/50">
                <th className="py-2 px-4 text-left w-2/3" />
                <th className="py-2 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={2} className="py-20 text-center text-gray-400">
                    <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    <p className="text-xs font-semibold">Generating {title}...</p>
                    <p className="text-[10px]">Processing journal entries for {companyName}</p>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map(row => renderRow(row))
              ) : (
                <tr>
                  <td colSpan={2} className="py-20 text-center text-gray-400">
                    <p className="text-sm italic">No journal entries found for this report period.</p>
                  </td>
                </tr>
              )}
            </tbody>
            {settings.showTotal && (
              <tfoot>
                <tr className="border-t-2 border-double border-gray-900">
                  <td className="py-4 px-4 text-sm font-bold">
                    {reportType === 'balance-sheet' ? (settings.sectionTitles['TOTAL ASSETS'] || 'TOTAL ASSETS') : (settings.sectionTitles['NET INCOME'] || 'NET INCOME')}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-right tabular-nums">
                    {loading ? '...' : (
                      reportType === 'balance-sheet' 
                        ? formatAmount(data.find(r => r.id === 'assets')?.children?.find(c => c.id === 'total-assets')?.amount)
                        : formatAmount(data.find(r => r.id === 'net-income')?.amount)
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
          
          <div className={cn(
            "p-8 text-[10px] text-gray-400 italic",
            settings.footer.alignment === 'center' && "text-center",
            settings.footer.alignment === 'left' && "text-left",
            settings.footer.alignment === 'right' && "text-right"
          )}>
            {settings.footer.basis && `${accountingMethod} Basis `}
            {settings.footer.date && new Date().toLocaleDateString()} {settings.footer.time && new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
