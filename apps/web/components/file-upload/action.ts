'use server';

import {
  getStoragePublicUrl,
  storageBucketName,
  uploadBufferToStorage,
} from '@/components/shared/utils';

export async function uploadFileLocal(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const tenantId = formData.get('tenantId') as string || undefined;
    
    if (!file) throw new Error('No file provided');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const safeName = file.name.replace(/[^a-z0-9.-]/gi, '_');
    const uploaded = await uploadBufferToStorage(
      buffer,
      safeName,
      'uploads',
      file.type || 'application/octet-stream',
      false,
      tenantId
    );

    return {
      success: true,
      publicUrl: uploaded.publicUrl,
      filename: uploaded.key,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

// Legacy compatibility exports (for minimal refactoring)
export async function getSignedURL(filename: string, _contentType: string) {
  try {
    void _contentType;

    const safeName = filename.replace(/[^a-z0-9.-]/gi, '_');
    const key = `uploads/${safeName}`;

    // Return a storage-compatible object for callers that still expect the legacy shape.
    return {
      success: true,
      url: getStoragePublicUrl(key),
      key,
      bucket: storageBucketName,
      publicUrl: getStoragePublicUrl(key),
    };
  } catch (error) {
    console.error('Error in getSignedURL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate upload URL',
    };
  }
}

export async function makeFilePublic(key: string) {
  return {
    success: true,
    publicUrl: getStoragePublicUrl(key),
  };
}
