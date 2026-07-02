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
import { CompanyInfo, FileWithPreview } from '../invoice/types';
import type { TaxSelectData } from '../shared/tax/actions';
import { createCreditMemo, updateCreditMemo } from './actions';
import { CreditMemoFormValues } from './schema';
import { CreditMemo } from './types';
import { useCreditMemoForm } from './useCreditMemoForm';
import { CreditMemoViewRenderer } from './ViewRenderer';

interface CreditMemoFormProps {
  mode?: 'create' | 'edit';
  initialData?: CreditMemo;
  company?: CompanyInfo | null;
}

export function CreditMemoForm({
  mode = 'create',
  initialData,
  company
}: CreditMemoFormProps) {
  const setIsUploading = useUploadStore(
    useCallback((state) => state.setUploading, [])
  );
  const formMethods = useCreditMemoForm({
    initialData
  });

  const router = useRouter();
  const { handleSubmit } = formMethods;
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [pendingSubmission, setPendingSubmission] =
    useState<CreditMemoFormValues | null>(null);

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
    (data: CreditMemoFormValues) => ({
      ...data,
      ccEmail: data.ccEmail || '',
      status: data.status,
      reason: data.reason,
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
    async (data: CreditMemoFormValues) => {
      try {
        setIsUploading(true);
        const { customizationSettings: settings, selectedColor } =
          useSidebarStore.getState();
        const result =
          mode === 'edit' && initialData
            ? await updateCreditMemo(
                initialData.id,
                prepareFormData(data),
                settings,
                selectedColor
              )
            : await createCreditMemo(
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
          `Credit Memo ${
            mode === 'create' ? 'created' : 'updated'
          } successfully`
        );
        router.push('/credit-memos');
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
    [setIsUploading, mode, initialData, prepareFormData, router, formMethods]
  );

  const onSubmit = useCallback(
    async (data: CreditMemoFormValues) => {
      const validationWarnings = validateWithWarnings({
        dueDate: data.issueDate
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
      mode,
      initialData
    }),
    [
      company,
      handleTaxChange,
      onSubmit,
      warnings,
      showWarnings,
      handleWarningConfirm,
      handleWarningCancel,
      mode,
      initialData
    ]
  );

  return (
    <FormProvider {...formMethods}>
      <div className="relative flex h-full flex-col overflow-hidden">
        <MemoizedNavigation />
        <div className="relative flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <CreditMemoViewRenderer
              company={company}
              formContentProps={formContentProps}
            />
          </div>
          <MemoizedSidebar paperType="Credit Memo" />
        </div>
        <SubmitButton
          mode={mode}
          onSubmit={handleSubmit(onSubmit)}
          paperType="Credit Memo"
        />
      </div>
    </FormProvider>
  );
}
