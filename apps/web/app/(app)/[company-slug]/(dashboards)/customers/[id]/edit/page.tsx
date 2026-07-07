import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { EditCustomerForm } from '@/components/customer/edit-customer-form';
import { Button } from '@/components/ui/button';
import { getFullCustomer } from '../../actions';

interface EditCustomerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({
  params
}: EditCustomerPageProps) {
  const { id } = await params;
  const customer = await getFullCustomer(id);

  if (!customer) notFound();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-x-4">
        <Link href={`/customers/${id}`}>
          <Button variant="ghost" size="sm" className="h-8 gap-x-1">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-primary text-2xl font-bold">Edit Customer</h1>
          <p className="text-muted-foreground text-sm">
            Update {customer.displayName}&apos;s information
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <EditCustomerForm
          customerId={id}
          defaultValues={{
            ...customer,
            metadata: customer.metadata ?? undefined,
            billingAddress: customer.billingAddress ?? undefined,
            shippingAddress: customer.shippingAddress ?? undefined,
            parentId: customer.parentId ?? undefined
          }}
        />
      </div>
    </div>
  );
}
