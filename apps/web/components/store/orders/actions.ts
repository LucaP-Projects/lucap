"use server";

import { revalidatePath } from "next/cache";
import { getSessionWithCompany } from "@/lib/auth";
import { OrderStatus, FulfillmentStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type OrderResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

const itemInclude = {
  item: {
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
  }
};

export async function placeOrder({
  sellerStoreId
}: {
  sellerStoreId?: string;
} = {}): Promise<OrderResponse> {
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
      where: { companyId },
      include: {
        items: {
          include: itemInclude
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    const items = sellerStoreId
      ? cart.items.filter((item) => item.item.company?.store?.id === sellerStoreId)
      : cart.items;

    if (items.length === 0) {
      return { success: false, error: "No items from this store in cart" };
    }

    const firstItem = items[0];
    if (!firstItem) {
      return { success: false, error: "No items from this store in cart" };
    }

    const total = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const orderNumber = `ORD-${Date.now()}`;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerCompanyId: companyId,
          sellerCompanyId: firstItem.item.companyId,
          sellerStoreId: firstItem.item.company?.store?.id ?? "",
          status: OrderStatus.PENDING,
          fulfillmentStatus: FulfillmentStatus.PENDING,
          subtotal: total,
          total,
          currency: "USD",
          items: {
            create: items.map((item) => ({
              itemId: item.itemId,
              itemName: item.item.name,
              description: item.item.salesDescription,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: Number(item.unitPrice) * item.quantity
            }))
          }
        },
        include: {
          items: true,
          buyerCompany: { select: { id: true, name: true, slug: true, logo: true } },
          sellerCompany: { select: { id: true, name: true, slug: true, logo: true } }
        }
      });

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          itemId: { in: items.map((item) => item.itemId) }
        }
      });

      return createdOrder;
    });

    revalidatePath(`/${session.activeCompany?.slug}/cart`);
    revalidatePath(`/${session.activeCompany?.slug}/orders`);
    revalidatePath(`/${session.activeCompany?.slug}/store/orders`);

    return { success: true, data: order };
  } catch (error) {
    console.error("Error placing order:", error);
    return { success: false, error: "Failed to place order" };
  }
}

export async function getOrders(): Promise<OrderResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const orders = await prisma.order.findMany({
      where: { buyerCompanyId: companyId },
      include: {
        items: { include: itemInclude },
        sellerCompany: {
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

    return { success: true, data: orders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

export async function getReceivedOrders(): Promise<OrderResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const orders = await prisma.order.findMany({
      where: { sellerCompanyId: companyId },
      include: {
        items: { include: itemInclude },
        buyerCompany: {
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

    return { success: true, data: orders };
  } catch (error) {
    console.error("Error fetching received orders:", error);
    return { success: false, error: "Failed to fetch received orders" };
  }
}

export async function getOrderById(orderId: string): Promise<OrderResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }]
      },
      include: {
        items: { include: itemInclude },
        buyerCompany: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        },
        sellerCompany: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        },
        invoice: true
      }
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

export async function updateOrderStatus({
  orderId,
  status,
  fulfillmentStatus
}: {
  orderId: string;
  status?: OrderStatus;
  fulfillmentStatus?: FulfillmentStatus;
}): Promise<OrderResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }]
      }
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (fulfillmentStatus) updateData.fulfillmentStatus = fulfillmentStatus;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: { include: itemInclude },
        buyerCompany: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        },
        sellerCompany: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        }
      }
    });

    revalidatePath(`/${session.activeCompany?.slug}/orders`);
    revalidatePath(`/${session.activeCompany?.slug}/store/orders`);
    revalidatePath(`/${session.activeCompany?.slug}/orders/${orderId}`);

    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function createInvoiceFromOrder(orderId: string): Promise<OrderResponse> {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const companyId = session.user.activeCompanyId;
    if (!companyId) {
      return { success: false, error: "No active company" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        sellerCompanyId: companyId
      },
      include: {
        items: true,
        buyerCompany: true
      }
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.invoiceId) {
      return { success: false, error: "Invoice already exists for this order" };
    }

    const invoiceNumber = `INV-${Date.now()}`;

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          companyId,
          customerId: order.buyerCompanyId,
          amount: order.total,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          taxAmount: order.taxAmount,
          status: "PENDING",
          paymentEventSnapshot: { amount: order.total },
          items: {
            create: order.items.map((item) => ({
              itemId: item.itemId,
              productName: item.itemName,
              description: item.description,
              quantity: item.quantity,
              rate: item.unitPrice,
              amount: item.total
            }))
          }
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: { invoiceId: invoice.id }
      });

      return invoice;
    });

    revalidatePath(`/${session.activeCompany?.slug}/orders/${orderId}`);
    revalidatePath(`/${session.activeCompany?.slug}/store/orders`);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating invoice from order:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}
