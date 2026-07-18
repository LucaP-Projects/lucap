"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createOrUpdateStore } from "./actions";
import { StoreSettingsInput, storeSettingsSchema } from "./schema";

interface StoreSettingsFormProps {
  companySlug: string;
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    slug: string;
    isPublic: boolean;
    allowGuests: boolean;
    primaryColor?: string | null;
    accentColor?: string | null;
  };
}

export function StoreSettingsForm({ companySlug, initialData }: StoreSettingsFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const isEditing = Boolean(initialData);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<StoreSettingsInput>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      slug: initialData?.slug || "",
      isPublic: initialData?.isPublic ?? true,
      allowGuests: initialData?.allowGuests ?? true,
      primaryColor: initialData?.primaryColor || "#000000",
      accentColor: initialData?.accentColor || "#000000"
    }
  });

  async function onSubmit(data: StoreSettingsInput) {
    setIsPending(true);
    try {
      const result = await createOrUpdateStore(data);

      if (result.success) {
        toast.success(isEditing ? "Store updated" : "Store created");
        router.push(`/${companySlug}/store`);
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
        <CardTitle>{isEditing ? "Store Settings" : "Set Up Your Store"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update your public store profile and preferences."
            : "Create a public store to showcase and sell your products to other companies."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Store Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input id="name" placeholder="Acme Store" {...field} />
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Store Slug</Label>
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Input id="slug" placeholder="acme-store" {...field} />
              )}
            />
            <p className="text-sm text-muted-foreground">
              A short name for your store&apos;s URL, e.g. acme-store — not a full web address.
            </p>
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Tell customers what your store offers..."
                  {...field}
                  value={field.value || ""}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Controller
                name="primaryColor"
                control={control}
                render={({ field }) => (
                  <Input
                    id="primaryColor"
                    type="color"
                    {...field}
                    value={field.value || "#000000"}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <Controller
                name="accentColor"
                control={control}
                render={({ field }) => (
                  <Input
                    id="accentColor"
                    type="color"
                    {...field}
                    value={field.value || "#000000"}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Public Store</Label>
              <p className="text-sm text-muted-foreground">
                Make your store visible to other companies in the marketplace.
              </p>
            </div>
            <Controller
              name="isPublic"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Allow Guest Orders</Label>
              <p className="text-sm text-muted-foreground">
                Allow companies without an account to place orders.
              </p>
            </div>
            <Controller
              name="allowGuests"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${companySlug}/settings`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Update Store" : "Create Store"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
