import { z } from 'zod';
import {
  DiscountApplicationTime,
  DiscountType,
  PaymentMethod,
  ReceiptStatus
} from '@/lib/generated/prisma/enums';
import { addressSchema } from '../invoice/schema';

export const salesReceiptFormSchema = z.object({
  paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.CASH),
  status: z.enum(ReceiptStatus).default(ReceiptStatus.COMPLETED),
  customerId: z.string().min(1, 'Please select a customer'),
  amount: z.number(),
  dueDate: z.date({
    error: 'Due date is required'
  }),
  notes: z.string().optional(),
  discountType: z.enum(DiscountType).nullable(),
  discountValue: z.number(),
  discountApplicationTime: z.enum(DiscountApplicationTime),
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
  emailCustomer: z.email('Invalid email format'),
  ccEmail: z
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

export type SalesReceiptFormValues = z.infer<typeof salesReceiptFormSchema>;

export interface SalesReceiptItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable: boolean;
}
