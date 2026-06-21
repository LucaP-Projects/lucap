'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useFormCacheStore } from '@/stores/useInvoice';
import { useSidebarStore } from '@/stores/useSidePaper';
import { useUploadStore } from '@/stores/useViewStore';
import { generatePdf } from './preview/template/generatePdf';
import { PaperType, Company } from './preview/types';
import { colorPalette } from './sideBar/color/colors';

interface SubmitButtonProps {
  mode?: 'create' | 'edit';
  onSubmit: () => void;
  paperType: PaperType;
  company?: Company | null;
}

export const SubmitButton = memo(function SubmitButton({
  mode = 'create',
  onSubmit,
  paperType,
  company
}: SubmitButtonProps) {
  const router = useRouter();
  const { isUploading } = useUploadStore();
  const selectedColor = useSidebarStore((state) => state.selectedColor);
  const settings = useSidebarStore((state) => state.customizationSettings);
  const note = useSidebarStore((state) => state.note);
  const formData = useFormCacheStore((state) => state.cachedFormData);

  const calculations = {
    subtotal: 0,
    taxableSubtotal: 0,
    discountAmount: 0,
    total: 0,
    taxAmount: 0
  };

  if (formData?.items) {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );

    const taxableSubtotal = formData.items.reduce(
      (sum, item) => (item.taxable ? sum + item.quantity * item.rate : sum),
      0
    );

    let discountAmount = 0;
    if (formData.discountType === 'PERCENTAGE' && formData.discountValue) {
      discountAmount = subtotal * (formData.discountValue / 100);
    } else if (
      formData.discountType === 'FIXED_AMOUNT' &&
      formData.discountValue
    ) {
      discountAmount = Math.min(formData.discountValue, subtotal);
    }

    let taxAmount = 0;
    let total = subtotal;

    if (formData.discountApplicationTime === 'BEFORE_TAX') {
      total -= discountAmount;
      if (formData.taxRate) {
        const discountProportion =
          subtotal > 0 ? taxableSubtotal / subtotal : 0;
        const taxableAfterDiscount =
          taxableSubtotal - discountAmount * discountProportion;
        taxAmount = (taxableAfterDiscount * formData.taxRate) / 100;
        total += taxAmount;
      }
    } else {
      if (formData.taxRate) {
        taxAmount = (taxableSubtotal * formData.taxRate) / 100;
        total += taxAmount;
      }
      total -= discountAmount;
    }

    calculations.subtotal = subtotal;
    calculations.taxableSubtotal = taxableSubtotal;
    calculations.discountAmount = discountAmount;
    calculations.total = total;
    calculations.taxAmount = taxAmount;
  }

  const handlePreview = async () => {
    if (!formData) return;

    try {
      const pdfBuffer = await generatePdf({
        formData,
        company,
        color: colorPalette[selectedColor].main,
        colorLight: `${colorPalette[selectedColor].light}`,
        settings,
        note,
        taxRate: formData.taxRate,
        paperType,
        ...calculations
      });

      const blob = new Blob([pdfBuffer as unknown as Blob], {
        type: 'application/pdf'
      });
      const blobUrl = URL.createObjectURL(blob);

      const previewWindow = window.open();
      if (previewWindow) {
        previewWindow.document.write(`
          <iframe 
            src="${blobUrl}" 
            style="width:100%;height:100%;border:none;" 
            onload="URL.revokeObjectURL('${blobUrl}')"
          ></iframe>
        `);
        previewWindow.document.close();
      } else {
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  return (
    <div className="border-t bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        {/* Print/Download button - centered and full width on mobile */}
        <div className="flex w-full justify-center sm:flex-1">
          <Button
            variant="link"
            onClick={handlePreview}
            className="w-full sm:w-auto sm:max-w-xs"
          >
            Print/Download
          </Button>
        </div>

        {/* Cancel and Submit buttons - right aligned on desktop, full width on mobile */}
        <div className="flex w-full gap-3 sm:w-auto">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isUploading}
            onClick={onSubmit}
            className={`flex-1 sm:flex-none ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {isUploading
              ? 'Uploading...'
              : mode === 'edit'
                ? `Update ${paperType}`
                : `Create ${paperType}`}
          </Button>
        </div>
      </div>
    </div>
  );
});
