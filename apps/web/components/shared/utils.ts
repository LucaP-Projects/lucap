import crypto from 'crypto';
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Decimal } from 'decimal.js';

// --- S3-COMPATIBLE STORAGE CONFIGURATION (MinIO / Garage) ---
const globalS3Client = new S3Client({
  endpoint: process.env.GARAGE_ENDPOINT || 'http://localhost:9000',
  region: process.env.GARAGE_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.GARAGE_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: process.env.GARAGE_SECRET_ACCESS_KEY || 'minioadmin',
  },
  forcePathStyle: true,
});

export const s3Client = globalS3Client; // Exported for direct use if needed

/**
 * Factory for S3 Clients. 
 * Can be extended to return different clients based on tenant settings.
 */
export async function getS3Client(tenantId?: string) {
  if (!tenantId) return globalS3Client;

  // Example: Return a custom client if company has its own storage provider
  // const company = await prisma.company.findUnique({ where: { id: tenantId } });
  // if (company?.settings?.storage?.accessKeyId) { ... }

  return globalS3Client;
}

export const storageBucketName = process.env.GARAGE_BUCKET_NAME || 'lucap';
export const storagePublicBaseUrl =
  process.env.GARAGE_PUBLIC_URL || `http://localhost:9000/${storageBucketName}`;

let storageBucketReady: Promise<void> | null = null;

/**
 * Resolves the storage configuration for a specific tenant/company.
 * If no specific configuration is found, it falls back to the default bucket
 * but prefixes files with the company ID for isolation.
 */
export async function resolveTenantStorage(tenantId?: string) {
  // If no tenantId, use global default
  if (!tenantId) {
    return {
      bucket: storageBucketName,
      prefix: '',
      baseUrl: storagePublicBaseUrl,
    };
  }

  // TODO: Fetch company settings from DB if you want separate buckets/endpoints
  // const company = await prisma.company.findUnique({ where: { id: tenantId }, select: { settings: true } });
  // const storageConfig = (company?.settings as any)?.storage;
  
  // Default multitenancy pattern: Shared bucket, isolated folder prefix
  return {
    bucket: storageBucketName,
    prefix: `tenants/${tenantId}/`,
    baseUrl: `${storagePublicBaseUrl}/tenants/${tenantId}`,
  };
}

async function ensureStorageBucket(bucketName: string = storageBucketName, tenantId?: string) {
  // Optimization: only ensure the default bucket once per process lifetime. 
  if (bucketName === storageBucketName && storageBucketReady) {
    await storageBucketReady;
    return;
  }

  const client = await getS3Client(tenantId);
  const checkBucket = (async () => {
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error) {
      const statusCode = (error as { $metadata?: { httpStatusCode?: number } })
        .$metadata?.httpStatusCode;
      const errorName = (error as { name?: string }).name;

      if (
        statusCode === 404 ||
        errorName === 'NotFound' ||
        errorName === 'NoSuchBucket'
      ) {
        await s3Client.send(
          new CreateBucketCommand({ Bucket: bucketName })
        );
        return;
      }

      throw error;
    }
  })();

  if (bucketName === storageBucketName) {
    storageBucketReady = checkBucket;
  }

  await checkBucket;
}

export function buildStorageKey(filename: string, folder: string, prefix = '') {
  const fileExt = filename.split('.').pop()?.toLowerCase();
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Prefix handles tenant folder isolation
  return `${prefix}${folder}/${uniqueId}.${fileExt}`;
}

export function getStoragePublicUrl(storageKey: string, tenantId?: string) {
  if (/^https?:\/\//.test(storageKey)) return storageKey;

  // If the key already starts with tenants/, we assume it's correctly scoped
  // Otherwise, we might need to resolve the tenant's base URL.
  return `${storagePublicBaseUrl}/${storageKey.replace(/^\/+/, '')}`;
}

export async function uploadBufferToStorage(
  buffer: Buffer,
  filename: string,
  folder: string,
  contentType: string,
  isSecure = false,
  tenantId?: string
) {
  const { bucket, prefix } = await resolveTenantStorage(tenantId);
  await ensureStorageBucket(bucket, tenantId);

  const client = await getS3Client(tenantId);
  const storageKey = buildStorageKey(filename, folder, prefix);
  const payload = isSecure ? encryptPayload(buffer) : buffer;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storageKey,
    Body: payload,
    ContentType: isSecure ? 'application/octet-stream' : contentType,
    CacheControl: isSecure ? 'private, no-store' : 'public, max-age=31536000',
    ContentLength: payload.length, // Explicitly provide length to S3
  });

  await client.send(command);

  return {
    key: storageKey,
    publicUrl: isSecure ? storageKey : getStoragePublicUrl(storageKey, tenantId),
  };
}

// --- ENCRYPTION CONFIGURATION (Andersen Security Standard) ---
const ENCRYPTION_KEY = process.env.STORAGE_ENCRYPTION_KEY || ''; 
const IV_LENGTH = 12; 
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a binary buffer using AES-256-GCM.
 * Prepends the IV and Auth Tag to the payload for self-contained decryption.
 */
export function encryptPayload(buffer: Buffer): Buffer {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('Secure storage requires a valid 32-byte hexadecimal ENCRYPTION_KEY.');
  }
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Structure: [IV (12B)] + [AuthTag (16B)] + [Encrypted Data]
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypts an envelope payload extracted from storage back into raw usable binary.
 */
export function decryptPayload(packedBuffer: Buffer): Buffer {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('Secure decryption requires a valid 32-byte hexadecimal ENCRYPTION_KEY.');
  }

  const iv = packedBuffer.subarray(0, IV_LENGTH);
  const authTag = packedBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encryptedData = packedBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
}

// --- ITEM ACCUMULATION VALIDATOR ---
export function validateItems(items: Array<{ quantity: number; rate: number }>) {
  if (!items.length) throw new Error('At least one item is required');
  const MAX_AMOUNT = new Decimal(999999999.99);
  let totalAmount = new Decimal(0);

  for (const item of items) {
    if (item.quantity <= 0) throw new Error('Item quantity must be greater than 0');
    if (item.rate < 0) throw new Error('Item rate cannot be negative');

    const itemAmount = new Decimal(item.quantity).mul(item.rate);
    totalAmount = totalAmount.add(itemAmount);

    if (totalAmount.gt(MAX_AMOUNT)) throw new Error('Total amount exceeds maximum limit');
  }
  return totalAmount.toNumber();
}

// --- UNIFIED FILE UPLOAD ENGINE ---
export async function uploadFile(
  file: File, 
  folder: string, 
  isSecure: boolean = false
): Promise<string> {
  if (!file) return '';

  try {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) throw new Error('File size exceeds 5MB limit');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type.');
    }

    // Fix: Explicitly cast ArrayBufferLike to ArrayBuffer for compiler version harmony
    const arrayBuffer = (await file.arrayBuffer()) as ArrayBuffer;
    const buffer = Buffer.from(arrayBuffer);
    const uploaded = await uploadBufferToStorage(
      buffer,
      file.name,
      folder,
      file.type,
      isSecure
    );

    return uploaded.publicUrl;
  } catch (error) {
    console.error('File upload error:', error);
    throw error instanceof Error ? error : new Error('Failed to upload file');
  }
}

// --- PIPELINE HANDLERS ---
export async function handleItemImage(file: File): Promise<string> {
  return uploadFile(file, 'items', false);
}

export async function handleCompanyLogo(file: File): Promise<string> {
  return uploadFile(file, 'companies', false);
}

export async function handleSecureDocument(file: File): Promise<string> {
  return uploadFile(file, 'vault', true);
}

/**
 * Fetches an encrypted file from Garage, decrypts it dynamically, and streams it back.
 */
export async function downloadSecureFile(filePath: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: storageBucketName,
    Key: filePath,
  });

  const response = await s3Client.send(command);
  if (!response.Body) throw new Error('Empty storage response body');
  
  const chunks = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }
  const encryptedBuffer = Buffer.concat(chunks);
  
  return decryptPayload(encryptedBuffer);
}

// --- PRESIGNED DIRECT INGESTION URLS ---
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
  await ensureStorageBucket();

  const key = buildStorageKey(fileName, folderPath);

  const command = new PutObjectCommand({
    Bucket: storageBucketName,
    Key: key,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return {
    url: getStoragePublicUrl(key),
    key,
    signedUrl,
  };
}