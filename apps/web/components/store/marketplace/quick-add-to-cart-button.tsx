"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/components/store/cart/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickAddToCartButtonProps {
  itemId: string;
  disabled?: boolean;
  className?: string;
}

export function QuickAddToCartButton({
  itemId,
  disabled,
  className
}: QuickAddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      const result = await addToCart({ itemId, quantity: 1 });
      if (result.success) {
        toast.success("Added to cart");
      } else {
        toast.error(result.error || "Failed to add to cart");
      }
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      onClick={handleClick}
      disabled={disabled || isAdding}
      className={cn("shadow-sm", className)}
      title="Add to cart"
    >
      <ShoppingCart className="h-4 w-4" />
    </Button>
  );
}
