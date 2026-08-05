"use client";

import type { TiptapDoc } from "@repo/db/schema";
import { Button } from "@repo/ui/button";
import { Separator } from "@repo/ui/separator";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
} from "lucide-react";
import { useEffect } from "react";
import { createExtensions } from "./extensions";

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className="size-8"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function TiptapEditor({
  content,
  onChange,
  placeholder,
}: {
  content: TiptapDoc;
  onChange: (doc: TiptapDoc) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: createExtensions(placeholder),
    content: content as JSONContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-64 focus:outline-none px-3 py-2 text-sm sm:text-base",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getJSON() as TiptapDoc);
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  if (!editor) {
    return null;
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="rounded-md border border-input">
      <div className="flex flex-wrap items-center gap-1 border-b border-input p-1.5">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>
        <Separator orientation="vertical" className="mx-0.5 h-6" />
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Ordered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <Separator orientation="vertical" className="mx-0.5 h-6" />
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="size-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <div className="border-t border-input px-3 py-1.5 text-right text-xs text-muted-foreground">
        {editor.storage.characterCount.characters()} characters
      </div>
    </div>
  );
}
