"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getCompanyFiles(companyId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const files = await prisma.file.findMany({
    where: {
      companyId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
        invoiceAttachments: {
            include: {
                invoice: true
            }
        },
        receiptAttachments: {
            include: {
                receipt: true
            }
        }
    }
  });

  return files;
}

export async function deleteFile(fileId: string, companySlug: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    await prisma.file.update({
        where: { id: fileId },
        data: { isActive: false }
    });

    revalidatePath(`/${companySlug}/drive`);
    return { success: true };
}

export async function uploadToDrive(formData: FormData, companySlug: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const { uploadFileLocal } = await import("@/components/file-upload/action");
    const result = await uploadFileLocal(formData);

    if (!result.success) {
        throw new Error(result.error);
    }

    revalidatePath(`/${companySlug}/drive`);
    return result;
}
