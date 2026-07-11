import * as z from 'zod';

export const budgetEntrySchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  amount: z.number().min(0, 'Amount must be positive'),
});

export const budgetFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  budgetType: z.enum(['ANNUAL', 'MONTHLY', 'QUARTERLY']).default('ANNUAL'),
  fiscalYear: z.number().int().min(2000).max(2100),
  entries: z.array(budgetEntrySchema).min(1, 'At least one account entry is required'),
});

export type BudgetFormValues = z.input<typeof budgetFormSchema>;
export type BudgetEntryValues = z.input<typeof budgetEntrySchema>;

export type BudgetRecord = {
  id: string;
  name: string;
  budgetType: string;
  fiscalYear: number;
  startDate: Date;
  endDate: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BudgetWithEntries = BudgetRecord & {
  entries: { id: string; accountId: string; account: { id: string; title: string; number: string }; amount: number }[];
};
