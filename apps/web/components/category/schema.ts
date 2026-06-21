import * as z from 'zod';

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  description: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  parentId: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0)
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
