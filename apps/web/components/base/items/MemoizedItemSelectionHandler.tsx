import React, { memo, useCallback } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
  useController
} from 'react-hook-form';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatCurrency, handleNumberInput } from '@/lib/utils';
import { InvoiceFormValues } from '../../invoice/schema';
import { ItemSelect } from '../../shared/item/item-selection';

interface ItemSelectionHandlerProps {
  showTaxable?: boolean;
  itemLabel?: string;
}
const DescriptionField = memo(({ index }: { index: number }) => {
  const { control } = useFormContext<InvoiceFormValues>();

  return (
    <div className="col-span-2 border-r border-gray-200 pr-4 dark:border-gray-700">
      <Controller
        control={control}
        name={`items.${index}.description`}
        render={({ field }) => (
          <Field className="space-y-0">
            <Input
              {...field}
              className="h-8 text-sm focus:ring-1"
              placeholder="Add description"
            />
          </Field>
        )}
      />
    </div>
  );
});

const ProductField = memo(
  ({ index }: { index: number }) => {
    const { control, setValue } = useFormContext<InvoiceFormValues>();
    const {
      field: itemField,
      fieldState: { error: itemError }
    } = useController({
      name: `items.${index}.itemId`,
      control
    });

    const { field: productNameField } = useController({
      name: `items.${index}.productName`,
      control
    });

    const handleSelect = useCallback(
      (selectedItem: any) => {
        setValue(`items.${index}.productName`, selectedItem.name, {
          shouldValidate: true
        });
        setValue(`items.${index}.description`, selectedItem.description || '', {
          shouldValidate: true
        });
        setValue(`items.${index}.itemId`, selectedItem.id, {
          shouldValidate: true
        });
        setValue(`items.${index}.sku`, selectedItem.sku, {
          shouldValidate: true
        });

        const originalPrice = Number(selectedItem.salesPrice) || 0;
        let finalPrice = originalPrice;
        if (
          selectedItem.sellable &&
          selectedItem.status === 'DISCONTINUED' &&
          selectedItem.discountType &&
          typeof selectedItem.discountValue === 'number' &&
          selectedItem.discountValue > 0
        ) {
          if (selectedItem.discountType === 'PERCENTAGE') {
            finalPrice = originalPrice * (1 - selectedItem.discountValue / 100);
          } else if (selectedItem.discountType === 'FIXED_AMOUNT') {
            finalPrice = originalPrice - selectedItem.discountValue;
          }

          finalPrice = Math.max(finalPrice, 0);
        }

        setValue(`items.${index}.rate`, finalPrice, {
          shouldValidate: true
        });
      },
      [index, setValue]
    );

    return (
      <div className="col-span-3 border-r border-gray-200 pr-4 dark:border-gray-700">
        <Field className="space-y-0">
          <ItemSelect
            showAddNew
            onSelect={handleSelect}
            selectedItemId={itemField.value || undefined}
            initialName={productNameField.value}
          />
          {itemError && (
            <span className="mt-1 text-xs text-red-500 dark:text-red-400">
              {itemError.message}
            </span>
          )}
        </Field>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.index === nextProps.index
);

const QuantityField = memo(({ index }: { index: number }) => {
  const { control } = useFormContext<InvoiceFormValues>();
  const {
    field,
    fieldState: { error }
  } = useController({
    name: `items.${index}.quantity`,
    control
  });

  return (
    <div className="col-span-2 border-r border-gray-200 pr-4 dark:border-gray-700">
      <Field className="space-y-0">
        <Input
          type="number"
          step="0.01"
          className={cn(
            'h-8 text-right text-sm',
            error && 'border-red-500 focus:border-red-500'
          )}
          {...field}
          onChange={(e) => {
            handleNumberInput(e.target.value, field.onChange, 0);
          }}
        />
        {error && (
          <span className="mt-1 text-xs text-red-500 dark:text-red-400">
            {error.message}
          </span>
        )}
      </Field>
    </div>
  );
});

const RateField = memo(({ index }: { index: number }) => {
  const { control } = useFormContext<InvoiceFormValues>();
  const {
    field,
    fieldState: { error }
  } = useController({
    name: `items.${index}.rate`,
    control
  });

  return (
    <div className="col-span-2 border-r border-gray-200 pr-4 dark:border-gray-700">
      <Field className="space-y-0">
        <Input
          type="number"
          step="0.01"
          className={cn(
            'h-8 text-right text-sm',
            error && 'border-red-500 focus:border-red-500'
          )}
          {...field}
          onChange={(e) => {
            handleNumberInput(e.target.value, field.onChange, 0);
          }}
        />
        {error && (
          <span className="mt-1 text-xs text-red-500 dark:text-red-400">
            {error.message}
          </span>
        )}
      </Field>
    </div>
  );
});

const SortableItem = memo(({ id, children }: { id: number; children: any }) => {
  const sortable = useSortable({ id, index: id }); ;
  const { ref, listeners, transform, transition } = sortable || {};

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition
  };

  return (
    <div ref={ref as any} style={style}>
      {children(listeners)}
    </div>
  );
});

const ItemRow = memo(
  ({
    index,
    onRemove,
    listeners,

    totalItems
  }: {
    index: number;
    onRemove: () => void;
    listeners: any;

    totalItems: number;
  }) => (
    <div className="grid grid-cols-12 items-center gap-4 px-4 py-3">
      <div
        className="col-span-1 flex cursor-move items-center px-1"
        {...listeners}
      >
        <GripVertical className="h-4 w-4 min-w-[16px] text-gray-400 dark:text-gray-500" />
      </div>

      <ProductField index={index} />
      <DescriptionField index={index} />
      <QuantityField index={index} />
      <RateField index={index} />

      <div className="col-span-2 flex items-center justify-end gap-2">
        <Total index={index} />
        {totalItems > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-7 w-7 p-0 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  ),
  (prev, next) =>
    prev.index === next.index &&
    prev.totalItems === next.totalItems &&
    prev.onRemove === next.onRemove
);

const MobileItemRow = memo(
  ({
    index,
    onRemove,

    totalItems
  }: {
    index: number;
    onRemove: () => void;
    totalItems: number;
  }) => {
    const { control } = useFormContext<InvoiceFormValues>();
    const quantity = useWatch({
      control: control,
      name: `items.${index}.quantity`
    });

    const rate = useWatch({
      control: control,
      name: `items.${index}.rate`
    });

    return (
      <div className="border-b p-4 dark:border-gray-700">
        <div className="flex flex-col gap-3">
          <ProductField index={index} />

          <Controller
            control={control}
            name={`items.${index}.description`}
            render={({ field }) => (
              <Field>
                <Textarea
                  {...field}
                  placeholder="Description"
                  className="h-8 text-sm"
                />
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <QuantityField index={index} />
            <RateField index={index} />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(quantity * rate)}
            </span>
            {totalItems > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-7 w-7 p-0"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

const ItemSelectionHandler = memo(
  ({ itemLabel = 'product or service' }: ItemSelectionHandlerProps) => {
    const { control } = useFormContext<InvoiceFormValues>();

    const {
      fields: items,
      append,
      remove,
      move
    } = useFieldArray({
      control: control,
      name: 'items',
      keyName: 'id'
    });
    const handleRemove = useCallback(
      (index: number) => () => remove(index),
      [remove]
    );

    const onAddItem = useCallback(() => {
      append({
        id: crypto.randomUUID(),
        productName: '',
        description: '',
        quantity: 1,
        rate: 0,
        taxable: true,
        itemId: '',
        sku: ''
      });
    }, [append]);
    const handleDragEnd = useCallback(
      (event: any) => {
        const { operation, canceled } = event;
        if (canceled) return;

        const sourceId = operation?.source?.id;
        const targetId = operation?.target?.id;
        if (!sourceId || !targetId || sourceId === targetId) return;

        const oldIndex = items.findIndex((item) => item.id === sourceId);
        const newIndex = items.findIndex((item) => item.id === targetId);
        if (oldIndex === -1 || newIndex === -1) return;

        move(oldIndex, newIndex);
      },
      [items, move]
    );

    return (
      <div className="bg-white dark:bg-gray-800">
        {/* Desktop View */}
        <div className="hidden p-4 md:block">
          <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <div className="col-span-1" />
            <div className="col-span-3 border-r border-gray-200 pr-4 dark:border-gray-700">
              Product/service
            </div>
            <div className="col-span-2 border-r border-gray-200 pr-4 dark:border-gray-700">
              Description
            </div>
            <div className="col-span-2 border-r border-gray-200 pr-4 text-right dark:border-gray-700">
              Qty
            </div>
            <div className="col-span-2 border-r border-gray-200 pr-4 text-right dark:border-gray-700">
              Rate
            </div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="overflow-hidden">
            <DragDropProvider onDragEnd={handleDragEnd}>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item, index) => (
                  <SortableItem key={item.id} id={item.id}>
                    {(listeners: any) => (
                      <ItemRow
                        index={index}
                        onRemove={handleRemove(index)}
                        listeners={listeners}
                        totalItems={items.length}
                      />
                    )}
                  </SortableItem>
                ))}
              </div>
            </DragDropProvider>
          </div>
        </div>

        <div className="md:hidden">
          {items.map((item, index) => (
            <MobileItemRow
              key={item.id}
              index={index}
              onRemove={handleRemove(index)}
              totalItems={items.length}
            />
          ))}
        </div>

        <div className="flex justify-start p-4">
          <Button
            type="button"
            onClick={onAddItem}
            variant="ghost"
            size="sm"
            className="bg-gray-100 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {itemLabel}
          </Button>
        </div>
      </div>
    );
  }
);
const Total = memo(({ index }: { index: number }) => {
  const { control } = useFormContext<InvoiceFormValues>();

  const quantity = useWatch({
    control,
    name: `items.${index}.quantity`,
    defaultValue: 1
  });

  // Watch rate with default value
  const rate = useWatch({
    control,
    name: `items.${index}.rate`,
    defaultValue: 0
  });

  return (
    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
      {formatCurrency(quantity * rate)}
    </span>
  );
});

Total.displayName = 'Total';
SortableItem.displayName = 'SortableItem';
ItemRow.displayName = 'ItemRow';
MobileItemRow.displayName = 'MobileItemRow';
DescriptionField.displayName = 'DescriptionField';
ProductField.displayName = 'ProductField';
QuantityField.displayName = 'QuantityField';
RateField.displayName = 'RateField';
ItemSelectionHandler.displayName = 'ItemSelectionHandler';

export default ItemSelectionHandler;
