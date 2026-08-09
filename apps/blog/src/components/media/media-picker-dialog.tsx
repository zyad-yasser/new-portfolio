"use client";

import { type MediaItem, useMediaUpload } from "@/components/media/use-media-upload";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Dropzone } from "@repo/ui/dropzone";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { Progress } from "@repo/ui/progress";
import { Skeleton } from "@repo/ui/skeleton";
import {
  AlertCircle,
  ChevronRight,
  Folder,
  ImageOff,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const ALL_ACCEPT = `${IMAGE_ACCEPT},video/mp4,video/webm,video/quicktime`;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const SEARCH_DEBOUNCE_MS = 250;

function isVideoItem(item: { mimeType: string }) {
  return item.mimeType.startsWith("video/");
}

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
  mediaKind = "all",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: MediaItem) => void;
  mediaKind?: "image" | "all";
}) {
  const [folderId, setFolderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    if (open) {
      setFolderId(null);
      setQuery("");
      setDebouncedQuery("");
      setCreatingFolder(false);
    }
  }, [open]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const trimmedQuery = debouncedQuery.trim();
  const utils = publicApi.useUtils();

  const { data: subfolders } = publicApi.mediaFolder.list.useQuery(
    { parentId: folderId },
    { enabled: open && !trimmedQuery }
  );
  const { data: breadcrumb } = publicApi.mediaFolder.path.useQuery(
    { folderId: folderId ?? "" },
    { enabled: open && !!folderId }
  );
  const { data: mediaData, isLoading } = publicApi.media.list.useQuery(
    { folderId, search: trimmedQuery || undefined },
    { enabled: open }
  );
  const mediaList =
    mediaKind === "image"
      ? mediaData?.items.filter((item) => !isVideoItem(item))
      : mediaData?.items;

  const createFolder = publicApi.mediaFolder.create.useMutation({
    onSuccess: (created) => {
      utils.mediaFolder.list.invalidate();
      setCreatingFolder(false);
      setNewFolderName("");
      if (created) {
        setFolderId(created.id);
      }
    },
  });

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
          <DialogTitle>{mediaKind === "image" ? "Choose an image" : "Choose media"}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setCreatingFolder((v) => !v)}
          >
            <Plus className="size-3.5" />
            Folder
          </Button>
        </div>

        {!trimmedQuery && (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFolderId(null)}
              className={cn(
                "cursor-pointer rounded px-1.5 py-0.5 hover:underline",
                !folderId ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              Root
            </button>
            {breadcrumb?.map((crumb, index) => (
              <span key={crumb.id} className="flex items-center gap-1">
                <ChevronRight className="size-3 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setFolderId(crumb.id)}
                  className={cn(
                    "cursor-pointer rounded px-1.5 py-0.5 hover:underline",
                    index === breadcrumb.length - 1
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </nav>
        )}

        {creatingFolder && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newFolderName.trim()) {
                createFolder.mutate({ name: newFolderName.trim(), parentId: folderId });
              }
            }}
            className="flex items-center gap-2"
          >
            <Input
              autoFocus
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newFolderName.trim() || createFolder.isPending}
            >
              Create
            </Button>
          </form>
        )}

        <Dropzone
          accept={mediaKind === "image" ? IMAGE_ACCEPT : ALL_ACCEPT}
          multiple
          maxSize={mediaKind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES}
          onFiles={(files) => uploadFiles(files, folderId)}
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
                <Skeleton key={index} className="skeleton-shimmer aspect-square rounded-lg" />
              ))}
            </div>
          ) : !subfolders?.length && !mediaList?.length ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <ImageOff className="size-6 opacity-40" />
              {trimmedQuery ? "No matches" : "No uploads yet"}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {!trimmedQuery &&
                subfolders?.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setFolderId(folder.id)}
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-border/60 p-2 hover:border-primary"
                  >
                    <Folder className="size-8 text-muted-foreground" />
                    <span className="line-clamp-2 text-center text-[11px] font-medium break-all">
                      {folder.name}
                    </span>
                  </button>
                ))}

              {mediaList?.map((item) => (
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
                    {isVideoItem(item) ? (
                      <>
                        <video
                          src={item.url}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="size-6 fill-white text-white" />
                        </span>
                      </>
                    ) : (
                      <Image
                        src={item.url}
                        alt={item.originalName}
                        fill
                        sizes="160px"
                        className="object-cover"
                        draggable={false}
                      />
                    )}
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
