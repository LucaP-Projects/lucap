export interface Company {
  name: string;
  legalName?: string | null;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: any;
  logo?: string | null;
}
export type PaperType =
  | 'Invoice'
  | 'Estimate'
  | 'Delayed Credit'
  | 'Delayed Charge'
  | 'Credit Memo'
  | 'Refund Receipt'
  | 'Sales Receipt';
