'use client';

import { useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CompanyType } from '@/lib/generated/prisma/enums';
import { createCompanySchema, CreateCompanyInput } from '../types';
import { createCompany } from './actions';

type CreateCompanyFormInput = z.input<typeof createCompanySchema>;


export function CreateCompanyForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompanyFormInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      companyType: undefined,
      email: '',
      taxId: '',
      phone: '',
      website: '',
      logo: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    },
  });

  const onSubmit = (form: CreateCompanyFormInput) => {
    startTransition(async () => {
      try {
        const response = await createCompany({
          ...form,
          name: form.name?.trim() || '',
          email: form.email?.trim() || '',
          taxId: form.taxId?.trim() || '',
          phone: form.phone?.trim() || '',
          website: form.website?.trim() || '',
          companyType: form.companyType || null,
          logo: typeof form.logo === 'string' ? form.logo.trim() : form.logo,
        } as CreateCompanyInput);

        if (!response.success) {
          toast.error(response.error || 'Failed to create company');
          return;
        }

        toast.success('Company created successfully');
        router.push('/');
        router.refresh();
      } catch {
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-3">
        <div className="grid gap-4 md:grid-cols-2">
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="name">Company name</FieldLabel>
            <Input
              id="name"
              {...register('name')}
              placeholder="Company name"
              required
            />
            {errors.name ? (
              <FieldError errors={[{ message: errors.name?.message }]} />
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="companyType">Company type</FieldLabel>
            <Select
              {...register('companyType')}
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
          </Field>

          <Field>
            <FieldLabel htmlFor="logo">Logo URL</FieldLabel>
            <FieldDescription>Optional — public URL for your company logo</FieldDescription>
            <Input id="logo" {...register('logo')} placeholder="Logo URL (optional)" />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" {...register('email')} placeholder="Email" />
            {errors.email ? <FieldError errors={[{ message: errors.email?.message }]} /> : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="taxId">Tax ID</FieldLabel>
            <Input id="taxId" {...register('taxId')} placeholder="Tax ID" />
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" {...register('phone')} placeholder="Phone" />
            {errors.phone ? <FieldError errors={[{ message: errors.phone?.message }]} /> : null}
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel htmlFor="website">Website</FieldLabel>
            <Input id="website" {...register('website')} placeholder="Website" />
            {errors.website ? <FieldError errors={[{ message: errors.website?.message }]} /> : null}
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-medium">Address</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="line1">Street</FieldLabel>
            <Input id="line1" {...register('address.line1')} placeholder="Street" />
          </Field>

          <Field>
            <FieldLabel htmlFor="line2">Street 2</FieldLabel>
            <Input id="line2" {...register('address.line2')} placeholder="Street 2" />
          </Field>

          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" {...register('address.city')} placeholder="City" />
          </Field>

          <Field>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input id="state" {...register('address.state')} placeholder="State" />
          </Field>

          <Field>
            <FieldLabel htmlFor="postalCode">Postal code</FieldLabel>
            <Input id="postalCode" {...register('address.postalCode')} placeholder="Postal code" />
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input id="country" className="md:col-span-2" {...register('address.country')} placeholder="Country" />
          </Field>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/select-company')}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Creating...' : 'Create Company'}
        </Button>
      </div>
    </form>
  );
}
