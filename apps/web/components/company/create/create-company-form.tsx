'use client';

import { useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
                street: '',
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
            <Card>
                <CardHeader>
                    <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <Input
                            {...register('name')}
                            placeholder="Company name"
                            required
                        />
                        {errors.name ? (
                            <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                        ) : null}
                    </div>

                    <Input
                        {...register('companyType')}
                        placeholder="Company type"
                    />
                    <Input
                        {...register('logo')}
                        placeholder="Logo URL (optional)"
                    />
                    <Input
                        type="email"
                        {...register('email')}
                        placeholder="Email"
                    />
                    {errors.email ? (
                        <p className="-mt-2 text-sm text-destructive md:col-span-2">{errors.email.message}</p>
                    ) : null}
                    <Input
                        {...register('taxId')}
                        placeholder="Tax ID"
                    />
                    <Input
                        {...register('phone')}
                        placeholder="Phone"
                    />
                    {errors.phone ? (
                        <p className="-mt-2 text-sm text-destructive md:col-span-2">{errors.phone.message}</p>
                    ) : null}
                    <Input
                        {...register('website')}
                        placeholder="Website"
                    />
                    {errors.website ? (
                        <p className="-mt-2 text-sm text-destructive md:col-span-2">{errors.website.message}</p>
                    ) : null}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <Input
                        {...register('address.street')}
                        placeholder="Street"
                    />
                    <Input
                        {...register('address.city')}
                        placeholder="City"
                    />
                    <Input
                        {...register('address.state')}
                        placeholder="State"
                    />
                    <Input
                        {...register('address.postalCode')}
                        placeholder="Postal code"
                    />
                    <Input
                        className="md:col-span-2"
                        {...register('address.country')}
                        placeholder="Country"
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push('/onboarding/select-organization')}>
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
