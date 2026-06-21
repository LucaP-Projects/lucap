'use client';
import { useState } from 'react';
import { PaymentEventVersion } from '@/lib/generated/prisma/client';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// import { activateVersionButtonTrigger } from "./one_time/newactions";

export interface ExtendedCustomerPaymentEvent {
  id: string;
  status: string;
  customer: {
    displayName: string;
  } | null;
}

export interface ExtendedPaymentEventVersion extends PaymentEventVersion {
  paymentEvent?: {
    customerPaymentEvents: ExtendedCustomerPaymentEvent[];
  };
}

interface VersionActivateButtonProps {
  versionId: string;
  version: ExtendedPaymentEventVersion;
  pendingPaymentsCount?: number;
}

export function VersionActivateButton({
  versionId,
  version,
  pendingPaymentsCount = 0
}: VersionActivateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();

  async function handleActivate() {
    try {
      setLoading(true);
      // await activateVersionButtonTrigger(versionId);

      toast.success(
        'Version scheduled for activation. This will take effect in the next few minutes.'
      );

      router.refresh();
    } catch (error) {
      console.error('Activation error:', error);
      toast.error('Failed to schedule version activation');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }

  // Don't show button if version is not in DRAFT state
  if (version.status !== 'DRAFT') {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        size="sm"
        className="w-full sm:w-auto"
      >
        {loading ? 'Scheduling...' : 'Activate Version'}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Activate Version {version.version}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to activate version{' '}
                  <span className="font-medium">{version.name}</span>?
                </p>
                <p className="text-muted-foreground text-sm">
                  The version will be activated in the next few minutes.
                </p>

                {pendingPaymentsCount > 0 && (
                  <div className="bg-muted mt-4 flex items-start gap-2 rounded-lg p-4">
                    <Info className="mt-0.5 h-5 w-5 text-blue-500" />
                    <div className="space-y-2">
                      <p className="font-medium">
                        {pendingPaymentsCount} pending payment
                        {pendingPaymentsCount === 1 ? '' : 's'} affected
                      </p>
                      <p className="text-muted-foreground text-sm">
                        These payments will be migrated to the new version
                        automatically.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={handleActivate}
              className="bg-primary"
            >
              {loading ? 'Scheduling...' : 'Activate Version'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
