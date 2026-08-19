"use client";

import { getErrorMessage } from "@repo/trpc/error";
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
  AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import { Button } from "@repo/ui/button";
import { toast } from "sonner";
import { TiptapContent } from "../editor/tiptap-content";
import { AnnotationTypeBadge } from "./annotation-type-badge";
import type { VideoComment } from "./video-marker-strip";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function groupByVideo(comments: VideoComment[]) {
  const groups = new Map<string, VideoComment[]>();
  for (const comment of comments) {
    const existing = groups.get(comment.videoSrc);
    if (existing) {
      existing.push(comment);
    } else {
      groups.set(comment.videoSrc, [comment]);
    }
  }
  return [...groups.entries()];
}

export function VideoCommentsList({
  postId,
  comments,
  onJumpTo,
}: {
  postId: string;
  comments: VideoComment[];
  onJumpTo: (videoSrc: string, timestampSeconds: number) => void;
}) {
  const utils = publicApi.useUtils();

  const deleteComment = publicApi.videoComment.delete.useMutation({
    onSuccess: () => {
      utils.videoComment.listMineForPost.invalidate({ postId });
      toast.success("Comment deleted.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete this comment.")),
  });

  if (comments.length === 0) return null;

  const groups = groupByVideo(comments);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Video comments
      </span>
      {groups.map(([videoSrc, videoComments], groupIndex) => (
        <div key={videoSrc} className="flex flex-col gap-2">
          {groups.length > 1 && (
            <span className="text-xs font-medium text-muted-foreground">
              Video {groupIndex + 1}
            </span>
          )}
          {videoComments.map((comment) => (
            <div
              key={comment.id}
              className="flex flex-col gap-1.5 rounded-lg border border-border/60 p-3"
            >
              <div className="flex items-center justify-between">
                <AnnotationTypeBadge kind="video" color={comment.color} />
                <span className="text-xs text-muted-foreground">
                  {formatTime(comment.timestampSeconds)}
                </span>
              </div>

              {comment.noteJson && <TiptapContent json={comment.noteJson} className="text-sm" />}

              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onJumpTo(comment.videoSrc, comment.timestampSeconds)}
                >
                  Jump to
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                      <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleteComment.isPending}
                        onClick={() => deleteComment.mutate({ id: comment.id })}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
