'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  DiscountApplicationTime,
  DiscountType,
  PaymentMethod,
  ReceiptStatus
} from '@/lib/generated/prisma/browser';
import { salesReceiptFormSchema,  } from './schema';
import { SalesReceipt } from './types';

export interface SalesFormProps {
  mode?: 'create' | 'edit';
  initialData?: SalesReceipt;
}

export function useSalesForm({ mode = 'create', initialData }: SalesFormProps) {
  const formMethods = useForm({
    mode: 'onChange',
    resolver: zodResolver(salesReceiptFormSchema),
    shouldUnregister: false,
    defaultValues: {
      customerId: initialData?.customer?.id ?? '',
      paymentMethod: initialData?.paymentMethod ?? PaymentMethod.CASH,
      status: initialData?.status ?? ReceiptStatus.COMPLETED,
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
