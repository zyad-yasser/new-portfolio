"use client";

import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Download } from "lucide-react";
import Image from "next/image";

export type PreviewMediaItem = {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: Date | string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaPreviewDialog({
  item,
  onOpenChange,
}: {
  item: PreviewMediaItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{item?.originalName}</DialogTitle>
        </DialogHeader>

        {item && (
          <>
            <div className="relative max-h-[55vh] min-h-48 flex-1 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
              <Image
                src={item.url}
                alt={item.originalName}
                fill
                sizes="672px"
                className="object-contain"
              />
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-4">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="truncate">{item.mimeType}</dd>
              <dt className="text-muted-foreground">Size</dt>
              <dd>{formatBytes(item.size)}</dd>
              {item.width && item.height && (
                <>
                  <dt className="text-muted-foreground">Dimensions</dt>
                  <dd>
                    {item.width} × {item.height}
                  </dd>
                </>
              )}
              <dt className="text-muted-foreground">Uploaded</dt>
              <dd>
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </dd>
            </dl>

            <div className="flex justify-end">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={item.url} target="_blank" rel="noreferrer" download={item.originalName}>
                  <Download className="size-3.5" />
                  Download
                </a>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
