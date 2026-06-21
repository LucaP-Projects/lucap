import { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import FileUpload from '@/components/file-upload/file-upload';
import { Textarea } from '@/components/ui/textarea';
import { CompanyInfo } from '../base/company/company';
import { DelayedChargeStatusSection } from '../base/customer/DelayedChargeStatusSection';
import { DetailsSection } from '../base/customer/main';
import MemoizedItemSelectionHandler from '../base/items/MemoizedItemSelectionHandler';
import MemoizedPriceSummary from '../base/price/MemoizedPriceSummary';
import {
  ValidationWarning,
  ValidationWarningDialog
} from '../base/validationWarning';
import { CompanyInfo as Company } from '../invoice/types';
import { TaxSelectData } from '../shared/tax/actions';
import { DelayedChargeFormValues } from './schema';
import { DelayedCharge } from './types';

export interface formContentProps {
  onTaxChange: (tax: TaxSelectData | null) => void;
  onSubmit: (data: DelayedChargeFormValues) => Promise<void>;
  warnings: ValidationWarning[];
  showWarnings: boolean;
  handleWarningConfirm: () => void;
  handleWarningCancel: () => void;
  mode?: 'create' | 'edit';
  initialData?: DelayedCharge;
  onUploadStatusChange?: (isUploading: boolean) => void;
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
  const formMethods = useFormContext<DelayedChargeFormValues>();
  const { control, handleSubmit } = formMethods;

  return (
    <div className="flex w-full flex-col bg-white dark:bg-gray-900">
      <form
        id="delayed-charge-form"
        onSubmit={handleSubmit(onSubmit)}
        className="m-0 space-y-8 p-4"
      >
        {/* Company Information */}
        {company && (
          <div className="mb-6 border-b pb-6 dark:border-gray-700">
            <CompanyInfo
              doc="Delayed Charge"
              company={company}
              variant="desktop"
              className="hidden lg:block"
            />
            <CompanyInfo
              doc="Delayed Charge"
              company={company}
              variant="mobile"
              className="lg:hidden"
            />
          </div>
        )}

        <DelayedChargeStatusSection />
        <DetailsSection initialData={initialData} />

        {/* Items Table */}
        <div className="rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-800">
          <MemoizedItemSelectionHandler />
        </div>

        {/* Notes & Summary Section */}
        <div className="grid grid-cols-1 gap-4 2xl:grid-cols-12">
          <div className="space-y-4 xl:col-span-7">
            <div className="max-w-[500px] rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                Notes
              </h3>
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-24 resize-none border-none bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 dark:text-gray-100 dark:placeholder:text-gray-400"
                    placeholder="Add any additional notes..."
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
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
