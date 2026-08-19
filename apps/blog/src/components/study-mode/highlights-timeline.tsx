"use client";

import type { HighlightColor, TiptapDoc } from "@repo/db/schema";
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
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { TiptapContent } from "../editor/tiptap-content";
import { AnnotationTypeBadge } from "./annotation-type-badge";

export type TimelineHighlight = {
  id: string;
  quoteText: string;
  color: HighlightColor;
  noteJson: TiptapDoc | null;
  updatedAt: string | Date;
};

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function HighlightsTimeline({
  postId,
  highlights,
  resolvedMap,
  hasSession,
  onJumpTo,
  onEditNote,
}: {
  postId: string;
  highlights: TimelineHighlight[];
  resolvedMap: Record<string, boolean>;
  hasSession: boolean;
  onJumpTo: (id: string) => void;
  onEditNote: (id: string) => void;
}) {
  const utils = publicApi.useUtils();

  const deleteHighlight = publicApi.highlight.delete.useMutation({
    onSuccess: () => {
      utils.highlight.listMineForPost.invalidate({ postId });
      toast.success("Highlight deleted.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete this highlight.")),
  });

  if (!hasSession) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>{" "}
        to save your highlights and notes.
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
        Select text in the article to add a highlight.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {highlights.map((highlight) => {
        const resolved = resolvedMap[highlight.id] ?? true;
        return (
          <div
            key={highlight.id}
            data-highlight-id={highlight.id}
            className="flex flex-col gap-1.5 rounded-lg border border-border/60 p-3"
          >
            <div className="flex items-center justify-between">
              <AnnotationTypeBadge kind="highlight" color={highlight.color} />
              <span className="text-xs text-muted-foreground">
                {formatDate(highlight.updatedAt)}
              </span>
            </div>

            <blockquote
              className={cn(
                "line-clamp-3 border-l-2 pl-2 text-sm italic",
                !resolved && "opacity-50"
              )}
            >
              {highlight.quoteText}
            </blockquote>

            {!resolved && (
              <span className="text-xs text-amber-600 dark:text-amber-500">
                Text no longer found in this article
              </span>
            )}

            {highlight.noteJson && <TiptapContent json={highlight.noteJson} className="text-sm" />}

            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={!resolved}
                onClick={() => onJumpTo(highlight.id)}
              >
                Jump to
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEditNote(highlight.id)}>
                {highlight.noteJson ? "Edit note" : "Add note"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this highlight?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the highlight and its note. This can't be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleteHighlight.isPending}
                      onClick={() => deleteHighlight.mutate({ id: highlight.id })}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        );
      })}
    </div>
  );
}
