'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { TermForm } from './form';
import { TermRecord } from './schema';

interface TermSheetProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  term?: TermRecord;
}

export function TermSheet({
  children,
  open,
  onOpenChange,
  onSuccess,
  term,
}: TermSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null) as React.RefObject<HTMLFormElement>;

  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const isEditMode = !!term;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-8 pb-4">
            <SheetTitle className="text-2xl">
              {isEditMode ? 'Edit Payment Term' : 'Create Payment Term'}
            </SheetTitle>
            <SheetDescription>
              {isEditMode
                ? 'Update your payment term details.'
                : 'Add a new payment term (e.g. Net 30, 2% 15 Net 60).'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <TermForm
                term={term}
                onSuccess={() => { onSuccess?.(); setOpen(false); }}
                formRef={formRef}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
              />
            </div>
          </div>

          <div className="bg-background sticky bottom-0 border-t px-6 py-4">
            <SheetFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} type="button">
                Cancel
              </Button>
              <Button onClick={(e) => { e.preventDefault(); formRef.current?.requestSubmit(); }} disabled={isSubmitting}>
                {isEditMode ? 'Save Changes' : 'Create'}
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}