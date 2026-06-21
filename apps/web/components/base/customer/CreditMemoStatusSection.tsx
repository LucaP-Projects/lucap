import React, { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CreditMemoStatus, CreditMemoReason } from '@/lib/generated/prisma/client';
import { CreditMemoFormValues } from '../../credit-memo/schema';

export const CreditMemoStatusSection: React.FC = memo(() => {
  const { control } = useFormContext<CreditMemoFormValues>();

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
          Status
        </label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              onValueChange={(value) =>
                field.onChange(value as CreditMemoStatus)
              }
              value={field.value}
            >
              <SelectTrigger className="h-9 w-[130px] bg-gray-50/50 dark:bg-gray-800/50">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CreditMemoStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={CreditMemoStatus.APPLIED}>
                  Applied
                </SelectItem>
                <SelectItem value={CreditMemoStatus.ISSUED}>Issued</SelectItem>
                <SelectItem value={CreditMemoStatus.VOID}>Void</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
          Reason
        </label>
        <Controller
          control={control}
          name="reason"
          render={({ field }) => (
            <Select
              onValueChange={(value) =>
                field.onChange(value as CreditMemoReason)
              }
              value={field.value}
            >
              <SelectTrigger className="h-9 w-[130px] bg-gray-50/50 dark:bg-gray-800/50">
                <SelectValue placeholder="Select Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CreditMemoReason.RETURN}>Return</SelectItem>
                <SelectItem value={CreditMemoReason.OVERPAYMENT}>
                  Overpayment
                </SelectItem>
                <SelectItem value={CreditMemoReason.CANCELLATION}>
                  Cancellation
                </SelectItem>
                <SelectItem value={CreditMemoReason.CORRECTION}>
                  Correction
                </SelectItem>
                <SelectItem value={CreditMemoReason.DISCOUNT}>
                  Discount
                </SelectItem>
                <SelectItem value={CreditMemoReason.DAMAGED_GOODS}>
                  Damaged Goods
                </SelectItem>
                <SelectItem value={CreditMemoReason.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
});

CreditMemoStatusSection.displayName = 'CreditMemoStatusSection';
