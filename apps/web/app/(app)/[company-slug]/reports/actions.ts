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

  const results = await Promise.all(customers.map(customer =>
    prisma.journalEntryLine.findMany({
      where: {
        journalEntry: { companyId, customerId: customer.id, date: { gte: startDate, lte: endDate } },
        account: { OR: [{ number: { startsWith: '6' } }, { number: { startsWith: '7' } }] }
      },
      include: { account: true }
    })
  ));

  const reportRows: ReportRow[] = [];
  customers.forEach((customer, i) => {
    const lines = results[i]!;

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
  });
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

export async function getTrialBalanceData(asOfDate: Date = new Date(), settings?: ReportSettings) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const allAccounts = await prisma.account.findMany({ where: { companyId }, orderBy: { number: 'asc' } });
  const where = buildJournalEntryWhere(companyId, settings, { endDate: asOfDate });
  const balances = await prisma.journalEntryLine.groupBy({ by: ['accountId'], where, _sum: { debit: true, credit: true } });
  const balanceMap = new Map(balances.map(b => [b.accountId, (b._sum.debit || 0) - (b._sum.credit || 0)]));

  const rows = allAccounts.map(a => ({
    id: a.id, label: `${a.number} ${a.title}`, amount: balanceMap.get(a.id) || 0, level: 1,
    isTotal: !a.parent_id,
  }));
  const totalDebit = rows.reduce((s, r) => s + (r.amount! > 0 ? r.amount! : 0), 0);
  const totalCredit = rows.reduce((s, r) => s + (r.amount! < 0 ? -r.amount! : 0), 0);
  return [
    { id: 'trial-balance', label: 'Trial Balance', isHeader: true, level: 0, children: [
      ...rows,
      { id: 'total-debit', label: 'Total Debit', amount: totalDebit, isTotal: true, level: 1 },
      { id: 'total-credit', label: 'Total Credit', amount: totalCredit, isTotal: true, level: 1 },
    ]}
  ];
}

export async function getGeneralLedgerData(startDate: Date, endDate: Date, settings?: ReportSettings) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const where = buildJournalEntryWhere(companyId, settings, { startDate, endDate });
  const journals = await prisma.journalEntry.findMany({
    where: { ...where.journalEntry, isActive: true, companyId },
    include: {
      entries: { where: { isActive: true }, include: { account: { select: { title: true, number: true } } } }
    },
    orderBy: { date: 'asc' }
  });

  const rows = journals.map(j => ({
    id: j.id, label: `${j.date.toLocaleDateString()} ${j.journalNo || ''} ${j.description || ''}`, level: 1, isHeader: true,
    children: j.entries.map((e, i) => ({
      id: `${j.id}-${i}`, label: `${e.account.number} ${e.account.title}`, amount: e.debit || e.credit || 0, level: 2
    }))
  }));
  return [{ id: 'general-ledger', label: 'General Ledger', isHeader: true, level: 0, children: rows }];
}

export async function getAPAgingSummaryData(asOfDate: Date = new Date(), settings?: ReportSettings) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const openBills = await prisma.bill.findMany({
    where: { companyId, status: { in: ['OPEN', 'OVERDUE', 'PARTIALLY_PAID'] }, dueDate: { lte: asOfDate } },
    include: { vendor: true, allocations: true }
  });

  const vendorMap = new Map<string, { current: number; days30: number; days60: number; days90: number; over90: number; total: number }>();
  openBills.forEach(bill => {
    const paid = bill.allocations.reduce((s, a) => s + a.amount, 0);
    const balance = bill.amount - paid;
    if (balance <= 0) return;
    const overdue = Math.floor((asOfDate.getTime() - bill.dueDate.getTime()) / 86400000);
    const name = bill.vendor!.displayName;
    if (!vendorMap.has(name)) vendorMap.set(name, { current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0 });
    const d = vendorMap.get(name)!;
    if (overdue <= 0) d.current += balance;
    else if (overdue <= 30) d.days30 += balance;
    else if (overdue <= 60) d.days60 += balance;
    else if (overdue <= 90) d.days90 += balance;
    else d.over90 += balance;
    d.total += balance;
  });

  const rows = Array.from(vendorMap.entries()).map(([name, d]) => ({
    id: name, label: name, level: 1, isHeader: true,
    children: [
      { id: `${name}-cur`, label: 'Current', amount: d.current, level: 2 },
      { id: `${name}-30`, label: '1 - 30', amount: d.days30, level: 2 },
      { id: `${name}-60`, label: '31 - 60', amount: d.days60, level: 2 },
      { id: `${name}-90`, label: '61 - 90', amount: d.days90, level: 2 },
      { id: `${name}-over90`, label: '91 and over', amount: d.over90, level: 2 },
      { id: `${name}-total`, label: 'Total', amount: d.total, isTotal: true, level: 2 }
    ]
  }));
  const total = Array.from(vendorMap.values()).reduce((s, d) => s + d.total, 0);
  return [{ id: 'ap-aging', label: 'AP Aging Summary', isHeader: true, level: 0, children: [...rows, { id: 'total-ap', label: 'TOTAL', amount: total, isTotal: true, level: 1 }] }];
}

export async function getSalesByCustomerData(startDate: Date, endDate: Date, settings?: ReportSettings) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const invoices = await prisma.invoice.findMany({
    where: { companyId, createdAt: { gte: startDate, lte: endDate } },
    include: { customer: true, payments: true }
  });

  const customerMap = new Map<string, { sales: number; payments: number }>();
  invoices.forEach(inv => {
    const name = inv.customer?.displayName || `${inv.customer?.givenName || ''} ${inv.customer?.familyName || ''}`.trim() || 'Unknown';
    if (!customerMap.has(name)) customerMap.set(name, { sales: 0, payments: 0 });
    const d = customerMap.get(name)!;
    d.sales += inv.amount;
    d.payments += inv.payments.reduce((s, p) => s + p.amount, 0);
  });

  const rows = Array.from(customerMap.entries()).map(([name, d]) => ({
    id: name, label: name, level: 1, isHeader: true,
    children: [
      { id: `${name}-sales`, label: 'Total Sales', amount: d.sales, level: 2 },
      { id: `${name}-collected`, label: 'Amount Collected', amount: d.payments, level: 2 },
      { id: `${name}-balance`, label: 'Balance Due', amount: d.sales - d.payments, isTotal: true, level: 2 }
    ]
  }));
  const totalSales = Array.from(customerMap.values()).reduce((s, d) => s + d.sales, 0);
  const totalCollected = Array.from(customerMap.values()).reduce((s, d) => s + d.payments, 0);
  return [{ id: 'sales-customer', label: 'Sales by Customer', isHeader: true, level: 0, children: [
    ...rows,
    { id: 'total-sales', label: 'TOTAL SALES', amount: totalSales, isTotal: true, level: 1 },
    { id: 'total-collected', label: 'TOTAL COLLECTED', amount: totalCollected, isTotal: true, level: 1 },
  ]}];
}

export async function getSalesByProductData(startDate: Date, endDate: Date, settings?: ReportSettings) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const invoiceItems = await prisma.invoiceItem.findMany({
    where: { invoice: { companyId, createdAt: { gte: startDate, lte: endDate } } },
    include: { item: { select: { name: true } } }
  });

  const itemMap = new Map<string, { qty: number; amount: number }>();
  invoiceItems.forEach(ii => {
    const name = ii.item?.name || ii.productName || 'Unknown';
    if (!itemMap.has(name)) itemMap.set(name, { qty: 0, amount: 0 });
    const d = itemMap.get(name)!;
    d.qty += ii.quantity;
    d.amount += ii.amount;
  });

  const rows = Array.from(itemMap.entries()).map(([name, d]) => ({
    id: name, label: name, level: 1, isHeader: true,
    children: [
      { id: `${name}-qty`, label: 'Quantity Sold', amount: d.qty, level: 2 },
      { id: `${name}-amt`, label: 'Total Sales', amount: d.amount, isTotal: true, level: 2 }
    ]
  }));
  const total = Array.from(itemMap.values()).reduce((s, d) => s + d.amount, 0);
  return [{ id: 'sales-product', label: 'Sales by Product', isHeader: true, level: 0, children: [...rows, { id: 'total-product', label: 'TOTAL', amount: total, isTotal: true, level: 1 }] }];
}

export async function getVendorBalanceData(settings?: ReportSettings) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const vendors = await prisma.vendor.findMany({
    where: { companyId, isActive: true },
    include: {
      bills: { where: { isActive: true }, include: { allocations: true } },
      vendorCredits: { where: { isActive: true } }
    }
  });

  const rows = vendors.filter(v => v.bills.length || v.vendorCredits.length).map(v => {
    const billTotal = v.bills.reduce((s, b) => s + b.amount, 0);
    const billPaid = v.bills.reduce((s, b) => s + b.allocations.reduce((sp, a) => sp + a.amount, 0), 0);
    const creditTotal = v.vendorCredits.reduce((s, c) => s + c.amount, 0);
    const balance = billTotal - billPaid - creditTotal;
    return { id: v.id, label: v.displayName, level: 1, isHeader: true, children: [
      { id: `${v.id}-billed`, label: 'Total Billed', amount: billTotal, level: 2 },
      { id: `${v.id}-paid`, label: 'Total Paid', amount: billPaid, level: 2 },
      { id: `${v.id}-credits`, label: 'Credits', amount: creditTotal, level: 2 },
      { id: `${v.id}-balance`, label: 'Balance', amount: balance, isTotal: true, level: 2 }
    ]};
  });

  const total = rows.reduce((s, r) => s + (r.children?.find(c => c.isTotal)?.amount || 0), 0);
  return [{ id: 'vendor-balance', label: 'Vendor Balance', isHeader: true, level: 0, children: [...rows, { id: 'total-vendor', label: 'TOTAL', amount: total, isTotal: true, level: 1 }] }];
}

export async function getTaxSummaryData(startDate: Date, endDate: Date) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error("Unauthorized");
  const companyId = session.user.activeCompanyId;

  const invoices = await prisma.invoice.findMany({
    where: { companyId, createdAt: { gte: startDate, lte: endDate } },
    include: { tax: true, items: true }
  });

  const taxMap = new Map<string, { taxable: number; taxAmount: number }>();
  invoices.forEach(inv => {
    const rateName = inv.tax?.name || 'No Tax';
    if (!taxMap.has(rateName)) taxMap.set(rateName, { taxable: 0, taxAmount: 0 });
    const d = taxMap.get(rateName)!;
    const taxable = inv.items.reduce((s, item) => s + item.amount, 0);
    d.taxable += taxable;
    d.taxAmount += (taxable * (inv.tax?.rate || 0)) / 100;
  });

  const rows = Array.from(taxMap.entries()).map(([name, d]) => ({
    id: name, label: name, level: 1, isHeader: true,
    children: [
      { id: `${name}-taxable`, label: 'Taxable Sales', amount: d.taxable, level: 2 },
      { id: `${name}-tax`, label: 'Tax Amount', amount: d.taxAmount, isTotal: true, level: 2 }
    ]
  }));
  const total = Array.from(taxMap.values()).reduce((s, d) => s + d.taxAmount, 0);
  return [{ id: 'tax-summary', label: 'Tax Summary', isHeader: true, level: 0, children: [...rows, { id: 'total-tax', label: 'TOTAL TAX', amount: total, isTotal: true, level: 1 }] }];
}

async function getPnlByDimension(companyId: string, startDate: Date, endDate: Date, dimension: 'classId' | 'departmentId', labels: Map<string, string>) {
  const rows: ReportRow[] = [];
  for (const [id, label] of labels) {
    if (!id) continue;
    const lines = await prisma.journalEntryLine.findMany({
      where: {
        journalEntry: { companyId, [dimension]: id, date: { gte: startDate, lte: endDate } },
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
      rows.push({ id, label, level: 1, isHeader: true, children: [
        { id: `${id}-income`, label: 'Income', amount: income, level: 2 },
        { id: `${id}-expenses`, label: 'Expenses', amount: expenses, level: 2 },
        { id: `${id}-net`, label: 'Net', amount: income - expenses, isTotal: true, level: 2 }
      ]});
    }
  }
  return rows;
}

export async function getSalesByClassData(startDate: Date, endDate: Date) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('Unauthorized');
  const classes = await prisma.class.findMany({ where: { companyId: session.user.activeCompanyId } });
  const labels = new Map(classes.map(c => [c.id, c.name]));
  const rows = await getPnlByDimension(session.user.activeCompanyId, startDate, endDate, 'classId', labels);
  return [{ id: 'sales-class', label: 'Sales by Class', isHeader: true, level: 0, children: rows }];
}

export async function getSalesByDepartmentData(startDate: Date, endDate: Date) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('Unauthorized');
  const depts = await prisma.department.findMany({ where: { companyId: session.user.activeCompanyId } });
  const labels = new Map(depts.map(d => [d.id, d.name]));
  const rows = await getPnlByDimension(session.user.activeCompanyId, startDate, endDate, 'departmentId', labels);
  return [{ id: 'sales-dept', label: 'Sales by Department', isHeader: true, level: 0, children: rows }];
}

export async function getTransactionListData(startDate: Date, endDate: Date) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('Unauthorized');
  const companyId = session.user.activeCompanyId;

  const [invoices, bills, journals] = await Promise.all([
    prisma.invoice.findMany({ where: { companyId, createdAt: { gte: startDate, lte: endDate } }, include: { customer: true } }),
    prisma.bill.findMany({ where: { companyId, createdAt: { gte: startDate, lte: endDate } }, include: { vendor: true } }),
    prisma.journalEntry.findMany({ where: { companyId, date: { gte: startDate, lte: endDate }, isActive: true } }),
  ]);

  const all = [
    ...invoices.map(i => ({ date: i.createdAt, type: 'Invoice', ref: i.number || i.id.slice(0, 8), name: i.customer?.displayName || '', amount: i.amount, status: i.status })),
    ...bills.map(b => ({ date: b.createdAt, type: 'Bill', ref: b.number, name: b.vendor?.displayName || '', amount: b.amount, status: b.status })),
    ...journals.map(j => ({ date: j.date, type: 'Journal Entry', ref: j.journalNo || '', name: '', amount: 0, status: j.isActive ? 'ACTIVE' : 'INACTIVE' })),
  ];
  all.sort((a, b) => a.date.getTime() - b.date.getTime());

  const rows = all.map((r, i) => ({
    id: `tx-${i}`, label: `${r.date.toLocaleDateString()} ${r.type} ${r.ref}`, level: 1, isHeader: true,
    children: [
      { id: `tx-${i}-name`, label: r.name || 'N/A', level: 2 },
      { id: `tx-${i}-amount`, label: 'Amount', amount: r.amount, level: 2 },
      { id: `tx-${i}-status`, label: `Status: ${r.status}`, level: 2 },
    ]
  }));
  return [{ id: 'transaction-list', label: 'Transaction List', isHeader: true, level: 0, children: rows }];
}

export async function getTransactionListByCustomerData(startDate: Date, endDate: Date) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('Unauthorized');
  const companyId = session.user.activeCompanyId;

  const [invoices, journals] = await Promise.all([
    prisma.invoice.findMany({
      where: { companyId, createdAt: { gte: startDate, lte: endDate } },
      include: { customer: true }
    }),
    prisma.journalEntry.findMany({
      where: { companyId, date: { gte: startDate, lte: endDate }, isActive: true, customerId: { not: null } },
      include: { customer: true }
    }),
  ]);

  const customerMap = new Map<string, { date: Date; type: string; ref: string; name: string; amount: number; status: string }[]>();
  invoices.forEach(i => {
    const name = i.customer?.displayName || 'Unknown';
    if (!customerMap.has(name)) customerMap.set(name, []);
    customerMap.get(name)!.push({ date: i.createdAt, type: 'Invoice', ref: i.number || '', name, amount: i.amount, status: i.status });
  });
  journals.forEach(j => {
    const name = j.customer?.displayName || 'Unknown';
    if (!customerMap.has(name)) customerMap.set(name, []);
    customerMap.get(name)!.push({ date: j.date, type: 'Journal', ref: j.journalNo || '', name, amount: 0, status: '' });
  });

  const rows = Array.from(customerMap.entries()).map(([name, txs]) => ({
    id: name, label: name, level: 1, isHeader: true,
    children: txs.sort((a, b) => a.date.getTime() - b.date.getTime()).map((tx, i) => ({
      id: `${name}-${i}`, label: `${tx.date.toLocaleDateString()} ${tx.type} ${tx.ref}`, amount: tx.amount, level: 2
    }))
  }));
  return [{ id: 'tx-customer', label: 'Transaction List by Customer', isHeader: true, level: 0, children: rows }];
}

export async function getTransactionListByVendorData(startDate: Date, endDate: Date) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('Unauthorized');
  const companyId = session.user.activeCompanyId;

  const bills = await prisma.bill.findMany({
    where: { companyId, createdAt: { gte: startDate, lte: endDate } },
    include: { vendor: true }
  });

  const vendorMap = new Map<string, { date: Date; type: string; ref: string; name: string; amount: number; status: string }[]>();
  bills.forEach(b => {
    const name = b.vendor?.displayName || 'Unknown';
    if (!vendorMap.has(name)) vendorMap.set(name, []);
    vendorMap.get(name)!.push({ date: b.createdAt, type: 'Bill', ref: b.number, name, amount: b.amount, status: b.status });
  });

  const rows = Array.from(vendorMap.entries()).map(([name, txs]) => ({
    id: name, label: name, level: 1, isHeader: true,
    children: txs.sort((a, b) => a.date.getTime() - b.date.getTime()).map((tx, i) => ({
      id: `${name}-${i}`, label: `${tx.date.toLocaleDateString()} ${tx.type} ${tx.ref}`, amount: tx.amount, level: 2
    }))
  }));
  return [{ id: 'tx-vendor', label: 'Transaction List by Vendor', isHeader: true, level: 0, children: rows }];
}

export async function getBudgetVsActualsData(budgetId: string) {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) throw new Error('Unauthorized');
  const companyId = session.user.activeCompanyId;

  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: { entries: { include: { account: { select: { id: true, title: true, number: true } } } } },
  });
  if (!budget) throw new Error('Budget not found');

  const actualBalances = await prisma.journalEntryLine.groupBy({
    by: ['accountId'],
    where: {
      journalEntry: { companyId, date: { gte: budget.startDate, lte: budget.endDate } },
      account: { OR: [{ number: { startsWith: '6' } }, { number: { startsWith: '7' } }] },
    },
    _sum: { debit: true, credit: true },
  });

  const actualMap = new Map(actualBalances.map(b => [b.accountId, (b._sum.debit || 0) - (b._sum.credit || 0)]));

  const rows = budget.entries.map(entry => {
    const actual = -(actualMap.get(entry.accountId) || 0);
    const budgeted = entry.amount;
    const variance = actual - budgeted;
    return {
      id: entry.id, label: `${entry.account.number} ${entry.account.title}`, level: 1, isHeader: true,
      children: [
        { id: `${entry.id}-budget`, label: 'Budget', amount: budgeted, level: 2 },
        { id: `${entry.id}-actual`, label: 'Actual', amount: actual, level: 2 },
        { id: `${entry.id}-variance`, label: 'Variance', amount: variance, isTotal: true, level: 2 },
      ]
    };
  });

  const totalBudget = rows.reduce((s, r) => s + (r.children?.[0]?.amount || 0), 0);
  const totalActual = rows.reduce((s, r) => s + (r.children?.[1]?.amount || 0), 0);
  return [{ id: 'budget-vs-actual', label: `Budget vs Actuals — ${budget.name}`, isHeader: true, level: 0, children: [
    ...rows,
    { id: 'total-budget', label: 'TOTAL BUDGET', amount: totalBudget, isTotal: true, level: 1 },
    { id: 'total-actual', label: 'TOTAL ACTUAL', amount: totalActual, isTotal: true, level: 1 },
    { id: 'total-variance', label: 'TOTAL VARIANCE', amount: totalActual - totalBudget, isTotal: true, level: 1 },
  ]}];
}
