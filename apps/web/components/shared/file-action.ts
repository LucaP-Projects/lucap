'use server';

import { Prisma } from '@/lib/generated/prisma/client';
import { bucket, validateItems } from './utils';

// Shared Types
export interface FileUploadResult {
  url: string;
  key: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function uploadFileToGCS(
  file: File,
  folderPath: string
): Promise<FileUploadResult> {
  try {
    const fileExt = file.name.split('.').pop();
    const key = `${folderPath}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Cloud Storage
    const gcsFile = bucket.file(key);
    await gcsFile.save(buffer, {
      metadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000'
      },
      resumable: false,
      gzip: true
    });

    // Make file public
    await gcsFile.makePublic();

    const bucketName = 'lucapacioli.com.tn';
    return {
      url: `https://storage.googleapis.com/${bucketName}/${key}`,
      key
    };
  } catch (error) {
    console.error('Error uploading file to Google Cloud Storage:', error);
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
    console.log(error);
  }
}
