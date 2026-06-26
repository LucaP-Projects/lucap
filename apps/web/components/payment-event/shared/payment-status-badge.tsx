
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

import { getPaymentStatusConfig } from '@/app/(app)/[company-slug]/(dashboards)/payment/[id]/utils';
import { Badge } from '@/components/ui/badge';
import type { PaymentStatus } from '@/lib/generated/prisma/enums';

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
