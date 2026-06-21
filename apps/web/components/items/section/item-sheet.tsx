'use client';
import React from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { ItemFormValues } from '../schema';
import ItemForm from './item-form';

interface ItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<ItemFormValues>;
  isNestedForm?: boolean;
  onSuccess?: () => void;
}

export function ItemSheet({
  open,
  onOpenChange,
  initialData,
  isNestedForm = true,
  onSuccess
}: ItemSheetProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  // This function handles submitting the form
  const handleSubmit = (e: React.FormEvent) => {
    if (isNestedForm) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  // When form is successfully submitted, ensure we trigger a full refresh
  const handleSuccess = () => {
    // Make sure we fully close the modal
    onOpenChange(false);

    // Call the original onSuccess (which should refresh the router)
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-8 pb-4">
            <SheetTitle className="text-2xl">
              {initialData ? 'Edit Item' : 'Create New Item'}
            </SheetTitle>
            <SheetDescription className="text-base">
              Add the details for your item. Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <ItemForm
                initialData={initialData}
                onSuccess={handleSuccess}
                formRef={formRef as React.RefObject<HTMLFormElement>}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                isNestedForm={isNestedForm}
              />
            </div>
          </div>

          <div className="bg-background sticky bottom-0 border-t px-6 py-4">
            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Item'
                )}
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
