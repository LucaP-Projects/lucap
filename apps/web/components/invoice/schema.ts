import { z } from 'zod';
import { DiscountApplicationTime, DiscountType } from '@/lib/generated/prisma/client';

export const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required')
});

export const invoiceFormSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
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

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
