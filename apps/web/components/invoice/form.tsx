import { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea'; 
import FileUpload from '@/components/file-upload/file-upload';
import { CompanyInfo } from '../base/company/company';
import { DetailsSection } from '../base/customer/main';
import MemoizedItemSelectionHandler from '../base/items/MemoizedItemSelectionHandler';
import MemoizedPriceSummary from '../base/price/MemoizedPriceSummary';
import {
  ValidationWarning,
  ValidationWarningDialog
} from '../base/validationWarning';
import { TaxSelectData } from '../shared/tax/actions';
import { InvoiceFormValues } from './schema';
import { CompanyInfo as Company, Invoice } from './types';
import { FieldError } from '../ui/field';

export interface formContentProps {
  onTaxChange: (tax: TaxSelectData | null) => void;
  onSubmit: (data: InvoiceFormValues) => Promise<void>;
  warnings: ValidationWarning[];
  showWarnings: boolean;
  handleWarningConfirm: () => void;
  handleWarningCancel: () => void;
  mode?: 'create' | 'edit';
  initialData?: Invoice;
}

interface MemoizedFormContentProps extends formContentProps {
  company?: Company | null;
}

const MemoizedFormContent = ({
  company,
  onTaxChange,
  onSubmit,
  warnings,
  showWarnings,
  handleWarningConfirm,
  handleWarningCancel,
  initialData
}: MemoizedFormContentProps) => {
  const formMethods = useFormContext<InvoiceFormValues>();
  const { control, handleSubmit } = formMethods;

  return (
    <div className="flex w-full flex-col bg-white dark:bg-gray-900">
        <form
          id="invoice-form"
          onSubmit={handleSubmit(onSubmit)}
          className="m-0 space-y-8 p-4"
        >
          {company && (
            <div className="mb-6 border-b pb-6 dark:border-gray-700">
              <CompanyInfo
                doc="Invoice"
                company={company}
                variant="desktop"
                className="hidden lg:block"
              />
              <CompanyInfo
                doc="Invoice"
                company={company}
                variant="mobile"
                className="lg:hidden"
              />
            </div>
          )}

          <DetailsSection initialData={initialData} />

          <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <MemoizedItemSelectionHandler />
          </div>

          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-7">
              <div className="max-w-[500px] rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Notes
                </h3>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field, fieldState }) => (
                    <>
                      <Textarea
                        {...field}
                        className="h-24 resize-none border-none bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 dark:text-gray-100 dark:placeholder:text-gray-400"
                        placeholder="Add any additional notes..."
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </>
                  )}
                />
              </div>

              {/* Attachments */}
              <div className="max-w-[500px] rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
                <FileUpload maxFiles={10} maxSizeInMB={10} />
              </div>
            </div>

            {/* Price Summary */}
            <div className="xl:col-span-5">
              <MemoizedPriceSummary onTaxChange={onTaxChange} />
            </div>
          </div>

          {/* Warning Dialog */}
          <ValidationWarningDialog
            warnings={warnings}
            onConfirm={handleWarningConfirm}
            onCancel={handleWarningCancel}
            open={showWarnings}
          />
        </form>
    </div>
  );
};

MemoizedFormContent.displayName = 'MemoizedFormContent';

export default memo(MemoizedFormContent);
