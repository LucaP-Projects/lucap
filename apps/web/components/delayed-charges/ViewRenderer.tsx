'use client';

import { memo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useViewStore } from '@/stores/useViewStore';
import { EmailPreview } from '../base/preview/email';
import { PayorPreview } from '../base/preview/payor';
import { PdfPreview } from '../base/preview/pdf';
import { CompanyInfo } from '../invoice/types';
import MemoizedFormContent, { formContentProps } from './form';

interface ChargeViewRendererProps {
  company?: CompanyInfo | null;
  formContentProps: formContentProps;
}

export const ChargeViewRenderer = memo<ChargeViewRendererProps>(
  ({ company, formContentProps }) => {
    const activeView = useViewStore((state) => state.activeView);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }, [activeView]);

    return (
      <div
        ref={containerRef}
        className="relative w-full transition-[height] duration-200 ease-in-out"
      >
        <div
          className={cn(
            'relative w-full transition-opacity duration-200',
            activeView === 'form'
              ? 'z-10 h-auto opacity-100'
              : 'pointer-events-none z-0 h-0 overflow-hidden opacity-0'
          )}
        >
          <MemoizedFormContent {...formContentProps} company={company} />
        </div>

        <div className="relative w-full">
          <div
            className={cn(
              'relative w-full transition-opacity duration-200',
              activeView === 'payor'
                ? 'z-10 h-auto opacity-100'
                : 'pointer-events-none z-0 h-0 overflow-hidden opacity-0'
            )}
          >
            <PayorPreview company={company} paperType="Delayed Charge" />
          </div>

          <div
            className={cn(
              'relative w-full transition-opacity duration-200',
              activeView === 'email'
                ? 'z-10 h-auto opacity-100'
                : 'pointer-events-none z-0 h-0 overflow-hidden opacity-0'
            )}
          >
            <EmailPreview company={company} paperType="Delayed Charge" />
          </div>

          <div
            className={cn(
              'relative w-full transition-opacity duration-200',
              activeView === 'pdf'
                ? 'z-10 h-auto opacity-100'
                : 'pointer-events-none z-0 h-0 overflow-hidden opacity-0'
            )}
          >
            <PdfPreview company={company} paperType="Delayed Charge" />
          </div>
        </div>
      </div>
    );
  }
);

ChargeViewRenderer.displayName = 'ChargeViewRenderer';
