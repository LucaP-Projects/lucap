'use client';

import { SubmitEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import Loading from '../shared/loading';


export const ForgotPasswordForm = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(evt: SubmitEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const email = String(formData.get('email'));

    if (!email) return toast.error('Please enter your email.');

    await authClient.requestPasswordReset({
      email,
      redirectTo: '/auth/reset-password',
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setError("something went wrong. Please try again.");
        },
        onSuccess: () => {
          toast.success('Reset link sent to your email.');
          router.push('/auth/forgot-password/success');
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

      <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loading /> : "Send Reset Link"}
          </Button>
          {error ? (
            <FieldDescription className="text-destructive">
              {error}
            </FieldDescription>
          ) : null}
        </Field>
    </form>
  );
};
