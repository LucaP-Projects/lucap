'use server';

import { existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const uploadDir = join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
}

export async function uploadFileLocal(file: Buffer, filename: string) {
  try {
    await ensureUploadDir();

    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-z0-9.-]/gi, '_');
    const localFilename = `${timestamp}-${safeName}`;
    const filePath = join(uploadDir, localFilename);

    // Write file to public/uploads
    await writeFile(filePath, file);

    // Return public URL
    const publicUrl = `/uploads/${localFilename}`;

    return {
      success: true,
      publicUrl,
      filename: localFilename,
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
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-z0-9.-]/gi, '_');
    const localFilename = `${timestamp}-${safeName}`;

    // Return a mock signed URL (for local dev, we'll upload directly)
    return {
      success: true,
      url: `/api/upload?name=${encodeURIComponent(localFilename)}`,
      key: localFilename,
      bucket: 'local',
      publicUrl: `/uploads/${localFilename}`,
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
  // In local dev, files in public/uploads are already public
  return {
    success: true,
    publicUrl: `/uploads/${key}`,
  };
}
