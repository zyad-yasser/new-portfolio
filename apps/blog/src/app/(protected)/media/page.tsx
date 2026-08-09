"use client";

import { MediaPreviewDialog } from "@/components/media/media-preview-dialog";
import { useMediaUpload } from "@/components/media/use-media-upload";
import { SiteHeader } from "@/components/site-header";
import { publicApi } from "@repo/trpc/public/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { Button } from "@repo/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@repo/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Dropzone } from "@repo/ui/dropzone";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { Progress } from "@repo/ui/progress";
import { Skeleton } from "@repo/ui/skeleton";
import {
  Check,
  ChevronRight,
  Eye,
  Folder,
  FolderInput,
  ImageOff,
  Loader2,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { type KeyboardEvent, useMemo, useState } from "react";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime";
const MAX_SIZE_BYTES = 200 * 1024 * 1024;

function isVideoItem(item: { mimeType: string }) {
  return item.mimeType.startsWith("video/");
}

function formatGb(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(1);
}

function StorageUsageBar() {
  const { data: quota } = publicApi.mediaQuota.get.useQuery();

  if (!quota) {
    return <Skeleton className="skeleton-shimmer h-10 w-full rounded-lg" />;
  }

  const fraction = quota.totalBytes > 0 ? quota.usedBytes / quota.totalBytes : 0;
  const percent = Math.min(100, fraction * 100);
  const isFull = fraction >= 1;
  const isNearFull = fraction >= 0.8;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border/60 p-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Storage used</span>
        <span className={cn("font-medium", isFull && "text-destructive")}>
          {formatGb(quota.usedBytes)} GB of {formatGb(quota.totalBytes)} GB
        </span>
      </div>
      <Progress
        value={percent}
        className={cn(
          "[&>[data-slot=progress-indicator]]:bg-primary",
          isNearFull &&
            !isFull &&
            "[&>[data-slot=progress-indicator]]:bg-amber-500 dark:[&>[data-slot=progress-indicator]]:bg-amber-400",
          isFull && "[&>[data-slot=progress-indicator]]:bg-destructive"
        )}
      />
    </div>
  );
}

type DragPayload = { id: string; kind: "file" | "folder" };

function parseDragPayload(event: React.DragEvent): DragPayload | null {
  const raw = event.dataTransfer.getData("application/json");
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.id === "string" &&
      (parsed.kind === "file" || parsed.kind === "folder")
    ) {
      return parsed as DragPayload;
    }
  } catch {
    // ignore malformed payloads
  }
  return null;
}

function MoveToDialog({
  open,
  onOpenChange,
  excludeFolderId,
  onMove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeFolderId?: string | undefined;
  onMove: (folderId: string | null) => void;
}) {
  const { data: folders } = publicApi.mediaFolder.listAll.useQuery(undefined, { enabled: open });
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!folders) {
      return [];
    }

    const byId = new Map(folders.map((folder) => [folder.id, folder]));
    function depthOf(id: string): number {
      let depth = 0;
      let current = byId.get(id);
      while (current?.parentId) {
        depth += 1;
        current = byId.get(current.parentId);
      }
      return depth;
    }

    return folders
      .filter((folder) => folder.id !== excludeFolderId)
      .filter((folder) => folder.name.toLowerCase().includes(query.trim().toLowerCase()))
      .map((folder) => ({ ...folder, depth: depthOf(folder.id) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [folders, excludeFolderId, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[70vh] flex-col sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Move to…</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search folders…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                onMove(null);
                onOpenChange(false);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <Folder className="size-4 text-muted-foreground" />
              Root
            </button>
            {rows.map((folder) => (
              <button
                key={folder.id}
                type="button"
                style={{ paddingLeft: `${folder.depth * 16 + 8}px` }}
                onClick={() => {
                  onMove(folder.id);
                  onOpenChange(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm hover:bg-accent"
              >
                <Folder className="size-4 text-muted-foreground" />
                {folder.name}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MediaLibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folder");

  const utils = publicApi.useUtils();

  const { data: subfolders, isLoading: foldersLoading } = publicApi.mediaFolder.list.useQuery({
    parentId: currentFolderId,
  });
  const { data: breadcrumb } = publicApi.mediaFolder.path.useQuery(
    { folderId: currentFolderId ?? "" },
    { enabled: !!currentFolderId }
  );
  const {
    data,
    isLoading: filesLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = publicApi.media.list.useInfiniteQuery(
    { folderId: currentFolderId },
    { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined }
  );

  const files = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set());
  const [renaming, setRenaming] = useState<{ id: string; kind: "file" | "folder" } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [moveTarget, setMoveTarget] = useState<DragPayload | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<{ id: string; name: string } | null>(
    null
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewItem = files.find((file) => file.id === previewId) ?? null;

  const invalidateAll = () => {
    utils.mediaFolder.list.invalidate();
    utils.mediaFolder.listAll.invalidate();
    utils.media.list.invalidate();
  };

  const createFolder = publicApi.mediaFolder.create.useMutation({
    onSuccess: () => {
      invalidateAll();
      setCreatingFolder(false);
      setNewFolderName("");
    },
  });
  const renameFolder = publicApi.mediaFolder.rename.useMutation({ onSuccess: invalidateAll });
  const moveFolder = publicApi.mediaFolder.move.useMutation({
    onSuccess: invalidateAll,
    onError: (err) => setActionError(err.message),
  });
  const deleteFolder = publicApi.mediaFolder.delete.useMutation({
    onSuccess: () => {
      invalidateAll();
      setDeleteFolderTarget(null);
    },
  });

  const renameFile = publicApi.media.rename.useMutation({ onSuccess: invalidateAll });
  const moveFile = publicApi.media.move.useMutation({
    onSuccess: invalidateAll,
    onError: (err) => setActionError(err.message),
  });
  const deleteFile = publicApi.media.delete.useMutation({ onSuccess: invalidateAll });
  const bulkDeleteFiles = publicApi.media.bulkDelete.useMutation({
    onSuccess: () => {
      invalidateAll();
      setBulkDeleteOpen(false);
      setSelectedFileIds(new Set());
    },
  });

  const { items: uploadItems, uploadFiles } = useMediaUpload(() => invalidateAll());

  function goToFolder(id: string | null) {
    router.push(id ? `/media?folder=${id}` : "/media");
  }

  function startRename(id: string, kind: "file" | "folder", currentName: string) {
    setRenaming({ id, kind });
    setRenameValue(currentName);
  }

  function commitRename() {
    if (!renaming || !renameValue.trim()) {
      setRenaming(null);
      return;
    }
    if (renaming.kind === "folder") {
      renameFolder.mutate({ id: renaming.id, name: renameValue.trim() });
    } else {
      renameFile.mutate({ id: renaming.id, name: renameValue.trim() });
    }
    setRenaming(null);
  }

  function handleDropOn(targetFolderId: string | null, event: React.DragEvent) {
    event.preventDefault();
    setDragOverId(null);
    const payload = parseDragPayload(event);
    if (!payload) {
      return;
    }
    if (payload.kind === "folder") {
      if (payload.id === targetFolderId) {
        return;
      }
      moveFolder.mutate({ id: payload.id, parentId: targetFolderId });
    } else {
      moveFile.mutate({ id: payload.id, folderId: targetFolderId });
    }
  }

  function toggleSelected(id: string, kind: "file" | "folder") {
    const setter = kind === "file" ? setSelectedFileIds : setSelectedFolderIds;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const hasSelection = selectedFileIds.size > 0 || selectedFolderIds.size > 0;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Media library</h1>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
              <button
                type="button"
                onClick={() => goToFolder(null)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId("root");
                }}
                onDragLeave={() => setDragOverId((id) => (id === "root" ? null : id))}
                onDrop={(e) => handleDropOn(null, e)}
                className={cn(
                  "cursor-pointer rounded px-1.5 py-0.5 hover:underline",
                  !currentFolderId && "font-medium text-foreground",
                  currentFolderId && "text-muted-foreground",
                  dragOverId === "root" && "bg-primary/10 ring-1 ring-primary"
                )}
              >
                Root
              </button>
              {breadcrumb?.map((crumb, index) => (
                <span key={crumb.id} className="flex items-center gap-1">
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => goToFolder(crumb.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverId(crumb.id);
                    }}
                    onDragLeave={() => setDragOverId((id) => (id === crumb.id ? null : id))}
                    onDrop={(e) => handleDropOn(crumb.id, e)}
                    className={cn(
                      "cursor-pointer rounded px-1.5 py-0.5 hover:underline",
                      index === breadcrumb.length - 1
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                      dragOverId === crumb.id && "bg-primary/10 ring-1 ring-primary"
                    )}
                  >
                    {crumb.name}
                  </button>
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setCreatingFolder((v) => !v)}
            >
              <Plus className="size-3.5" />
              New folder
            </Button>
            <Button
              variant={selectMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setSelectMode((v) => !v);
                setSelectedFileIds(new Set());
                setSelectedFolderIds(new Set());
              }}
            >
              {selectMode ? "Done" : "Select"}
            </Button>
            {selectMode && hasSelection && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" />
                Delete ({selectedFileIds.size + selectedFolderIds.size})
              </Button>
            )}
          </div>
        </div>

        <StorageUsageBar />

        {actionError && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {actionError}
            <button type="button" onClick={() => setActionError(null)} className="cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {creatingFolder && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newFolderName.trim()) {
                createFolder.mutate({ name: newFolderName.trim(), parentId: currentFolderId });
              }
            }}
            className="flex items-center gap-2"
          >
            <Input
              autoFocus
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="max-w-xs"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newFolderName.trim() || createFolder.isPending}
            >
              Create
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreatingFolder(false);
                setNewFolderName("");
              }}
            >
              Cancel
            </Button>
          </form>
        )}

        <Dropzone
          accept={ACCEPT}
          multiple
          maxSize={MAX_SIZE_BYTES}
          onFiles={(uploaded) => uploadFiles(uploaded, currentFolderId)}
          className="min-h-24 p-6"
        />

        {uploadItems.length > 0 && (
          <div className="flex flex-col gap-2">
            {uploadItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">{item.file.name}</span>
                {item.status === "error" ? (
                  <span className="text-xs text-destructive">{item.error ?? "Failed"}</span>
                ) : item.status === "done" ? (
                  <Check className="size-4 text-primary" />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(item.progress * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Couldn't load media. {error.message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {foldersLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="skeleton-shimmer aspect-square rounded-lg" />
            ))}

          {subfolders?.map((folder) => (
            <ContextMenu key={folder.id}>
              <ContextMenuTrigger>
                <div
                  draggable={!selectMode}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({ id: folder.id, kind: "folder" })
                    );
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverId(folder.id);
                  }}
                  onDragLeave={() => setDragOverId((id) => (id === folder.id ? null : id))}
                  onDrop={(e) => handleDropOn(folder.id, e)}
                  onClick={() => {
                    if (selectMode) {
                      toggleSelected(folder.id, "folder");
                    } else if (renaming?.id !== folder.id) {
                      goToFolder(folder.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (selectMode) {
                        toggleSelected(folder.id, "folder");
                      } else if (renaming?.id !== folder.id) {
                        goToFolder(folder.id);
                      }
                    }
                  }}
                  className={cn(
                    "group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-border/60 p-3 hover:border-primary",
                    dragOverId === folder.id && "border-primary bg-primary/5",
                    selectedFolderIds.has(folder.id) && "border-primary bg-primary/10"
                  )}
                >
                  {selectMode && (
                    <div
                      className={cn(
                        "absolute top-2 left-2 flex size-5 items-center justify-center rounded-full border",
                        selectedFolderIds.has(folder.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      )}
                    >
                      {selectedFolderIds.has(folder.id) && <Check className="size-3" />}
                    </div>
                  )}
                  <Folder className="size-10 text-muted-foreground" />
                  {renaming?.id === folder.id ? (
                    <Input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={commitRename}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setRenaming(null);
                      }}
                      className="h-7 text-center text-xs"
                    />
                  ) : (
                    <span className="line-clamp-2 text-center text-xs font-medium break-all">
                      {folder.name}
                    </span>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onSelect={() => startRename(folder.id, "folder", folder.name)}
                  className="gap-2"
                >
                  <Pencil className="size-3.5" />
                  Rename
                </ContextMenuItem>
                <ContextMenuItem
                  variant="destructive"
                  onSelect={() => setDeleteFolderTarget(folder)}
                  className="gap-2"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}

          {filesLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={`file-skel-${i}`}
                className="skeleton-shimmer aspect-square rounded-lg"
              />
            ))}

          {files.map((item) => (
            <ContextMenu key={item.id}>
              <ContextMenuTrigger>
                <div
                  draggable={!selectMode}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({ id: item.id, kind: "file" })
                    );
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => {
                    if (selectMode) {
                      toggleSelected(item.id, "file");
                    } else {
                      setPreviewId(item.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (selectMode) {
                        toggleSelected(item.id, "file");
                      } else {
                        setPreviewId(item.id);
                      }
                    }
                  }}
                  className={cn(
                    "card-hover group relative aspect-square cursor-pointer overflow-hidden rounded-lg",
                    selectedFileIds.has(item.id) && "border-primary ring-2 ring-primary"
                  )}
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
                      sizes="220px"
                      className="object-cover"
                      draggable={false}
                    />
                  )}
                  {selectMode && (
                    <div
                      className={cn(
                        "absolute top-2 left-2 flex size-5 items-center justify-center rounded-full border",
                        selectedFileIds.has(item.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-white/80 bg-black/30"
                      )}
                    >
                      {selectedFileIds.has(item.id) && <Check className="size-3" />}
                    </div>
                  )}
                  {renaming?.id === item.id && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1">
                      <Input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={commitRename}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setRenaming(null);
                        }}
                        className="h-7 text-xs"
                      />
                    </div>
                  )}
                  {!renaming && (
                    <div className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent p-1.5 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.originalName}
                    </div>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onSelect={() => setPreviewId(item.id)} className="gap-2">
                  <Eye className="size-3.5" />
                  Preview
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => startRename(item.id, "file", item.originalName)}
                  className="gap-2"
                >
                  <Pencil className="size-3.5" />
                  Rename
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => setMoveTarget({ id: item.id, kind: "file" })}
                  className="gap-2"
                >
                  <FolderInput className="size-3.5" />
                  Move to…
                </ContextMenuItem>
                <ContextMenuItem asChild>
                  <a href={item.url} target="_blank" rel="noreferrer" className="gap-2">
                    Open original
                  </a>
                </ContextMenuItem>
                <ContextMenuItem
                  variant="destructive"
                  onSelect={() => deleteFile.mutate({ id: item.id })}
                  className="gap-2"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>

        {!foldersLoading && !filesLoading && subfolders?.length === 0 && files.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <ImageOff className="size-6 opacity-40" />
            This folder is empty
          </div>
        )}

        {hasNextPage && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              className="gap-2"
            >
              {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          </div>
        )}
      </main>

      <MediaPreviewDialog item={previewItem} onOpenChange={(open) => !open && setPreviewId(null)} />

      <MoveToDialog
        open={!!moveTarget}
        onOpenChange={(open) => !open && setMoveTarget(null)}
        excludeFolderId={moveTarget?.kind === "folder" ? moveTarget.id : undefined}
        onMove={(folderId) => {
          if (!moveTarget) return;
          if (moveTarget.kind === "folder") {
            moveFolder.mutate({ id: moveTarget.id, parentId: folderId });
          } else {
            moveFile.mutate({ id: moveTarget.id, folderId });
          }
          setMoveTarget(null);
        }}
      />

      <AlertDialog
        open={!!deleteFolderTarget}
        onOpenChange={(open) => !open && setDeleteFolderTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteFolderTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. Every file inside this folder (and its subfolders) will be
              permanently deleted too.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteFolder.isPending}
              onClick={() =>
                deleteFolderTarget && deleteFolder.mutate({ id: deleteFolderTarget.id })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedFileIds.size + selectedFolderIds.size} item
              {selectedFileIds.size + selectedFolderIds.size === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. Any files inside selected folders will be permanently deleted
              too.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteFiles.isPending}
              onClick={async () => {
                if (selectedFileIds.size > 0) {
                  await bulkDeleteFiles.mutateAsync({ ids: Array.from(selectedFileIds) });
                }
                for (const id of selectedFolderIds) {
                  await deleteFolder.mutateAsync({ id });
                }
                setSelectedFolderIds(new Set());
                setBulkDeleteOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
