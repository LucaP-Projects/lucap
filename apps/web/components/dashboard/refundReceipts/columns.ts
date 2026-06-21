'use client';

import {
  createColumns,
  entityConfigs
} from '@/components/dashboard/base/columns';
import { RefundReceiptBasic } from './actions';

// Create and export the columns
export const columns = createColumns<RefundReceiptBasic>(entityConfigs.refund);
