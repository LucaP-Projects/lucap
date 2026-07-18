"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import { addItemsToStore, removeItemsFromStore, StoreItemListEntry } from "./actions";

interface StoreItemSelectorProps {
  initialAvailable: StoreItemListEntry[];
  initialSelected: StoreItemListEntry[];
}

function ItemList({
  title,
  description,
  items,
  checked,
  onToggle,
  onToggleAll,
  onDoubleClick,
  emptyLabel
}: {
  title: string;
  description: string;
  items: StoreItemListEntry[];
  checked: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
  onDoubleClick: (id: string) => void;
  emptyLabel: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.sku?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const filteredIds = useMemo(() => filtered.map((item) => item.id), [filtered]);
  const checkedInFiltered = filteredIds.filter((id) => checked.has(id)).length;
  const allFilteredChecked = filteredIds.length > 0 && checkedInFiltered === filteredIds.length;
  const selectAllState: boolean | "indeterminate" =
    checkedInFiltered === 0 ? false : allFilteredChecked ? true : "indeterminate";

  return (
    <div className="flex flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="space-y-3 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-medium text-gray-800">{title}</h4>
          <Badge variant="secondary">{items.length}</Badge>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items..."
        />
        {filtered.length > 0 && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <Checkbox
              checked={selectAllState}
              onCheckedChange={(value) => onToggleAll(filteredIds, value === true)}
            />
            Select all{query ? " (matching)" : ""}
          </label>
        )}
      </div>
      <ScrollArea className="h-[420px] flex-1 px-4 pb-4">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            {items.length === 0 ? emptyLabel : "No items match your search."}
          </p>
        ) : (
          <div className="space-y-1 pt-2">
            {filtered.map((item) => (
              <label
                key={item.id}
                onDoubleClick={() => onDoubleClick(item.id)}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-50"
              >
                <Checkbox
                  checked={checked.has(item.id)}
                  onCheckedChange={() => onToggle(item.id)}
                />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">{item.name}</p>
                    {item.sku && (
                      <p className="truncate text-xs text-gray-500">{item.sku}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm text-gray-600">
                    {formatCurrency(item.salesPrice)}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export function StoreItemSelector({
  initialAvailable,
  initialSelected
}: StoreItemSelectorProps) {
  const router = useRouter();
  const [available, setAvailable] = useState(initialAvailable);
  const [selected, setSelected] = useState(initialSelected);
  const [checkedAvailable, setCheckedAvailable] = useState<Set<string>>(new Set());
  const [checkedSelected, setCheckedSelected] = useState<Set<string>>(new Set());
  const [isPending, setIsPending] = useState(false);

  function toggleAvailable(id: string) {
    setCheckedAvailable((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelected(id: string) {
    setCheckedSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAllAvailable(ids: string[], value: boolean) {
    setCheckedAvailable((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (value ? next.add(id) : next.delete(id)));
      return next;
    });
  }

  function toggleAllSelected(ids: string[], value: boolean) {
    setCheckedSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (value ? next.add(id) : next.delete(id)));
      return next;
    });
  }

  async function moveToStore(ids: string[]) {
    if (ids.length === 0) return;
    setIsPending(true);
    try {
      const result = await addItemsToStore(ids);
      if (!result.success) {
        toast.error(result.error || "Failed to add items to store");
        return;
      }
      const moving = available.filter((item) => ids.includes(item.id));
      setAvailable((prev) => prev.filter((item) => !ids.includes(item.id)));
      setSelected((prev) => [...prev, ...moving].sort((a, b) => a.name.localeCompare(b.name)));
      setCheckedAvailable(new Set());
      toast.success(
        moving.length === 1 ? "Product added to store" : `${moving.length} products added to store`
      );
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  async function removeFromStore(ids: string[]) {
    if (ids.length === 0) return;
    setIsPending(true);
    try {
      const result = await removeItemsFromStore(ids);
      if (!result.success) {
        toast.error(result.error || "Failed to remove items from store");
        return;
      }
      const moving = selected.filter((item) => ids.includes(item.id));
      setSelected((prev) => prev.filter((item) => !ids.includes(item.id)));
      setAvailable((prev) => [...prev, ...moving].sort((a, b) => a.name.localeCompare(b.name)));
      setCheckedSelected(new Set());
      toast.success(
        moving.length === 1
          ? "Product removed from store"
          : `${moving.length} products removed from store`
      );
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
      <ItemList
        title="Company Items"
        description="Items not currently shown in your store."
        items={available}
        checked={checkedAvailable}
        onToggle={toggleAvailable}
        onToggleAll={toggleAllAvailable}
        onDoubleClick={(id) => moveToStore([id])}
        emptyLabel="All your sellable items are already in the store."
      />

      <div className="flex flex-row items-center justify-center gap-2 md:flex-col">
        <Button
          type="button"
          size="icon"
          className="bg-indigo-600 shadow-sm hover:bg-indigo-700"
          disabled={isPending || checkedAvailable.size === 0}
          onClick={() => moveToStore(Array.from(checkedAvailable))}
          title="Add to store"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isPending || checkedSelected.size === 0}
          onClick={() => removeFromStore(Array.from(checkedSelected))}
          title="Remove from store"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <ItemList
        title="Store Products"
        description="Items customers can see and order in your store."
        items={selected}
        checked={checkedSelected}
        onToggle={toggleSelected}
        onToggleAll={toggleAllSelected}
        onDoubleClick={(id) => removeFromStore([id])}
        emptyLabel="No products in your store yet. Add items from the left."
      />
    </div>
  );
}
