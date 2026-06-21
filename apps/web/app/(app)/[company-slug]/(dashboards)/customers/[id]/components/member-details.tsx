'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface CustomerDetailsProps {
  customer: {
    user: {
      name: string;
      email: string;
    };
    phone: string | null;
    address: string | null;
    createdAt: Date;
    paymentEvents: Array<{
      status: string;
    }>;
  };
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      PAID: 'bg-green-500/10 text-green-500',
      PENDING: 'bg-yellow-500/10 text-yellow-500',
      OVERDUE: 'bg-red-500/10 text-red-500',
      CANCELLED: 'bg-gray-500/10 text-gray-500'
    };
    return colors[status as keyof typeof colors] || colors.CANCELLED;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div>
            <dt className="text-muted-foreground text-sm font-medium">Name</dt>
            <dd className="text-lg">{customer.user.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm font-medium">Email</dt>
            <dd className="text-lg">{customer.user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm font-medium">Phone</dt>
            <dd className="text-lg">{customer.phone || '-'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm font-medium">
              Address
            </dt>
            <dd className="text-lg">{customer.address || '-'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm font-medium">
              Customer Since
            </dt>
            <dd className="text-lg">{formatDate(customer.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm font-medium">
              Status
            </dt>
            <dd>
              <Badge
                variant="outline"
                className={getStatusColor(
                  customer.paymentEvents[0]?.status || 'CANCELLED'
                )}
              >
                {customer.paymentEvents[0]?.status || 'INACTIVE'}
              </Badge>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
