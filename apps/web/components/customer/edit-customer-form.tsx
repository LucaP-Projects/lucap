'use client';

import { useRouter } from 'next/navigation';
import { CreateCustomerDTO } from '@/types/customer';
import { CustomerForm } from './customer-form';

interface EditCustomerFormProps {
  customerId: string;
  defaultValues: Partial<CreateCustomerDTO>;
}

export function EditCustomerForm({
  customerId,
  defaultValues
}: EditCustomerFormProps) {
  const router = useRouter();

  return (
    <CustomerForm
      type="update"
      customerId={customerId}
      defaultValues={defaultValues}
      onSuccess={() => {
        router.push(`/customers/${customerId}`);
        router.refresh();
      }}
    />
  );
}
