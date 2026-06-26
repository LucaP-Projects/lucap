'use client';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { DiscountApplicationTime } from '@/lib/generated/prisma/enums';
import { useSidebarStore } from '@/stores/useSidePaper';
import { useUploadStore } from '@/stores/useViewStore';
import MemoizedNavigation from '../base/navBar';
import { MemoizedSidebar } from '../base/sideBar/sideBar';
import { SubmitButton } from '../base/submitButton';
import {
  validateWithWarnings,
  ValidationWarning
} from '../base/validationWarning';
import { CompanyInfo } from '../invoice/types';
import { TaxSelectData } from '../shared/tax/actions';
import { createSalesReceipt, updateSalesReceipt } from './actions';
import { SalesReceiptFormValues } from './schema';
import { FileWithPreview, SalesReceipt } from './types';
import { useSalesForm } from './useSalesForm';
import { ViewRenderer } from './ViewRenderer';

export interface SalesReceiptFormProps {
  mode?: 'create' | 'edit';
  initialData?: SalesReceipt;
  company?: CompanyInfo | null;
}

export function SalesReceiptForm({
  mode = 'create',
  initialData,
  company
}: SalesReceiptFormProps) {
  const setIsUploading = useUploadStore(
    useCallback((state) => state.setUploading, [])
  );
  const formMethods = useSalesForm({
    mode,
    initialData
  });

  const router = useRouter();
  const { handleSubmit } = formMethods;
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [pendingSubmission, setPendingSubmission] =
    useState<SalesReceiptFormValues | null>(null);

  const handleTaxChange = useCallback(
    (tax: TaxSelectData | null) => {
      formMethods.setValue('taxId', tax?.id || undefined, {
        shouldValidate: true
      });
      formMethods.setValue('taxRate', tax?.rate || 0, { shouldValidate: true });
    },
    [formMethods]
  );

  const prepareFormData = useCallback(
    (data: SalesReceiptFormValues) => ({
      ...data,
      ccEmail: data.ccEmail || '',
      discountType: data.discountType,
      discountValue: data.discountValue ?? 0,
      discountApplicationTime:
        data.discountApplicationTime ?? DiscountApplicationTime.BEFORE_TAX,
      items: data.items.map((item) => ({
        ...item,
        itemId: item.itemId ?? null,
        sku: item.sku || ''
      })),
      files: data.files as FileWithPreview[],
      removedAttachmentIds: data.removedAttachmentIds || []
    }),
    []
  );

  const handleSubmission = useCallback(
    async (data: SalesReceiptFormValues) => {
      try {
        setIsUploading(true);
        const { customizationSettings: settings, selectedColor } =
          useSidebarStore.getState();
        const result =
          mode === 'edit' && initialData
            ? await updateSalesReceipt(
                initialData.id,
                prepareFormData(data),
                settings,
                selectedColor
              )
            : await createSalesReceipt(
                prepareFormData(data),
                settings,
                selectedColor
              );

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        if (mode === 'create') {
          formMethods.reset();
        }

        toast.success(
          `Sales receipt ${mode === 'create' ? 'created' : 'updated'} successfully`
        );

        router.push('/salesreceipts');
        router.refresh();
      } catch (error) {
        console.error('Submission error:', error);
        toast.error(
          error instanceof Error ? error.message : 'Unexpected error'
        );
      } finally {
        setIsUploading(false);
      }
    },
    [mode, initialData, prepareFormData, formMethods, router, setIsUploading]
  );

  const onSubmit = useCallback(
    async (data: SalesReceiptFormValues) => {
      const validationWarnings = validateWithWarnings({
        dueDate: data.dueDate
      });

      if (validationWarnings.length > 0) {
        setWarnings(validationWarnings);
        setShowWarnings(true);
        setPendingSubmission(data);
        return;
      }

      await handleSubmission(data);
    },
    [handleSubmission]
  );

  const handleWarningConfirm = useCallback(async () => {
    setShowWarnings(false);
    if (pendingSubmission) {
      await handleSubmission(pendingSubmission);
    }
    setPendingSubmission(null);
  }, [pendingSubmission, handleSubmission]);

  const handleWarningCancel = useCallback(() => {
    setShowWarnings(false);
    setPendingSubmission(null);
  }, []);

  const formContentProps = useMemo(
    () => ({
      company,
      onTaxChange: handleTaxChange,
      onSubmit,
      warnings,
      showWarnings,
      handleWarningConfirm,
      handleWarningCancel,
      mode
    }),
    [
      company,
      handleTaxChange,
      onSubmit,
      warnings,
      showWarnings,
      handleWarningConfirm,
      handleWarningCancel,
      mode
    ]
  );

  return (
    <FormProvider {...formMethods}>
      <div className="relative flex h-full flex-col overflow-hidden">
        <MemoizedNavigation />
        <div className="relative flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <ViewRenderer
              company={company}
              formContentProps={formContentProps}
            />
          </div>
          <MemoizedSidebar paperType="Sales Receipt" />
        </div>
        <SubmitButton
          mode={mode}
          onSubmit={handleSubmit(onSubmit)}
          paperType="Sales Receipt"
        />
      </div>
    </FormProvider>
  );
}
