import { TaxType, TaxStatus } from '@/lib/generated/prisma/client';
import * as z from 'zod';

export const taxFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  description: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  agencyName: z
    .string()
    .min(1, 'Agency name is required')
    .max(50, 'Agency name must be less than 50 characters'),
  type: z.nativeEnum(TaxType).default(TaxType.SALES),
  rate: z.number().min(0, 'Rate must be greater than or equal to 0')
});

export type TaxFormValues = z.infer<typeof taxFormSchema>;
