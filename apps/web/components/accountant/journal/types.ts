import * as z from 'zod';

export const journalEntrySchema = z.object({
  date: z.date({
    required_error: 'Date is required'
  }),
  journalNo: z.string().min(1, 'Journal number is required'),
  description: z.string().optional(),
  customerId: z.string().optional(),
  entries: z
    .array(
      z.object({
        accountId: z.string().min(1, 'Account is required'),
        customerId: z.string().optional(),
        debit: z.number().nullable(),
        credit: z.number().nullable(),
        description: z.string().optional()
      })
    )
    .min(1, 'At least one entry is required')
});

export type JournalFormValues = z.infer<typeof journalEntrySchema>;
