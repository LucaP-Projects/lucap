'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DiscountApplicationTime, DiscountType } from '@/lib/generated/prisma/client';
import { useForm } from 'react-hook-form';
import { ColorName } from '@/components/base/sideBar/color/types';
import { useSidebarStore } from '@/stores/useSidePaper';
import { invoiceFormSchema, InvoiceFormValues } from './schema';
import { InvoiceFormProps } from './types';

export function useInvoiceForm({
  mode = 'create',
  initialData
}: InvoiceFormProps) {
  const setSelectedColor = useSidebarStore((state) => state.setSelectedColor);
  const setCustomizationSettings = useSidebarStore(
    (state) => state.setCustomizationSettings
  );

  useEffect(() => {
    // Set the color from the payment event snapshot if it exists
    if (initialData?.paymentEventSnapshot?.color) {
      const invoiceColor = initialData.paymentEventSnapshot.color as ColorName;
      setSelectedColor(invoiceColor);
    }

    // Set the customization settings from the payment event snapshot if it exists
    if (initialData?.paymentEventSnapshot?.customPdfSettings) {
      const customPdfSettings =
        initialData.paymentEventSnapshot.customPdfSettings;
      setCustomizationSettings({
        shipTo: customPdfSettings.shipTo ?? true,
        invoiceNo: customPdfSettings.invoiceNo ?? true,
        invoiceDate: customPdfSettings.invoiceDate ?? false,
        dueDate: customPdfSettings.dueDate ?? true,
        tableNumber: customPdfSettings.tableNumber ?? true,
        productService: customPdfSettings.productService ?? true,
        sku: customPdfSettings.sku ?? false,
        description: customPdfSettings.description ?? true,
        quantity: customPdfSettings.quantity ?? true,
        rate: customPdfSettings.rate ?? true,
        amount: customPdfSettings.amount ?? true,
        note: customPdfSettings.note ?? false
      });
    }
  }, [initialData, setSelectedColor, setCustomizationSettings]);
  const formMethods = useForm<InvoiceFormValues>({
    mode: 'onChange',
    resolver: zodResolver(invoiceFormSchema),
    shouldUnregister: false,
    defaultValues: {
      customerId: initialData?.customer?.id ?? '',
      ccEmail: initialData?.paymentEventSnapshot?.cc ?? '',
      files:
        initialData?.attachments?.map((att) => ({
          id: att.id,
          status: 'complete' as const,
          key: att.file.path,
          file: {
            name: att.file.filename,
            type: att.file.mimetype,
            size: att.file.size
          },
          fileId: att.file.id,
          path: att.file.path,
          mimetype: att.file.mimetype,
          size: att.file.size,
          attachmentId: att.id
        })) || [],
      dueDate: initialData?.dueDate
        ? new Date(initialData.dueDate)
        : new Date(),
      taxId: initialData?.taxId ?? '',
      amount: initialData?.amount ?? 0,
      taxRate: initialData?.taxRate ?? 0,
      discountType: initialData?.discountType ?? DiscountType.PERCENTAGE,
      discountValue: initialData?.discountValue ?? 0,
      discountApplicationTime:
        initialData?.discountApplicationTime ??
        DiscountApplicationTime.AFTER_TAX,
      notes: initialData?.notes ?? '',
      emailCustomer: initialData?.emailCustomer ?? '',
      customerAddress: {
        line1:
          initialData?.paymentEventSnapshot?.customer?.address?.line1 ?? '',
        line2:
          initialData?.paymentEventSnapshot?.customer?.address?.line2 ?? '',
        city: initialData?.paymentEventSnapshot?.customer?.address?.city ?? '',
        state:
          initialData?.paymentEventSnapshot?.customer?.address?.state ?? '',
        postalCode:
          initialData?.paymentEventSnapshot?.customer?.address?.postalCode ??
          '',
        country:
          initialData?.paymentEventSnapshot?.customer?.address?.country ?? ''
      },
      removedAttachmentIds: [],

      items: initialData?.items?.map((item) => ({
        id: item.id,
        productName: item.productName ?? '',
        description: item.description ?? '',
        sku: item.sku ?? '',
        quantity: item.quantity ?? 1,
        rate: item.rate ?? 0,
        taxable: item.taxable ?? true,
        itemId: item.itemId ?? ''
      })) ?? [
        {
          id: crypto.randomUUID(),
          productName: '',
          itemId: '',
          description: '',
          quantity: 1,
          rate: 0,
          sku: '',
          taxable: true
        }
      ]
    }
  });

  return formMethods;
}
