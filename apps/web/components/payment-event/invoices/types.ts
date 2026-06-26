import { PaymentMethod } from "@/lib/generated/prisma/enums";

export interface PaymentFormData {
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  invoiceId: string;
}