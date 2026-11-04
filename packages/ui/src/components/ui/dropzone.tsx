"use client";

import { UploadCloud } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";

function Dropzone({
  accept,
  multiple = false,
  maxSize,
  onFiles,
  className,
  disabled = false,
}: {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFiles: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const handleFiles = React.useCallback(
    (files: FileList | File[]) => {
      if (disabled) return;
      const arr = Array.from(files);
      const filtered = maxSize ? arr.filter((f) => f.size <= maxSize) : arr;
      if (filtered.length > 0) onFiles(filtered);
    },
    [disabled, maxSize, onFiles]
  );

  return (
    <div>
      <button
        type="button"
        aria-label="Upload files"
        disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files.length > 0) handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors duration-200",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/40",
          disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        <UploadCloud className="mb-3 size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Drop files here or <span className="text-primary">browse</span>
        </p>
        {maxSize && (
          <p className="mt-1 text-xs text-muted-foreground">
            Max {Math.round(maxSize / 1024 / 1024)} MB per file
          </p>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => event.target.files && handleFiles(event.target.files)}
        disabled={disabled}
      />
    </div>
  );
}

export { Dropzone };
