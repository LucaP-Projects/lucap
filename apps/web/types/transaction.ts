import { LucideIcon, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { TransactionStatus as PrismaTransactionStatus } from '@/lib/generated/prisma/browser';

export type StatusConfig = {
  icon: LucideIcon;
  color: string;
  text: string;
};

// Create a status configuration map with all possible statuses
export const STATUS_CONFIG: Record<PrismaTransactionStatus, StatusConfig> = {
  PENDING: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    text: 'Pending'
  },
  APPROVED: {
    icon: CheckCircle,
    color: 'text-green-500',
    text: 'Approved'
  },
  REJECTED: {
    icon: XCircle,
    color: 'text-red-500',
    text: 'Rejected'
  },
  VOID: {
    icon: XCircle,
    color: 'text-gray-500',
    text: 'Void'
  },
  INCOMPLETE: {
    icon: AlertCircle,
    color: 'text-orange-500',
    text: 'Incomplete'
  }
};
