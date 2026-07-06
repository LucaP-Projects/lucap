"use server";

import { revalidatePath } from "next/cache";
import { getSessionWithCompany } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CartResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

const itemInclude = {
  item: {
    include: {
      store: {
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
      }
    }
  }
};

export async function getCart(): Promise<CartResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    let cart = await prisma.cart.findUnique({
      where: { companyId },
      include: { items: { include: itemInclude } }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { companyId },
        include: { items: { include: itemInclude } }
      });
    }

    return { success: true, data: cart };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return { success: false, error: "Failed to fetch cart" };
  }
}

export async function addToCart({
  itemId,
  quantity
}: {
  itemId: string;
  quantity: number;
}): Promise<CartResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return { success: false, error: "Product not found" };
    }

    if (item.companyId === companyId) {
      return { success: false, error: "Cannot buy your own products" };
    }

    let cart = await prisma.cart.findUnique({
      where: { companyId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { companyId }
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, itemId }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          itemId,
          quantity,
          unitPrice: item.salesPrice
        }
      });
    }

    revalidatePath(`/${session.activeCompany?.slug}/cart`);

    return { success: true };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: "Failed to add to cart" };
  }
}

export async function updateCartItem({
  cartItemId,
  quantity
}: {
  cartItemId: string;
  quantity: number;
}): Promise<CartResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const cart = await prisma.cart.findUnique({
      where: { companyId }
    });

    if (!cart) {
      return { success: false, error: "Cart not found" };
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id }
    });

    if (!cartItem) {
      return { success: false, error: "Cart item not found" };
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      });
    } else {
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity }
      });
    }

    revalidatePath(`/${session.activeCompany?.slug}/cart`);

    return { success: true };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { success: false, error: "Failed to update cart item" };
  }
}

export async function clearCart(): Promise<CartResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const cart = await prisma.cart.findUnique({
      where: { companyId }
    });

    if (!cart) {
      return { success: true };
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    revalidatePath(`/${session.activeCompany?.slug}/cart`);

    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}
