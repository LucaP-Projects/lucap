import * as z from 'zod';

export const accountFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Account name is required')
    .max(255, 'Account name must be less than 255 characters'),
  number: z
    .string()
    .min(1, 'Account number is required')
    .max(6, 'Account number must be less than 7 characters')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  parentId: z.string().nullable().optional()
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
