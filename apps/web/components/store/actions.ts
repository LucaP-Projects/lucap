"use server";

import { revalidatePath } from "next/cache";
import { getSessionWithCompany } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StoreSettingsInput } from "./schema";

export type StoreResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export async function getStore(): Promise<StoreResponse> {
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
      where: { companyId },
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

    return { success: true, data: store };
  } catch (error) {
    console.error("Error fetching store:", error);
    return { success: false, error: "Failed to fetch store" };
  }
}

export async function createOrUpdateStore(data: StoreSettingsInput): Promise<StoreResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const existingStore = await prisma.store.findUnique({
      where: { companyId }
    });

    const store = existingStore
      ? await prisma.store.update({
          where: { companyId },
          data: {
            name: data.name,
            description: data.description,
            slug: data.slug,
            isPublic: data.isPublic,
            allowGuests: data.allowGuests,
            primaryColor: data.primaryColor,
            accentColor: data.accentColor
          }
        })
      : await prisma.store.create({
          data: {
            name: data.name,
            description: data.description,
            slug: data.slug,
            isPublic: data.isPublic,
            allowGuests: data.allowGuests,
            primaryColor: data.primaryColor,
            accentColor: data.accentColor,
            companyId
          }
        });

    revalidatePath(`/${session.activeCompany?.slug}/settings/store`);
    revalidatePath(`/${session.activeCompany?.slug}/store`);

    return { success: true, data: store };
  } catch (error) {
    console.error("Error saving store:", error);
    return { success: false, error: "Failed to save store" };
  }
}

export async function getStoreBySlug(slug: string): Promise<StoreResponse> {
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
        },
        products: {
          where: { status: "ACTIVE" },
          include: {
            category: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!store) {
      return { success: false, error: "Store not found" };
    }

    return { success: true, data: store };
  } catch (error) {
    console.error("Error fetching store by slug:", error);
    return { success: false, error: "Failed to fetch store" };
  }
}

export async function getStoreItems(): Promise<StoreResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
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
    console.error("Error fetching store items:", error);
    return { success: false, error: "Failed to fetch store items" };
  }
}
