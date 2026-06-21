'use client';

import {
  createColumns,
  entityConfigs
} from '@/components/dashboard/base/columns';
import { CreditMemoBasic } from './actions';

// Create and export the columns
export const columns = createColumns<CreditMemoBasic>(entityConfigs.creditMemo);
