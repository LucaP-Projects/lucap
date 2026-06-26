'use client';

import { useState } from 'react';
import authClient from '@/lib/auth-client';
import { Button } from '../ui/button';
interface SignInOauthButtonProps {
  provider: 'google' | 'github';
  signUp?: boolean;
}

export const SignInOauthButton = ({
  provider,
  signUp
}: SignInOauthButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);

    await authClient.signIn.social({
      provider,
      callbackURL: '/profile',
      errorCallbackURL: '/login/error'
    });

    setIsPending(false);
  }

  const action = signUp ? 'Up' : 'In';
  const providerName = provider === 'google' ? 'Google' : 'GitHub';

  return (
    <Button onClick={handleClick} disabled={isPending}>
      Sign {action} with {providerName}
    </Button>
  );
};
