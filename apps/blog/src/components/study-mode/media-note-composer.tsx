"use client";

import type { HighlightColor, TiptapDoc } from "@repo/db/schema";
import { Button } from "@repo/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@repo/ui/popover";
import { useState } from "react";
import { TiptapEditor } from "../editor/tiptap-editor";
import { ColorSwatchPicker } from "./color-swatch-picker";

const EMPTY_DOC: TiptapDoc = { type: "doc", content: [{ type: "paragraph" }] };

export function MediaNoteComposer({
  label,
  color,
  noteJson,
  anchorPoint,
  saving,
  onSave,
  onColorChange,
  onClose,
  onDelete,
}: {
  label: string;
  color: HighlightColor;
  noteJson: TiptapDoc | null;
  anchorPoint: { top: number; left: number };
  saving?: boolean;
  onSave: (doc: TiptapDoc) => void;
  onColorChange: (color: HighlightColor) => void;
  onClose: () => void;
  onDelete?: (() => void) | undefined;
}) {
  const [draft, setDraft] = useState<TiptapDoc>(noteJson ?? EMPTY_DOC);

  return (
    <Popover open onOpenChange={(open) => !open && onClose()}>
      <PopoverAnchor asChild>
        <div
          style={{
            position: "fixed",
            top: anchorPoint.top,
            left: anchorPoint.left,
            width: 0,
            height: 0,
          }}
        />
      </PopoverAnchor>
      <PopoverContent side="top" align="center" className="flex w-96 flex-col gap-3 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
          <ColorSwatchPicker value={color} onChange={onColorChange} />
        </div>
        <TiptapEditor content={draft} onChange={setDraft} placeholder="Add a note…" />
        <div className="flex items-center justify-between gap-2">
          {onDelete ? (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" disabled={saving} onClick={() => onSave(draft)}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
