import { Controller, UseFormReturn } from 'react-hook-form';
import { ImageUpload } from '@/components/image-upload/image-upload';
import { CategorySelect } from '@/components/shared/category/category-selection';
import { ItemFormValues } from '../schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

interface BasicInfoProps {
  form: UseFormReturn<ItemFormValues>;
}

export function BasicInfo({ form }: BasicInfoProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Basic Information</h2>
      <div className="space-y-3">
        <FieldLabel>Profile Image*</FieldLabel>
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
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Name*</FieldLabel>
              <Input {...field} placeholder="Enter item name" />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="sku"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>SKU</FieldLabel>
              <Input {...field} placeholder="Enter SKU" />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

      </div>

      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              {...field}
              value={field.value || ''}
              placeholder="Describe your item"
              className="h-20 resize-none"
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="categoryId"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Category</FieldLabel>
            <CategorySelect
              selectedCategoryId={field.value}
              onSelect={(category) => field.onChange(category.id)}
              className="w-full"
              showAddNew
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
    </div >
  );
}
