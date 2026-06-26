'use client';

import { SubmitEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import authClient from '@/lib/auth-client';
import { Button } from '../ui/button';
import { FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

interface UpdateUserFormProps {
  name: string;
  image: string;
}

export const UpdateUserForm = ({ name, image }: UpdateUserFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: SubmitEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);
    const name = String(formData.get('name'));
    const image = String(formData.get('image'));

    if (!name && !image) {
      return toast.error('Error', {
        description: 'Please enter a name or image'
      });
    }

    await authClient.updateUser({
      ...(name && { name }),
      image,
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: () => {
          toast.error('Error', {
            description: 'Failed to update profile.'
          });
        },
        onSuccess: () => {
          toast.success('Success', {
            description: 'Your profile has been updated.'
          });
          (evt.target as HTMLFormElement).reset();
          router.refresh();
        }
      }
    });
  }

  return (
    <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" name="name" defaultValue={name} />
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="image">Image</FieldLabel>
        <Input id="image" name="image" defaultValue={image} />
      </div>

      <Button type="submit" disabled={isPending}>
        Update User
      </Button>
    </form>
  );
};
