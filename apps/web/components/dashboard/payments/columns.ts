'use client';

import {
  createColumns,
  entityConfigs
} from '@/components/dashboard/base/columns';
import { PaymentBasic } from './actions';

// Create and export the columns
export const columns = createColumns<PaymentBasic>(entityConfigs.payment);
