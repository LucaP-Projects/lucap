import { memo } from 'react';
import { motion } from 'framer-motion';
import { useFormContext, useWatch } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { TaxSelectData } from '../../shared/tax/actions';
import { TaxSelect } from '../../shared/tax/tax-select';

interface TaxSectionProps {
  taxAmount: number;

  onTaxChange: (tax: TaxSelectData | null) => void;
}

const TaxSection = memo(({ taxAmount, onTaxChange }: TaxSectionProps) => {
  const { control } = useFormContext();
  const taxId = useWatch({ control, name: 'taxId' });
  const handleTaxChange = (tax: TaxSelectData | null) => {
    onTaxChange(tax);
  };

  return (
    <motion.div
      className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      initial={{ scale: 0.98 }}
      animate={{ scale: 1 }}
    >
      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-linear-to-r from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-gray-950 dark:from-gray-600 dark:to-gray-800">
            Tax
          </Badge>
          <TaxSelect
            onSelect={handleTaxChange}
            selectedTaxId={taxId}
            className="w-full md:w-[200px]"
            showAddNew
          />
        </div>
        <span className="text-sm font-medium text-indigo-600 md:text-base dark:text-indigo-400">
          +{formatCurrency(taxAmount)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs dark:text-gray-400">
          {/* Note: Tax rate display will now be handled by TaxSelect component */}
        </span>
      </div>
    </motion.div>
  );
});

TaxSection.displayName = 'TaxSection';

export { TaxSection };
