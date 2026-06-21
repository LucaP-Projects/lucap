'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { sendVerificationEmail } from '@/utils/auth-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';


export const SendVerificationEmailForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const email = String(formData.get('email'));

    if (!email)
      return toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Email is required.'
      });

    await sendVerificationEmail({
      email,
      callbackURL: '/verify',
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast({
            title: 'Error',
            variant: 'destructive',
            description: 'Failed to send verification email.'
          });
        },
        onSuccess: () => {
          toast({
            title: 'Success',
            variant: 'default',
            description: 'Verification email sent successfully.'
          });
          router.push('/verify/success');
        }
      }
    });
  }

  return (
    <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" />
      </div>

      <Button type="submit" disabled={isPending}>
        Resend Verification Email
      </Button>
    </form>
  );
};
