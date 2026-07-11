import * as z from 'zod';
export const depositFormSchema = z.object({
  depositNumber: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  depositDate: z.string().min(1, 'Date is required'),
  memo: z.string().optional(),
});
export type DepositFormValues = z.input<typeof depositFormSchema>;
export type DepositRecord = { id: string; depositNumber: string | null; amount: number; depositDate: Date; memo: string | null; companyId: string; createdAt: Date };
