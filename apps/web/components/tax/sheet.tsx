'use client';

import { useRef, useState } from 'react';
import { TaxRate } from '@/lib/generated/prisma/client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button
} from '@silknexus/ui';
import { TaxForm } from './form';

interface TaxSheetProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (newTax?: TaxRate) => void;
  isNestedForm?: boolean;
  editData?: {
    id: string;
    name: string;
    description: string | null;
    agencyName: string;
    type: string;
    rate: number;
  } | null;
}

export function TaxSheet({
  children,
  open,
  onOpenChange,
  onSuccess,
  isNestedForm = false,
  editData
}: TaxSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFormSuccess = (newTax?: TaxRate) => {
    onSuccess?.(newTax);
    onOpenChange?.(false);
  };

  const handleSubmit = (e: React.MouseEvent) => {
    if (isNestedForm) {
      e.preventDefault();
      e.stopPropagation();
    }
    formRef.current?.requestSubmit();
  };

  const trigger = children ? (
    <SheetTrigger asChild>{children}</SheetTrigger>
  ) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger}
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-8 pb-4">
            <SheetTitle className="text-2xl">
              {editData ? 'Edit Tax Rate' : 'Create Tax Rate'}
            </SheetTitle>
            <SheetDescription>
              {editData
                ? 'Update the tax rate information.'
                : 'Add a new tax rate for your company.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <TaxForm
                onSuccess={handleFormSuccess}
                formRef={formRef}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                isNestedForm={isNestedForm}
                editData={editData}
              />
            </div>
          </div>

          <div className="bg-background sticky bottom-0 border-t px-6 py-4">
            <SheetFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                disabled={isSubmitting}
                type="button"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {editData ? 'Update' : 'Create'}
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
