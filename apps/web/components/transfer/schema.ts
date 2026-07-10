import * as z from 'zod';
export const transferFormSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  transferDate: z.string().min(1, 'Date is required'),
  fromAccountId: z.string().min(1, 'Source account is required'),
  toAccountId: z.string().min(1, 'Target account is required'),
  memo: z.string().optional(),
});
export type TransferFormValues = z.input<typeof transferFormSchema>;
export type TransferRecord = { id: string; amount: number; transferDate: Date; fromAccountId: string; toAccountId: string; memo: string | null; companyId: string; createdAt: Date };
