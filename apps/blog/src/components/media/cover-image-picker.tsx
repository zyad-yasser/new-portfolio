"use client";

import { MediaPickerDialog } from "@/components/media/media-picker-dialog";
import { Button } from "@repo/ui/button";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function CoverImagePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  if (value) {
    return (
      <div className="group relative aspect-[3/1] w-full overflow-hidden rounded-lg border border-border/60">
        <Image src={value} alt="" fill sizes="768px" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
            Change
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            aria-label="Remove cover image"
            onClick={() => onChange(null)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
        <MediaPickerDialog
          open={open}
          onOpenChange={setOpen}
          onSelect={(item) => onChange(item.url)}
        />
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <ImageIcon className="size-3.5" />
        Add cover image
      </Button>
      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={(item) => onChange(item.url)}
      />
    </>
  );
}
