'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import * as Prisma from '@/lib/generated/prisma/internal/prismaNamespace';
// Make sure to export s3Client and encryptPayload from your updated utils.ts
import { s3Client, encryptPayload, validateItems } from './utils';

// Shared Types
export interface FileUploadResult {
  url: string;
  key: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Uploads a file to the S3-compatible storage (Garage).
 * @param file The file object from the client.
 * @param folderPath The target directory path.
 * @param isSecure If true, encrypts the file payload using AES-256-GCM before uploading.
 */
export async function uploadFileToStorage(
  file: File,
  folderPath: string,
  isSecure: boolean = false
): Promise<FileUploadResult> {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const key = `${folderPath}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    let buffer: Buffer;
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);

    // Apply Andersen-grade encryption for sensitive documents
    if (isSecure) {
      buffer = encryptPayload(buffer);
    }

    const bucketName = process.env.GARAGE_BUCKET_NAME || 'lucap';

    // Build the S3 Put Object Command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: isSecure ? 'application/octet-stream' : file.type,
      CacheControl: isSecure ? 'private, no-store' : 'public, max-age=31536000',
      // Public files get public-read, secure files stay strictly private
      ACL: isSecure ? 'private' : 'public-read',
    });

    // Execute upload to Garage
    await s3Client.send(command);

    const publicBaseUrl = process.env.GARAGE_PUBLIC_URL || `http://localhost:9000/${bucketName}`;

    return {
      // Secure files shouldn't expose a public URL, just return the key for later decryption fetches
      url: isSecure ? key : `${publicBaseUrl}/${key}`,
      key
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
    // Best practice: Rethrow the error rather than failing silently so the upstream caller can handle it
    throw error; 
  }
}