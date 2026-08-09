"use client";

import { useMediaUpload } from "@/components/media/use-media-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Loader2, Pencil } from "lucide-react";
import { useRef } from "react";

export function AvatarUpload({
  imageUrl,
  fallback,
  onUploaded,
}: {
  imageUrl: string | null | undefined;
  fallback: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { items, uploadFiles } = useMediaUpload((item) => onUploaded(item.url));
  const uploading = items.some((item) => item.status === "uploading");

  return (
    <div className="group relative size-20 shrink-0">
      <Avatar className="size-20">
        <AvatarImage src={imageUrl ?? undefined} alt={fallback} />
        <AvatarFallback className="text-lg">{fallback}</AvatarFallback>
      </Avatar>
      <button
        type="button"
        aria-label="Change photo"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
      >
        {uploading ? <Loader2 className="size-5 animate-spin" /> : <Pencil className="size-5" />}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            uploadFiles([file]);
          }
          event.target.value = "";
        }}
      />
    </div>
  );
}
