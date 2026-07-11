'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CCPaymentForm } from './form';

interface CCPaymentSheetProps { children?: React.ReactNode; onSuccess?: () => void; }
export function CCPaymentSheet({ children, onSuccess }: CCPaymentSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null) as React.RefObject<HTMLFormElement>;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-8 pb-4"><SheetTitle className="text-2xl">New Credit Card Payment</SheetTitle><SheetDescription>Pay down a credit card from a bank account.</SheetDescription></SheetHeader>
          <div className="flex-1 overflow-y-auto"><div className="px-6 py-4"><CCPaymentForm onSuccess={() => { onSuccess?.(); setOpen(false); }} formRef={formRef} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} /></div></div>
          <SheetFooter className="px-6 py-4 border-t"><Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button><Button onClick={() => formRef.current?.requestSubmit()} disabled={isSubmitting}>Create</Button></SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
