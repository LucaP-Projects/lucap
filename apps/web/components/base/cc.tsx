import React, { memo, useCallback, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { InvoiceFormValues } from '../invoice/schema';

const validateEmail = (email: string): boolean => {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const CCInput = memo(function CCInput() {
  const [open, setOpen] = useState(false);
  const { control } = useFormContext<InvoiceFormValues>();

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  return (
    <Controller
      control={control}
      name="ccEmail"
      render={({ field }) => {
        // Instead of using useMemo, just compute these values directly
        const isInvalid = !validateEmail(field.value || '');

        const buttonClassName = `bg-transparent group-hover/invoice-section:bg-white dark:group-hover/invoice-section:bg-gray-800 ${
          isInvalid && field.value ? 'text-red-500 dark:text-red-400' : ''
        }`;

        const inputClassName = `w-full ${
          isInvalid && field.value
            ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-400 dark:focus-visible:ring-red-400'
            : ''
        }`;

        return (
          <FieldGroup className="w-auto">
            <Popover open={open} onOpenChange={handleOpenChange} modal>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={buttonClassName}
                  type="button"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      CC Email (Optional)
                    </label>
                    {field.value && isInvalid && (
                      <span className="text-xs text-red-500 dark:text-red-400">
                        Invalid email format
                      </span>
                    )}
                  </div>
                  <Input
                    placeholder="Enter CC email (optional)"
                    className={inputClassName}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </FieldGroup>
        );
      }}
    />
  );
});

CCInput.displayName = 'CCInput';
export default CCInput;
