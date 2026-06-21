import { z } from 'zod';
const itemSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().positive('Rate must be positive'),
  amount: z.number().positive('Amount must be positive'),
  taxable: z.boolean().default(true)
});
const initialFeeSchema = z.object({
  amount: z.number().min(0, 'Initial fee cannot be negative'),
  description: z.string().optional()
});

const baseSchema = {
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one item is required')
};

// Separate weekly and monthly anchor configurations
const weeklyAnchorSchema = z.object({
  type: z.literal('weekly'),
  day: z.number().min(1).max(7)
});

const monthlyAnchorSchema = z.object({
  type: z.literal('monthly'),
  day: z.union([z.number().min(1).max(28), z.literal('last')])
});

const frequencySchema = z.object({
  unit: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']),
  value: z.number().min(1, 'Frequency value must be positive').default(1)
});

const oneTimeSchema = z.object({
  ...baseSchema,
  type: z.literal('ONE_TIME'),

  dueDate: z.date().optional().nullable(),
  generateInvoiceNow: z.boolean().default(false)
});

const subscriptionSchema = z.object({
  ...baseSchema,
  type: z.literal('SUBSCRIPTION'),
  frequency: frequencySchema,
  useAnchorDate: z.boolean().default(false),
  // Only required if useAnchorDate is true
  anchorConfig: z.union([weeklyAnchorSchema, monthlyAnchorSchema]).optional(),
  allowPause: z.boolean().default(false),
  trialPeriodDays: z.number().min(0).optional(),
  initialFee: initialFeeSchema.optional().default({
    amount: 0,
    description: ''
  })
});

export const paymentEventFormSchema = z
  .discriminatedUnion('type', [oneTimeSchema, subscriptionSchema])
  .refine(
    (data) => {
      if (data.type === 'ONE_TIME') {
        // If generateInvoiceNow is false, dueDate must be provided
        if (!data.generateInvoiceNow && !data.dueDate) {
          return false;
        }
        // If generateInvoiceNow is true, dueDate should not be provided
        if (data.generateInvoiceNow && data.dueDate) {
          return false;
        }
      }

      if (data.type === 'SUBSCRIPTION') {
        // If useAnchorDate is true, anchorConfig must be provided
        if (data.useAnchorDate && !data.anchorConfig) {
          return false;
        }

        // Validate anchor configuration matches frequency
        if (data.useAnchorDate && data.anchorConfig) {
          if (
            data.frequency.unit === 'WEEK' &&
            data.anchorConfig.type !== 'weekly'
          ) {
            return false;
          }
          if (
            data.frequency.unit === 'MONTH' &&
            data.anchorConfig.type !== 'monthly'
          ) {
            return false;
          }
          // Don't allow anchor dates for daily or yearly frequencies
          if (['DAY', 'YEAR'].includes(data.frequency.unit)) {
            return false;
          }
        }
      }
      return true;
    },
    {
      message: 'Invalid form configuration'
    }
  );

export type PaymentEventFormValues = z.infer<typeof paymentEventFormSchema>;
export const defaultOneTimeValues = {
  type: 'ONE_TIME' as const,
  name: '',
  description: '',
  items: [],
  generateInvoiceNow: false,
  dueDate: null
};

export const defaultSubscriptionValues = {
  type: 'SUBSCRIPTION' as const,
  name: '',
  description: '',
  items: [],

  frequency: {
    unit: 'MONTH' as const,
    value: 1
  },
  useAnchorDate: false,
  allowPause: false,
  initialFee: {
    amount: 0,
    description: ''
  }
};
