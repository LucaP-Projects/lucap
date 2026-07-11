"use server";

import { getSessionWithCompany } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ReportRow {
  id: string;
  label: string;
  amount?: number;
  isHeader?: boolean;
  isTotal?: boolean;
  children?: ReportRow[];
  level: number;
}

export interface ReportSettings {
  filters?: { type: 'account' | 'customer'; value: string }[];
  showRows?: 'all' | 'non-zero' | 'active';
  accountingMethod?: 'Accrual' | 'Cash';
  sectionTitles?: Record<string, string>;
}

/**
 * Fetches available filters (Accounts, Customers) for a company.
 */
export async function getReportFilters() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const [accounts, customers] = await Promise.all([
    prisma.account.findMany({
      where: { companyId, isActive: true },
      orderBy: { number: 'asc' },
      select: { id: true, title: true, number: true }
    }),
    prisma.customer.findMany({
      where: { companyId, isActive: true },
      orderBy: { displayName: 'asc' },
      select: { id: true, displayName: true, givenName: true, familyName: true }
    })
  ]);

  return {
    accounts: accounts.map(a => ({ id: a.id, label: `${a.number} ${a.title}` })),
    customers: customers.map(c => ({ id: c.id, label: c.displayName || `${c.givenName} ${c.familyName}` }))
  };
}

/**
 * Builds a common Prisma WHERE clause for journal entries based on settings.
 */
function buildJournalEntryWhere(companyId: string, settings?: ReportSettings, options: { startDate?: Date, endDate?: Date, method?: 'Accrual' | 'Cash' } = {}) {
  const where: any = {
    journalEntry: {
      companyId,
      isActive: true,
      ...(options.startDate || options.endDate ? {
        date: {
          ...(options.startDate ? { gte: options.startDate } : {}),
          ...(options.endDate ? { lte: options.endDate } : {})
        }
      } : {}),
      ...(options.method === 'Cash' ? { transactionType: 'PAYMENT' } : {}),
    }
  };

  // Apply filters from Customize modal (settings.filters)
  if (settings?.filters && Array.isArray(settings.filters)) {
    settings.filters.forEach((f) => {
      if (f.type === 'customer' && f.value) {
        where.journalEntry.customerId = f.value;
      }
      if (f.type === 'account' && f.value) {
        where.accountId = f.value;
      }
    });
  }

  return where;
}

export async function getBalanceSheetData(
  asOfDate: Date = new Date(),
  method: 'Accrual' | 'Cash' = 'Accrual',
  settings?: ReportSettings
) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  // 1. Fetch all accounts
  const allAccounts = await prisma.account.findMany({
    where: { 
      companyId,
      ...(settings?.showRows === 'active' ? { isActive: true } : {})
    },
    orderBy: { number: 'asc' }
  });

  // 2. Aggregate balances
  const where = buildJournalEntryWhere(companyId, settings, { endDate: asOfDate, method });
  const lineBalances = await prisma.journalEntryLine.groupBy({
    by: ['accountId'],
    where: where,
    _sum: { debit: true, credit: true }
  });

  const balanceMap = new Map<string, number>();
  lineBalances.forEach(lb => {
    balanceMap.set(lb.accountId, (lb._sum.debit || 0) - (lb._sum.credit || 0));
  });

  const getAccountBalance = (accountId: string): number => {
    let balance = balanceMap.get(accountId) || 0;
    const children = allAccounts.filter(a => a.parent_id === accountId);
    children.forEach(child => { balance += getAccountBalance(child.id); });
    return balance;
  };

  const buildTree = (accounts: { id: string, title: string, number: string }[], level: number = 0): ReportRow[] =>
    accounts.map(account => {
      const children = allAccounts.filter(a => a.parent_id === account.id);
      const totalBalance = getAccountBalance(account.id);
      
      const displayAmount = ['1', '40', '42', '43', '44', '7'].some(p => account.number.startsWith(p)) 
        ? -totalBalance 
        : totalBalance;

      if (settings?.showRows === 'non-zero' && totalBalance === 0) return null;

      return {
        id: account.id,
        label: account.title,
        amount: children.length === 0 ? displayAmount : undefined,
        isHeader: children.length > 0,
        level,
        children: children.length > 0 ? [
            ...buildTree(children, level + 1),
            { id: `total-${account.id}`, label: `Total for ${account.title}`, amount: displayAmount, isTotal: true, level: level + 1 }
        ].filter(Boolean) : undefined
      };
    }).filter(Boolean) as ReportRow[];

  // Groups
  const assetsAccounts = allAccounts.filter(a => !a.parent_id && ['2', '3', '41', '5'].some(p => a.number.startsWith(p)));
  const liabilitiesAccounts = allAccounts.filter(a => !a.parent_id && (a.number.startsWith('15') || a.number.startsWith('16') || a.number.startsWith('17') || a.number.startsWith('18') || a.number.startsWith('40') || a.number.startsWith('42') || a.number.startsWith('43') || a.number.startsWith('44')));
  const equityAccounts = allAccounts.filter(a => !a.parent_id && (a.number.startsWith('10') || a.number.startsWith('11') || a.number.startsWith('12') || a.number.startsWith('13') || a.number.startsWith('14')));

  // Net Income calculation
  const niWhere = buildJournalEntryWhere(companyId, settings, { endDate: asOfDate });
  niWhere.account = { OR: [{ number: { startsWith: '6' } }, { number: { startsWith: '7' } }] };
  const niLines = await prisma.journalEntryLine.groupBy({
    by: ['accountId'],
    where: niWhere,
    _sum: { debit: true, credit: true }
  });
  let netIncome = 0;
  niLines.forEach(lb => { netIncome += ((lb._sum.credit || 0) - (lb._sum.debit || 0)); });

  const assetsTree = buildTree(assetsAccounts, 1);
  const liabilitiesTree = buildTree(liabilitiesAccounts, 2);
  const equityTree = buildTree(equityAccounts, 2);

  const totalAssets = assetsTree.reduce((sum, item) => sum + (item.children?.find((c: ReportRow) => c.isTotal)?.amount ?? item.amount ?? 0), 0);
  const totalLiabilities = liabilitiesTree.reduce((sum, item) => sum + (item.children?.find((c: ReportRow) => c.isTotal)?.amount ?? item.amount ?? 0), 0);
  const totalEquityPrev = equityTree.reduce((sum, item) => sum + (item.children?.find((c: ReportRow) => c.isTotal)?.amount ?? item.amount ?? 0), 0);

  return [
    { id: 'assets', label: settings?.sectionTitles?.Assets || 'ASSETS', isHeader: true, level: 0, children: [
      ...assetsTree,
      { id: 'total-assets', label: 'TOTAL ASSETS', amount: totalAssets, isTotal: true, level: 1 }
    ]},
    { id: 'liabilities-equity', label: settings?.sectionTitles?.['Liabilities and Equity'] || 'LIABILITIES AND EQUITY', isHeader: true, level: 0, children: [
        { id: 'liabilities', label: 'Liabilities', isHeader: true, level: 1, children: [
          ...liabilitiesTree,
          { id: 'total-liabilities', label: 'Total Liabilities', amount: totalLiabilities, isTotal: true, level: 2 }
        ]},
        { id: 'equity', label: 'Equity', isHeader: true, level: 1, children: [
          ...equityTree,
          { id: 'net-income', label: 'Net Income', amount: netIncome, level: 2 },
          { id: 'total-equity', label: 'Total Equity', amount: totalEquityPrev + netIncome, isTotal: true, level: 2 }
        ]},
        { id: 'total-liabilities-equity', label: 'TOTAL LIABILITIES AND EQUITY', amount: totalLiabilities + totalEquityPrev + netIncome, isTotal: true, level: 1 }
    ]}
  ];
}

export async function getProfitAndLossData(
  startDate: Date = new Date(new Date().getFullYear(), 0, 1),
  endDate: Date = new Date(),
  settings?: ReportSettings
) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const allAccounts = await prisma.account.findMany({
    where: { 
      companyId,
      ...(settings?.showRows === 'active' ? { isActive: true } : {})
    },
    orderBy: { number: 'asc' }
  });

  const pnlWhere = buildJournalEntryWhere(companyId, settings, { startDate, endDate });
  pnlWhere.account = { OR: [{ number: { startsWith: '6' } }, { number: { startsWith: '7' } }] };

  const lineBalances = await prisma.journalEntryLine.groupBy({
    by: ['accountId'],
    where: pnlWhere,
    _sum: { debit: true, credit: true }
  });

  const balanceMap = new Map<string, number>();
  lineBalances.forEach(lb => { balanceMap.set(lb.accountId, (lb._sum.debit || 0) - (lb._sum.credit || 0)); });

  const getAccountBalance = (accountId: string): number => {
    let balance = balanceMap.get(accountId) || 0;
    const children = allAccounts.filter(a => a.parent_id === accountId);
    children.forEach(child => { balance += getAccountBalance(child.id); });
    return balance;
  };

  const buildTree = (accounts: { id: string, title: string, number: string }[], level: number = 0): ReportRow[] =>
    accounts.map(account => {
      const children = allAccounts.filter(a => a.parent_id === account.id);
      const totalBalance = getAccountBalance(account.id);
      const displayAmount = account.number.startsWith('7') ? -totalBalance : totalBalance;

      if (settings?.showRows === 'non-zero' && totalBalance === 0) return null;

      return {
        id: account.id,
        label: account.title,
        amount: children.length === 0 ? displayAmount : undefined,
        isHeader: children.length > 0,
        level,
        children: children.length > 0 ? [
            ...buildTree(children, level + 1),
            { id: `total-${account.id}`, label: `Total for ${account.title}`, amount: displayAmount, isTotal: true, level: level + 1 }
        ].filter(Boolean) : undefined
      };
    }).filter(Boolean) as ReportRow[];

  const incomeAccounts = allAccounts.filter(a => !a.parent_id && a.number.startsWith('7'));
  const expenseAccounts = allAccounts.filter(a => !a.parent_id && a.number.startsWith('6'));

  const incomeTree = buildTree(incomeAccounts, 1);
  const expenseTree = buildTree(expenseAccounts, 1);

  const totalIncome = incomeTree.reduce((sum, item) => sum + (item.children?.find((c: ReportRow) => c.isTotal)?.amount ?? item.amount ?? 0), 0);
  const totalExpenses = expenseTree.reduce((sum, item) => sum + (item.children?.find((c: ReportRow) => c.isTotal)?.amount ?? item.amount ?? 0), 0);

  return [
    { id: 'income', label: settings?.sectionTitles?.Income || 'INCOME', isHeader: true, level: 0, children: [
        ...incomeTree,
        { id: 'total-income', label: 'TOTAL INCOME', amount: totalIncome, isTotal: true, level: 1 }
      ]
    },
    { id: 'expenses', label: settings?.sectionTitles?.Expenses || 'EXPENSES', isHeader: true, level: 0, children: [
        ...expenseTree,
        { id: 'total-expenses', label: 'TOTAL EXPENSES', amount: totalExpenses, isTotal: true, level: 1 }
      ]
    },
    { id: 'net-income', label: 'NET INCOME', amount: totalIncome - totalExpenses, isTotal: true, level: 0 }
  ];
}

export async function getARAgingSummaryData(asOfDate: Date = new Date(), settings?: ReportSettings) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const customerIds = settings?.filters?.filter(f => f.type === 'customer').map(f => f.value);

  const openInvoices = await prisma.invoice.findMany({
    where: {
      companyId,
      status: { in: ['PENDING', 'PARTIAL'] },
      createdAt: { lte: asOfDate },
      ...(customerIds?.length && customerIds.length > 0 ? { customerId: { in: customerIds } } : {})
    },
    include: { customer: true, payments: { where: { paymentDate: { lte: asOfDate } } } }
  });

  interface CustomerAgingData {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
    total: number;
  }

  const customerData = new Map<string, CustomerAgingData>();
  openInvoices.forEach(invoice => {
    const balance = invoice.amount - invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    if (balance <= 0) return;

    const daysOverdue = Math.floor((asOfDate.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const name = invoice.customer.displayName || `${invoice.customer.givenName} ${invoice.customer.familyName}`;

    if (!customerData.has(name)) customerData.set(name, { current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0 });
    const data = customerData.get(name)!;
    if (daysOverdue <= 0) data.current += balance;
    else if (daysOverdue <= 30) data.days30 += balance;
    else if (daysOverdue <= 60) data.days60 += balance;
    else if (daysOverdue <= 90) data.days90 += balance;
    else data.over90 += balance;
    data.total += balance;
  });

  const reportData: ReportRow[] = Array.from(customerData.entries()).map(([name, data]) => ({
    id: name, label: name, level: 1, isHeader: true, children: [
      { id: `${name}-current`, label: 'Current', amount: data.current, level: 2 },
      { id: `${name}-30`, label: '1 - 30', amount: data.days30, level: 2 },
      { id: `${name}-60`, label: '31 - 60', amount: data.days60, level: 2 },
      { id: `${name}-90`, label: '61 - 90', amount: data.days90, level: 2 },
      { id: `${name}-over90`, label: '91 and over', amount: data.over90, level: 2 },
      { id: `${name}-total`, label: 'Total', amount: data.total, isTotal: true, level: 2 }
    ]
  }));

  const total = Array.from(customerData.values()).reduce((acc, curr) => acc + curr.total, 0);

  return [{ id: 'ar-summary', label: 'Accounts Receivable Aging Summary', isHeader: true, level: 0, children: [...reportData, { id: 'total-ar', label: 'TOTAL', amount: total, isTotal: true, level: 1 }] }];
}

export async function getProfitAndLossByCustomerData(startDate: Date, endDate: Date, settings?: ReportSettings) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const customerIds = settings?.filters?.filter(f => f.type === 'customer').map(f => f.value);
  const customers = await prisma.customer.findMany({
    where: { 
        companyId,
        ...(customerIds?.length && customerIds.length > 0 ? { id: { in: customerIds } } : {})
    }
  });

  const reportRows: ReportRow[] = [];
  for (const customer of customers) {
    const lines = await prisma.journalEntryLine.findMany({
      where: {
        journalEntry: { companyId, customerId: customer.id, date: { gte: startDate, lte: endDate } },
        account: { OR: [{ number: { startsWith: '6' } }, { number: { startsWith: '7' } }] }
      },
      include: { account: true }
    });

    let income = 0, expenses = 0;
    lines.forEach(line => {
      const balance = (line.credit || 0) - (line.debit || 0);
      if (line.account.number.startsWith('7')) income += balance; else expenses -= balance;
    });

    if (income !== 0 || expenses !== 0) {
      reportRows.push({
        id: customer.id, label: customer.displayName || `${customer.givenName} ${customer.familyName}`, level: 1, isHeader: true, children: [
          { id: `${customer.id}-income`, label: 'Total Income', amount: income, level: 2 },
          { id: `${customer.id}-expenses`, label: 'Total Expenses', amount: expenses, level: 2 },
          { id: `${customer.id}-net`, label: 'Net Income', amount: income - expenses, isTotal: true, level: 2 }
        ]
      });
    }
  }
  return [{ id: 'pnl-customer', label: 'Profit and Loss by Customer', isHeader: true, level: 0, children: reportRows }];
}

export async function getCashFlowData(startDate: Date, endDate: Date, settings?: ReportSettings) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const [allAccounts, pnl] = await Promise.all([
    prisma.account.findMany({ where: { companyId } }),
    getProfitAndLossData(startDate, endDate, settings)
  ]);
  
  const netIncome = pnl.find(r => r.id === 'net-income')?.amount || 0;

  const getBalances = async (date: Date) => {
    const where = buildJournalEntryWhere(companyId, settings, { endDate: date });
    const balances = await prisma.journalEntryLine.groupBy({ by: ['accountId'], where, _sum: { debit: true, credit: true } });
    const map = new Map<string, number>();
    balances.forEach(b => map.set(b.accountId, (b._sum.debit || 0) - (b._sum.credit || 0)));
    return map;
  };

  const [openBalances, closeBalances] = await Promise.all([getBalances(new Date(startDate.getTime() - 1)), getBalances(endDate)]);

  const adjustments: ReportRow[] = [];
  let totalOperating = netIncome, totalInvesting = 0, totalFinancing = 0;

  allAccounts.forEach(account => {
    const change = (closeBalances.get(account.id) || 0) - (openBalances.get(account.id) || 0);
    if (change === 0) return;

    if (account.number.startsWith('2')) {
      totalInvesting -= change;
      adjustments.push({ id: `investing-${account.id}`, label: account.title, amount: -change, level: 2 });
    } else if (account.number.startsWith('1')) {
      totalFinancing -= change;
      adjustments.push({ id: `financing-${account.id}`, label: account.title, amount: -change, level: 2 });
    } else if (account.number.startsWith('3') || account.number.startsWith('4')) {
      const impact = (account.number.startsWith('41') || account.number.startsWith('3')) ? -change : change;
      totalOperating += impact;
      adjustments.push({ id: `operating-${account.id}`, label: account.title, amount: impact, level: 2 });
    }
  });

  return [
    { id: 'operating', label: 'OPERATING ACTIVITIES', isHeader: true, level: 0, children: [
        { id: 'net-income-cf', label: 'Net Income', amount: netIncome, level: 1 },
        ...adjustments.filter(a => a.id.startsWith('operating')),
        { id: 'total-operating', label: 'Net cash provided by operating activities', amount: totalOperating, isTotal: true, level: 1 }
    ]},
    { id: 'investing', label: 'INVESTING ACTIVITIES', isHeader: true, level: 0, children: [
        ...adjustments.filter(a => a.id.startsWith('investing')),
        { id: 'total-investing', label: 'Net cash provided by investing activities', amount: totalInvesting, isTotal: true, level: 1 }
    ]},
    { id: 'financing', label: 'FINANCING ACTIVITIES', isHeader: true, level: 0, children: [
        ...adjustments.filter(a => a.id.startsWith('financing')),
        { id: 'total-financing', label: 'Net cash provided by financing activities', amount: totalFinancing, isTotal: true, level: 1 }
    ]},
    { id: 'net-cash-change', label: 'NET CASH INCREASE FOR PERIOD', amount: totalOperating + totalInvesting + totalFinancing, isTotal: true, level: 0 }
  ];
}

export async function getAuditLogData() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const journals = await prisma.journalEntry.findMany({
    where: { companyId, isActive: true },
    include: {
      customer: { select: { displayName: true, givenName: true, familyName: true } },
      entries: {
        where: { isActive: true },
        include: { account: { select: { title: true, number: true } } }
      }
    },
    orderBy: { date: 'desc' },
    take: 100
  });

  const reportRows: ReportRow[] = journals.map(journal => {
    const totalAmount = journal.entries.reduce((sum, line) => sum + (line.debit || 0), 0);
    const customerName = journal.customer 
      ? (journal.customer.displayName || `${journal.customer.givenName} ${journal.customer.familyName}`) 
      : 'N/A';

    return {
      id: journal.id,
      label: `${journal.date.toLocaleDateString()} - ${journal.journalNo || 'No#'} - ${journal.transactionType}`,
      level: 1,
      isHeader: true,
      children: [
        { id: `${journal.id}-desc`, label: `Description: ${journal.description || 'No description'}`, level: 2 },
        { id: `${journal.id}-cust`, label: `Customer: ${customerName}`, level: 2 },
        { id: `${journal.id}-total`, label: 'Total Amount', amount: totalAmount, isTotal: true, level: 2 },
        ...journal.entries.map((line, idx) => ({
          id: `${journal.id}-line-${idx}`,
          label: `${line.account.number} ${line.account.title} (${line.debit ? 'Debit' : 'Credit'})`,
          amount: line.debit || line.credit || 0,
          level: 2
        }))
      ]
    };
  });

  return [{ id: 'journal-report', label: 'Recent Journal Entries', isHeader: true, level: 0, children: reportRows }];
}

export async function getSnapshotData() {
  const now = new Date();
  const [pnl, ar] = await Promise.all([getProfitAndLossData(new Date(now.getFullYear(), 0, 1), now), getARAgingSummaryData(now)]);
  const income = pnl.find(r => r.id === 'income')?.children?.find(c => c.isTotal)?.amount || 0;
  const expenses = pnl.find(r => r.id === 'expenses')?.children?.find(c => c.isTotal)?.amount || 0;
  const arTotal = ar.find(r => r.id === 'ar-summary')?.children?.find(c => c.id === 'total-ar')?.amount || 0;

  return [{ id: 'snapshot', label: 'Business Snapshot', isHeader: true, level: 0, children: [
    { id: 'income-snap', label: 'Total Income (YTD)', amount: income, level: 1 },
    { id: 'expense-snap', label: 'Total Expenses (YTD)', amount: expenses, level: 1 },
    { id: 'net-snap', label: 'Net Income (YTD)', amount: income - expenses, isTotal: true, level: 1 },
    { id: 'ar-snap', label: 'Accounts Receivable', amount: arTotal, level: 1 }
  ]}];
}

export async function getInventoryValuationData() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const items = await prisma.item.findMany({ where: { companyId: session.user.activeCompanyId, trackInventory: true, isActive: true } });
  const rows = items.map(item => ({ id: item.id, label: item.name, level: 1, isHeader: true, children: [
    { id: `${item.id}-qty`, label: 'Quantity On Hand', amount: item.quantityOnHand || 0, level: 2 },
    { id: `${item.id}-cost`, label: 'Asset Cost', amount: item.cost || 0, level: 2 },
    { id: `${item.id}-total`, label: 'Total Value', amount: (item.quantityOnHand || 0) * (item.cost || 0), isTotal: true, level: 2 }
  ]}));
  return [{ id: 'inventory-valuation', label: 'Inventory Valuation Summary', isHeader: true, level: 0, children: [...rows, { id: 'total-inventory', label: 'TOTAL INVENTORY VALUE', amount: items.reduce((s, i) => s + ((i.quantityOnHand || 0) * (i.cost || 0)), 0), isTotal: true, level: 1 }] }];
}
