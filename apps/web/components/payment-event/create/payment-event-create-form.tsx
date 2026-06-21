'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Calendar as CalendarIcon } from 'lucide-react';

import {
  Button,
  Calendar,
  Card,
  CardContent,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
  Textarea,
  toast
} from '@silknexus/ui';
import {
  createOneTimePaymentEvent,
  createSubscriptionPaymentEvent
} from '@/components/payment-event/create/payment-event-create';

import { handleNumberInput } from '@/lib/utils';
import {
  paymentEventFormSchema,
  PaymentEventFormValues
} from '@/validation/payment-event/subscription.schema';

interface PaymentEventDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaymentEventDrawer({
  open,
  onOpenChange
}: PaymentEventDrawerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<PaymentEventFormValues>({
    resolver: zodResolver(paymentEventFormSchema),
    defaultValues: {
      type: 'SUBSCRIPTION',
      name: '',
      description: '',
      frequency: {
        unit: 'MONTH',
        value: 1
      },
      useAnchorDate: false,
      allowPause: false,
      initialFee: {
        amount: 0,
        description: ''
      }
    }
  });
  const { watch, setValue } = form;
  const paymentType = watch('type');
  const generateInvoiceNow = watch('generateInvoiceNow');
  const useAnchorDate = watch('useAnchorDate');
  const frequencyUnit = watch('frequency.unit');

  // Effect to clear or set dueDate based on generateInvoiceNow

  useEffect(() => {
    if (generateInvoiceNow) {
      // When generateInvoiceNow is true, clear the dueDate
      setValue('dueDate', undefined, { shouldValidate: true });
    }
  }, [generateInvoiceNow, setValue]);
  useEffect(() => {
    if (useAnchorDate && frequencyUnit) {
      if (!['WEEK', 'MONTH'].includes(frequencyUnit)) {
        form.setValue('useAnchorDate', false);
      }
      // Clear anchor config when switching frequency types
      form.setValue('anchorConfig', undefined);
    }
  }, [frequencyUnit, useAnchorDate, form]);

  async function onSubmit(values: PaymentEventFormValues) {
    try {
      setLoading(true);
      // Handle different submission based on type
      if (values.type === 'ONE_TIME') {
        await createOneTimePaymentEvent(values);
      } else {
        await createSubscriptionPaymentEvent(values);
      }

      toast({
        title: 'Success',
        description: 'Payment event created successfully'
      });
      onOpenChange(false);
      form.reset();
      router.push('/finance/payment-events');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }
  const renderAnchorDayInput = () => {
    if (!useAnchorDate || !frequencyUnit) return null;

    if (frequencyUnit === 'WEEK') {
      return (
        <FormField
          control={form.control}
          name="anchorConfig"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Day</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange({ type: 'weekly', day: parseInt(value) })
                }
                value={
                  field.value?.type === 'weekly'
                    ? field.value.day.toString()
                    : undefined
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                  <SelectItem value="7">Sunday</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the day of the week for billing
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (frequencyUnit === 'MONTH') {
      return (
        <FormField
          control={form.control}
          name="anchorConfig"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Day</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange({
                    type: 'monthly',
                    day: value === 'last' ? 'last' : parseInt(value)
                  })
                }
                value={
                  field.value?.type === 'monthly'
                    ? field.value.day === 'last'
                      ? 'last'
                      : field.value.day.toString()
                    : undefined
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {' '}
                  {/* Added these classes */}
                  {[...Array(28)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                  <SelectItem value="last">Last Day</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the day of the month for billing
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return null;
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="p-8 pb-4">
            <SheetTitle className="text-2xl">Create Payment Event</SheetTitle>
            <SheetDescription className="text-base">
              Set up a new payment event for your customers
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <Card className="border-none shadow-none">
                  <CardContent className="space-y-8 p-0">
                    {/* Basic Information */}

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter payment name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                onChange={(e) =>
                                  handleNumberInput(
                                    e.target.value,
                                    field.onChange
                                  )
                                }
                                value={field.value === 0 ? '' : field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}

                    {/* Common Fields */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter subscription description"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-4">
                              <button
                                type="button"
                                onClick={() => field.onChange('ONE_TIME')}
                                className={`hover:border-primary/50 flex w-full flex-col rounded-lg border-2 p-4 transition-colors ${
                                  field.value === 'ONE_TIME'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    Single payment
                                  </span>
                                  {field.value === 'ONE_TIME' && (
                                    <div className="text-primary">
                                      <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <path d="M20 6L9 17L4 12" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <span className="text-muted-foreground text-sm">
                                  Charge a one-time fee
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => field.onChange('SUBSCRIPTION')}
                                className={`hover:border-primary/50 flex w-full flex-col rounded-lg border-2 p-4 transition-colors ${
                                  field.value === 'SUBSCRIPTION'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    Subscription
                                  </span>
                                  {field.value === 'SUBSCRIPTION' && (
                                    <div className="text-primary">
                                      <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <path d="M20 6L9 17L4 12" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <span className="text-muted-foreground text-sm">
                                  Charge an ongoing fee
                                </span>
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {paymentType === 'ONE_TIME' ? (
                      // One Time Payment Fields
                      <>
                        <FormField
                          control={form.control}
                          name="generateInvoiceNow"
                          render={({ field }) => (
                            <FormItem className="bg-secondary/20 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <FormLabel>
                                    Generate Invoice Immediately
                                  </FormLabel>

                                  <FormDescription>
                                    Invoice will be created as soon as customer
                                    is assigned
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {!generateInvoiceNow && (
                          <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
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
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={field.value || undefined}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date <
                                        new Date(
                                          new Date().setHours(0, 0, 0, 0)
                                        )
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    ) : (
                      // Subscription Fields
                      <>
                        <div className="grid gap-6 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="frequency.unit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency Unit</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select frequency unit" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="DAY">Day</SelectItem>
                                    <SelectItem value="WEEK">Week</SelectItem>
                                    <SelectItem value="MONTH">Month</SelectItem>
                                    <SelectItem value="YEAR">Year</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="frequency.value"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency Value</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    onChange={(e) =>
                                      handleNumberInput(
                                        e.target.value,
                                        field.onChange,
                                        1
                                      )
                                    }
                                    value={field.value}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="useAnchorDate"
                          render={({ field }) => (
                            <FormItem className="bg-secondary/20 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <FormLabel>Use Anchor Date</FormLabel>
                                  <FormDescription>
                                    {frequencyUnit === 'WEEK'
                                      ? 'Bill on a specific day of the week'
                                      : frequencyUnit === 'MONTH'
                                        ? 'Bill on a specific day of the month'
                                        : 'Bill on specific day of period'}
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={
                                      !['WEEK', 'MONTH'].includes(frequencyUnit)
                                    }
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {useAnchorDate && renderAnchorDayInput()}

                        <FormField
                          control={form.control}
                          name="trialPeriodDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trial Period (Days)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  onChange={(e) =>
                                    handleNumberInput(
                                      e.target.value,
                                      field.onChange,
                                      0
                                    )
                                  }
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormDescription>
                                Number of trial days before first billing
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="allowPause"
                          render={({ field }) => (
                            <FormItem className="bg-secondary/20 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <FormLabel>Allow Pause</FormLabel>
                                  <FormDescription>
                                    Enable subscription pausing
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="space-y-6 border-t pt-6">
                          <h3 className="text-lg font-medium">
                            Initial Fee (Will Be Charged With First Invoice)
                          </h3>
                          <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="initialFee.amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Initial Fee Amount</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      step="0.01"
                                      min="0"
                                      onChange={(e) =>
                                        handleNumberInput(
                                          e.target.value,
                                          field.onChange
                                        )
                                      }
                                      value={
                                        field.value === 0 ? '' : field.value
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="initialFee.description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Initial Fee Description</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter description"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Initial Fee Section */}
                  </CardContent>
                </Card>
                <div className="space-y-6 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Items</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const currentItems = form.getValues('items') || [];
                        form.setValue('items', [
                          ...currentItems,
                          {
                            productName: '',
                            description: '',
                            quantity: 1,
                            rate: 0,
                            amount: 0,
                            taxable: true
                          }
                        ]);
                      }}
                    >
                      Add Item
                    </Button>
                  </div>

                  {form.watch('items')?.map((_, index) => (
                    <div
                      key={index}
                      className="space-y-4 rounded-lg border p-4"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-destructive h-8 px-2"
                          onClick={() => {
                            const currentItems = form.getValues('items');
                            form.setValue(
                              'items',
                              currentItems.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.productName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter product name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter description"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  step="1"
                                  onChange={(e) => {
                                    const quantity = parseFloat(e.target.value);
                                    field.onChange(quantity);

                                    // Update amount when quantity changes
                                    const rate =
                                      form.getValues(`items.${index}.rate`) ||
                                      0;
                                    form.setValue(
                                      `items.${index}.amount`,
                                      quantity * rate
                                    );
                                  }}
                                  value={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.rate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rate</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  onChange={(e) => {
                                    const rate = parseFloat(e.target.value);
                                    field.onChange(rate);

                                    // Update amount when rate changes
                                    const quantity =
                                      form.getValues(
                                        `items.${index}.quantity`
                                      ) || 0;
                                    form.setValue(
                                      `items.${index}.amount`,
                                      quantity * rate
                                    );
                                  }}
                                  value={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.taxable`}
                          render={({ field }) => (
                            <FormItem>
                              {/* <FormLabel>Taxable</FormLabel> */}
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                  <span className="text-muted-foreground text-sm">
                                    Apply tax to this item
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Amount (auto-calculated)</FormLabel>
                                <span className="font-medium">
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                  }).format(field.value || 0)}
                                </span>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 text-right text-lg font-medium">
                    Total Amount:{' '}
                    {form
                      .watch('items')
                      ?.reduce((sum, item) => sum + (item.amount || 0), 0)
                      .toFixed(2)}
                  </div>
                </div>
              </form>
            </Form>
          </div>
          <SheetFooter className="border-t bg-white p-6">
            <div className="flex w-full justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                onClick={form.handleSubmit(onSubmit)}
              >
                {loading ? 'Creating...' : 'Create Payment Event'}
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
