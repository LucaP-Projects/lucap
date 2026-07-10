'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { createClass, updateClass, getClassParents } from './actions';
import { classFormSchema, ClassFormValues, ClassRecord } from './schema';

interface ClassFormProps {
  onSuccess: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  classRecord?: ClassRecord;
}

export function ClassForm({
  onSuccess,
  formRef,
  isSubmitting,
  setIsSubmitting,
  classRecord,
}: ClassFormProps) {
  const router = useRouter();
  const isEditMode = !!classRecord;
  const [parents, setParents] = useState<{ id: string; name: string }[]>([]);

  const form = useForm({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: classRecord?.name || '',
      parentId: classRecord?.parentId || undefined,
      active: classRecord?.active ?? true,
    },
  });

  useEffect(() => {
    getClassParents().then((res) => {
      if (res.success && res.data) {
        setParents(res.data.filter((p) => p.id !== classRecord?.id));
      }
    });
  }, [classRecord?.id]);

  const onSubmit = async (data: ClassFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const response = isEditMode && classRecord
        ? await updateClass(classRecord.id, data)
        : await createClass(data);

      if (!response.success) {
        toast(response.error || `Failed to ${isEditMode ? 'update' : 'create'} class`);
        return;
      }

      toast(`Class ${isEditMode ? 'updated' : 'created'} successfully`);
      form.reset();
      onSuccess?.();
      router.refresh();
    } catch {
      toast('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Name*</FieldLabel>
            <Input {...field} placeholder="Enter class name" />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="parentId"
        render={({ field }) => (
          <Field>
            <FieldLabel>Parent Class</FieldLabel>
            <Select
              value={field.value || ''}
              onValueChange={(val) => field.onChange(val || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="No parent (top level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No parent (top level)</SelectItem>
                {parents.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="active"
        render={({ field }) => (
          <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FieldLabel>Active</FieldLabel>
              <FieldDescription>Disable to hide this class from lists</FieldDescription>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Field>
        )}
      />
    </form>
  );
}
