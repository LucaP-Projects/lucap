'use client';

import { useTransition, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Building2, Loader2, MapPin, Phone } from 'lucide-react';

import { ImageUpload } from '@/components/image-upload/image-upload';
import { PhoneInput } from '@/components/shared/mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
import {
  Input,

} from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CompanyType } from '@/lib/generated/prisma/client';
import { EditCompanyInput, editCompanySchema, CompanyResponse } from '../types';
import { editCompany, getCompany } from './actions';

interface Props {
  companyId: string;
}

export function EditCompanyForm({ companyId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const router = useRouter();

  const form = useForm<EditCompanyInput>({
    resolver: zodResolver(editCompanySchema),
    defaultValues: {
      id: companyId,
      name: '',
      companyType: undefined,
      email: '',
      taxId: '',
      phone: '',
      website: '',
      logo: undefined, // Change to undefined to handle File objects properly
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      }
    }
  });

  // Load company data
  useEffect(() => {
    async function loadCompany() {
      try {
        const response = await getCompany(companyId);

        if (!response.success) {
          toast.error(response.error);
          return;
        }

        const company = response.data as CompanyResponse;
        setCompany(company);

        // Reset form with loaded data
        form.reset({
          id: company.id,
          name: company.name,
          companyType: company.companyType ?? undefined,
          email: company.email || '',
          taxId: company.taxId || '',
          phone: company.phone || '',
          website: company.website || '',
          logo: undefined, // Don't set the URL here, let ImageUpload handle it
          address: {
            street: (company.address as any)?.street || '',
            city: (company.address as any)?.city || '',
            state: (company.address as any)?.state || '',
            postalCode: (company.address as any)?.postalCode || '',
            country: (company.address as any)?.country || ''
          }
        });
      } catch (error) {
        toast.error('Failed to load company information');
      } finally {
        setIsLoading(false);
      }
    }

    loadCompany();
  }, [companyId, form, router]);

  async function onSubmit(values: z.infer<typeof editCompanySchema>) {
    startTransition(async () => {
      try {
        const response = await editCompany(values);

        if (!response.success) {
          toast.error(response.error);
          return;
        }

        toast.success('Company updated successfully!');
        router.push(`/`);
      } catch (error) {
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6">
          {/* Company Profile Section */}
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-xl">Company Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <ImageUpload
                  name="logo"
                  control={form.control}
                  defaultValue={company?.logo || undefined}
                  className="border-muted bg-muted/50 h-40 w-40 shrink-0 rounded-lg border-2 border-dashed p-4"
                />
                <div className="flex-1 space-y-4">
                  <FieldGroup>
                    <Controller
                      control={form.control}
                      name="name"
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel>Company Name *</FieldLabel>
                          <FieldContent>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="Enter company name"
                            />
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </FieldContent>
                        </Field>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="companyType"
                      render={({ field: selField, fieldState }) => (
                        <Field>
                          <FieldLabel>Company Type</FieldLabel>
                          <FieldContent>
                            <Select
                              onValueChange={selField.onChange}
                              value={selField.value || undefined}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select company type" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(CompanyType).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </FieldContent>
                        </Field>
                      )}
                    />
                  </FieldGroup>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                      control={form.control}
                      name="email"
                      render={({ field: emailField, fieldState }) => (
                        <Field>
                          <FieldLabel>Email Address</FieldLabel>
                          <FieldContent>
                            <Input
                              {...emailField}
                              value={emailField.value || ''}
                              type="email"
                              placeholder="company@example.com"
                            />
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </FieldContent>
                        </Field>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="taxId"
                      render={({ field: taxField, fieldState }) => (
                        <Field>
                          <FieldLabel>Tax ID</FieldLabel>
                          <FieldContent>
                            <Input
                              {...taxField}
                              value={taxField.value || ''}
                              placeholder="Enter tax ID"
                            />
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </FieldContent>
                        </Field>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Section */}
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-xl">Contact Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Controller
                control={form.control}
                name="phone"
                render={({ field: phoneField, fieldState }) => (
                  <Field className="flex flex-col items-start">
                    <FieldLabel className="pb-2.5 text-left">Phone Number</FieldLabel>
                    <FieldContent className="w-full">
                      <PhoneInput
                        defaultCountry="TN"
                        placeholder="Enter a phone number"
                        {...phoneField}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="website"
                render={({ field: webField, fieldState }) => (
                  <Field>
                    <FieldLabel>Website</FieldLabel>
                    <FieldContent>
                      <Input
                        {...webField}
                        value={webField.value || ''}
                        type="url"
                        placeholder="https://example.com"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          {/* Address Section */}
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-xl">Address</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Controller
                  control={form.control}
                  name="address.street"
                  render={({ field: streetField, fieldState }) => (
                    <Field>
                      <FieldLabel>Street Address</FieldLabel>
                      <FieldContent>
                        <Input
                          {...streetField}
                          value={streetField.value || ''}
                          placeholder="123 Main St"
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    control={form.control}
                    name="address.city"
                    render={({ field: cityField, fieldState }) => (
                      <Field>
                        <FieldLabel>City</FieldLabel>
                        <FieldContent>
                          <Input
                            {...cityField}
                            value={cityField.value || ''}
                            placeholder="City"
                          />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="address.state"
                    render={({ field: stateField, fieldState }) => (
                      <Field>
                        <FieldLabel>State/Province</FieldLabel>
                        <FieldContent>
                          <Input
                            {...stateField}
                            value={stateField.value || ''}
                            placeholder="State"
                          />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="address.postalCode"
                    render={({ field: postalField, fieldState }) => (
                      <Field>
                        <FieldLabel>Postal Code</FieldLabel>
                        <FieldContent>
                          <Input
                            {...postalField}
                            value={postalField.value || ''}
                            placeholder="Postal Code"
                          />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="address.country"
                    render={({ field: countryField, fieldState }) => (
                      <Field>
                        <FieldLabel>Country</FieldLabel>
                        <FieldContent>
                          <Input
                            {...countryField}
                            value={countryField.value || ''}
                            placeholder="Country"
                          />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Updating...' : 'Update Company'}
          </Button>
        </div>
      </form>
    </div>
  );
}
