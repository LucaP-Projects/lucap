import React, { memo } from 'react';
import { PaymentMethod, ReceiptStatus } from '@/lib/generated/prisma/client';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SalesReceiptFormValues } from '../../sales-receipt/schema';

export const SalesStatusSection: React.FC = memo(() => {
  const { control } = useFormContext<SalesReceiptFormValues>();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Status
            </label>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-9 w-[130px] bg-gray-50/50 dark:bg-gray-800/50">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReceiptStatus.COMPLETED}>
                  Completed
                </SelectItem>
                <SelectItem value={ReceiptStatus.REFINDED}>Refunded</SelectItem>
                <SelectItem value={ReceiptStatus.VOIDED}>Voided</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      />

      <Controller
        control={control}
        name="paymentMethod"
        render={({ field }) => (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Payment Method
            </label>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-9 w-[160px] bg-gray-50/50 dark:bg-gray-800/50">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                <SelectItem value={PaymentMethod.CREDIT_CARD}>
                  Credit Card
                </SelectItem>
                <SelectItem value={PaymentMethod.CHECK}>Check</SelectItem>
                <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                  Bank Transfer
                </SelectItem>
                <SelectItem value={PaymentMethod.DIGITAL_WALLET}>
                  Digital Wallet
                </SelectItem>
                <SelectItem value={PaymentMethod.MOBILE_PAYMENT}>
                  Mobile Payment
                </SelectItem>
                <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      />
    </div>
  );
});

SalesStatusSection.displayName = 'SalesStatusSection';
