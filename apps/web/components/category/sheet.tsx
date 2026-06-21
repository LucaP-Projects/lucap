'use client';

import { useRef, useState } from 'react';
import { CategoryWithItems } from '@/components/dashboard/categories/types';
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
import { CategoryForm } from './form';

interface CategorySheetProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (newCategory?: CategoryWithItems) => void;
  isNestedForm?: boolean;
  category?: CategoryWithItems;
}

export function CategorySheet({
  children,
  open,
  onOpenChange,
  onSuccess,
  isNestedForm = false,
  category
}: CategorySheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(
    null
  ) as React.RefObject<HTMLFormElement>;

  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const handleFormSuccess = (newCategory?: CategoryWithItems) => {
    onSuccess?.(newCategory);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
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

  const isEditMode = !!category;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      {trigger}
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-8 pb-4">
            <SheetTitle className="text-2xl">
              {isEditMode ? 'Edit Category' : 'Create Category'}
            </SheetTitle>
            <SheetDescription>
              {isEditMode
                ? 'Update your category details.'
                : 'Add a new category to organize your items.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <CategoryForm
                category={category}
                onSuccess={handleFormSuccess}
                formRef={formRef}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                isNestedForm={isNestedForm}
              />
            </div>
          </div>

          <div className="bg-background sticky bottom-0 border-t px-6 py-4">
            <SheetFooter>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                type="button"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isEditMode ? 'Save Changes' : 'Create'}
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
