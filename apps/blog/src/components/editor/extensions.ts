import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import type { Extensions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export const CONTENT_CHARACTER_LIMIT = 20000;

export function createExtensions(placeholder?: string): Extensions {
  return [
    StarterKit.configure({
      link: { openOnClick: false, autolink: true },
    }),
    Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
    CharacterCount.configure({ limit: CONTENT_CHARACTER_LIMIT }),
  ];
}
