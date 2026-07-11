import * as z from 'zod';

export const companyCurrencyFormSchema = z.object({
  currency: z.string().min(1, 'Currency code is required').max(3, 'Currency code must be 3 characters').toUpperCase(),
  name: z.string().optional(),
  active: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export type CompanyCurrencyFormValues = z.infer<typeof companyCurrencyFormSchema>;

export type CompanyCurrencyRecord = {
  id: string;
  currency: string;
  name: string | null;
  active: boolean;
  isDefault: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};
