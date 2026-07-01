'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Loading from '../shared/loading';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { createTicket } from './actions';
import { ticketSchema, TicketInput } from './schema';

export function NewTicketButton({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: '',
      service: 'Standard Support',
      message: '',
    },
  });

  async function onSubmit(data: TicketInput) {
    try {
      const ticket = await createTicket(data, companyId);
      toast.success('Ticket created successfully');
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error('An error occurred');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-navy hover:bg-navy-light text-white font-bold h-11 px-6 shadow-sm">
          <PlusIcon className="mr-2" />
          New Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-playfair text-navy">Open a support ticket</DialogTitle>
          <DialogDescription>
            Describe your request and a member of our team will get back to you quickly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Subject</FieldLabel>
                <Input placeholder="e.g. VPN access issue" {...field} />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="service"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Service concerned</FieldLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard Support">General Support</SelectItem>
                    <SelectItem value="Accounting">Accounting & Tax</SelectItem>
                    <SelectItem value="Legal">Legal Advice</SelectItem>
                    <SelectItem value="IT Support">Technical Support / VPN</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="message"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Detailed message</FieldLabel>
                  <Textarea 
                    placeholder="Describe your request..." 
                    className="min-h-30 resize-none"
                    {...field} 
                  />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter className="pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-navy hover:bg-navy-light text-white"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <><Loading className="fa-solid fa-spinner fa-spin mr-2" />Sending...</>
              ) : (
                'Submit request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
