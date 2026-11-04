"use client";

import { VerifiedGate } from "@/components/verified-gate";
import type { HighlightColor, TiptapDoc } from "@repo/db/schema";
import { getErrorMessage } from "@repo/trpc/error";
import { publicApi } from "@repo/trpc/public/react";
import { cn } from "@repo/ui/lib/utils";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { colorSwatchClass } from "./color-swatch-picker";
import { MediaNoteComposer } from "./media-note-composer";

export type VideoComment = {
  id: string;
  videoSrc: string;
  timestampSeconds: number;
  color: HighlightColor;
  noteJson: TiptapDoc | null;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoMarkerStrip({
  postId,
  videoEl,
  videoSrc,
  rect,
  comments,
  session,
}: {
  postId: string;
  videoEl: HTMLVideoElement;
  videoSrc: string;
  rect: { top: number; left: number; width: number; height: number };
  comments: VideoComment[];
  session: { user: { emailVerified: boolean } } | null | undefined;
}) {
  const [duration, setDuration] = useState(videoEl.duration || 0);
  const [active, setActive] = useState<{
    mode: "create" | "edit";
    id?: string;
    timestampSeconds: number;
    color: HighlightColor;
    noteJson: TiptapDoc | null;
    anchorPoint: { top: number; left: number };
  } | null>(null);

  const utils = publicApi.useUtils();

  useEffect(() => {
    function handleLoaded() {
      setDuration(videoEl.duration || 0);
    }
    videoEl.addEventListener("loadedmetadata", handleLoaded);
    return () => videoEl.removeEventListener("loadedmetadata", handleLoaded);
  }, [videoEl]);

  const createComment = publicApi.videoComment.create.useMutation({
    onSuccess: () => {
      utils.videoComment.listMineForPost.invalidate({ postId });
      toast.success("Comment added.");
      setActive(null);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't add this comment.")),
  });

  const updateNote = publicApi.videoComment.updateNote.useMutation({
    onSuccess: () => {
      utils.videoComment.listMineForPost.invalidate({ postId });
      toast.success("Note saved.");
      setActive(null);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't save this note.")),
  });

  const updateColor = publicApi.videoComment.updateColor.useMutation({
    onSuccess: () => utils.videoComment.listMineForPost.invalidate({ postId }),
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update the color.")),
  });

  function openCreate(event: React.MouseEvent<HTMLButtonElement>) {
    const anchor = event.currentTarget.getBoundingClientRect();
    setActive({
      mode: "create",
      timestampSeconds: videoEl.currentTime,
      color: "yellow",
      noteJson: null,
      anchorPoint: { top: anchor.top, left: anchor.left + anchor.width / 2 },
    });
  }

  function openEdit(comment: VideoComment, event: React.MouseEvent<HTMLButtonElement>) {
    videoEl.currentTime = comment.timestampSeconds;
    const anchor = event.currentTarget.getBoundingClientRect();
    setActive({
      mode: "edit",
      id: comment.id,
      timestampSeconds: comment.timestampSeconds,
      color: comment.color,
      noteJson: comment.noteJson,
      anchorPoint: { top: anchor.top, left: anchor.left + anchor.width / 2 },
    });
  }

  return (
    <>
      <div
        className="pointer-events-auto absolute flex items-center gap-2"
        style={{ top: rect.top + rect.height + 6, left: rect.left, width: rect.width }}
      >
        <div className="relative h-1.5 flex-1 rounded-full bg-muted">
          {duration > 0 &&
            comments.map((comment) => (
              <button
                key={comment.id}
                type="button"
                title={`Comment at ${formatTime(comment.timestampSeconds)}`}
                onClick={(event) => openEdit(comment, event)}
                className={cn(
                  "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 size-2.5 rounded-full border border-background",
                  colorSwatchClass(comment.color)
                )}
                style={{ left: `${(comment.timestampSeconds / duration) * 100}%` }}
              />
            ))}
        </div>
        <VerifiedGate
          verified={!!session?.user.emailVerified}
          message={session ? "Verify your email to add comments" : "Log in to add comments"}
        >
          <button
            type="button"
            aria-label="Add comment at current time"
            onClick={openCreate}
            className="flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3" />
          </button>
        </VerifiedGate>
      </div>

      {active && (
        <MediaNoteComposer
          label={`At ${formatTime(active.timestampSeconds)}`}
          color={active.color}
          noteJson={active.noteJson}
          anchorPoint={active.anchorPoint}
          saving={createComment.isPending || updateNote.isPending}
          onColorChange={(color) => {
            setActive((current) => (current ? { ...current, color } : current));
            if (active.mode === "edit" && active.id) {
              updateColor.mutate({ id: active.id, color });
            }
          }}
          onSave={(doc) => {
            if (active.mode === "create") {
              createComment.mutate({
                postId,
                videoSrc,
                timestampSeconds: active.timestampSeconds,
                color: active.color,
                noteJson: doc,
              });
            } else if (active.id) {
              updateNote.mutate({ id: active.id, noteJson: doc });
            }
          }}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
