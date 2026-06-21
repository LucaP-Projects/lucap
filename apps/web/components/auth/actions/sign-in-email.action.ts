'use server';

import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, ErrorCode } from '@/utils/auth';

export async function signInEmailAction(formData: FormData) {
  const email = String(formData.get('email'));
  if (!email) return { error: 'Please enter your email' };

  const password = String(formData.get('password'));
  if (!password) return { error: 'Please enter your password' };

  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password
      }
    });
    return { error: null };
  } catch (err) {
    console.log('Sign-in error:', err);
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : 'UNKNOWN';
      console.dir(err, { depth: 5 });
      switch (errCode) {
        case 'EMAIL_NOT_VERIFIED':
          redirect('/verify?error=email_not_verified');
          break;
        default:
          return { error: err.message };
      }
    }
    console.error('Sign-in error:', err);
    return { error: 'Internal Server Error' };
  }
}
