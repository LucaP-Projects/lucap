'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreditMemoStatus,
  CreditMemoReason,
  DiscountType,
  DiscountApplicationTime
} from '@/lib/generated/prisma/client';
import { useForm } from 'react-hook-form';
import { creditMemoFormSchema, CreditMemoFormValues } from './schema';
import { CreditMemo } from './types';

interface CreditMemoFormProps {
  mode?: 'create' | 'edit';
  initialData?: CreditMemo;
}

export function useCreditMemoForm({
  mode = 'create',
  initialData
}: CreditMemoFormProps) {
  const formMethods = useForm<CreditMemoFormValues>({
    mode: 'onChange',
    resolver: zodResolver(creditMemoFormSchema),
    shouldUnregister: false,
    defaultValues: {
      amount: initialData?.amount ?? 0,
      status: initialData?.status ?? CreditMemoStatus.DRAFT,
      customerId: initialData?.customer?.id ?? '',
      reason: initialData?.reason ?? CreditMemoReason.OTHER,
      issueDate: initialData?.issueDate
        ? new Date(initialData.issueDate)
        : new Date(),
      ccEmail: initialData?.paymentEventSnapshot?.cc ?? '',
      files:
        initialData?.attachments?.map((att: any) => ({
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
      taxId: initialData?.taxId ?? '',
      dueDate: initialData?.dueDate
        ? new Date(initialData.dueDate)
        : new Date(),
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
      items: initialData?.items?.map((item: any) => ({
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
