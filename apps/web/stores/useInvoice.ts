import { create } from 'zustand';
import { InvoiceFormValues } from '@/components/invoice/schema';

interface FormCacheStore {
  cachedFormData: InvoiceFormValues | null;
  setCachedFormData: (data: InvoiceFormValues) => void;
}

export const useFormCacheStore = create<FormCacheStore>((set) => ({
  cachedFormData: null,
  setCachedFormData: (data) => set({ cachedFormData: data })
}));
