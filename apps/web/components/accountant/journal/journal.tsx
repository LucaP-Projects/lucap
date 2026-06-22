'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';

import {
  Button,
  Calendar,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  toast
} from '@silknexus/ui';

import { AccountSelect } from '@/components/new/shared/account/account-select';
import { CustomerSelect } from '@/components/new/shared/customer/customer-selection';
import { cn, handleNumberInput } from '@/lib/utils';
import { createJournalEntry, updateJournalEntry } from './actions';
import { JournalFormValues, journalEntrySchema } from './types';
type JournalEntryFormProps = {
  mode?: 'create' | 'edit';
  journalId?: string;
  initialData?: JournalFormValues;
};
export function JournalEntryForm({
  mode = 'create',
  journalId,
  initialData
}: JournalEntryFormProps) {
  const router = useRouter();

  const [isPending, startTransition] = React.useTransition();

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: initialData || {
      date: new Date(),
      journalNo: '',
      entries: [
        {
          accountId: '',
          customerId: '',
          debit: null,
          credit: null,
          description: ''
        }
      ]
    }
  });

  async function onSubmit(data: JournalFormValues) {
    const difference = Math.abs(totalDebits - totalCredits);

    if (difference > 0) {
      toast(`Entries are not balanced. Difference: ${difference.toFixed(2)}`);
      return;
    }

    startTransition(async () => {
      try {
        let result;
        if (mode === 'edit' && journalId) {
          result = await updateJournalEntry(journalId, data);
        } else {
          result = await createJournalEntry(data);
        }

        if (!result.success) {
          if (result.redirect) {
            router.push(result.redirect);
            return;
          }
          throw new Error(result.error);
        }

        toast.success(
          `Journal entry ${mode === 'edit' ? 'updated' : 'created'} successfully`
        );

        router.refresh();
        router.push('/journals');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Something went wrong'
        );
      }
    });
  }

  const entries = form.watch('entries');
  const totalDebits = entries.reduce(
    (sum, entry) => sum + (entry.debit || 0),
    0
  );
  const totalCredits = entries.reduce(
    (sum, entry) => sum + (entry.credit || 0),
    0
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Journal Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Section */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Date Field */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel className="text-sm font-medium">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'h-10 w-full px-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Journal Number */}
              <FormField
                control={form.control}
                name="journalNo"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel className="text-sm font-medium">
                      Journal No.
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Entries Section */}
            <div className="rounded-lg border">
              <div className="bg-muted/50 p-4">
                <h3 className="font-semibold">Journal Entries</h3>
              </div>
              <ScrollArea className="h-[400px] rounded-md">
                <div className="space-y-4 p-4">
                  {/* Headers */}
                  <div className="hidden gap-4 text-sm font-medium md:grid md:grid-cols-[2fr_2fr_1fr_1fr_2fr_40px]">
                    <div>Account</div>
                    <div>Customer</div>
                    <div className="text-right">Debit</div>
                    <div className="text-right">Credit</div>
                    <div>Description</div>
                    <div />
                  </div>

                  {/* Entry Lines */}
                  {entries.map((_, index) => (
                    <div
                      key={index}
                      className="grid gap-4 border-b pb-4 last:border-0 last:pb-0 md:grid-cols-[2fr_2fr_1fr_1fr_2fr_40px]"
                    >
                      {/* Account field remains the same */}
                      <div className="space-y-2 md:space-y-0">
                        <div className="font-medium md:hidden">Account</div>
                        <FormField
                          control={form.control}
                          name={`entries.${index}.accountId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <AccountSelect
                                  onSelect={(account) =>
                                    field.onChange(account.id)
                                  }
                                  selectedAccountId={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2 md:space-y-0">
                        <div className="font-medium md:hidden">Customer</div>
                        <FormField
                          control={form.control}
                          name={`entries.${index}.customerId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <CustomerSelect
                                  onSelect={(customer) =>
                                    field.onChange(customer.id)
                                  }
                                  selectedCustomerId={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Updated Debit field */}
                      <div className="space-y-2 md:space-y-0">
                        <div className="font-medium md:hidden">Debit</div>
                        <FormField
                          control={form.control}
                          name={`entries.${index}.debit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="h-10 w-full text-right"
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    handleNumberInput(
                                      e.target.value,
                                      (value) => {
                                        field.onChange(value);
                                        if (value > 0) {
                                          form.setValue(
                                            `entries.${index}.credit`,
                                            0
                                          );
                                        }
                                      }
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Updated Credit field */}
                      <div className="space-y-2 md:space-y-0">
                        <div className="font-medium md:hidden">Credit</div>
                        <FormField
                          control={form.control}
                          name={`entries.${index}.credit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="h-10 w-full text-right"
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    handleNumberInput(
                                      e.target.value,
                                      (value) => {
                                        field.onChange(value);
                                        if (value > 0) {
                                          form.setValue(
                                            `entries.${index}.debit`,
                                            0
                                          );
                                        }
                                      }
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Updated Description field */}
                      <div className="space-y-2 md:space-y-0">
                        <div className="font-medium md:hidden">Description</div>
                        <FormField
                          control={form.control}
                          name={`entries.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} className="h-10 w-full" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Delete button remains the same */}
                      <div className="flex items-center justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const currentEntries = form.getValues('entries');
                            if (currentEntries.length > 1) {
                              form.setValue(
                                'entries',
                                currentEntries.filter((_, i) => i !== index)
                              );
                            }
                          }}
                          disabled={entries.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            {/* Add Line Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentEntries = form.getValues('entries');
                form.setValue('entries', [
                  ...currentEntries,
                  {
                    accountId: '',
                    customerId: '',
                    debit: null,
                    credit: null,
                    description: ''
                  }
                ]);
              }}
              className="w-full md:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Line
            </Button>

            {/* Totals */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-6">
                <div className="flex justify-between sm:gap-2">
                  <span className="font-medium sm:hidden">Total Debit:</span>
                  <span className="font-semibold">
                    {totalDebits.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between sm:gap-2">
                  <span className="font-medium sm:hidden">Total Credit:</span>
                  <span className="font-semibold">
                    {totalCredits.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto"
          onClick={form.handleSubmit(onSubmit)}
        >
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default JournalEntryForm;
