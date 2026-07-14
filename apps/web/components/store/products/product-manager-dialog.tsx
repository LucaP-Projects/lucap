"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { StoreItemListEntry } from "./actions";
import { StoreItemSelector } from "./store-item-selector";

interface ProductManagerDialogProps {
  initialAvailable: StoreItemListEntry[];
  initialSelected: StoreItemListEntry[];
}

export function ProductManagerDialog({
  initialAvailable,
  initialSelected
}: ProductManagerDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ListChecks className="mr-2 h-4 w-4" />
          Product Manager
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Product Manager</DialogTitle>
          <DialogDescription>
            Choose which of your items are shown in your store.
          </DialogDescription>
        </DialogHeader>
        <StoreItemSelector
          initialAvailable={initialAvailable}
          initialSelected={initialSelected}
        />
      </DialogContent>
    </Dialog>
  );
}
