"use server";

import { getSessionWithCompany } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type MarketplaceResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export async function getPublicStores(): Promise<MarketplaceResponse> {
  try {
    const stores = await prisma.store.findMany({
      where: { isPublic: true },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const productCounts = await prisma.item.groupBy({
      by: ["companyId"],
      where: {
        companyId: { in: stores.map((store) => store.companyId) },
        isStoreItem: true,
        storeStatus: "ACTIVE",
        storeIsPublic: true
      },
      _count: { _all: true }
    });
    const countByCompanyId = new Map(
      productCounts.map((entry) => [entry.companyId, entry._count._all])
    );

    const storesWithProductCount = stores.map((store) => ({
      ...store,
      productCount: countByCompanyId.get(store.companyId) ?? 0
    }));

    return { success: true, data: storesWithProductCount };
  } catch (error) {
    console.error("Error fetching stores:", error);
    return { success: false, error: "Failed to fetch stores" };
  }
}

export async function getStoreBySlug(slug: string): Promise<MarketplaceResponse> {
  try {
    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            email: true,
            phone: true,
            address: true
          }
        }
      }
    });

    if (!store) {
      return { success: false, error: "Store not found" };
    }

    const items = await prisma.item.findMany({
      where: {
        companyId: store.companyId,
        isStoreItem: true,
        storeStatus: "ACTIVE",
        storeIsPublic: true
      },
      include: {
        category: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, data: { ...store, products: items } };
  } catch (error) {
    console.error("Error fetching store:", error);
    return { success: false, error: "Failed to fetch store" };
  }
}

export async function getStoreItemBySlug(
  storeSlug: string,
  itemSlug: string
): Promise<MarketplaceResponse> {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        }
      }
    });

    if (!store) {
      return { success: false, error: "Store not found" };
    }

    const item = await prisma.item.findFirst({
      where: {
        companyId: store.companyId,
        storeSlug: itemSlug,
        isStoreItem: true,
        storeStatus: "ACTIVE",
        storeIsPublic: true
      },
      include: {
        category: { select: { id: true, name: true } }
      }
    });

    if (!item) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: { ...item, store } };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

export async function getMarketplaceProducts(): Promise<MarketplaceResponse> {
  try {
    const items = await prisma.item.findMany({
      where: {
        isStoreItem: true,
        storeStatus: "ACTIVE",
        storeIsPublic: true
      },
      include: {
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
        },
        category: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching marketplace products:", error);
    return { success: false, error: "Failed to fetch marketplace products" };
  }
}
