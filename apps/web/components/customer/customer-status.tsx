import type { PaymentStatus } from '@/lib/generated/prisma/enums';
import { Badge } from '../ui/badge';

export function CustomerStatus({ status }: { status: PaymentStatus }) {
  const colors: Record<PaymentStatus, string> = {
    PAID: 'bg-green-500/10 text-green-500',
    PENDING: 'bg-yellow-500/10 text-yellow-500',
    OVERDUE: 'bg-red-500/10 text-red-500',
    CANCELLED: 'bg-gray-500/10 text-gray-500',
    PARTIAL: 'bg-blue-500/10 text-blue-500'
  };

  return (
    <Badge variant="outline" className={colors[status]}>
      {status}
    </Badge>
  );
}
