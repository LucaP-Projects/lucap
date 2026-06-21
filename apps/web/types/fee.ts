import {
  PaymentFrequency,
  PaymentEvent,
  PaymentEventVersion
} from '@prisma/client';
import { z } from 'zod';
export const feeStructureSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  amount: z.number().positive(),
  type: z.enum(['TUITION', 'REGISTRATION', 'ACTIVITY', 'TRANSPORTATION']),
  frequency: z.nativeEnum(PaymentFrequency),
  gradeLevel: z.string(),
  academicYear: z.string()
});

export interface Fee extends PaymentEvent {
  currentVersion: PaymentEventVersion;
  config: FeeConfig;
}

export interface FeeDetails extends Fee {
  versions: PaymentEventVersion[];
  customerSubscriptions: Array<{
    id: string;
    startDate: Date;
    renewsAt: Date;
    subCustomer: {
      id: string;
      name: string;
    };
  }>;
}

export type FeeConfig = {
  key: string;
  value: {
    type: 'TUITION' | 'REGISTRATION' | 'ACTIVITY' | 'TRANSPORTATION';
    gradeLevel: string;
    academicYear: string;
  };
};

export const paymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHECK']),
  reference: z.string().optional(),
  notes: z.string().optional()
});
