'use client';

import { ReactNode, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { Direction } from 'radix-ui';
import { AssistantDrawer } from '@/components/shared/assistant-drawer';
import { MessageScrollerProvider } from '@/components/ui/message-scroller';
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
      <TooltipProvider>
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <MessageScrollerProvider>
            <NextIntlClientProvider locale='en'>
              <TooltipProvider>
                {children}
                <AssistantDrawer />
              </TooltipProvider>
            </NextIntlClientProvider>
          </MessageScrollerProvider>
        </ThemeProvider>
      </TooltipProvider>
    </Direction.Provider>
  );
}