import React, { memo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFormContext, useWatch } from 'react-hook-form';
import { ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { DiscountApplicationTime, DiscountType } from '@/lib/generated/prisma/client';
import { formatCurrency } from '@/lib/utils';

import { TaxSelectData } from '../../shared/tax/actions';
import { DiscountSection } from './DiscountInput';
import { TaxSection } from './TaxRow';
import { usePriceCalculation } from './usePriceCalculation';

interface MemoizedPriceSummaryProps {
  onTaxChange: (tax: TaxSelectData | null) => void;
}

const MemoizedPriceSummary = memo(
  ({ onTaxChange }: MemoizedPriceSummaryProps) => {
    const { control, setValue } = useFormContext();
    const items = useWatch({ control, name: 'items' });
    const discountType = useWatch({ control, name: 'discountType' });
    const discountValue = useWatch({ control, name: 'discountValue' });
    const discountApplicationTime = useWatch({
      control,
      name: 'discountApplicationTime'
    });
    const taxRate = useWatch({ control, name: 'taxRate' });

    const { total, subtotal, discountAmount, taxAmount } = usePriceCalculation({
      items: items || [],
      taxRate: taxRate || 0,
      discountType: discountType || DiscountType.PERCENTAGE,
      discountValue: discountValue || 0,
      discountPosition:
        discountApplicationTime || DiscountApplicationTime.BEFORE_TAX
    });

    useEffect(() => {
      setValue('amount', total, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }, [total, setValue]);

    const handleTaxChange = useCallback(
      (tax: TaxSelectData | null) => {
        onTaxChange(tax);
      },
      [onTaxChange]
    );

    const handleDiscountChange = useCallback(
      (type: DiscountType, value: number) => {
        setValue('discountType', type);
        setValue('discountValue', value);
      },
      [setValue]
    );

    const handleDiscountPositionChange = useCallback(() => {
      setValue(
        'discountApplicationTime',
        discountApplicationTime === DiscountApplicationTime.BEFORE_TAX
          ? DiscountApplicationTime.AFTER_TAX
          : DiscountApplicationTime.BEFORE_TAX
      );
    }, [setValue, discountApplicationTime]);

    return (
      <Card className="overflow-hidden rounded-lg border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <CardContent className="space-y-4 p-6">
          {/* Subtotal */}
          <div className="flex items-center justify-between pt-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Subtotal
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-border h-px w-full dark:bg-gray-700"
              />
            </div>
            <div className="relative flex justify-center">
              <Tooltip>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDiscountPositionChange}
                  className="bg-background z-10 h-10 w-10 rounded-full p-0 dark:bg-gray-900"
                >
                  <motion.div
                    animate={{
                      rotate:
                        discountApplicationTime ===
                        DiscountApplicationTime.BEFORE_TAX
                          ? 0
                          : 180
                    }}
                  >
                    <ArrowDownUp className="h-4 w-4" />
                  </motion.div>
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Animated Sections */}
          <div className="flex flex-col gap-4">
            <motion.div
              layout="position"
              transition={{ duration: 0.2 }}
              style={{
                order:
                  discountApplicationTime === DiscountApplicationTime.BEFORE_TAX
                    ? 0
                    : 1
              }}
            >
              <DiscountSection
                discountType={discountType || DiscountType.PERCENTAGE}
                discountValue={discountValue || 0}
                onDiscountChange={handleDiscountChange}
                discountAmount={discountAmount}
                position={
                  discountApplicationTime === DiscountApplicationTime.BEFORE_TAX
                    ? 'before'
                    : 'after'
                }
              />
            </motion.div>
            <motion.div
              layout="position"
              transition={{ duration: 0.2 }}
              style={{
                order:
                  discountApplicationTime === DiscountApplicationTime.BEFORE_TAX
                    ? 1
                    : 0
              }}
            >
              <TaxSection taxAmount={taxAmount} onTaxChange={handleTaxChange} />
            </motion.div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t pt-4 dark:border-gray-700">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Total
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(total)}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }
);

MemoizedPriceSummary.displayName = 'MemoizedPriceSummary';

export default MemoizedPriceSummary;
