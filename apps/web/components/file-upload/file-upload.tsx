'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import {
  AudioWaveform,
  File as FileIcon,
  FileImage,
  FolderArchive,
  UploadCloud,
  Video,
  X,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useUploadStore } from '@/stores/useViewStore';
import { uploadFileLocal } from './action';

interface FileUploadProgress {
  id: string;
  file:
    | File
    | {
        name: string;
        type: string;
        size: number;
        blob?: Blob;
      };
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  path?: string;
  mimetype?: string;
  size?: number;
  fileId?: string;
  attachmentId?: string;
}

interface FileUploadProps {
  maxFiles?: number;
  maxSizeInMB?: number;
  purpose?: string;
}

enum FileTypes {
  Image = 'image',
  Pdf = 'application/pdf',
  Audio = 'audio',
  Video = 'video',
  Excel = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  Word = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  Other = 'other'
}

const FileTypeColors = {
  [FileTypes.Image]: {
    bgColor: 'bg-purple-600',
    fillColor: 'fill-purple-600'
  },
  [FileTypes.Pdf]: {
    bgColor: 'bg-red-400',
    fillColor: 'fill-red-400'
  },
  [FileTypes.Audio]: {
    bgColor: 'bg-yellow-400',
    fillColor: 'fill-yellow-400'
  },
  [FileTypes.Video]: {
    bgColor: 'bg-green-400',
    fillColor: 'fill-green-400'
  },
  [FileTypes.Excel]: {
    bgColor: 'bg-green-600',
    fillColor: 'fill-green-600'
  },
  [FileTypes.Word]: {
    bgColor: 'bg-blue-600',
    fillColor: 'fill-blue-600'
  },
  [FileTypes.Other]: {
    bgColor: 'bg-gray-400',
    fillColor: 'fill-gray-400'
  }
} as const;

const FileUpload = React.memo(function FileUpload({
  maxFiles = 10,
  maxSizeInMB = 10,
  purpose = 'invoice_attachment'
}: FileUploadProps) {
  const { setValue, getValues } = useFormContext();
  const [queuedFiles, setQueuedFiles] = useState<FileUploadProgress[]>([]);
  const { setUploading: onUploadStatusChange, isUploading } = useUploadStore();
  const getFileIconAndColor = useCallback((file: { type: string }) => {
    let fileType = FileTypes.Other;

    if (file.type.startsWith('image/')) fileType = FileTypes.Image;
    else if (file.type === FileTypes.Pdf) fileType = FileTypes.Pdf;
    else if (file.type.startsWith('audio/')) fileType = FileTypes.Audio;
    else if (file.type.startsWith('video/')) fileType = FileTypes.Video;
    else if (file.type === FileTypes.Excel) fileType = FileTypes.Excel;
    else if (file.type === FileTypes.Word) fileType = FileTypes.Word;

    const colors = FileTypeColors[fileType];
    const icons = {
      [FileTypes.Image]: <FileImage size={40} className={colors.fillColor} />,
      [FileTypes.Pdf]: <FileIcon size={40} className={colors.fillColor} />,
      [FileTypes.Audio]: (
        <AudioWaveform size={40} className={colors.fillColor} />
      ),
      [FileTypes.Video]: <Video size={40} className={colors.fillColor} />,
      [FileTypes.Excel]: <FileIcon size={40} className={colors.fillColor} />,
      [FileTypes.Word]: <FileIcon size={40} className={colors.fillColor} />,
      [FileTypes.Other]: (
        <FolderArchive size={40} className={colors.fillColor} />
      )
    };

    return {
      icon: icons[fileType],
      color: colors.bgColor
    };
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  const processFile = useCallback(
    async (fileProgress: FileUploadProgress) => {
      try {
        setQueuedFiles((prev) =>
          prev.map((f) =>
            f.id === fileProgress.id ? { ...f, status: 'uploading' } : f
          )
        );

        const { file } = fileProgress;

        if (!('arrayBuffer' in file)) {
          if (fileProgress.status === 'complete' && fileProgress.path) {
            return true;
          }
          throw new Error('Invalid file object');
        }

        // Convert file to buffer and upload locally
        const arrayBuffer = await (file as File).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await uploadFileLocal(buffer, file.name);

        if (!result.success) {
          throw new Error(result.error || 'Failed to upload file');
        }

        const { publicUrl, filename } = result;

        const completedFile = {
          id: fileProgress.id,
          status: 'complete' as const,
          key: filename,
          file: {
            name: file.name,
            type: file.type,
            size: file.size
          },
          mimetype: file.type,
          size: file.size,
          path: filename,
          publicUrl: publicUrl
        };

        const currentFiles = getValues('files') || [];
        setValue('files', [...currentFiles, completedFile]);

        setQueuedFiles((prev) =>
          prev.map((f) =>
            f.id === fileProgress.id
              ? { ...f, status: 'complete', path: key }
              : f
          )
        );

        return true;
      } catch (error) {
        console.error('Upload error:', error);
        setQueuedFiles((prev) =>
          prev.map((f) =>
            f.id === fileProgress.id
              ? {
                  ...f,
                  status: 'error',
                  error:
                    error instanceof Error ? error.message : 'Upload failed'
                }
              : f
          )
        );
        toast('Upload failed');
        return false;
      }
    },
    [getValues, setValue]
  );

  const removeFile = useCallback(
    (fileProgress: FileUploadProgress) => {
      setQueuedFiles((prev) => prev.filter((f) => f.id !== fileProgress.id));

      const currentFiles = getValues('files') || [];
      const removedAttachmentIds = getValues('removedAttachmentIds') || [];

      if (fileProgress.attachmentId || fileProgress.id) {
        const idToRemove = fileProgress.attachmentId || fileProgress.id;
        if (!removedAttachmentIds.includes(idToRemove)) {
          setValue('removedAttachmentIds', [
            ...removedAttachmentIds,
            idToRemove
          ]);
        }
      }

      setValue(
        'files',
        currentFiles.filter(
          (f: any) =>
            f.id !== fileProgress.id &&
            f.attachmentId !== fileProgress.attachmentId
        )
      );
    },
    [getValues, setValue]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const currentFiles = getValues('files') || [];
      const remainingSlots = maxFiles - currentFiles.length;

      if (remainingSlots <= 0) {
        toast(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const filesToProcess = acceptedFiles.slice(0, remainingSlots);

      const oversizedFiles = filesToProcess.filter(
        (file) => file.size > maxSizeInMB * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast(`Some files exceed the ${maxSizeInMB}MB limit`);
        return;
      }

      const newFiles = filesToProcess.map((file) => ({
        file,
        status: 'pending' as const,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`
      }));

      setQueuedFiles((prev) => [...prev, ...newFiles]);
      onUploadStatusChange?.(true);

      try {
        for (const fileProgress of newFiles) {
          await processFile(fileProgress);
        }
      } finally {
        onUploadStatusChange?.(false);
      }
    },
    [maxFiles, maxSizeInMB, getValues, processFile, onUploadStatusChange]
  );

  // Memoize dropzone config
  const dropzoneConfig = useMemo(
    () => ({
      onDrop,
      maxSize: maxSizeInMB * 1024 * 1024,
      maxFiles,
      disabled: isUploading
    }),
    [onDrop, maxSizeInMB, maxFiles, isUploading]
  );

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone(dropzoneConfig);

  // Memoize UI states
  const uploadStatusText = useMemo(
    () => (isUploading ? 'uploading' : 'to upload'),
    [isUploading]
  );

  const dragText = useMemo(
    () => (isDragActive ? 'Drop files here...' : 'Drag files'),
    [isDragActive]
  );

  useEffect(() => {
    const existingFiles = getValues('files') || [];
    if (existingFiles.length > 0) {
      const formattedFiles: FileUploadProgress[] = existingFiles.map(
        (file: any) => ({
          id: file.id || file.attachmentId,
          file: {
            name: file.file.name,
            type: file.file.type || file.mimetype,
            size: file.file.size || file.size
          },
          status: 'complete',
          path: file.path || file.key,
          mimetype: file.mimetype || file.file.type,
          size: file.size || file.file.size,
          fileId: file.fileId,
          attachmentId: file.attachmentId
        })
      );
      setQueuedFiles(formattedFiles);
    }
  }, [getValues]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
        } py-6 hover:bg-gray-100 dark:hover:bg-gray-700 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <div className="text-center">
          <div className="mx-auto max-w-min rounded-md border border-gray-300 p-2 dark:border-gray-600">
            <UploadCloud
              size={20}
              className="text-gray-600 dark:text-gray-400"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">{dragText}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click to upload files (max {maxFiles} files, up to {maxSizeInMB}MB
            each)
          </p>
        </div>
        <Input {...getInputProps()} className="hidden" />
      </div>

      {queuedFiles.length > 0 && (
        <ScrollArea className="h-40">
          <p className="text-muted-foreground my-2 text-sm font-medium dark:text-gray-400">
            Files {uploadStatusText}
          </p>
          <div className="space-y-2 pr-3">
            {queuedFiles.map((fileProgress) => (
              <div
                key={fileProgress.id}
                className="group flex justify-between gap-2 overflow-hidden rounded-lg border border-slate-100 pr-2 hover:pr-0 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-1 items-center p-2">
                  <div className="text-white">
                    {getFileIconAndColor(fileProgress.file).icon}
                  </div>
                  <div className="ml-2 w-full space-y-1">
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground font-medium dark:text-gray-300">
                          {fileProgress.file.name.slice(0, 25)}
                          {fileProgress.file.name.length > 25 ? '...' : ''}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatFileSize(fileProgress.file.size)}
                        </p>
                      </div>
                      <span className="flex items-center gap-2 text-xs">
                        {fileProgress.status === 'uploading' && (
                          <Loader2 className="text-primary h-4 w-4 animate-spin" />
                        )}
                        {fileProgress.status === 'error' ? (
                          <span className="text-red-500 dark:text-red-400">
                            Error
                          </span>
                        ) : (
                          fileProgress.status.charAt(0).toUpperCase() +
                          fileProgress.status.slice(1)
                        )}
                      </span>
                    </div>
                    {fileProgress.error && (
                      <p className="text-xs text-red-500 dark:text-red-400">
                        {fileProgress.error}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFile(fileProgress)}
                  className="hidden cursor-pointer items-center justify-center bg-red-500 px-2 text-white transition-all group-hover:flex"
                  disabled={fileProgress.status === 'uploading'}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
});

export default FileUpload;
