import {
  ChargeStatus,
  DiscountApplicationTime,
  DiscountType
} from '@/lib/generated/prisma/client';
import { z } from 'zod';
import { addressSchema } from '../invoice/schema';

const delayedChargeItemSchema = z.object({
  id: z.string(),
  productName: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0.01, 'Rate must be greater than 0'),
  taxable: z.boolean().default(true)
});

export const delayedChargeFormSchema = z.object({
  status: z.nativeEnum(ChargeStatus).default(ChargeStatus.PENDING),
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.number(),
  dueDate: z.date({
    required_error: 'Due date is required'
  }),
  notes: z.string().optional(),
  discountType: z.nativeEnum(DiscountType).nullable(),
  discountValue: z.number(),
  discountApplicationTime: z.nativeEnum(DiscountApplicationTime),
  files: z.array(
    z.object({
      id: z.string(),
      file: z.any(),
      preview: z.string().optional(),
      status: z.enum(['pending', 'uploading', 'complete', 'error']),
      progress: z.number().optional(),
      error: z.string().optional(),
      url: z.string().optional(),
      key: z.string().optional()
    })
  ),
  emailCustomer: z.string().email('Invalid email format'),

  ccEmail: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal(''))
    .transform((val) => val || null),
  customerAddress: addressSchema,
  taxId: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  removedAttachmentIds: z.array(z.string()).optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        productName: z.string().min(1, 'Product name is required'),
        description: z.string().optional(),
        quantity: z.number().min(0.01, 'Quantity must be at least 0.01'),
        rate: z.number().min(0.01, 'Rate must be at least 0.01'),
        taxable: z.boolean().default(true),
        itemId: z.string().min(1, 'Please select a product'),
        sku: z.string().optional().nullable()
      })
    )
    .min(1, 'At least one item is required')
});

export type DelayedChargeFormValues = z.infer<typeof delayedChargeFormSchema>;
