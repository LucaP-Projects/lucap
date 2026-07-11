'use server';

import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
import { uploadBufferToStorage, encryptPayload, validateItems } from './utils';

export interface FileUploadResult {
  url: string;
  key: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function uploadFileToStorage(
  file: File,
  folderPath: string,
  isSecure: boolean = false
): Promise<FileUploadResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadBufferToStorage(
      buffer,
      file.name,
      folderPath,
      file.type,
      isSecure
    );

    return {
      url: uploaded.publicUrl,
      key: uploaded.key,
    };
  } catch (error) {
    console.error('Error uploading file to Storage:', error);
    throw new Error(`Failed to upload file ${file.name}`);
  }
}

export async function validateCustomer(
  tx: Prisma.TransactionClient,
  customerId: string,
  companyId: string
) {
  try {
    const customer = await tx.customer.findUnique({
      where: { id: customerId, companyId },
      select: { id: true }
    });
    if (!customer) throw new Error('Customer not found');

    return customer;
  } catch (error) {
    console.error('Error validating customer:', error);
    throw error;
  }
}
