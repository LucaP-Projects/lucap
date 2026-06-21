import React, { memo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { useSidebarStore } from '@/stores/useSidePaper';
import { PaperType } from '../preview/types';
import ColorPicker from './color/colorPicker';

import CustomizationSettings from './customize/customizeSection';
import { CustomizationSettingsInput } from './customize/types';

interface SidebarProps {
  paperType: PaperType;
}

const SidebarSettings = ({ paperType }: SidebarProps) => {
  const selectedColor = useSidebarStore((state) => state.selectedColor);
  const setSelectedColor = useSidebarStore((state) => state.setSelectedColor);
  const settings = useSidebarStore((state) => state.customizationSettings);
  const setCustomizationSettings = useSidebarStore(
    (state) => state.setCustomizationSettings
  );
  const note = useSidebarStore((state) => state.note);
  const setNote = useSidebarStore((state) => state.setNote);
  const setIsSidebarOpen = useSidebarStore((state) => state.setIsSidebarOpen);

  const handleSettingChange = (
    key: keyof CustomizationSettingsInput,
    value: boolean
  ) => {
    setCustomizationSettings({ ...settings, [key]: value });
  };
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-xl font-semibold dark:text-gray-100">
          Manage {paperType}
        </h2>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          aria-label="Close sidebar"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        <AccordionItem
          value="customerReports"
          className="border-border rounded-lg border border-b! dark:border-gray-700"
        >
          <AccordionTrigger className="hover:bg-muted px-4 hover:no-underline dark:hover:bg-gray-700">
            Customer reports
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2">
            <div className="space-y-2">
              <a
                href={`/${paperType.toLocaleLowerCase()}s`}
                className="text-primary block hover:underline dark:text-blue-400"
              >
                Open {paperType}s
              </a>
              <a
                href="/all-transactions"
                className="text-primary block hover:underline dark:text-blue-400"
              >
                All transactions
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="customization"
          className="border-border rounded-lg border !border-b dark:border-gray-700"
        >
          <AccordionTrigger className="hover:bg-muted px-4 hover:no-underline dark:hover:bg-gray-700">
            Customization
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2">
            <div className="space-y-4">
              <CustomizationSettings
                paperType={paperType}
                note={note}
                onNoteChange={setNote}
                settings={settings}
                onSettingChange={handleSettingChange}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="design"
          className="border-border rounded-lg border !border-b dark:border-gray-700"
        >
          <AccordionTrigger className="hover:bg-muted px-4 hover:no-underline dark:hover:bg-gray-700">
            Design
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2">
            <ColorPicker
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SidebarSettings;

export const MemoizedSidebar = memo<SidebarProps>(({ paperType }) => {
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  return (
    <div
      className={`border-border bg-background absolute right-0 top-0 z-50 border-l shadow-xl transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-900 ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full'} xl:static xl:h-auto`}
    >
      <div className="max-h-screen w-80 overflow-y-auto xl:max-h-none">
        {isSidebarOpen && <SidebarSettings paperType={paperType} />}
      </div>
    </div>
  );
});

MemoizedSidebar.displayName = 'MemoizedSidebar';
