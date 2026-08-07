"use client";

import { type MediaItem, useMediaUpload } from "@/components/media/use-media-upload";
import { publicApi } from "@repo/trpc/public/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Dropzone } from "@repo/ui/dropzone";
import { cn } from "@repo/ui/lib/utils";
import { Progress } from "@repo/ui/progress";
import { Skeleton } from "@repo/ui/skeleton";
import { AlertCircle, ImageOff, Trash2 } from "lucide-react";
import Image from "next/image";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

function UploadRow({ file, progress, status, error }: { file: File } & Record<string, unknown>) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5 text-sm">
      <span className="min-w-0 flex-1 truncate">{file.name}</span>
      {status === "error" ? (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3.5" />
          {typeof error === "string" ? error : "Failed"}
        </span>
      ) : (
        <Progress value={(progress as number) * 100} className="h-1.5 w-24" />
      )}
    </div>
  );
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: MediaItem) => void;
}) {
  const { data: mediaList, isLoading } = publicApi.media.list.useQuery(undefined, {
    enabled: open,
  });
  const utils = publicApi.useUtils();
  const deleteMedia = publicApi.media.delete.useMutation({
    onSuccess: () => utils.media.list.invalidate(),
  });

  const { items: uploadItems, uploadFiles } = useMediaUpload((item) => {
    onSelect(item);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose an image</DialogTitle>
        </DialogHeader>

        <Dropzone
          accept={ACCEPT}
          multiple
          maxSize={MAX_SIZE_BYTES}
          onFiles={uploadFiles}
          className="min-h-28 p-6"
        />

        {uploadItems.length > 0 && (
          <div className="flex flex-col gap-2">
            {uploadItems.map((item) => (
              <UploadRow key={item.id} {...item} />
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : !mediaList?.length ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <ImageOff className="size-6 opacity-40" />
              No uploads yet
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {mediaList.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-lg border border-border/60",
                    "hover:border-primary"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      onOpenChange(false);
                    }}
                    className="absolute inset-0 cursor-pointer"
                  >
                    <Image
                      src={item.url}
                      alt={item.originalName}
                      fill
                      sizes="160px"
                      className="object-cover"
                      draggable={false}
                    />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${item.originalName}`}
                    onClick={() => deleteMedia.mutate({ id: item.id })}
                    className="absolute top-1 right-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
