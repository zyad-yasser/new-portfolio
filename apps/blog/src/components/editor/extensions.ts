import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import type { Extensions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { StudyHighlights, type StudyHighlightsOptions } from "../study-mode/highlight-extension";
import { Video } from "./video-extension";

export const CONTENT_CHARACTER_LIMIT = 20000;

export function createExtensions(
  placeholder?: string,
  studyHighlights?: StudyHighlightsOptions
): Extensions {
  const extensions: Extensions = [
    StarterKit.configure({
      link: { openOnClick: false, autolink: true },
    }),
    Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
    CharacterCount.configure({ limit: CONTENT_CHARACTER_LIMIT }),
    Image.configure({ inline: false }),
    Video,
  ];

  if (studyHighlights) {
    extensions.push(StudyHighlights.configure(studyHighlights));
  }

  return extensions;
}
