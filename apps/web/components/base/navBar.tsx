import { memo, useCallback, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { LucideIcon, PenLine, CreditCard, Mail, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { useFormCacheStore } from '@/stores/useInvoice';
import { useSidebarStore } from '@/stores/useSidePaper';
import { useViewStore } from '@/stores/useViewStore';
import type { InvoiceFormValues } from '../invoice/schema';

export type ViewType = 'form' | 'payor' | 'email' | 'pdf';

const NAV_ITEMS: Array<{
  value: ViewType;
  label: string;
  icon: LucideIcon;
}> = [
    { value: 'form', label: 'Edit', icon: PenLine },
    { value: 'payor', label: 'Payor View', icon: CreditCard },
    { value: 'email', label: 'Email View', icon: Mail },
    { value: 'pdf', label: 'PDF View', icon: FileText }
  ];

const MemoizedNavigation = memo(() => {
  const { getValues, watch } = useFormContext<InvoiceFormValues>();
  const activeView = useViewStore((state) => state.activeView);
  const setActiveView = useViewStore((state) => state.setActiveView);
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useSidebarStore((state) => state.setIsSidebarOpen);
  const setCachedFormData = useFormCacheStore(
    (state) => state.setCachedFormData
  );
  const shouldCache = useRef(false);

  const debouncedCacheUpdate = useDebounce((currentValues: InvoiceFormValues) => {
    if (shouldCache.current) {
      setCachedFormData(currentValues);
    }
  }, 500);

  useEffect(() => {
    shouldCache.current = true;

    const subscription = watch((value, { name, type }) => {
      if (activeView === 'form') {
        const currentValues = getValues();
        debouncedCacheUpdate(currentValues);
      }
    });

    return () => {
      shouldCache.current = false;
      subscription.unsubscribe();
    };
  }, [watch, getValues, debouncedCacheUpdate, activeView]);

  const handleViewChange = useCallback(
    (value: string) => {
      const newView = value as ViewType;

      if (activeView === 'form') {
        // Cancel pending debounced updates
        // Immediately save current values
        setCachedFormData(getValues());
      }

      setActiveView(newView);
    },
    [activeView, getValues, setActiveView, setCachedFormData]
  );
  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen, setIsSidebarOpen]);

  const renderTabTriggers = useCallback(
    () =>
      NAV_ITEMS.map(({ value, label, icon: Icon }) => (
        <TabsTrigger
          key={value}
          value={value}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2',
            'hover:bg-primary/5 hover:text-primary transition-all duration-200 ease-in-out',
            'focus-visible:bg-primary/5 focus-visible:text-primary focus-visible:ring-primary',
            'data-[state=active]:bg-primary/5 data-[state=active]:text-primary'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{label}</span>
        </TabsTrigger>
      )),
    []
  );

  return (
    <nav className="supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-gray-900/60 sticky top-0 z-10 w-full border-b bg-white/95 p-4 backdrop-blur dark:bg-gray-900/95">
      <div className="flex w-full items-center">
        <div className="flex-1">
          <Tabs
            value={activeView}
            onValueChange={handleViewChange}
            className="w-fit"
          >
            <TabsList className="flex h-auto space-x-1 bg-transparent p-0">
              {renderTabTriggers()}
            </TabsList>
          </Tabs>
        </div>

        <Button
          variant="ghost"
          onClick={handleSidebarToggle}
          className={cn(
            'hover:bg-primary/5 hover:text-primary gap-2 transition-all duration-200',
            'focus-visible:ring-primary',
            isSidebarOpen && 'bg-primary/5 text-primary'
          )}
          size="sm"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Manage</span>
        </Button>
      </div>
    </nav>
  );
});

MemoizedNavigation.displayName = 'MemoizedNavigation';

export default MemoizedNavigation;
