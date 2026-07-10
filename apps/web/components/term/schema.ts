import * as z from 'zod';

export const termFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  dueDays: z.number().int().min(0).optional(),
  discountDays: z.number().int().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  active: z.boolean().default(true),
});

export type TermFormValues = z.infer<typeof termFormSchema>;

export type TermRecord = {
  id: string;
  name: string;
  discountPercent: number | null;
  discountDays: number | null;
  dueDays: number | null;
  active: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};