'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { updateUser } from '@/utils/auth-client';

interface UpdateUserFormProps {
  name: string;
  image: string;
}

export const UpdateUserForm = ({ name, image }: UpdateUserFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);
    const name = String(formData.get('name'));
    const image = String(formData.get('image'));

    if (!name && !image) {
      return toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Please enter a name or image'
      });
    }

    await updateUser({
      ...(name && { name }),
      image,
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
            description: ctx.error.message
          });
        },
        onSuccess: () => {
          toast({
            title: 'Success',
            variant: 'default',
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
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="image">Image</Label>
        <Input id="image" name="image" defaultValue={image} />
      </div>

      <Button type="submit" disabled={isPending}>
        Update User
      </Button>
    </form>
  );
};
