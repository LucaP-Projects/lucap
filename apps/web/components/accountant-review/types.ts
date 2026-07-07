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

export type CustomerForAccountant = {
  id: string;
  displayName: string;
  primaryEmail: string | null;
  companyName: string | null;
};
