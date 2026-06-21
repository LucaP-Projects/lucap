import path from 'path';
import { Storage } from '@google-cloud/storage';
import { Decimal } from 'decimal.js';

const keyFilename = path.join(process.cwd(), 'key.json');

export const storage = new Storage({
  projectId: 'silknexus',
  keyFilename: keyFilename
});

const bucketName = 'silknexus';
export const bucket = storage.bucket(bucketName);

export function validateItems(
  items: Array<{ quantity: number; rate: number }>
) {
  if (!items.length) throw new Error('At least one item is required');

  const MAX_AMOUNT = new Decimal(999999999.99);
  let totalAmount = new Decimal(0);

  for (const item of items) {
    if (item.quantity <= 0) {
      throw new Error('Item quantity must be greater than 0');
    }
    if (item.rate < 0) {
      throw new Error('Item rate cannot be negative');
    }

    const itemAmount = new Decimal(item.quantity).mul(item.rate);
    totalAmount = totalAmount.add(itemAmount);

    if (totalAmount.gt(MAX_AMOUNT)) {
      throw new Error('Total amount exceeds maximum limit');
    }
  }

  return totalAmount.toNumber();
}

// Unified file upload utility for both items and company logos
export async function uploadFile(file: File, folder: string): Promise<string> {
  if (!file) return '';

  try {
    // Validate file size (e.g., 5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 5MB limit');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed'
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const fileName = `${uniqueId}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Cloud Storage
    const gcsFile = bucket.file(filePath);
    await gcsFile.save(buffer, {
      metadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
        contentDisposition: 'inline'
      },
      resumable: false,
      gzip: true
    });

    // Make file public
    await gcsFile.makePublic();

    // Return the public URL
    return `https://storage.googleapis.com/${bucketName}/${filePath}`;
  } catch (error) {
    console.error('File upload error:', error);
    throw error instanceof Error ? error : new Error('Failed to upload file');
  }
}

// Usage in item creation
export async function handleItemImage(file: File): Promise<string> {
  try {
    return await uploadFile(file, 'items');
  } catch (error) {
    console.error('Item image upload failed:', error);
    throw new Error('Failed to upload item image');
  }
}

// Usage in company logo upload
export async function handleCompanyLogo(file: File): Promise<string> {
  try {
    return await uploadFile(file, 'companies');
  } catch (error) {
    console.error('Company logo upload failed:', error);
    throw new Error('Failed to upload company logo');
  }
}

export interface FileUploadResult {
  url: string;
  key: string;
  signedUrl: string;
}

export async function getPresignedUrl(
  fileName: string,
  fileType: string,
  folderPath: string
): Promise<FileUploadResult> {
  const fileExt = fileName.split('.').pop();
  const key = `${folderPath}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Generate signed URL for upload
  const gcsFile = bucket.file(key);
  const [signedUrl] = await gcsFile.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
    contentType: fileType
  });

  return {
    url: `https://storage.googleapis.com/${bucketName}/${key}`,
    key,
    signedUrl
  };
}
