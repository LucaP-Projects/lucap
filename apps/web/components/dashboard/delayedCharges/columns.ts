'use client';
import {
  createColumns,
  entityConfigs
} from '@/components/dashboard/base/columns';
import { DelayedChargeBasic } from './actions';

export const columns = createColumns<DelayedChargeBasic>(entityConfigs.charge);
