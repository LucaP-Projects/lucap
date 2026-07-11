import React, { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PaymentMethod, RefundReason, RefundStatus } from '@/lib/generated/prisma/enums';
import { RefundReceiptFormValues } from '../../refund-receipt/schema';

export const RefundStatusSection: React.FC = memo(() => {
  const { control } = useFormContext<RefundReceiptFormValues>();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Controller
        control={control}
        name="refundMethod"
        render={({ field }) => (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Refund Method
            </label>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-9 w-[160px] bg-gray-50/50 dark:bg-gray-800/50">
                <SelectValue placeholder="Select refund method" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PaymentMethod).map((method) => (
                  <SelectItem key={method} value={method}>
                    {method.charAt(0) +
                      method.slice(1).toLowerCase().replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />

      <Controller
        control={control}
        name="originalPaymentMethod"
        render={({ field }) => (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Original Payment Method
            </label>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-9 w-[160px] bg-gray-50/50 dark:bg-gray-800/50">
                <SelectValue placeholder="Select original method" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PaymentMethod).map((method) => (
                  <SelectItem key={method} value={method}>
                    {method.charAt(0) +
                      method.slice(1).toLowerCase().replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />

      <Controller
        control={control}
        name="reason"
        render={({ field }) => (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Refund Reason
            </label>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-9 w-[160px] bg-gray-50/50 dark:bg-gray-800/50">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(RefundReason).map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason.charAt(0) +
                      reason.slice(1).toLowerCase().replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />

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
                {Object.values(RefundStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0) +
                      status.slice(1).toLowerCase().replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />
    </div>
  );
});

RefundStatusSection.displayName = 'RefundStatusSection';
