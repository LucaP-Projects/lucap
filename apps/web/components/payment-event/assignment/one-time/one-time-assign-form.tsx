import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Badge,
  ChevronDown,
  ChevronRight,
  Search,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CustomerItemProps,
  OneTimeAssignFormProps
} from '@/types/payment-event/assignment';
import { FormattedCustomer } from '@/types/payment-event/table';

import { assignOneTimePayment, checkCustomerAssignment } from './assign-action';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Add loading skeleton for better UX
export const CustomerSkeleton = () => (
  <div className="space-y-3 p-4">
    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
  </div>
);

export const CustomerItem: React.FC<CustomerItemProps> = ({
  customer,
  level = 0,
  selectedId,
  onSelect,
  searchTerm
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubCustomers = customer.subCustomers?.length > 0;

  const matches = useMemo(
    () =>
      searchTerm
        ? customer.displayName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.subCustomers?.some((sub) =>
            sub.displayName.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : true,
    [customer, searchTerm]
  );

  if (!matches) return null;

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center rounded-md transition-all',
          'hover:bg-gray-50',
          selectedId === customer.id && 'bg-blue-50 ring-1 ring-blue-200',
          'group cursor-pointer'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasSubCustomers ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        ) : (
          <div className="w-8" />
        )}

        <div
          onClick={() => onSelect(customer)}
          className="flex flex-1 items-center gap-2 px-3 py-2"
        >
          <span className="flex-1">{customer.displayName}</span>
          {hasSubCustomers && (
            <Badge variant="outline" className="opacity-60">
              {customer.subCustomers.length} sub-customers
            </Badge>
          )}
        </div>
      </div>

      {isExpanded && hasSubCustomers && (
        <div className="ml-4 space-y-1">
          {customer.subCustomers.map((sub) => (
            <CustomerItem
              key={sub.id}
              customer={sub}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const OneTimeAssignForm: React.FC<OneTimeAssignFormProps> = ({
  event,
  customers,
  onClose,
  isLoading: parentIsLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<FormattedCustomer | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Price modification state
  const originalAmount =
    event.currentVersion?.paymentSettings.settings.amount || 0;
  const [customAmount, setCustomAmount] = useState(originalAmount);
  const [reason, setReason] = useState('');

  const isPriceModified = customAmount !== originalAmount;

  const loading = isLoading || parentIsLoading;

  const handleAssign = async () => {
    if (!selectedCustomer) return;

    setIsLoading(true);
    try {
      const checkResult = await checkCustomerAssignment({
        paymentEventId: event.id,
        customerId: selectedCustomer.id
      });

      if (checkResult.exists) {
        setShowWarning(true);
      } else {
        await processAssignment();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check existing assignments',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processAssignment = async () => {
    if (!selectedCustomer) return;

    setIsLoading(true);
    try {
      const response = await assignOneTimePayment({
        paymentEventId: event.id,
        customerId: selectedCustomer.id,
        amount: customAmount,
        reason: isPriceModified ? reason : undefined
      });

      if (!response.success) {
        throw new Error(response.error?.message);
      }

      toast({
        title: 'Success',
        description: 'Payment event assigned successfully'
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to assign payment event',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setShowWarning(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-6">
          <div className="bg-background sticky top-0 z-10 space-y-4 pb-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
              <Input
                placeholder="Search customers by name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {selectedCustomer && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-5 w-5" />
                      <span className="font-medium">
                        {selectedCustomer.displayName}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            {loading ? (
              <CustomerSkeleton />
            ) : (
              <div className="divide-y">
                {customers.some(
                  (customer) =>
                    customer.displayName
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    customer.subCustomers?.some((sub) =>
                      sub.displayName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                ) ? (
                  customers.map((customer) => (
                    <CustomerItem
                      key={customer.id}
                      customer={customer}
                      selectedId={selectedCustomer?.id || null}
                      onSelect={setSelectedCustomer}
                      searchTerm={searchTerm}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Users className="text-muted-foreground h-10 w-10 opacity-40" />
                    <p className="text-muted-foreground mt-2 text-sm">
                      No customers found matching &quot;{searchTerm}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {selectedCustomer && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg border p-4">
                  <div className="text-muted-foreground mb-2 text-sm">
                    Original Amount
                  </div>
                  <div className="text-2xl font-semibold">
                    ${originalAmount.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Amount</label>
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {customAmount !== originalAmount && (
                  <>
                    <div
                      className={cn(
                        'text-sm font-medium',
                        customAmount > originalAmount
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    >
                      Difference: $
                      {Math.abs(customAmount - originalAmount).toFixed(2)}(
                      {customAmount > originalAmount ? 'Increase' : 'Decrease'})
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Reason for price modification
                      </label>
                      <Input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter reason for price change..."
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
      <div className="mt-auto border-t">
        <div className="flex justify-end gap-4 px-6 py-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            type="button"
            className="hover:bg-secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              !selectedCustomer ||
              loading ||
              (customAmount !== originalAmount && !reason)
            }
            className="bg-gray-700 hover:bg-gray-800"
          >
            {loading ? 'Assigning...' : 'Assign Payment'}
          </Button>
        </div>
      </div>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Confirm Assignment</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <span className="block">
                You are about to create a new payment assignment for{' '}
                <span className="font-medium">
                  {selectedCustomer?.displayName}
                </span>
              </span>

              {customAmount !== originalAmount && (
                <span className="block rounded-lg border p-4">
                  <span className="mb-2 block font-medium">
                    Price Modification Details:
                  </span>
                  <span className="mt-2 block space-y-1.5">
                    <span className="block text-sm">
                      Original Amount: ${originalAmount.toFixed(2)}
                    </span>
                    <span className="block text-sm">
                      Modified Amount: ${customAmount.toFixed(2)}
                    </span>
                    <span
                      className={cn(
                        'block text-sm font-medium',
                        customAmount > originalAmount
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    >
                      Difference: $
                      {Math.abs(customAmount - originalAmount).toFixed(2)} (
                      {customAmount > originalAmount ? 'Increase' : 'Decrease'})
                    </span>
                  </span>
                </span>
              )}

              <span className="block font-medium">
                Are you sure you want to proceed?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={processAssignment}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Confirm Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OneTimeAssignForm;
