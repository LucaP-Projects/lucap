"use server";

import { revalidatePath } from "next/cache";
import { getSessionWithCompany } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { StoreProductInput } from "../schema";

export type ProductResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

function generateSlug(name: string, existingSlugs: string[] = []): string {
  const base = slugify(name);
  let slug = base;
  let counter = 1;
  while (existingSlugs.includes(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

export async function getProducts(): Promise<ProductResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const store = await prisma.store.findUnique({
      where: { companyId }
    });

    if (!store) {
      return { success: false, error: "Store not found" };
    }

    const items = await prisma.item.findMany({
      where: { companyId, storeStatus: { not: "ARCHIVED" } },
      include: {
        category: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function getProductBySlug(slug: string): Promise<ProductResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const item = await prisma.item.findFirst({
      where: { storeSlug: slug },
      include: {
        category: { select: { id: true, name: true } },
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            store: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!item) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: item };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

export async function createProduct(data: StoreProductInput): Promise<ProductResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const store = await prisma.store.findUnique({
      where: { companyId }
    });

    if (!store) {
      return { success: false, error: "Store not found" };
    }

    const existingSlugs = (
      await prisma.item.findMany({
        where: { companyId },
        select: { storeSlug: true }
      })
    ).map((i) => i.storeSlug).filter(Boolean) as string[];

    const slug = generateSlug(data.name, existingSlugs);

    const item = await prisma.item.create({
      data: {
        type: "NON_INVENTORY",
        name: data.name,
        description: data.description,
        salesDescription: data.shortDescription,
        storeShortDescription: data.shortDescription,
        storeSlug: slug,
        salesPrice: data.price,
        sku: data.sku,
        quantityOnHand: data.inventory,
        storeStatus: data.status,
        companyId,
        sellable: true,
        salesTaxable: true,
        storeFeatures: data.features,
        storeImages: data.images,
        storeIsPublic: data.status === "ACTIVE",
        storeCategoryIds: data.categoryIds,
        categoryId: data.categoryIds[0] ?? null
      },
      include: {
        category: { select: { id: true, name: true } }
      }
    });

    revalidatePath(`/${session.activeCompany?.slug}/store/products`);
    revalidatePath(`/${session.activeCompany?.slug}/store`);

    return { success: true, data: item };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(
  productId: string,
  data: StoreProductInput
): Promise<ProductResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const existingItem = await prisma.item.findFirst({
      where: { id: productId, companyId }
    });

    if (!existingItem) {
      return { success: false, error: "Product not found" };
    }

    const item = await prisma.item.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        salesDescription: data.shortDescription,
        storeShortDescription: data.shortDescription,
        salesPrice: data.price,
        sku: data.sku,
        quantityOnHand: data.inventory,
        storeStatus: data.status,
        storeFeatures: data.features,
        storeImages: data.images,
        storeIsPublic: data.status === "ACTIVE",
        storeCategoryIds: data.categoryIds,
        categoryId: data.categoryIds[0] ?? null
      },
      include: {
        category: { select: { id: true, name: true } }
      }
    });

    revalidatePath(`/${session.activeCompany?.slug}/store/products`);
    revalidatePath(`/${session.activeCompany?.slug}/store`);

    return { success: true, data: item };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(productId: string): Promise<ProductResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const existingItem = await prisma.item.findFirst({
      where: { id: productId, companyId }
    });

    if (!existingItem) {
      return { success: false, error: "Product not found" };
    }

    await prisma.item.update({
      where: { id: productId },
      data: { storeStatus: "ARCHIVED", storeIsPublic: false }
    });

    revalidatePath(`/${session.activeCompany?.slug}/store/products`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
