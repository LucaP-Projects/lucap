"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { StoreItemListEntry } from "./actions";
import { ProductManagerDialog } from "./product-manager-dialog";

interface ProductDetailsProduct {
  id: string;
  name: string;
  storeStatus: "DRAFT" | "ACTIVE" | "ARCHIVED";
  salesPrice: number;
  quantityOnHand: number | null;
}

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "status";

const SORT_LABELS: Record<SortOption, string> = {
  "name-asc": "Name (A–Z)",
  "name-desc": "Name (Z–A)",
  "price-asc": "Price (Low–High)",
  "price-desc": "Price (High–Low)",
  status: "Status"
};

const STATUS_ORDER: Record<ProductDetailsProduct["storeStatus"], number> = {
  ACTIVE: 0,
  DRAFT: 1,
  ARCHIVED: 2
};

const STATUS_COLORS: Record<ProductDetailsProduct["storeStatus"], string> = {
  ACTIVE: "bg-green-500 hover:bg-green-600",
  DRAFT: "bg-gray-500 hover:bg-gray-600",
  ARCHIVED: "bg-slate-400 hover:bg-slate-500"
};

interface ProductDetailsTableProps {
  products: ProductDetailsProduct[];
  companySlug: string;
  available: StoreItemListEntry[];
  selected: StoreItemListEntry[];
}

export function ProductDetailsTable({
  products,
  companySlug,
  available,
  selected
}: ProductDetailsTableProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;

    return [...result].sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.salesPrice - b.salesPrice;
        case "price-desc":
          return b.salesPrice - a.salesPrice;
        case "status":
          return STATUS_ORDER[a.storeStatus] - STATUS_ORDER[b.storeStatus];
        default:
          return 0;
      }
    });
  }, [products, query, sort]);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-800">No products yet</h3>
        <p className="text-sm text-gray-600">
          Use Product Manager to show existing items in your store, or add a new one.
        </p>
        <div className="mt-4 flex gap-3">
          <ProductManagerDialog initialAvailable={available} initialSelected={selected} />
          <Link href={`/${companySlug}/store/products/new`}>
            <Button className="bg-indigo-600 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-indigo-700">
              Add Product
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:items-center lg:space-x-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full lg:max-w-[300px]"
        />
        <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
              <SelectItem key={option} value={option}>
                {SORT_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[product.storeStatus]}>
                      {product.storeStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(product.salesPrice)}</TableCell>
                  <TableCell>
                    {product.quantityOnHand === null ? "Unlimited" : product.quantityOnHand}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/${companySlug}/store/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
