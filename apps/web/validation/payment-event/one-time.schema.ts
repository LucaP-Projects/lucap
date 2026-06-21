import { z } from 'zod';

// Form schema for one-time payment
export const oneTimePaymentFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.date({
    required_error: 'Due date is required'
  }),
  isRequired: z.boolean().default(false),
  initialFee: z
    .object({
      amount: z.number().min(0, 'Initial fee cannot be negative'),
      description: z.string().optional(),
      dueDate: z.date().optional()
    })
    .optional()
});

// For API/DB with string dates
export const OneTimePaymentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  amount: z.union([
    z.number().positive('Amount must be positive'),
    z.literal(0)
  ]),
  dueDate: z.string(),
  isRequired: z.boolean().default(false),
  baseSchedule: z.object({
    totalAmount: z.number(),
    type: z.literal('ONE_TIME'),
    dueDate: z.string(),
    initialFee: z
      .object({
        amount: z.number().min(0, 'Initial fee cannot be negative'),
        description: z.string().optional(),
        dueDate: z.string().optional()
      })
      .optional()
  })
});
export const oneTimeVersionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.date().min(new Date(), 'Due date must be in the future'),
  isRequired: z.boolean(),
  shouldMigrate: z.boolean(),
  migrationReason: z.string().optional(),
  changeReason: z.string().min(1, 'Change reason is required'),
  scheduledFor: z
    .date()
    .min(new Date(), 'Scheduled date must be in the future'),
  initialFee: z.object({
    amount: z.number().min(0, 'Initial fee amount must be positive'),
    description: z.string().optional(),
    dueDate: z.date().optional()
  })
});

export type OneTimeVersionFormValues = z.infer<typeof oneTimeVersionSchema>;
export type oneTimePaymentFormValues = z.infer<typeof oneTimePaymentFormSchema>;
export type OneTimePaymentValues = z.infer<typeof OneTimePaymentSchema>;
