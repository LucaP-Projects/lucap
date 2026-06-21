'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Form, useForm } from 'react-hook-form';


import { CategoryWithItems } from '@/components/dashboard/categories/types';
import { handleNumberInput } from '@/lib/utils';
import { CategorySelect } from '../shared/category/category-selection';
import { createCategory, updateCategory } from './actions';
import { categoryFormSchema, CategoryFormValues } from './schema';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import FormField from '../lang/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CategoryFormProps {
  onSuccess: (newCategory?: CategoryWithItems) => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  isNestedForm?: boolean;
  category?: CategoryWithItems; 
}

export function CategoryForm({
  onSuccess,
  formRef,
  isSubmitting,
  setIsSubmitting,
  isNestedForm = false,
  category 
}: CategoryFormProps) {
  const router = useRouter();
  const isEditMode = !!category;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      active: category?.active ?? true,
      sortOrder: category?.sortOrder ?? 0,
      parentId: category?.parentId || undefined
    }
  });

  const onSubmit = async (data: CategoryFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      let response;
      if (isEditMode && category) {
        response = await updateCategory(category.id, data);
      } else {
        response = await createCategory(data);
      }

      if (!response.success) {
        // Handle validation or other errors
        toast(
          response.error ||
            `Failed to ${isEditMode ? 'update' : 'create'} category`
        );
        return;
      }

      // Handle success
      toast(`Category ${isEditMode ? 'updated' : 'created'} successfully`);
      // Reset form
      form.reset();
      // Call success callback
      onSuccess?.(response.data);
      // Refresh the current route
      router.refresh();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? 'updating' : 'creating'} category:`,
        error
      );
      toast('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    if (isNestedForm) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit(onSubmit)(e);
  };
  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter category name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter category description"
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <CategorySelect
                showAddNew={false}
                onSelect={(category) => {
                  form.setValue('parentId', category.id);
                }}
                selectedCategoryId={field.value}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Disable to hide this category from lists
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input
                  min="0"
                  step="1"
                  type="number"
                  onChange={(e) =>
                    handleNumberInput(e.target.value, field.onChange, 0)
                  }
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Categories are sorted in ascending order
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
