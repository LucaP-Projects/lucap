'use client';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { toast } from 'sonner';
import { FieldGroup } from '@/components/ui/field';
import { createItem, updateItem } from '../actions';
import { itemFormSchema, itemUpdateSchema, ItemFormValues } from '../schema';
import { BasicInfo } from './basic-info';
import { InventoryInfo } from './InventoryInfo';
import { PurchaseInfo } from './purchase-info';
import { SalesInfo } from './sales-info';
import { TypeSelector } from './type-selector';

interface ItemFormProps {
  initialData?: Partial<ItemFormValues> & { id?: string };
  onSuccess: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  isNestedForm?: boolean;
}

export default function ItemForm({
  initialData,
  onSuccess,
  formRef,
  isSubmitting,
  setIsSubmitting,
  isNestedForm = false
}: ItemFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(isEditing ? itemUpdateSchema : itemFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      type: 'NON_INVENTORY',
      sellable: true,
      salesTaxable: true,
      purchasable: false,
      salesPrice: 0,
      cost: 0,
      initialQuantity: 0,
      reorderPoint: 0,
      quantityOnHand: 0,
      name: '',
      sku: '',
      description: '',
      categoryId: '',
      incomeAccountId: '',
      expenseAccountId: '',
      salesDescription: '',
      purchaseDescription: '',
      preferredVendorId: '',
      image: null,
      asOfDate: new Date(),
      inventoryAssetAccountId: '',
      ...{
        ...initialData,
        // Normalize discount fields for editing
        discountEnabled:
          typeof initialData?.discountEnabled === 'boolean'
            ? initialData.discountEnabled
            : false,
        discountType:
          initialData?.discountType === 'PERCENTAGE' ||
          initialData?.discountType === 'FIXED_AMOUNT'
            ? initialData.discountType
            : '',
        discountValue:
          typeof initialData?.discountValue === 'number'
            ? initialData.discountValue
            : 0,
        discountAmount:
          typeof initialData?.discountAmount === 'number'
            ? initialData.discountAmount
            : 0
      }
    }
  });
  // Initialize form for inventory items when editing
  React.useEffect(() => {
    if (isEditing && initialData?.type === 'INVENTORY') {
      if (
        initialData.initialQuantity === undefined ||
        initialData.initialQuantity === null
      ) {
        form.setValue('initialQuantity', 0);
      }
      if (
        initialData.reorderPoint === undefined ||
        initialData.reorderPoint === null
      ) {
        form.setValue('reorderPoint', 0);
      }
      if (!initialData.asOfDate) {
        form.setValue('asOfDate', new Date());
      }
    }
  }, [isEditing, initialData, form]);

  const onSubmit = async (data: ItemFormValues) => {
    try {
      setIsSubmitting(true);
      if (data.type === 'INVENTORY') {
        if (
          data.initialQuantity === undefined ||
          data.initialQuantity === null ||
          data.reorderPoint === undefined ||
          data.reorderPoint === null ||
          !data.asOfDate
        ) {
          toast.warning('Please fill in all required inventory fields');
          return;
        }

        // Ensure inventory assets account is set
        if (!data.inventoryAssetAccountId) {
          toast.warning('Inventory Asset Account is required for inventory items');
          return;
        }
      }

      // Required for all types
      if (!data.name) {
        toast.warning('Name is required');
        return;
      }

      // Sync discount status with item status
      // If discount is enabled, ensure status is DISCONTINUED
      if (data.discountEnabled) {
        data.status = 'DISCONTINUED';
      }
      // If discount is not enabled but status was DISCONTINUED, reset it to ACTIVE
      else if (!data.discountEnabled && data.status === 'DISCONTINUED') {
        data.status = 'ACTIVE';
      }

      // If discount is not enabled, clear discount fields
      if (!data.discountEnabled) {
        data.discountType = null;
        data.discountValue = null;
        data.discountAmount = 0;
      } else {
        // Calculate discountAmount if needed (for display/storage)
        const discountValue = Number(data.discountValue) || 0;
        const salesPrice = Number(data.salesPrice) || 0;
        if (data.discountType === 'PERCENTAGE') {
          if (discountValue > 100) {
            toast( 'Percentage cannot exceed 100%');
            setIsSubmitting(false);
            return;
          }
          data.discountAmount = (discountValue / 100) * salesPrice;
        } else if (data.discountType === 'FIXED_AMOUNT') {
          if (discountValue > salesPrice) {
            toast( 'Discount cannot exceed sales price');
            setIsSubmitting(false);
            return;
          }
          data.discountAmount = discountValue;
        }
        // If discountType is empty string, set to null
        if (!data.discountType) {
          data.discountType = null;
        }
        // If discountValue is not a number, set to null
        if (
          typeof data.discountValue !== 'number' ||
          isNaN(data.discountValue)
        ) {
          data.discountValue = null;
        }
      }

      const formData = { ...data };
      if (formData.image && !(formData.image instanceof File)) {
        delete formData.image;
      }

      let response;
      if (isEditing && initialData?.id) {
        response = await updateItem(initialData.id, formData);
      } else {
        response = await createItem(formData);
      }

      if (!response.success) {
        // Handle duplicate SKU case
        if (response.duplicateItemInfo) {
          toast( (
              <div className="flex flex-col gap-4">
                Your existing duplicate UI
              </div>
            ));
          return;
        }

        toast( response.error || 'Failed to create item');
        return;
      }

      form.reset();
      toast( isEditing
          ? 'Item updated successfully'
          : 'Item created successfully'
    );

      // Redirect and refresh
      onSuccess();
      router.refresh();
    } catch (error) {
      console.error('Form submission error:', error);
      toast(
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNestedForm) {
      e.stopPropagation();
    }

    form.trigger().then((isValid) => {
      if (isValid) {
        form.handleSubmit(onSubmit)(e);
      } else {
        toast( 'Please check all required fields');
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
      <div className="space-y-6">

        <TypeSelector
          value={form.watch('type')}
          onChange={(value) => {
            form.setValue('type', value as ItemFormValues['type']);
            // Reset inventory specific fields when changing type
            if (value !== 'INVENTORY') {
              form.setValue('initialQuantity', 0);
              form.setValue('reorderPoint', 0);
              form.setValue('inventoryAssetAccountId', '');
            }
          }}
        />
        <div className="space-y-6">
          <BasicInfo form={form} />
          {form.watch('type') === 'INVENTORY' && (
            <InventoryInfo form={form} />
          )}
          <SalesInfo form={form} />
          <PurchaseInfo form={form} />
        </div>
      </div>
      </FieldGroup>

    </form>
  );
}
