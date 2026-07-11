import { clsx, type ClassValue } from "clsx"
import { Decimal } from 'decimal.js';
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
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
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
}
<<<<<<< HEAD
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
=======
export function formatCurrency(amount: number, currency = 'TND'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
>>>>>>> feat/concierge-service-platform
    minimumFractionDigits: 2
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export const handleNumberInput = (
  value: string,
  onChange: (value: number) => void,
  minValue: number = 0
) => {
  const parsed = parseFloat(value);
  if (isNaN(parsed) || value === '') {
    onChange(minValue);
  } else {
    onChange(Math.max(minValue, parsed));
  }
};
// Unified file upload utility for both items and company logos
export async function uploadFile(file: File, folder: string): Promise<string> {
  if (!file) return '';

  try {
    // Validate file size (e.g., 5MB limit)
    const MAX_FILE_SIZE = parseInt(process.env.FILE_UPLOAD_MAX_SIZE || '5242880', 10); 
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

    // // Upload to Google Cloud Storage
    // const gcsFile = bucket.file(filePath);
    // await gcsFile.save(buffer, {
    //   metadata: {
    //     contentType: file.type,
    //     cacheControl: 'public, max-age=31536000',
    //     contentDisposition: 'inline'
    //   },
    //   resumable: false,
    //   gzip: true
    // });

    // // Make file public
    // await gcsFile.makePublic();

    // Return the public URL
    return ``;
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
    throw new Error('Failed to upload item image', { cause: error });
  }
}

// Usage in company logo upload
export async function handleCompanyLogo(file: File): Promise<string> {
  try {
    return await uploadFile(file, 'companies');
  } catch (error) {
    console.error('Company logo upload failed:', error);
    throw new Error('Failed to upload company logo', { cause: error });
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
  // const gcsFile = bucket.file(key);
  // const [signedUrl] = await gcsFile.getSignedUrl({
  //   version: 'v4',
  //   action: 'write',
  //   expires: Date.now() + 60 * 60 * 1000, // 1 hour
  //   contentType: fileType
  // });
  

  return {
    url: ``,
    key,
    signedUrl: ``
  };
}

export function generateUniqueNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  const candidate = `${timestamp}-${random}`;

  return candidate;
}

export function toSentenceCase(str: string) {
  return str
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx
 */
export function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as Event).defaultPrevented
    ) {
      return ourEventHandler?.(event);
    }
  };
}
