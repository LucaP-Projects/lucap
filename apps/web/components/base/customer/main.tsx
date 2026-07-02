import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Controller,
  useFormContext,
  useWatch,
  useController
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { useSidebarStore } from '@/stores/useSidePaper';
import { CreditMemo } from '../../credit-memo/types';
import { DelayedCharge } from '../../delayed-charges/types';
import { DelayedCredit } from '../../delayed-credits/types';
import { Estimate } from '../../estimate/types';
import { InvoiceFormValues } from '../../invoice/schema';
import { Invoice } from '../../invoice/types';
import { RefundReceipt } from '../../refund-receipt/types';
import { SalesReceipt } from '../../sales-receipt/types';
import {
  CustomerSelect,
  CustomerSelectData
} from '../../shared/customer/customer-selection';
import CCInput from '../cc';
import { colorPalette } from '../sideBar/color/colors';
import { DueDateSection } from './DueDateSection';

export interface CustomerAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const BillToSection: React.FC<{
  initialData?:
    | Invoice
    | Estimate
    | DelayedCharge
    | DelayedCredit
    | CreditMemo
    | RefundReceipt
    | SalesReceipt;
}> = React.memo(({ initialData }) => {
  const { control, setValue } = useFormContext<InvoiceFormValues>();

  const {
    field: customerIdField,
    fieldState: { error: customerIdError }
  } = useController({
    name: 'customerId',
    control
  });
  const {
    field: emailField,
    fieldState: { error: emailError }
  } = useController({
    name: 'emailCustomer',
    control
  });

  const customerId = useWatch({ control, name: 'customerId' });
  const initialCustomer = useMemo(() => {
    if (!initialData?.customer) return null;
    return {
      id: initialData.customer.id,
      displayName: initialData.customer.displayName || '',
      primaryEmail: initialData.customer.primaryEmail || '',
      level: initialData.customer.level,
      subCustomers: []
    };
  }, [initialData?.customer?.id]);

  const [currentCustomer, setCurrentCustomer] =
    useState<CustomerSelectData | null>(initialCustomer);

  const updateFormValues = useCallback(
    (customer: CustomerSelectData | null) => {
      if (!customer) return;

      setValue('customerId', customer.id, { shouldValidate: true });
      setValue('emailCustomer', customer.primaryEmail || '', {
        shouldValidate: true
      });

      setValue(
        'customerAddress',
        {
          line1: customer.billingAddress?.line1 || '',
          line2: customer.billingAddress?.line2 || '',
          city: customer.billingAddress?.city || '',
          state: customer.billingAddress?.state || '',
          postalCode: customer.billingAddress?.postalCode || '',
          country: customer.billingAddress?.country || ''
        },
        { shouldValidate: true }
      );
    },
    [setValue]
  );

  const handleCustomerSelect = useCallback(
    (customer: CustomerSelectData) => {
      setCurrentCustomer((prev) =>
        prev?.id === customer.id ? prev : customer
      );
      updateFormValues(customer);
    },
    [updateFormValues]
  );

  useEffect(() => {
    if (initialCustomer && !customerId) {
      updateFormValues(initialCustomer);
    }
  }, [initialCustomer, customerId, updateFormValues]);

  const customerInfoSection = useMemo(() => {
    if (!customerId)
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Select a customer to see address fields
        </div>
      );

    return (
      <div className="space-y-2 text-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                {...emailField}
                className="w-full border-b border-transparent bg-transparent p-1 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-500 group-hover/invoice-section:bg-white dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-gray-400 dark:group-hover/invoice-section:bg-gray-800"
                placeholder="Email"
              />
              {emailError && (
                <span className="mt-1 text-xs text-red-500 dark:text-red-400">
                  {emailError.message}
                </span>
              )}
            </div>
            <CCInput />
          </div>
        </div>
        <AddressFields />
      </div>
    );
  }, [customerId, emailField, emailError]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Bill To
      </h3>
      <div>
        <CustomerSelect
          onSelect={handleCustomerSelect}
          selectedCustomerId={customerId}
          className="w-full border-b border-transparent bg-transparent p-1 text-sm group-hover/invoice-section:border-gray-300 group-hover/invoice-section:bg-white dark:group-hover/invoice-section:border-gray-600 dark:group-hover/invoice-section:bg-gray-800"
        />
        {customerIdError && (
          <span className="mt-1 text-xs text-red-500 dark:text-red-400">
            {customerIdError.message}
          </span>
        )}
      </div>
      {customerInfoSection}
    </div>
  );
});
export const AddressFields: React.FC = React.memo(() => {
  const { control } = useFormContext<InvoiceFormValues>();

  return (
    <div className="grid grid-cols-1 gap-2">
      <Controller
        control={control}
        name="customerAddress.line1"
        render={({ field }) => (
          <Input
            {...field}
            placeholder="Address Line 1"
            className="border-b border-transparent bg-transparent p-1 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-500 group-hover/invoice-section:bg-white dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-gray-400 dark:group-hover/invoice-section:bg-gray-800"
          />
        )}
      />
      <Controller
        control={control}
        name="customerAddress.line2"
        render={({ field }) => (
          <Input
            {...field}
            placeholder="Address Line 2"
            className="border-b border-transparent bg-transparent p-1 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-500 group-hover/invoice-section:bg-white dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-gray-400 dark:group-hover/invoice-section:bg-gray-800"
          />
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <Controller
          control={control}
          name="customerAddress.city"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="City"
              className="border-b border-transparent bg-transparent p-1 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-500 group-hover/invoice-section:bg-white dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-gray-400 dark:group-hover/invoice-section:bg-gray-800"
            />
          )}
        />
        <Controller
          control={control}
          name="customerAddress.state"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="State"
              className="border-b border-transparent bg-transparent p-1 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-500 group-hover/invoice-section:bg-white dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-gray-400 dark:group-hover/invoice-section:bg-gray-800"
            />
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Controller
          control={control}
          name="customerAddress.postalCode"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Postal Code"
              className="border-b border-transparent bg-transparent p-1 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-500 group-hover/invoice-section:bg-white dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-gray-400 dark:group-hover/invoice-section:bg-gray-800"
            />
          )}
        />
        <Controller
          control={control}
          name="customerAddress.country"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Country"
              className="border-b border-transparent bg-transparent p-1 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-500 group-hover/invoice-section:bg-white dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-gray-400 dark:group-hover/invoice-section:bg-gray-800"
            />
          )}
        />
      </div>
    </div>
  );
});

export const DetailsSection: React.FC<{
  initialData?:
    | Invoice
    | Estimate
    | DelayedCharge
    | DelayedCredit
    | CreditMemo
    | RefundReceipt
    | SalesReceipt;
}> = React.memo(({ initialData }) => {
  const { theme } = useTheme();
  const selectedColor = useSidebarStore((state) => state.selectedColor);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const customColor = colorPalette[selectedColor];

  // Only apply custom background in light mode, and only after mount to
  // avoid a hydration mismatch (next-themes resolves the persisted theme
  // on the client before React's first hydration pass completes).
  const backgroundStyle =
    mounted && theme === 'light' && customColor?.light
      ? { backgroundColor: customColor.light }
      : {};

  return (
    <div
      className="group/invoice-section space-y-4 rounded-lg border border-gray-200 p-6 transition-colors dark:border-gray-700 dark:bg-gray-800"
      style={backgroundStyle}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BillToSection initialData={initialData} />
        <DueDateSection />
      </div>
    </div>
  );
});

DetailsSection.displayName = 'InvoiceDetailsSection';
AddressFields.displayName = 'AddressFields';
BillToSection.displayName = 'BillToSection';
