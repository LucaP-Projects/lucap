import { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useFormCacheStore } from '@/stores/useInvoice';
import { useSidebarStore } from '@/stores/useSidePaper';
import { colorPalette } from '../sideBar/color/colors';
import { generatePdf } from './template/generatePdf';
import { Company, PaperType } from './types';

interface PdfPreviewProps {
  company?: Company | null;
  paperType: PaperType;
}

export const PdfPreview = memo(({ company, paperType }: PdfPreviewProps) => {
  const selectedColor = useSidebarStore((state) => state.selectedColor);
  const settings = useSidebarStore((state) => state.customizationSettings);
  const note = useSidebarStore((state) => state.note);
  const formData = useFormCacheStore((state) => state.cachedFormData);

  const calculations = useMemo(() => {
    if (!formData?.items) {
      return {
        subtotal: 0,
        taxableSubtotal: 0,
        discountAmount: 0,
        total: 0,
        taxAmount: 0
      };
    }

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

    // Calculate tax amount and total
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

    return {
      subtotal,
      taxableSubtotal,
      discountAmount,
      total,
      taxAmount
    };
  }, [formData]);

  return (
    <div className="mx-auto min-h-full w-full max-w-4xl bg-white p-4 md:p-8">
      {/* Header Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div
            className="text-base font-bold uppercase md:text-lg"
            style={{ color: colorPalette[selectedColor].main }}
          >
            {paperType.toUpperCase()}
          </div>
          <div className="mt-1 text-sm text-gray-600">{company?.name}</div>
          <div className="text-sm text-gray-600">{company?.address?.line1}</div>
          <div className="text-sm text-gray-600">{company?.email}</div>
        </div>

        {/* Invoice Details */}
        {(settings.invoiceDate || settings.dueDate || settings.invoiceNo) && (
          <div className="text-sm">
            <div className="mb-1 font-semibold text-gray-900">
              {paperType} details
            </div>
            {/* {settings.invoiceNo && (
              <div>Invoice : {formData?.invoiceNumber}</div>
            )} */}
            {settings.invoiceDate && (
              <div className="text-gray-700">
                {paperType} date: {format(new Date(), 'MM/dd/yyyy')}
              </div>
            )}
            {settings.dueDate && (
              <div className="text-gray-700">
                Due date:{' '}
                {formData?.dueDate && format(formData?.dueDate, 'MM/dd/yyyy')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bill To and Customer Info */}

      {settings.shipTo && (
        <div
          className="mb-8 grid grid-cols-1 gap-6 p-2 md:grid-cols-2"
          style={{ backgroundColor: colorPalette[selectedColor].light }}
        >
          <div>
            <div className="mb-1 text-sm font-semibold text-gray-900">
              Bill to
            </div>
            <div className="text-sm text-gray-700">
              {formData?.emailCustomer}
              <div>{formData?.customerAddress?.line1}</div>
              <div>
                {formData?.customerAddress?.city},
                {formData?.customerAddress?.state}
                {formData?.customerAddress?.postalCode}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Scrollable Table Container */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[600px] table-fixed">
          <thead>
            <tr className="border-b text-left text-sm">
              {settings.tableNumber && (
                <th className="w-12 py-2 text-gray-900" />
              )}
              <th className="w-1/6 py-2 text-gray-900">Product</th>
              {settings.description && (
                <th className="w-1/3 py-2 text-gray-900 md:table-cell">
                  Description
                </th>
              )}
              {settings.sku && (
                <th className="w-24 py-2 text-gray-900 md:table-cell">SKU</th>
              )}
              {settings.quantity && (
                <th className="w-20 py-2 text-right text-gray-900">Qty</th>
              )}
              {settings.rate && (
                <th className="w-24 py-2 text-right text-gray-900">Rate</th>
              )}
              {settings.amount && (
                <th className="w-24 py-2 text-right text-gray-900">Amount</th>
              )}
            </tr>
          </thead>
          <tbody>
            {formData?.items?.map((item, index) => (
              <tr key={index} className="border-b text-sm">
                {settings.tableNumber && (
                  <td className="py-2 align-top text-gray-700">{index + 1}.</td>
                )}
                <td className="break-words py-2 font-medium text-gray-900">
                  {item.productName}
                </td>
                {settings.description && (
                  <td className="whitespace-pre-wrap break-words py-2 text-gray-700 md:table-cell">
                    {item.description}
                  </td>
                )}
                {settings.sku && (
                  <td className="break-words py-2 text-gray-700 md:table-cell">
                    {item.sku}
                  </td>
                )}
                {settings.quantity && (
                  <td className="py-2 text-right align-top text-gray-700">
                    {item.quantity}
                  </td>
                )}
                {settings.rate && (
                  <td className="py-2 text-right align-top text-gray-700">
                    ${item.rate.toFixed(2)}
                  </td>
                )}
                {settings.amount && (
                  <td className="py-2 text-right align-top text-gray-700">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end">
        <div className="w-full md:w-64">
          <div className="mb-2 flex justify-between text-sm text-gray-700">
            <span>Subtotal:</span>
            <span>${calculations.subtotal.toFixed(2)}</span>
          </div>

          {Boolean(formData?.discountValue) && (
            <div className="mb-2 flex justify-between text-sm text-red-600">
              <span>
                Discount (
                {formData?.discountType === 'PERCENTAGE'
                  ? `${formData?.discountValue}%`
                  : 'Flat'}
                ):
              </span>
              <span>-${calculations.discountAmount.toFixed(2)}</span>
            </div>
          )}

          {Boolean(formData?.taxRate) && (
            <div className="mb-2 flex justify-between text-sm text-gray-700">
              <span>Tax ({formData?.taxRate}%):</span>
              <span>${calculations.taxAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t pt-2 text-sm font-semibold text-gray-900">
            <div className="flex justify-between">
              <span>Total:</span>
              <span>${calculations.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Note to Customer */}
      <div className="mt-8 border-t pt-4 text-sm">
        {settings.note && (
          <>
            <div className="font-semibold text-gray-900">Note to customer</div>
            <div className="mt-1 text-gray-600">{note}</div>
          </>
        )}
      </div>
    </div>
  );
});
PdfPreview.displayName = 'MemoizedPdfPreview';
