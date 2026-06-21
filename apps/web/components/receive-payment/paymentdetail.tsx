'use client';

import { format } from 'date-fns';
import { UseFormReturn } from 'react-hook-form';
import { Calendar, CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PaymentFormValues } from './schema';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

interface PaymentDetailsProps {
  form: UseFormReturn<PaymentFormValues>;
}

export function PaymentDetails({ form }: PaymentDetailsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Method</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CHECK">Check</SelectItem>
                <SelectItem value="DIGITAL_WALLET">Digital Wallet</SelectItem>
                <SelectItem value="MOBILE_PAYMENT">Mobile Payment</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="paymentDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
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

      <FormField
        control={form.control}
        name="reference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reference Number (Optional)</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
