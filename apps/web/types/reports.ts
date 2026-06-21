export type RevenueDataItem = {
  month: Date;
  total: number | string;
};

export type FormattedRevenueData = {
  month: string;
  total: number;
};

export interface RevenueChartProps {
  data: RevenueDataItem[];
}

// export Types for the expenses chart
export type ExpenseDataItem = {
  categoryId: string;
  _sum: {
    amount: number | string;
  };
};

export type FormattedExpenseData = {
  name: string;
  value: number;
  color: string;
};

export interface ExpenseChartProps {
  data: ExpenseDataItem[];
}
export type ReportType = 'profitAndLoss' | 'balanceSheet' | 'cashFlow';
export type ReportDataItem = {
  date: Date;
  description: string;
  income: number;
  expense: number;
  net: number;
};
