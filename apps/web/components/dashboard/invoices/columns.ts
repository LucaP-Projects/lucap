'use client';
import {
  createColumns,
  entityConfigs
} from '@/components/dashboard/base/columns';
import { InvoiceBasic } from './actions';

export const columns = createColumns<InvoiceBasic>(entityConfigs.invoice);
