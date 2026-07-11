'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, Form, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { ChevronRight, Pencil, Plus,  Trash2 } from 'lucide-react';
import { AccountForm } from '@/components/accounts/form';
import { AccountFormValues } from '@/components/accounts/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Tooltip,  TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { deleteAccount, updateAccount } from './actions';
import { Account, AccountRowProps, AccountsPageClientProps } from './types';

// Validation schema
const editFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Account name is required')
    .max(255, 'Account name must be less than 255 characters')
});

// Helper function to update account in tree
const updateAccountInTree = (
  accounts: Account[],
  id: string,
  newTitle: string
): Account[] =>
  accounts.map((account) => {
    if (account.id === id) {
      return { ...account, title: newTitle };
    }
    if (account.subAccounts) {
      return {
        ...account,
        subAccounts: updateAccountInTree(account.subAccounts, id, newTitle)
      };
    }
    return account;
  });

// Helper function to remove account from tree
const removeAccountFromTree = (accounts: Account[], id: string): Account[] =>
  accounts
    .filter((account) => account.id !== id)
    .map((account) => {
      if (account.subAccounts) {
        return {
          ...account,
          subAccounts: removeAccountFromTree(account.subAccounts, id)
        };
      }
      return account;
    });
// Account Row Component
const AccountRow: React.FC<AccountRowProps> = ({
  account,
  level,
  onExpand,
  isExpanded,
  onEdit,
  onDelete
}) => {
  const hasSubAccounts = account.subAccounts && account.subAccounts?.length > 0;
  const indentPadding = level * 16;

  return (
    <div
      className={`group relative flex flex-wrap items-center gap-2 border-b border-gray-100 p-2 hover:bg-gray-50 sm:p-3 ${
        level === 0 ? 'bg-gray-50/50' : ''
      }`}
      style={{ paddingLeft: `${indentPadding + 12}px` }}
    >
      {/* Expand Button */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        {hasSubAccounts && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onExpand(account.id)}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </motion.div>
          </motion.button>
        )}
      </div>

      {/* Account Number Badge */}
      <Badge
        variant={level === 0 ? 'default' : 'outline'}
        className="min-w-[50px] shrink-0 justify-center px-1 text-xs sm:min-w-[60px] sm:px-2"
      >
        {account.number}
      </Badge>

      {/* Title with Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="min-w-0 flex-1 break-words pr-2 text-xs sm:text-sm">
            <div className="line-clamp-2 sm:line-clamp-1">
              {account.title}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[300px]">
          <p className="text-sm">{account.title}</p>
        </TooltipContent>
      </Tooltip>

      {/* Action Buttons */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 sm:h-8 sm:w-8"
          onClick={() => onEdit(account)}
        >
          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        {account.is_custom && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 sm:h-8 sm:w-8"
            onClick={() => onDelete(account)}
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Main Component
const AccountsPageClient: React.FC<AccountsPageClientProps> = ({
  initialAccounts
}) => {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    new Set()
  );
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const editForm = useForm<Pick<AccountFormValues, 'title'>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: ''
    }
  });
  const handleAccountCreated = React.useCallback(() => {
    setSheetOpen(false);
    toast.success('Account created successfully');
    window.location.reload();
  }, [toast]);
  const toggleExpand = (accountId: string) => {
    setExpandedAccounts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    editForm.reset({ title: account.title });
    setIsEditSheetOpen(true);
  };

  const handleDelete = (account: Account) => {
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const onEditSubmit = async (data: Pick<AccountFormValues, 'title'>) => {
    try {
      if (!selectedAccount) return;

      setIsLoading(true);
      const response = await updateAccount(selectedAccount.id, data.title);

      if (response.success) {
        // Optimistic update
        setAccounts((prevAccounts) =>
          updateAccountInTree(prevAccounts, selectedAccount.id, data.title)
        );

        toast.success('Account updated successfully');

        setIsEditSheetOpen(false);
      } else {
        if (response.redirect) {
          window.location.href = response.redirect;
          return;
        }

        toast.error(response.error || 'Failed to update account');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteConfirm = async () => {
    try {
      if (!selectedAccount) return;

      setIsLoading(true);
      const response = await deleteAccount(selectedAccount.id);

      if (response.success) {
        // Optimistic update
        setAccounts((prevAccounts) =>
          removeAccountFromTree(prevAccounts, selectedAccount.id)
        );

        toast.success('Account deleted successfully');

        setIsDeleteDialogOpen(false);
      } else {
        if (response.redirect) {
          window.location.href = response.redirect;
          return;
        }

        toast.error(response.error || 'Failed to delete account');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAccountTree = (account: Account, level = 0) => {
    const isExpanded = expandedAccounts.has(account.id);

    return (
      <motion.div
        key={account.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <AccountRow
          account={account}
          level={level}
          onExpand={toggleExpand}
          isExpanded={isExpanded}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <AnimatePresence>
          {isExpanded &&
            account.subAccounts &&
            account.subAccounts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-l border-gray-100"
              >
                {account.subAccounts.map((subAccount) =>
                  renderAccountTree(subAccount, level + 1)
                )}
              </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <Card className="flex h-full flex-col">
      {/* Mobile Header */}
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-center justify-between">
          <div className="pb-3">
            <CardTitle className="text-2xl">Chart of Accounts</CardTitle>
            <CardDescription>Manage your accounting structure</CardDescription>
          </div>
          <AccountForm
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            onSuccess={handleAccountCreated}
          >
            <Button
              onClick={() => setSheetOpen(true)}
              size="icon" // changed to "icon" size
              className="h-8 w-8 md:h-10 md:w-auto md:gap-2 md:px-4"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">New Account</span>
            </Button>
          </AccountForm>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full border-t">
          {isLoading ? (
            <div className="flex h-full items-center justify-center p-4">
              <div className="text-muted-foreground text-sm">Loading...</div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4">
              <div className="text-muted-foreground text-sm">
                No accounts found
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {accounts.map((account) => renderAccountTree(account))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Edit Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-2xl">Edit Account</SheetTitle>
            <SheetDescription>
              Update your account name to personalize your experience.
            </SheetDescription>
          </SheetHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-6 py-6"
            >
              <Controller
                control={editForm.control}
                name="title"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Account Name</FieldLabel>
                    <Input {...field} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <SheetFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditSheetOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editForm.formState.isSubmitting || isLoading}
                >
                  {editForm.formState.isSubmitting || isLoading
                    ? 'Saving...'
                    : 'Save Changes'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the account &quot;
              {selectedAccount?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AccountsPageClient;
