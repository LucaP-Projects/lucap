import { z } from 'zod';

const InstallmentScheduleFormItemSchema = z.object({
  dueDate: z.date(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  description: z.string().optional()
});

export const InstallmentPaymentFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    amount: z
      .number()
      .min(0.01, 'Amount must be greater than 0')
      .refine((val) => val > 0, 'Total amount is required'),
    isRequired: z.boolean().default(false),
    installmentDetails: z
      .object({
        numberOfInstallments: z
          .number()
          .min(2, 'Must have at least 2 installments'),
        startDate: z.date(),
        endDate: z.date(),
        schedule: z
          .array(InstallmentScheduleFormItemSchema)
          .min(2, 'Must have at least 2 installments')
      })
      .refine(
        (data) => {
          if (!data.endDate) return true;
          return data.endDate > data.startDate;
        },
        {
          message: 'End date must be after start date',
          path: ['endDate']
        }
      ),
    initialFee: z.object({
      amount: z.number().min(0, 'Initial fee amount cannot be negative'),
      description: z.string().optional(),
      dueDate: z.date().optional()
    })
  })
  .refine(
    (data) => {
      const totalInstallments = data.installmentDetails.schedule.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      return totalInstallments === data.amount;
    },
    {
      message: 'Sum of installments must equal total amount',
      path: ['installmentDetails.schedule']
    }
  )
  .refine(
    (data) => {
      const scheduleLength = data.installmentDetails.schedule.length;
      return scheduleLength === data.installmentDetails.numberOfInstallments;
    },
    {
      message: 'Number of installments must match schedule length',
      path: ['installmentDetails.numberOfInstallments']
    }
  );

export type InstallmentPaymentFormValues = z.infer<
  typeof InstallmentPaymentFormSchema
>;

// Schema for database/API
const InstallmentScheduleApiItemSchema = z.object({
  dueDate: z.string(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  description: z.string().optional()
});

export const InstallmentPaymentApiSchema = z.object({
  totalAmount: z.number(),
  type: z.literal('INSTALLMENTS'),
  numberOfInstallments: z.number().min(2, 'Must have at least 2 installments'),
  startDate: z.string(),
  endDate: z.string(),
  schedule: z
    .array(InstallmentScheduleApiItemSchema)
    .min(2, 'Must have at least 2 installments'),
  initialFee: z
    .object({
      amount: z.number().min(0, 'Initial fee amount cannot be negative'),
      description: z.string().optional(),
      dueDate: z.string().optional()
    })
    .optional()
});

export type InstallmentPaymentApiValues = z.infer<
  typeof InstallmentPaymentApiSchema
>;
