export type CustomerDocumentSummary = {
  id: string;
  displayName: string;
  primaryEmail: string | null;
  documentCount: number;
  pendingCount: number;
  totalAmount: number;
};

export type AccountantDocument = {
  id: string;
  number: string;
  amount: number;
  dueDate: Date;
  createdAt: Date;
  notes: string | null;
  qualificationStatus: 'VALIDATED' | 'REJECTED' | null;
};

// Same shape as AccountantDocument, plus the customer it belongs to — used by
// the flat, company-wide document list (no customer-picker step).
export type FlatAccountantDocument = AccountantDocument & {
  customerId: string;
  customerName: string;
};

export type CustomerForAccountant = {
  id: string;
  displayName: string;
  primaryEmail: string | null;
  companyName: string | null;
};
