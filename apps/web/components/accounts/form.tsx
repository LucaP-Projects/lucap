import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Form, useForm } from 'react-hook-form';

import { toast } from 'sonner';
import { AccountSelect } from '../shared/account/account-select';
import { createAccount } from './actions';
import { accountFormSchema, AccountFormValues } from './schema';
import { Sheet } from 'lucide-react';
import FormField from '../lang/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';

interface AccountFormProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  isNestedForm?: boolean;
}

const AccountForm = ({
  children,
  open,
  onOpenChange,
  onSuccess,
  isNestedForm
}: AccountFormProps) => {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      title: '',
      number: '',
      parentId: null
    }
  });

  const onSubmit = async (data: AccountFormValues) => {
    if (loading) return;

    try {
      setLoading(true);
      const response = await createAccount(data);

      if (!response.success) {
        toast(response.error || 'Failed to create account');
        return;
      }

      toast('Account created successfully');

      form.reset();
      onOpenChange(false);
      onSuccess?.(); // Call the success callback
      router.refresh();
    } catch (error) {
      toast('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isNestedForm) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit(onSubmit)(e);
  };

  // Handle number input to allow only digits
  const handleNumberInput = (
    value: string,
    onChange: (value: string) => void
  ) => {
    const numbersOnly = value.replace(/\D/g, '');
    onChange(numbersOnly);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader className="space-y-4">
          <SheetTitle>Create New Account</SheetTitle>
          <SheetDescription>
            Add a new account to your chart of accounts
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Enter account number"
                      {...field}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, field.onChange)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Account</FormLabel>
                  <FormControl>
                    <AccountSelect
                      showCreate={false}
                      selectedAccountId={field.value || undefined}
                      onSelect={(account) => field.onChange(account.id)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
      {children}
    </Sheet>
  );
};

export { AccountForm };
