'use client';

import { useState } from 'react';
import { ControllerRenderProps, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { uploadFileLocal } from '@/components/file-upload/action';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

interface ImageUploadProps {
  name: string;
  control: any;
  label?: string;
  defaultValue?: string;
  className?: string;
  required?: boolean;
}

export function ImageUpload({
  name,
  control,
  label,
  defaultValue,
  className = 'h-48 w-48',
  required
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<any, string>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.warning('Invalid file type', {
        description: 'Please select an image file',
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.warning('File too large', {
        description: 'Image must be less than 5MB',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Convert file to buffer for server upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to local file system
      const result = await uploadFileLocal(buffer, file.name);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload image');
      }

      // Set the public URL as the field value
      field.onChange(result.publicUrl);

      toast.success("Success", {
        description: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Upload error:', error);

      // Reset preview on error
      setPreview(defaultValue || null);

      toast.error("Error", {
        description:
          error instanceof Error ? error.message : 'Failed to upload image',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (field: ControllerRenderProps<any, string>) => {
    field.onChange(null);
    setPreview(null);
  };

  return (
    <FieldGroup>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Field>
            {label && (
              <FieldLabel>
                {label}
                {required && <span className="text-destructive">*</span>}
              </FieldLabel>
            )}
              <div className="flex items-center justify-center">
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className={`rounded-lg object-cover ${className}`}
                    />
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => removeImage(field)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 absolute -right-2 -top-2 rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <label
                    className={`border-muted-foreground/25 hover:border-muted-foreground/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${className} ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="text-muted-foreground mb-2 h-8 w-8 animate-spin" />
                        <span className="text-muted-foreground text-sm">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="text-muted-foreground mb-2 h-8 w-8" />
                        <span className="text-muted-foreground text-sm">
                          Upload Image
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, field)}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
          </Field>
        )}
      />
    </FieldGroup>
  );
}
