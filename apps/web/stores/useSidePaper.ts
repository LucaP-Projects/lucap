import { create } from 'zustand';
import { ColorName } from '@/components/base/sideBar/color/types';
import { CustomizationSettingsInput } from '@/components/base/sideBar/customize/types';

interface SidebarState {
  note: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  selectedColor: ColorName;
  customizationSettings: CustomizationSettingsInput;
  setNote: (note: string) => void;
  setSelectedColor: (color: ColorName) => void;
  setCustomizationSettings: (settings: CustomizationSettingsInput) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isSidebarOpen: false,
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  note: 'Thank you for your business and have a great day!',
  selectedColor: 'blue',
  customizationSettings: {
    shipTo: true,
    invoiceNo: true,
    invoiceDate: false,
    dueDate: true,
    tableNumber: true,
    productService: true,
    sku: false,
    description: true,
    quantity: true,
    rate: true,
    amount: true,
    note: false
  },
  setNote: (note) => set({ note }),
  setSelectedColor: (selectedColor) => set({ selectedColor }),
  setCustomizationSettings: (customizationSettings) =>
    set({ customizationSettings })
}));
