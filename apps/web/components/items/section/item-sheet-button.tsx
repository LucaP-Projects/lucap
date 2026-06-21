'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ItemSheet } from './item-sheet';

export function ItemSheetButton() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Item
      </Button>
      <ItemSheet open={open} onOpenChange={setOpen} onSuccess={handleSuccess} />
    </>
  );
}
