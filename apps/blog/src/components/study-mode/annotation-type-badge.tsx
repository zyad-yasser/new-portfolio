"use client";

import type { HighlightColor } from "@repo/db/schema";
import { cn } from "@repo/ui/lib/utils";
import { Circle, Highlighter, Video } from "lucide-react";
import { colorSwatchClass } from "./color-swatch-picker";

export type AnnotationKind = "highlight" | "video" | "circle";

const KIND_ICON: Record<AnnotationKind, typeof Highlighter> = {
  highlight: Highlighter,
  video: Video,
  circle: Circle,
};

const KIND_LABEL: Record<AnnotationKind, string> = {
  highlight: "Highlight",
  video: "Video comment",
  circle: "Circle",
};

export function AnnotationTypeBadge({
  kind,
  color,
}: {
  kind: AnnotationKind;
  color: HighlightColor;
}) {
  const Icon = KIND_ICON[kind];

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("size-2.5 shrink-0 rounded-full", colorSwatchClass(color))} />
      <Icon className="size-3.5 shrink-0" />
      <span>{KIND_LABEL[kind]}</span>
    </div>
  );
}
