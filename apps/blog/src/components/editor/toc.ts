import type { TiptapDoc } from "@repo/db/schema";

export type TocHeading = {
  id: string;
  level: 2 | 3;
  text: string;
};

function textOf(node: TiptapDoc): string {
  if (typeof node.text === "string") {
    return node.text;
  }
  return (node.content ?? []).map(textOf).join("");
}

export function extractHeadings(doc: TiptapDoc): TocHeading[] {
  const headings: TocHeading[] = [];

  function walk(node: TiptapDoc) {
    const level = node.attrs?.level;
    if (node.type === "heading" && (level === 2 || level === 3)) {
      headings.push({ id: `heading-${headings.length}`, level, text: textOf(node) });
    }
    for (const child of node.content ?? []) {
      walk(child);
    }
  }

  walk(doc);
  return headings;
}
