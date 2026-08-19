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
import type { CircleAnnotation } from "./article-circle-overlay";

export function ImageAnnotationsList({
  postId,
  annotations,
  onJumpTo,
}: {
  postId: string;
  annotations: CircleAnnotation[];
  onJumpTo: (id: string) => void;
}) {
  const utils = publicApi.useUtils();

  const deleteAnnotation = publicApi.imageAnnotation.delete.useMutation({
    onSuccess: () => {
      utils.imageAnnotation.listMineForPost.invalidate({ postId });
      toast.success("Circle deleted.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete this circle.")),
  });

  if (annotations.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Circles
      </span>
      {annotations.map((annotation) => (
        <div
          key={annotation.id}
          className="flex flex-col gap-1.5 rounded-lg border border-border/60 p-3"
        >
          <div className="flex items-center justify-between">
            <AnnotationTypeBadge kind="circle" color={annotation.color} />
          </div>

          {annotation.noteJson && <TiptapContent json={annotation.noteJson} className="text-sm" />}

          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => onJumpTo(annotation.id)}>
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
                  <AlertDialogTitle>Delete this circle?</AlertDialogTitle>
                  <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteAnnotation.isPending}
                    onClick={() => deleteAnnotation.mutate({ id: annotation.id })}
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
  );
}
