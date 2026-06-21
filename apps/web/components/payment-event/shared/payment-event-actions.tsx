'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Edit,
  Eye,
  History,
  MoreHorizontal,
  Power,
  PowerOff,
  Trash
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toast
} from '@silknexus/ui';
import { ActionResult } from '../assignment/one-time/types';
import {
  activatePaymentEvent,
  deactivatePaymentEvent,
  deletePaymentEvent
} from './payment-event-action';

type PaymentEventWithRelations = {
  id: string;
  type: 'ONE_TIME' | 'SUBSCRIPTION' | 'INSTALLMENTS';
  active: boolean;
  currentVersion?: {
    status: 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'PENDING_ACTIVATION';
    paymentSettings: any;
  };
  customerPaymentEvents: any[];
  versionId?: string;
};

interface PaymentEventActionsProps {
  event: PaymentEventWithRelations;
}

export function PaymentEventActions({ event }: any) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetState = useCallback(() => {
    setShowDeleteDialog(false);
    setShowDeactivateDialog(false);
    setShowActivateDialog(false);
    setIsLoading(false);
    setIsOpen(false);
  }, []);

  const handleActionWithErrorHandling = async (
    action: (id: string) => Promise<ActionResult>,
    successMessage: string,
    errorTitle: string
  ) => {
    if (!event?.id) {
      toast({
        title: 'Error',
        description: 'Invalid payment event ID',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await action(event.id);

      if (result.error) {
        toast({
          title: errorTitle,
          description: result.error,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Success',
        description: successMessage
      });

      resetState();
      router.refresh();
    } catch (error) {
      console.error('Action error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(event.id);
      toast({
        description: 'Payment event ID copied to clipboard'
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy ID to clipboard',
        variant: 'destructive'
      });
    }
  };

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    router.push(path);
  };

  const canActivate =
    !event.active && event.currentVersion?.status === 'ACTIVE';
  const canDeactivate = event.active;
  const canDelete = !event.active && event.customerPaymentEvents.length === 0;

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleNavigation(`/finance/payment-events/${event.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleNavigation(
              `/finance/payment-events/${event.id}/edit`
            )}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleNavigation(
              `/finance/payment-events/${event.id}/versions`
            )}
          >
            <History className="mr-2 h-4 w-4" />
            Version History
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {canActivate && (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowActivateDialog(true);
                setIsOpen(false);
              }}
              className="text-green-600"
            >
              <Power className="mr-2 h-4 w-4" />
              Activate Event
            </DropdownMenuItem>
          )}

          {canDeactivate && (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeactivateDialog(true);
                setIsOpen(false);
              }}
              className="text-yellow-600"
            >
              <PowerOff className="mr-2 h-4 w-4" />
              Deactivate Event
            </DropdownMenuItem>
          )}

          {canDelete && (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteDialog(true);
                setIsOpen(false);
              }}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Event
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={showActivateDialog}
        onOpenChange={setShowActivateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Payment Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will activate the payment event and allow new customer
              assignments. Existing assignments will remain unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowActivateDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleActionWithErrorHandling(
                  activatePaymentEvent,
                  'Payment event activated successfully',
                  'Activation failed'
                );
              }}
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Activating...' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Payment Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent new customer assignments but won&apos;t affect
              existing ones. All current payments and schedules will continue as
              normal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeactivateDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleActionWithErrorHandling(
                  deactivatePaymentEvent,
                  'Payment event deactivated successfully',
                  'Deactivation failed'
                );
              }}
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Event?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-muted-foreground space-y-2 text-sm">
                <p>
                  This action cannot be undone. This will permanently delete the
                  payment event and all its versions.
                </p>
                <p className="font-medium">
                  Note: Payment events can only be deleted if they have never
                  been assigned to any customers. This ensures all financial
                  records are preserved.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleActionWithErrorHandling(
                  deletePaymentEvent,
                  'Payment event and all related data deleted successfully',
                  'Deletion failed'
                );
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
