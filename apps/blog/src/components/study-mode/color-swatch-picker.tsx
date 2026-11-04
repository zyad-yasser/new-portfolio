"use client";

import { HIGHLIGHT_COLORS, type HighlightColor } from "@repo/db/schema";
import { cn } from "@repo/ui/lib/utils";
import { Check } from "lucide-react";

const COLOR_CLASSES: Record<HighlightColor, string> = {
  yellow: "bg-yellow-300",
  green: "bg-green-300",
  blue: "bg-blue-300",
  pink: "bg-pink-300",
};

export function colorSwatchClass(color: HighlightColor) {
  return COLOR_CLASSES[color];
}

export function ColorSwatchPicker({
  value,
  onChange,
  disabled,
}: {
  value?: HighlightColor;
  onChange: (color: HighlightColor) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {HIGHLIGHT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          disabled={disabled}
          aria-label={`${color} highlight`}
          aria-pressed={value === color}
          onClick={() => onChange(color)}
          className={cn(
            "flex size-6 items-center justify-center rounded-full border-2 transition-transform disabled:cursor-not-allowed disabled:opacity-50",
            colorSwatchClass(color),
            value === color
              ? "scale-110 border-foreground ring-2 ring-foreground/40 ring-offset-2 ring-offset-background"
              : "border-transparent"
          )}
        >
          {value === color && <Check className="size-3.5 text-foreground" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}
