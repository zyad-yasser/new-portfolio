"use client";

import { publicApi } from "@repo/trpc/public/react";
import { useCallback, useState } from "react";

export type MediaItem = {
  id: string;
  url: string;
  originalName: string;
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
    async (file: File) => {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { id, file, progress: 0, status: "uploading" }]);

      try {
        const dims = await captureImageDimensions(file);
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
                  error: error instanceof Error ? error.message : "Upload failed",
                }
              : item
          )
        );
      }
    },
    [createPresignedUrl, confirm, utils, onUploaded]
  );

  const uploadFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        upload(file);
      }
    },
    [upload]
  );

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, uploadFiles, dismiss };
}
