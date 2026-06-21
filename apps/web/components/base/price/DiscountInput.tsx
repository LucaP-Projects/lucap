import { DiscountApplicationTime, DiscountType } from '@/lib/generated/prisma/client';
import { motion } from 'framer-motion';

import { cn, formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from 'lucide-react';
import { Label, Tabs } from 'radix-ui';

interface DiscountSectionProps {
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  position?: 'before' | 'after';
  discountApplicationTime?: DiscountApplicationTime;
  onDiscountChange: (type: DiscountType, value: number) => void;
}

export function DiscountSection({
  position = 'before',
  discountApplicationTime = DiscountApplicationTime.BEFORE_TAX,
  ...props
}: DiscountSectionProps) {
  const actualPosition =
    position === 'before' ||
    discountApplicationTime === DiscountApplicationTime.BEFORE_TAX
      ? 'before'
      : 'after';
  return (
    <motion.div
      className={cn(
        'rounded-lg border p-3 shadow-sm md:p-4',
        actualPosition === 'before'
          ? 'border-amber-100 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20'
          : 'border-emerald-100 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-900/20'
      )}
    >
      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Badge
            className={
              position === 'before'
                ? 'bg-amber-700 text-amber-50 hover:bg-amber-800 dark:bg-amber-800 dark:hover:bg-amber-900'
                : 'bg-emerald-700 text-emerald-50 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-900'
            }
          >
            {position === 'before' ? 'Before Tax' : 'After Tax'}
          </Badge>
          <Label className="hidden text-gray-900 md:block dark:text-gray-100">
            Discount
          </Label>
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <Input
            type="number"
            min="0"
            value={props.discountValue}
            onChange={(e) => {
              const value = Math.max(0, parseFloat(e.target.value) || 0);
              props.onDiscountChange(props.discountType, value);
            }}
            className="w-full md:w-24"
          />
          <Tabs
            value={props.discountType}
            onValueChange={(value) =>
              props.onDiscountChange(value as DiscountType, props.discountValue)
            }
            className="w-[100px]"
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value={DiscountType.PERCENTAGE}>%</TabsTrigger>
              <TabsTrigger value={DiscountType.FIXED_AMOUNT}>$</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <span className="text-muted-foreground text-xs dark:text-gray-400">
          {position === 'before'
            ? 'Applied to subtotal first'
            : 'Applied after tax calculation'}
        </span>
        <span className="text-sm font-medium text-gray-900 md:text-base dark:text-gray-100">
          -{formatCurrency(props.discountAmount)}
        </span>
      </div>
    </motion.div>
  );
}
