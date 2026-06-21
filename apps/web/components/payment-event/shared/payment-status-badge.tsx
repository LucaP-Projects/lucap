
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { getPaymentStatusConfig } from '@/app/(finance)/finance/payment-events/[id]/utils';
import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '@/lib/generated/prisma/client';

const icons = {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  showIcon?: boolean;
}

export function PaymentStatusBadge({
  status,
  showIcon = true
}: PaymentStatusBadgeProps) {
  const config = getPaymentStatusConfig(status);
  const Icon = icons[config.icon as keyof typeof icons];

  return (
    <Badge className={config.color}>
      <div className="flex items-center gap-1">
        {showIcon && <Icon className="h-3 w-3" />}
        <span>{config.label}</span>
      </div>
    </Badge>
  );
}
