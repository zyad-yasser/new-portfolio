"use client";

import type { HighlightColor, TiptapDoc } from "@repo/db/schema";
import { getErrorMessage } from "@repo/trpc/error";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@repo/ui/popover";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TiptapEditor } from "../editor/tiptap-editor";
import { ColorSwatchPicker } from "./color-swatch-picker";

const EMPTY_DOC: TiptapDoc = { type: "doc", content: [{ type: "paragraph" }] };

export type ActiveHighlight = {
  id: string;
  quoteText: string;
  color: HighlightColor;
  noteJson: TiptapDoc | null;
};

export function HighlightNoteComposer({
  postId,
  highlight,
  anchorElement,
  onClose,
}: {
  postId: string;
  highlight: ActiveHighlight | null;
  anchorElement: HTMLElement | null;
  onClose: () => void;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [draft, setDraft] = useState<TiptapDoc>(EMPTY_DOC);
  const utils = publicApi.useUtils();

  useEffect(() => {
    setDraft(highlight?.noteJson ?? EMPTY_DOC);
  }, [highlight]);

  useEffect(() => {
    if (!highlight || !anchorElement) {
      setRect(null);
      return;
    }

    function measure() {
      if (anchorElement) setRect(anchorElement.getBoundingClientRect());
    }

    measure();

    const start = performance.now();
    let frameId = requestAnimationFrame(function tick() {
      measure();
      if (performance.now() - start < 600) {
        frameId = requestAnimationFrame(tick);
      }
    });

    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [highlight, anchorElement]);

  const saveNote = publicApi.highlight.updateNote.useMutation({
    onMutate: async (input) => {
      await utils.highlight.listMineForPost.cancel({ postId });
      const previous = utils.highlight.listMineForPost.getData({ postId });
      utils.highlight.listMineForPost.setData({ postId }, (old) =>
        old?.map((item) =>
          item.id === input.id
            ? { ...item, noteJson: input.noteJson as TiptapDoc | null, updatedAt: new Date() }
            : item
        )
      );
      toast.success("Note saved.");
      onClose();
      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        utils.highlight.listMineForPost.setData({ postId }, context.previous);
      }
      toast.error(getErrorMessage(error, "Couldn't save this note."));
    },
    onSettled: () => utils.highlight.listMineForPost.invalidate({ postId }),
  });

  const updateColor = publicApi.highlight.updateColor.useMutation({
    onMutate: async (input) => {
      await utils.highlight.listMineForPost.cancel({ postId });
      const previous = utils.highlight.listMineForPost.getData({ postId });
      utils.highlight.listMineForPost.setData({ postId }, (old) =>
        old?.map((item) => (item.id === input.id ? { ...item, color: input.color } : item))
      );
      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        utils.highlight.listMineForPost.setData({ postId }, context.previous);
      }
      toast.error(getErrorMessage(error, "Couldn't update the color."));
    },
    onSettled: () => utils.highlight.listMineForPost.invalidate({ postId }),
  });

  if (!highlight) return null;

  return (
    <Popover open onOpenChange={(open) => !open && onClose()}>
      <PopoverAnchor asChild>
        <div
          style={{
            position: "fixed",
            top: rect?.top ?? 0,
            left: rect ? rect.left + rect.width / 2 : 0,
            width: 0,
            height: 0,
          }}
        />
      </PopoverAnchor>
      <PopoverContent side="top" align="center" className="flex w-96 flex-col gap-3 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Your note
          </span>
          <ColorSwatchPicker
            value={highlight.color}
            onChange={(color) => updateColor.mutate({ id: highlight.id, color })}
          />
        </div>
        <blockquote className="line-clamp-2 border-l-2 pl-2 text-sm text-muted-foreground italic">
          {highlight.quoteText}
        </blockquote>
        <TiptapEditor content={draft} onChange={setDraft} placeholder="Add a note…" />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            disabled={saveNote.isPending}
            onClick={() => saveNote.mutate({ id: highlight.id, noteJson: draft })}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
