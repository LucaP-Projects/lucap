import { ValidationWarning } from '../base/validationWarning';
import { TaxSelectData } from '../shared/tax/actions';

export interface FormContentProps<T> {
  onTaxChange: (tax: TaxSelectData | null) => void;
  onSubmit: (data: T) => Promise<void>;
  warnings: ValidationWarning[];
  showWarnings: boolean;
  handleWarningConfirm: () => void;
  handleWarningCancel: () => void;
  mode?: 'create' | 'edit';
  initialData?: T;
  onUploadStatusChange?: (isUploading: boolean) => void;
}

export interface ViewRendererProps<T> {
  company?: CompanyInfo | null;
  docType: 'Invoice' | 'Estimate';
  formContentProps: FormContentProps<T>;
}

export interface CompanyInfo {
  name: string;
  legalName?: string | null;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: PrismaJson.Address | null;
  logo?: string | null;
}
