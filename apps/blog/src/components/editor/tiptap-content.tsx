"use client";

import type { TiptapDoc } from "@repo/db/schema";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { createExtensions } from "./extensions";

export function TiptapContent({ json }: { json: TiptapDoc }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: createExtensions(),
    content: json as JSONContent,
    editable: false,
    immediatelyRender: false,
  });

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
    <div ref={containerRef}>
      <EditorContent editor={editor} className="prose prose-neutral dark:prose-invert max-w-none" />
    </div>
  );
}
