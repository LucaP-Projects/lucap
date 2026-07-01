'use client';

import { useCallback, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Contact2, MapPinIcon, SquarePen } from 'lucide-react';
import { createCustomer, sparseUpdateCustomer, getFullCustomer } from '@/app/(app)/[company-slug]/(dashboards)/customers/actions';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { CustomerPreferredPaymentMethod } from '@/lib/generated/prisma/enums';
import { CreateCustomerDTO, CustomerFormData } from '@/types/customer';
import { CustomerSchema } from '@/validation/customer/customer.schema';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Textarea } from '../ui/textarea';



interface CustomerFormProps {
  type: 'create' | 'update';
  customerId?: string;
  defaultValues?: Partial<CreateCustomerDTO>;
  onSuccess?: () => void;
}

export function CustomerForm({
  type,
  customerId,
  onSuccess
}: CustomerFormProps) {
  const form = useForm({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      title: '',
      givenName: '',
      middleName: '',
      familyName: '',
      suffix: '',
      companyName: '',
      displayName: undefined,
      primaryEmail: '',
      primaryPhone: '',
      alternatePhone: '',
      mobile: '',
      fax: '',
      webAddress: '',
      printOnCheckName: '',
      isSubcustomer: false,
      parentId: undefined,
      billParentCustomer: false,
      billingAddress: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      },
      taxIdentifier: '',
      secondaryTaxId: '',
      resaleNumber: '',
      businessNumber: '',
      taxable: true,
      balance: 0,
      creditLimit: 0,
      preferredPaymentMethod: 'PRINT',
      notes: '',
      metadata: {
        industry: '',
        marketingPreferences: {
          emailOptIn: false,
          smsOptIn: false
        }
      },
      shippingAddressSameAsBilling: true,
      shippingAddress: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      }
    }
  });
  const fetchParentCustomerAndAutofillMissingFields = useCallback(async (
    parentId: string
  ) => {
    if (!parentId) return;
    const parentCustomer = await getFullCustomer(parentId);
    if (!parentCustomer) return;
    const parentBillingAddress =
      (parentCustomer.billingAddress as PrismaJson.Address) || null;
    const parentShippingAddress =
      (parentCustomer.shippingAddress as PrismaJson.Address) || null;

    for (const field of [
      'taxIdentifier',
      'secondaryTaxId',
      'resaleNumber',
      'businessNumber',
      'primaryEmail',
      'primaryPhone',
      'alternatePhone',
      'mobile',
      'fax',
      'webAddress',
      'companyName'
    ] as (keyof typeof form.getValues)[]) {
      if (!form.watch(field) && parentCustomer[field]) {
        form.setValue(field, parentCustomer[field] || undefined);
      }
    }

    if (
      (parentBillingAddress &&
        Object.keys(parentBillingAddress).length &&
        !form.watch('billingAddress')) ||
      !Object.values(form.watch('billingAddress') || {}).some(Boolean)
    ) {
      form.setValue('billingAddress', {
        line1: parentBillingAddress?.line1,
        line2: parentBillingAddress?.line2,
        city: parentBillingAddress?.city,
        state: parentBillingAddress?.state,
        postalCode: parentBillingAddress?.postalCode,
        country: parentBillingAddress?.country
      });
    }
    if (
      (parentShippingAddress &&
        Object.keys(parentShippingAddress).length &&
        !form.watch('shippingAddress')) ||
      !Object.values(form.watch('shippingAddress') || {}).some(Boolean)
    ) {
      form.setValue('shippingAddress', {
        line1: parentShippingAddress?.line1,
        line2: parentShippingAddress?.line2,
        city: parentShippingAddress?.city,
        state: parentShippingAddress?.state,
        postalCode: parentShippingAddress?.postalCode,
        country: parentShippingAddress?.country
      });
    }
  }, [form]);


  const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
    const result = await (type === 'create'
      ? createCustomer(data)
      : sparseUpdateCustomer(customerId as string, data));
    if (result?.success) onSuccess?.();
  };
  const isSubcustomer = form.watch('isSubcustomer');
  const watchedFields = form.watch([
    'title',
    'givenName',
    'middleName',
    'familyName',
    'suffix',
    'companyName'
  ]);
  const parentId = form.watch('parentId');

  useEffect(() => {
    if (parentId) fetchParentCustomerAndAutofillMissingFields(parentId);
  }, [fetchParentCustomerAndAutofillMissingFields, parentId]);
  const updateDisplayName = useCallback(() => {
    const [title, givenName, middleName, familyName, suffix, companyName] =
      watchedFields;

    const displayNames = {
      short: `${givenName || ''} ${familyName || ''}`.trim(),
      familyFirst: familyName
        ? `${familyName},${givenName ? ' ' + givenName : ''}`
        : '',
      full:
        title || suffix || middleName
          ? `${title || ''} ${givenName || ''} ${middleName || ''} ${familyName || ''} ${suffix || ''}`.trim()
          : '',
      company: companyName
    };

    return displayNames;
  }, [watchedFields]);
  const displayNames = updateDisplayName();


  useEffect(() => {
    updateDisplayName();
    const displayName = form.watch('displayName');
    if (!Object.values(displayNames).includes(displayName)) {
      if (form.formState.isDirty) {
        if (!displayName && displayNames.short) {
          form.setValue('displayName', displayNames.short);
        }
        if (
          !displayNames[form.watch('displayName') as keyof typeof displayNames]
        ) {
          form.setValue('displayName', '');
        }
      }
    }
  }, [displayNames, form, updateDisplayName, watchedFields]);

  

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
      <Accordion
        type="multiple"
        className="flex flex-col gap-6"
        defaultValue={['basic', 'billing', 'tax', 'financial', 'additional']}
      >
        {/* Basic Information */}
        <AccordionItem value="basic" className="rounded-lg border shadow-md">
          <AccordionTrigger className="flex justify-between px-4 hover:no-underline">
            <span className="flex gap-2 text-base">
              <Contact2 className="aspect-square w-6" /> Name and contact
            </span>
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-4">
              <div className="flex w-full flex-col gap-4 md:col-span-2 md:flex-row">
                <div className="md:grow-2 space-y-2 md:basis-0">
                  <Controller
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs" htmlFor="title">
                          Title
                        </FieldLabel>
                        <Input
                          {...field}
                          className="text-xs"
                          onBlur={() => {
                            form.setValue('title', field.value?.trim());
                          }}
                        />
                      </Field>
                    )}
                  />
                </div>
                <div className="md:grow-4 space-y-2 md:basis-0">
                  <Controller
                    control={form.control}
                    name="givenName"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs" htmlFor="givenName">
                          First name
                        </FieldLabel>
                        <Input
                          {...field}
                          onBlur={() => {
                            form.setValue('givenName', field.value?.trim());
                          }}
                        />
                      </Field>
                    )}
                  />
                </div>
                <div className="md:grow-3 space-y-2 md:basis-0">
                  <Controller
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs" htmlFor="middleName">
                          Middle name
                        </FieldLabel>
                        <Input
                          {...field}
                          onBlur={() => {
                            form.setValue(
                              'middleName',
                              field.value?.trim()
                            );
                          }}
                        />
                      </Field>
                    )}
                  />
                </div>
                <div className="md:grow-4 space-y-2 md:basis-0">
                  <Controller
                    control={form.control}
                    name="familyName"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs" htmlFor="familyName">
                          Last name
                        </FieldLabel>
                        <Input
                          {...field}
                          onBlur={() => {
                            form.setValue(
                              'familyName',
                              field.value?.trim()
                            );
                          }}
                        />
                      </Field>
                    )}
                  />
                </div>
                <div className="md:grow-2 space-y-2 md:basis-0">
                  <Controller
                    control={form.control}
                    name="suffix"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs" htmlFor="suffix">
                          Suffix
                        </FieldLabel>
                        <Input
                          {...field}
                          onBlur={() => {
                            form.setValue('suffix', field.value?.trim());
                          }}
                        />
                      </Field>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-1">
                <Controller
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="companyName">
                        Company name
                      </FieldLabel>
                      <Input
                        {...field}
                        onBlur={() => {
                          form.setValue('companyName', field.value?.trim());
                        }}
                      />
                    </Field>
                  )}
                />
              </div>
              <div className="flex-grow-4 space-y-2 md:col-span-1">
                <Controller
                  control={form.control}
                  name="displayName"
                  rules={{ required: 'Display name is required' }}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="displayName">
                        Customer display name*
                      </FieldLabel>
                      {/* TODO: Replace with combobox component */}
                      <Input
                        id="displayName"
                        {...field}
                        placeholder="Customer display name"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="primaryEmail"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="primaryEmail">
                        Email
                      </FieldLabel>
                      <Input
                        {...field}
                        id="primaryEmail"
                        type="email"
                        required
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="primaryPhone"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="primaryPhone">
                        Primary Phone
                      </FieldLabel>
                      <Input {...field} id="primaryPhone" />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="alternatePhone"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="alternatePhone">
                        Alternate Phone
                      </FieldLabel>
                      <Input {...field} id="alternatePhone" />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="mobile"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="mobile">
                        Mobile
                      </FieldLabel>
                      <Input {...field} id="mobile" />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>

                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="fax"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="fax">
                        Fax
                      </FieldLabel>
                      <Input {...field} id="fax" type="tel" />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="webAddress"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="webAddress">
                        Website
                      </FieldLabel>
                      <Input {...field} id="webAddress" type="url" />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Controller
                  control={form.control}
                  name="printOnCheckName"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        className="text-xs"
                        htmlFor="printOnCheckName"
                      >
                        Name to print on checks
                      </FieldLabel>
                      <Input {...field} id="printOnCheckName" />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="col-span-2">
                <Controller
                  control={form.control}
                  name="isSubcustomer"
                  render={({ field, fieldState }) => (
                    <Field className="flex items-center gap-2 space-y-0">
                      <FieldLabel
                        className="m-0 text-xs"
                        htmlFor="isSubcustomer"
                      >
                        Is a sub-customer
                      </FieldLabel>
                      <Checkbox
                        {...field}
                        className="m-0 "
                        id="isSubcustomer"
                        onCheckedChange={(value) =>
                          form.setValue('isSubcustomer', !!value)
                        }
                        value={'' + field.value}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {isSubcustomer && (
                <Controller
                  control={form.control}
                  name="parentId"
                  render={({ field, fieldState }) => (
                    <Field className="space-y-2 pl-4">
                      <FieldLabel className="text-xs" htmlFor="parentId">
                        Parent customer
                      </FieldLabel>
                      {/* TODO: Replace with combobox component */}
                      <Input
                        id="parentId"
                        {...field}
                        placeholder="Enter a parent customer"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}
              {isSubcustomer && form.watch('parentId') && (
                <div className="col-span-2 pl-4">
                  <Controller
                    control={form.control}
                    name="billParentCustomer"
                    render={({ field, fieldState }) => (
                      <Field className="flex items-center gap-2 space-y-0">
                        <Checkbox
                          {...field}
                          id="billParentCustomer"
                          onCheckedChange={(value) =>
                            form.setValue('billParentCustomer', !!value)
                          }
                          value={'' + field.value}
                        />
                        <FieldLabel
                          className="m-0 text-xs"
                          htmlFor="billParentCustomer"
                        >
                          Bill parent customer
                        </FieldLabel>
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Address */}
        <AccordionItem
          value="billing"
          className="rounded-lg border shadow-md"
        >
          <AccordionTrigger className="px-4">
            <span className="flex gap-2">
              <MapPinIcon className="aspect-square w-6" />
              Addresses
            </span>
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <div className="mb-4">
              <Label className="text-sm" htmlFor="billingAddress.line1">
                Billing Address
              </Label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Controller
                  control={form.control}
                  name="billingAddress.line1"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        className="text-xs"
                        htmlFor="billingAddress.line1"
                      >
                        Address Line 1
                      </FieldLabel>
                      <Input {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Controller
                  control={form.control}
                  name="billingAddress.line2"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        className="text-xs"
                        htmlFor="billingAddress.line2"
                      >
                        Address Line 2
                      </FieldLabel>
                      <Input {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="billingAddress.city"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        className="text-xs"
                        htmlFor="billingAddress.city"
                      >
                        City
                      </FieldLabel>
                      <Input {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="billingAddress.state"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        className="text-xs"
                        htmlFor="billingAddress.state"
                      >
                        State/Province
                      </FieldLabel>
                      <Input {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="billingAddress.postalCode"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        className="text-xs"
                        htmlFor="billingAddress.postalCode"
                      >
                        Postal Code
                      </FieldLabel>
                      <Input {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="billingAddress.country"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        className="text-xs"
                        htmlFor="billingAddress.country"
                      >
                        Country
                      </FieldLabel>
                      <Input {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>
            <div className="col-span-2 mt-4">
              <Controller
                control={form.control}
                name="shippingAddressSameAsBilling"
                render={({ field, fieldState }) => (
                  <Field className="flex items-center gap-2 space-y-0">
                    <Checkbox
                      {...field}
                      id="shippingAddressSameAsBilling"
                      value={'' + field.value}
                    />
                    <FieldLabel
                      className="m-0 text-xs"
                      htmlFor="shippingAddressSameAsBilling"
                    >
                      Shipping address same as billing address
                    </FieldLabel>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            {!form.watch('shippingAddressSameAsBilling') && (
              <>
                <div className="mb-4">
                  <Label className="text-sm" htmlFor="billingAddress.line1">
                    Billing Address
                  </Label>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Controller
                      control={form.control}
                      name="billingAddress.line1"
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel
                            className="text-xs"
                            htmlFor="billingAddress.line1"
                          >
                            Address Line 1
                          </FieldLabel>
                          <Input {...field} />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Controller
                      control={form.control}
                      name="billingAddress.line2"
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel
                            className="text-xs"
                            htmlFor="billingAddress.line2"
                          >
                            Address Line 2
                          </FieldLabel>
                          <Input {...field} />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Controller
                      control={form.control}
                      name="billingAddress.city"
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel
                            className="text-xs"
                            htmlFor="billingAddress.city"
                          >
                            City
                          </FieldLabel>
                          <Input {...field} />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Controller
                      control={form.control}
                      name="billingAddress.state"
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel
                            className="text-xs"
                            htmlFor="billingAddress.state"
                          >
                            State/Province
                          </FieldLabel>
                          <Input {...field} />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Controller
                      control={form.control}
                      name="billingAddress.postalCode"
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel
                            className="text-xs"
                            htmlFor="billingAddress.postalCode"
                          >
                            Postal Code
                          </FieldLabel>
                          <Input {...field} />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Controller
                      control={form.control}
                      name="billingAddress.country"
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel
                            className="text-xs"
                            htmlFor="billingAddress.country"
                          >
                            Country
                          </FieldLabel>
                          <Input {...field} />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
        {/* Additional Information */}
        <AccordionItem
          value="additional"
          className="rounded-lg border shadow-md"
        >
          <AccordionTrigger className="px-4">
            <span className="flex gap-2">
              <SquarePen className="aspect-square w-6" />
              Notes and attachments{' '}
            </span>
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="notes"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="notes">
                        Notes
                      </FieldLabel>
                      <Textarea {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tax Information */}
        <AccordionItem value="tax" className="rounded-lg border shadow-md">
          <AccordionTrigger className="px-4">
            <span className="flex gap-2">Tax Information</span>
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="taxIdentifier"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="taxIdentifier">
                        Tax ID
                      </FieldLabel>
                      <Input {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="secondaryTaxId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="secondaryTaxId">
                        Secondary Tax ID
                      </FieldLabel>
                      <Input {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="resaleNumber"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="resaleNumber">
                        Resale Number
                      </FieldLabel>
                      <Input {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="businessNumber"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="businessNumber">
                        Business Number
                      </FieldLabel>
                      <Input {...field} />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  control={form.control}
                  name="taxable"
                  render={({ field, fieldState }) => (
                    <Field className="flex items-center gap-2 space-y-0">
                      <Checkbox
                        {...field}
                        id="taxable"
                        value={'' + field.value}
                      />
                      <FieldLabel className="text-xs" htmlFor="taxable">
                        Taxable
                      </FieldLabel>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Financial Information */}
        <AccordionItem
          value="financial"
          className="rounded-lg border shadow-md"
        >
          <AccordionTrigger className="px-4">
            Financial Information
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="balance"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="balance">
                        Opening Balance
                      </FieldLabel>
                      <Input {...field} type="number" />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="creditLimit"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-xs" htmlFor="creditLimit">
                        Credit Limit
                      </FieldLabel>
                      <Input {...field} type="number" step="0.01" />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="preferredPaymentMethod"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        className="text-xs"
                        htmlFor="preferredPaymentMethod"
                      >
                        Preferred Payment Method
                      </FieldLabel>
                      <Select
                        {...field}
                        onValueChange={(
                          value: CustomerPreferredPaymentMethod
                        ) => form.setValue('preferredPaymentMethod', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Print">Print</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </form>
  );
}
