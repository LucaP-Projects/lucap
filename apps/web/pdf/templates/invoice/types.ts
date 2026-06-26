// PDF Template Types for Invoice Generation


export interface InvoiceItem {
  productName: string;
  description: string;
  quantity: number;
  rate: number;
  sku: string;
  taxable: boolean;
}

 interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Company {
  name: string;
  email: string;
  address: Address;
}

export interface FormData {
  invoiceNumber: string;
  dueDate: Date;
  items: InvoiceItem[];
  billingAdress?: Address | null;
  shippingAdress?: Address | null;
  emailCustomer?: string | null;
  discountType: string;
  discountValue: number;
}

export interface PdfSettings {
  sku: boolean;
  note: boolean;
  rate: boolean;
  amount: boolean;
  shipTo: boolean;
  dueDate: boolean;
  quantity: boolean;
  invoiceNo: boolean;
  description: boolean;
  invoiceDate: boolean;
  tableNumber: boolean;
  productService: boolean;
}     

export interface InvoiceTemplateData {
  formData: FormData;
  company: Company;
  color: string;
  colorLight: string;
  settings: PdfSettings;
  note: string;
  taxRate: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  paperType: PaperType;
}

export type PaperType =
  | 'Invoice'
  | 'Estimate'
  | 'Delayed Credit'
  | 'Delayed Charge'
  | 'Credit Memo'
  | 'Refund Receipt'
  | 'Sales Receipt';
