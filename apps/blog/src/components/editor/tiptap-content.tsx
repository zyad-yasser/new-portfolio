"use client";

import type { TiptapDoc } from "@repo/db/schema";
import { cn } from "@repo/ui/lib/utils";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import type { AnchoredHighlight, ResolvedHighlight } from "../study-mode/highlight-extension";
import { createExtensions } from "./extensions";

export function TiptapContent({
  json,
  className,
  studyMode,
  highlights,
  onHighlightClick,
  onHighlightsResolved,
  articleRef,
}: {
  json: TiptapDoc;
  className?: string;
  studyMode?: boolean;
  highlights?: AnchoredHighlight[];
  onHighlightClick?: (id: string) => void;
  onHighlightsResolved?: (resolved: ResolvedHighlight[]) => void;
  articleRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor(
    {
      extensions: createExtensions(undefined, {
        highlights: studyMode ? (highlights ?? []) : [],
        onResolved: onHighlightsResolved,
        onHighlightClick,
      }),
      content: json as JSONContent,
      editable: false,
      immediatelyRender: false,
    },
    [studyMode, highlights, json]
  );

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const headings = container.querySelectorAll("h2, h3");
    headings.forEach((heading, index) => {
      heading.id = `heading-${index}`;
    });
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (articleRef) articleRef.current = node;
      }}
    >
      <EditorContent
        editor={editor}
        className={cn("prose prose-neutral dark:prose-invert max-w-none", className)}
      />
    </div>
  );
}
