import { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { InvoiceFormValues } from '../invoice/schema';

const NotesField = memo(() => {
  const { control } = useFormContext<InvoiceFormValues>();

  return (
    <div className="max-w-[500px] rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
        Notes
      </h3>
      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <Textarea
            {...field}
            value={field.value || ''}
            className="h-24 resize-none border-none bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 dark:text-gray-100 dark:placeholder:text-gray-400"
            placeholder="Add any additional notes..."
          />
        )}
      />
    </div>
  );
});

NotesField.displayName = 'NotesField';
export default NotesField;
