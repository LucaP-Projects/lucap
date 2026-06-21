'use client';
import { useCallback, useMemo, useState } from 'react';
import { DiscountApplicationTime } from '@/lib/generated/prisma/client';
import { useRouter } from 'next/navigation';
import { FormProvider } from 'react-hook-form';
import { useSidebarStore } from '@/stores/useSidePaper';
import { useUploadStore } from '@/stores/useViewStore';
import MemoizedNavigation from '../base/navBar';
import { MemoizedSidebar } from '../base/sideBar/sideBar';
import { SubmitButton } from '../base/submitButton';
import {
  validateWithWarnings,
  ValidationWarning
} from '../base/validationWarning';
import { TaxSelectData } from '../shared/tax/actions';
import { createEstimate, updateEstimate } from './actions';
import { EstimateFormValues } from './schema';
import { FileWithPreview, EstimateFormProps } from './types';
import { useEstimateForm } from './useEstimateForm';
import { ViewRenderer } from './ViewRenderer';
import { toast } from 'sonner';

export function EstimateForm({
  mode = 'create',
  initialData,
  company
}: EstimateFormProps) {
  const setIsUploading = useUploadStore(
    useCallback((state) => state.setUploading, [])
  );
  const formMethods = useEstimateForm({
    mode,
    initialData
  });

  const router = useRouter();
  const { handleSubmit } = formMethods;
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [pendingSubmission, setPendingSubmission] =
    useState<EstimateFormValues | null>(null);

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
    (data: EstimateFormValues) => ({
      ...data,
      ccEmail: data.ccEmail || '',
      status: data.status,
      validUntil: data.validUntil,
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
    async (data: EstimateFormValues) => {
      try {
        setIsUploading(true);
        const { customizationSettings: settings, selectedColor } =
          useSidebarStore.getState();
        const result =
          mode === 'edit' && initialData
            ? await updateEstimate(
                initialData.id,
                prepareFormData(data),
                settings,
                selectedColor
              )
            : await createEstimate(
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
          `Estimate ${mode === 'create' ? 'created' : 'updated'} successfully`
        );
        router.push('/estimates');
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
    [mode, initialData, prepareFormData, formMethods, router]
  );

  const onSubmit = useCallback(
    async (data: EstimateFormValues) => {
      const validationWarnings = validateWithWarnings({
        dueDate: data.dueDate,
        validUntil: data.validUntil
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
          <MemoizedSidebar paperType="Estimate" />
        </div>
        <SubmitButton
          mode={mode}
          onSubmit={handleSubmit(onSubmit)}
          paperType="Estimate"
        />
      </div>
    </FormProvider>
  );
}
