import { PaperType } from '../../preview/types';

export interface CustomizationProps {
  paperType: PaperType;
  settings: CustomizationSettingsInput;
  onSettingChange: (
    key: keyof CustomizationSettingsInput,
    value: boolean
  ) => void;
  note: string;
  onNoteChange: (note: string) => void;
}
export type CustomizationSettingsInput = {
  shipTo: boolean;
  invoiceNo: boolean;
  invoiceDate: boolean;
  dueDate: boolean;
  tableNumber: boolean;

  productService: boolean;
  sku: boolean;
  description: boolean;
  quantity: boolean;
  rate: boolean;
  amount: boolean;
  note: boolean;
};
