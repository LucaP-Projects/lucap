import { ValidationWarning } from '../base/validationWarning';
import { CompanyInfo } from '../invoice/types';
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
