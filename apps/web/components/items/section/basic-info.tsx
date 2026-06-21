import { UseFormReturn } from 'react-hook-form';

import { ImageUpload } from '@/components/image-upload/image-upload';
import { CategorySelect } from '../../shared/category/category-selection';
import { ItemFormValues } from '../schema';
import FormField from '@/components/lang/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BasicInfoProps {
  form: UseFormReturn<ItemFormValues>;
}

export function BasicInfo({ form }: BasicInfoProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Basic Information</h2>
      <div className="space-y-3">
        <FormLabel>Profile Image*</FormLabel>
        <div className="flex items-start">
          <ImageUpload
            name="image"
            control={form.control}
            required
            className="bg-muted h-32 w-32 shrink-0 overflow-hidden rounded-md border"
          />
          <div className="ml-3 mt-1">
            <p className="text-muted-foreground text-sm">
              Upload a profile image for this item. Recommended size: 400x400px.
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Supported formats: JPG, PNG, GIF
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter item name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter SKU" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ''}
                placeholder="Describe your item"
                className="h-20 resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <CategorySelect
                selectedCategoryId={field.value}
                onSelect={(category) => field.onChange(category.id)}
                className="w-full"
                showAddNew
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
