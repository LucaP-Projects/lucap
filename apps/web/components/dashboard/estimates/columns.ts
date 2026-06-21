'use client';

import {
  createColumns,
  entityConfigs
} from '@/components/dashboard/base/columns';
import { EstimateBasic } from './actions';

// Create and export the columns
export const columns = createColumns<EstimateBasic>(entityConfigs.estimate);
