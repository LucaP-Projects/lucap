'use client';

import {
  createColumns,
  entityConfigs
} from '@/components/dashboard/base/columns';

import { DelayedCreditBasic } from './actions';

// Create and export the columns
export const columns = createColumns<DelayedCreditBasic>(entityConfigs.credit);
