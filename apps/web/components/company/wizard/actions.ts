"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wizardSchema } from "./types";

export type FormationRequestResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

export async function submitFormationRequest(
  data: unknown
): Promise<FormationRequestResult> {
  try {
    const parsed = wizardSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid data" };
    }

    const { companyType, info, capital } = parsed.data;
    const session = await auth.api.getSession({ headers: await headers() });

    const request = await prisma.companyFormationRequest.create({
      data: {
        companyType,
        companyName: info.name,
        taxId: info.taxId || null,
        email: info.email || null,
        phone: info.phone || null,
        website: info.website || null,
        address: info.address,
        taxRegime: info.taxRegime,
        vatRegime: info.vatRegime,
        capitalAmount: capital.capitalAmount,
        numberOfShares: capital.numberOfShares,
        shareholders: capital.shareholders,
        status: "SUBMITTED",
        userId: session?.user?.id || null,
        submitterName: session?.user?.name || null,
        submitterEmail: session?.user?.email || null,
      },
    });

    return { success: true, data: { id: request.id } };
  } catch (error) {
    console.error("Failed to submit formation request:", error);
    return { success: false, error: "Failed to submit request" };
  }
}

export async function getMyFormationRequests() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  return prisma.companyFormationRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      companyName: true,
      companyType: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getAllFormationRequests() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.isAccountant && session?.user?.role !== "ADMIN") {
    return [];
  }

  return prisma.companyFormationRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });
}

export async function updateFormationRequestStatus(
  requestId: string,
  status: string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.isAccountant && session?.user?.role !== "ADMIN") {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    await prisma.companyFormationRequest.update({
      where: { id: requestId },
      data: { status },
    });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to update" };
  }
}

export async function updateFormationNotes(requestId: string, notes: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.isAccountant && session?.user?.role !== "ADMIN") {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    await prisma.companyFormationRequest.update({
      where: { id: requestId },
      data: { notes },
    });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to update" };
  }
}
