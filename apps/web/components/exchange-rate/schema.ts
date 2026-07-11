import * as z from 'zod';

export const exchangeRateFormSchema = z.object({
  sourceCurrency: z.string().min(1, 'Source currency is required').max(3).toUpperCase(),
  targetCurrency: z.string().min(1, 'Target currency is required').max(3).toUpperCase(),
  rate: z.number().min(0, 'Rate must be positive'),
  asOfDate: z.string().min(1, 'Date is required'),
});

export type ExchangeRateFormValues = z.input<typeof exchangeRateFormSchema>;

export type ExchangeRateRecord = {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  rate: number;
  asOfDate: Date;
  source: string;
  createdAt: Date;
  updatedAt: Date;
};
