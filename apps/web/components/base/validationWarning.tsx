import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

export interface ValidationWarning {
  message: string;
  type:
    | 'DATE_PAST'
    | 'DATE_FAR_FUTURE'
    | 'VALID_UNTIL_BEFORE_DUE'
    | 'DUPLICATE_NUMBER';
  critical?: boolean;
}

interface ValidationDialogProps {
  warnings: ValidationWarning[];
  onConfirm: () => void;
  onCancel: () => void;
  open: boolean;
}

export const ValidationWarningDialog = ({
  warnings,
  onConfirm,
  onCancel,
  open
}: ValidationDialogProps) => (
  <AlertDialog open={open}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Validation Warnings</AlertDialogTitle>
        <AlertDialogDescription className="space-y-2">
          <span className="flex flex-col gap-2">
            {warnings.map((warning, index) => (
              <span key={index} className="text-sm">
                {warning.message}
              </span>
            ))}
            <span className="pt-2 font-medium">
              Do you want to proceed anyway?
            </span>
          </span>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>
          No, I&apos;ll revise
        </AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Yes, proceed</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

interface ValidationData {
  dueDate: Date;
  validUntil?: Date;
}

export const validateWithWarnings = (
  data: ValidationData
): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Common validations
  if (data.dueDate < today) {
    warnings.push({
      type: 'DATE_PAST',
      message: 'Due date is in the past'
    });
  }

  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);

  if (data.dueDate > maxFutureDate) {
    warnings.push({
      type: 'DATE_FAR_FUTURE',
      message: 'Due date is more than 1 year in the future'
    });
  }

  // Optional validUntil validation
  if (data.validUntil && data.validUntil < data.dueDate) {
    warnings.push({
      type: 'VALID_UNTIL_BEFORE_DUE',
      message: 'Valid until date is before due date'
    });
  }

  return warnings;
};
