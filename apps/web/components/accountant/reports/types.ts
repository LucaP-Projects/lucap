export interface Account {
  id: string;
  title: string;
  number: string;
}

export interface Customer {
  id: string;
  displayName: string;
}

export interface JournalEntryLine {
  id: string;
  debit: number | null;
  credit: number | null;
  description: string | null;
  accountId: string;
  journalEntryId: string;
  account: Account;
}

export interface JournalEntry {
  id: string;
  date: Date;
  journalNo: string | null;
  transactionType: string;
  description: string | null;
  customerId: string | null;
  companyId: string;
  entries: JournalEntryLine[];
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer | null;
}

export interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangeUpdate {
  range: DateRange;
  rangeCompare?: DateRange;
}

export interface FetchJournalsParams {
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface JournalsResponse {
  journals: JournalEntry[];
  pagination: PaginationData;
}

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
