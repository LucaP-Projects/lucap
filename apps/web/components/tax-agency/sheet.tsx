'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TaxAgencyForm } from './form';
import { TaxAgencyRecord } from './schema';

interface TaxAgencySheetProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  agency?: TaxAgencyRecord;
}

export function TaxAgencySheet({ children, open, onOpenChange, onSuccess, agency }: TaxAgencySheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null) as React.RefObject<HTMLFormElement>;
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const isEditMode = !!agency;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-8 pb-4">
            <SheetTitle className="text-2xl">{isEditMode ? 'Edit Tax Agency' : 'Add Tax Agency'}</SheetTitle>
            <SheetDescription>{isEditMode ? 'Update the tax agency details.' : 'Add a new tax agency (e.g. Ministere des Finances).'}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto"><div className="px-6 py-4">
            <TaxAgencyForm agency={agency} onSuccess={() => { onSuccess?.(); setOpen(false); }} formRef={formRef} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} />
          </div></div>
          <div className="bg-background sticky bottom-0 border-t px-6 py-4">
            <SheetFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} type="button">Cancel</Button>
              <Button onClick={(e) => { e.preventDefault(); formRef.current?.requestSubmit(); }} disabled={isSubmitting}>{isEditMode ? 'Save Changes' : 'Add'}</Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
