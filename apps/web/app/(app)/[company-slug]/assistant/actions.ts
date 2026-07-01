"use server";

import { prisma } from "@/lib/prisma";

export async function referenceSearch(query: string, companyId: string) {
  if (query.length < 2) return [];

  const [customers, invoices, accounts] = await Promise.all([
    prisma.customer.findMany({
      where: {
        companyId,
        displayName: { contains: query, mode: "insensitive" },
      },
      take: 5,
      select: { id: true, displayName: true },
    }),
    prisma.invoice.findMany({
      where: {
        companyId,
        invoiceNumber: { contains: query, mode: "insensitive" },
      },
      take: 5,
      select: { id: true, invoiceNumber: true },
    }),
    prisma.account.findMany({
      where: {
        companyId,
        name: { contains: query, mode: "insensitive" },
      },
      take: 5,
      select: { id: true, name: true },
    }),
  ]);

  return [
    ...customers.map((c) => ({ id: c.id, label: c.displayName, type: "customer" })),
    ...invoices.map((i) => ({ id: i.id, label: `Invoice #${i.invoiceNumber}`, type: "invoice" })),
    ...accounts.map((a) => ({ id: a.id, label: a.name, type: "account" })),
  ];
}
