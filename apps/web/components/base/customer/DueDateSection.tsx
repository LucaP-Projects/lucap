import React, { memo, useCallback } from 'react';
import { format } from 'date-fns';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Calendar, CalendarIcon } from 'lucide-react';

import { InvoiceFormValues } from '../../invoice/schema';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
export const DueDateSection: React.FC = React.memo(() => {
  const { control } = useFormContext<InvoiceFormValues>();
  const dueDate = useWatch({ control, name: 'dueDate' });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Due Date
      </h3>
      <Controller
        control={control}
        name="dueDate"
        render={({ field }) => (
          <FormItem>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start border-b border-transparent p-1 font-normal hover:border-gray-300 group-hover/invoice-section:bg-white dark:hover:border-gray-600 dark:group-hover/invoice-section:bg-gray-800"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {dueDate ? (
                    format(dueDate, 'dd/MM/yyyy')
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">
                      Select date
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormItem>
        )}
      />
    </div>
  );
});

DueDateSection.displayName = 'DueDateSection';
