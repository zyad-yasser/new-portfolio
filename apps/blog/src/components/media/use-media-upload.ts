"use client";

import { getErrorMessage } from "@repo/trpc/error";
import { publicApi } from "@repo/trpc/public/react";
import { useCallback, useState } from "react";

export type MediaItem = {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
};

export type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

const ALLOWED_MEDIA_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
    return "Unsupported file type";
  }
  const isVideo = file.type.startsWith("video/");
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return `File is too large (max ${Math.round(maxBytes / (1024 * 1024))} MB)`;
  }
  return null;
}

function captureImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({});
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function captureVideoDimensions(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      resolve({});
      URL.revokeObjectURL(url);
    };
    video.src = url;
  });
}

function captureMediaDimensions(file: File): Promise<{ width?: number; height?: number }> {
  return file.type.startsWith("video/")
    ? captureVideoDimensions(file)
    : captureImageDimensions(file);
}

function uploadWithProgress(uploadUrl: string, file: File, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded / event.total);
      }
    });
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.onload = () =>
      xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}

export function useMediaUpload(onUploaded: (item: MediaItem) => void) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const createPresignedUrl = publicApi.media.createPresignedUrl.useMutation();
  const confirm = publicApi.media.confirm.useMutation();
  const utils = publicApi.useUtils();

  const upload = useCallback(
    async (file: File, folderId: string | null) => {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { id, file, progress: 0, status: "uploading" }]);

      const validationError = validateFile(file);
      if (validationError) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "error", error: validationError } : item
          )
        );
        return;
      }

      try {
        const dims = await captureMediaDimensions(file);
        const { uploadUrl, publicUrl, key } = await createPresignedUrl.mutateAsync({
          contentType: file.type,
          size: file.size,
        });

        await uploadWithProgress(uploadUrl, file, (fraction) => {
          setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, progress: fraction } : item))
          );
        });

        const confirmed = await confirm.mutateAsync({
          key,
          url: publicUrl,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          folderId,
          ...dims,
        });

        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "done", progress: 1 } : item))
        );
        utils.media.list.invalidate();
        if (confirmed) {
          onUploaded(confirmed);
        }
      } catch (error) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "error",
                  error: getErrorMessage(error, "Upload failed"),
                }
              : item
          )
        );
      }
    },
    [createPresignedUrl, confirm, utils, onUploaded]
  );

  const uploadFiles = useCallback(
    (files: File[], folderId: string | null = null) => {
      for (const file of files) {
        upload(file, folderId);
      }
    },
    [upload]
  );

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, uploadFiles, dismiss };
}
