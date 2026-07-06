import { z } from "zod";

export const storeSettingsSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  isPublic: z.boolean(),
  allowGuests: z.boolean(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  logo: z.any().optional(),
  banner: z.any().optional()
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

export const storeProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  description: z.string().max(2000).optional(),
  shortDescription: z.string().max(500).optional(),
  price: z.number().min(0, "Price must be 0 or greater"),
  compareAtPrice: z.number().min(0).optional(),
  sku: z.string().max(50).optional(),
  inventory: z.number().int().min(0).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  itemId: z.string().optional(),
  categoryIds: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  images: z.array(z.any()).default([])
});

export type StoreProductInput = z.infer<typeof storeProductSchema>;

export const addToCartSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().min(1).default(1)
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  cartItemId: z.string(),
  quantity: z.number().int().min(0)
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const placeOrderSchema = z.object({
  sellerStoreId: z.string(),
  notes: z.string().optional(),
  shippingAddress: z
    .object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string()
    })
    .optional()
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const updateOrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  fulfillmentStatus: z.enum(["PENDING", "PICKING", "PACKED", "SHIPPED", "DELIVERED", "RETURNED"]).optional()
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
