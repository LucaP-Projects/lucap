'use client';

import {
  createColumns,
  entityConfigs
} from '@/components/dashboard/base/columns';
import { SalesReceiptBasic } from './actions';

// Create and export the columns
export const columns = createColumns<SalesReceiptBasic>(entityConfigs.receipt);
