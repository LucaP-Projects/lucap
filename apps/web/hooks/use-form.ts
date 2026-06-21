import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useHookForm, UseFormProps } from 'react-hook-form';
import { z } from 'zod';

interface UseFormConfig<T extends z.ZodType> {
  schema: T;
  defaultValues?: UseFormProps<z.infer<T>>['defaultValues'];
  mode?: UseFormProps<z.infer<T>>['mode'];
}

export function useForm<T extends z.ZodType>({
  schema,
  defaultValues,
  mode = 'onBlur'
}: UseFormConfig<T>) {
  return useHookForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode
  });
}
