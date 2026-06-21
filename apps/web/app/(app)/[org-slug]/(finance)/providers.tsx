'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Direction } from 'radix-ui';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ProvidersProps {
  children: ReactNode;
  lng: string;
}

type Direction = 'ltr' | 'rtl';
export function Providers({ children, lng }: ProvidersProps) {
  const [dir, setDir] = useState<Direction>(lng === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    setDir(lng === 'ar' ? 'rtl' : 'ltr');
  }, [lng]);

  return (
      <Direction.Provider dir={dir}>
        <TooltipProvider>{children}</TooltipProvider>
      </Direction.Provider>
  );
}
