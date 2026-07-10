import * as z from 'zod';
export const adjustmentFormSchema = z.object({
  docNumber: z.string().optional(),
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().int(),
  adjustAccountId: z.string().optional(),
  privateNote: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
});
export type AdjustmentFormValues = z.input<typeof adjustmentFormSchema>;
export type AdjustmentRecord = { id: string; docNumber: string | null; itemId: string; quantity: number; adjustAccountId: string | null; privateNote: string | null; date: Date; companyId: string; createdAt: Date };
