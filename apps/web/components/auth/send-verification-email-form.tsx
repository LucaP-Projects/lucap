'use client';

import { SubmitEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import authClient  from '@/lib/auth-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';


export const SendVerificationEmailForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: SubmitEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const email = String(formData.get('email'));

    if (!email)
      return toast.error('Error', {
        description: 'Email is required.'
      });

    await authClient.sendVerificationEmail({
      email,
      callbackURL: '/verify',
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: () => {
          toast.error('Error', {
            description: 'Failed to send verification email.'
          });
        },
        onSuccess: () => {
          toast.success('Success', {
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
