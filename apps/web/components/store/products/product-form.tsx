"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StoreProductInput, storeProductSchema } from "../schema";
import { createProduct, updateProduct } from "./actions";

interface ProductFormProps {
  companySlug: string;
  categories: { id: string; name: string }[];
  items: { id: string; name: string; sku: string | null }[];
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    storeShortDescription?: string | null;
    salesPrice: number;
    compareAtPrice?: number | null;
    sku?: string | null;
    quantityOnHand?: number | null;
    storeStatus: "DRAFT" | "ACTIVE" | "ARCHIVED";
    itemId?: string | null;
    category?: { id: string; name: string } | null;
    storeFeatures?: string[];
    storeImages?: { url: string }[];
  };
}

export function ProductForm({
  companySlug,
  categories,
  items,
  initialData
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const isEditing = Boolean(initialData);

  type ProductFormValues = z.input<typeof storeProductSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(storeProductSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      shortDescription: initialData?.storeShortDescription || "",
      price: initialData?.salesPrice || 0,
      compareAtPrice: initialData?.compareAtPrice || undefined,
      sku: initialData?.sku || "",
      inventory: initialData?.quantityOnHand || undefined,
      status: initialData?.storeStatus || "DRAFT",
      itemId: initialData?.itemId || "",
      categoryIds: initialData?.category?.id ? [initialData.category.id] : [],
      features: initialData?.storeFeatures || [],
      images: []
    }
  });

  async function onSubmit(data: ProductFormValues) {
    setIsPending(true);
    try {
      const payload: StoreProductInput = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        sku: data.sku,
        inventory: data.inventory,
        status: data.status,
        itemId: data.itemId || undefined,
        categoryIds: data.categoryIds || [],
        features: data.features || [],
        images: []
      };

      const result = isEditing
        ? await updateProduct(initialData!.id, payload)
        : await createProduct(payload);

      if (result.success) {
        toast.success(isEditing ? "Product updated" : "Product created");
        router.push(`/${companySlug}/store/products`);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Product" : "Add Product"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update your store product."
            : "Add a product to your company store."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input id="name" placeholder="Premium Widget" {...field} />
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare-at Price</Label>
              <Controller
                name="compareAtPrice"
                control={control}
                render={({ field }) => (
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Controller
                name="sku"
                control={control}
                render={({ field }) => (
                  <Input id="sku" {...field} value={field.value || ""} />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory</Label>
              <Controller
                name="inventory"
                control={control}
                render={({ field }) => (
                  <Input
                    id="inventory"
                    type="number"
                    min="0"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Describe your product..."
                  {...field}
                  value={field.value || ""}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Controller
              name="shortDescription"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="shortDescription"
                  placeholder="Brief summary for listings..."
                  {...field}
                  value={field.value || ""}
                />
              )}
            />
          </div>

          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {categories.map((category) => (
                  <Controller
                    key={category.id}
                    name="categoryIds"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={field.value?.includes(category.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            field.onChange(
                              checked
                                ? [...current, category.id]
                                : current.filter((id) => id !== category.id)
                            );
                          }}
                        />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                      </div>
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="itemId">Link to Existing Item (optional)</Label>
            <Controller
              name="itemId"
              control={control}
              render={({ field }) => (
                <Select value={field.value || "none"} onValueChange={field.onChange}>
                  <SelectTrigger id="itemId">
                    <SelectValue placeholder="Select an existing item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} {item.sku ? `(${item.sku})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${companySlug}/store/products`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
