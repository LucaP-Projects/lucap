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
import { DepartmentForm } from './form';
import { DepartmentRecord } from './schema';

interface DepartmentSheetProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  department?: DepartmentRecord;
}

export function DepartmentSheet({
  children,
  open,
  onOpenChange,
  onSuccess,
  department,
}: DepartmentSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null) as React.RefObject<HTMLFormElement>;

  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const isEditMode = !!department;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-8 pb-4">
            <SheetTitle className="text-2xl">
              {isEditMode ? 'Edit Department' : 'Create Department'}
            </SheetTitle>
            <SheetDescription>
              {isEditMode
                ? 'Update your department details.'
                : 'Add a new department to organize your transactions.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <DepartmentForm
                department={department}
                onSuccess={() => {
                  onSuccess?.();
                  setOpen(false);
                }}
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
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }}
                disabled={isSubmitting}
              >
                {isEditMode ? 'Save Changes' : 'Create'}
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
