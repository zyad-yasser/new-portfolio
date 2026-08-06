import type { TiptapDoc } from "@repo/db/schema";
import { describe, expect, it } from "vitest";
import { extractHeadings } from "./toc";

function text(value: string): TiptapDoc {
  return { type: "text", text: value };
}

function heading(level: number, value: string): TiptapDoc {
  return { type: "heading", attrs: { level }, content: [text(value)] };
}

function paragraph(value: string): TiptapDoc {
  return { type: "paragraph", content: [text(value)] };
}

describe("extractHeadings", () => {
  it("returns an empty array for a doc with no headings", () => {
    const doc: TiptapDoc = { type: "doc", content: [paragraph("just text")] };
    expect(extractHeadings(doc)).toEqual([]);
  });

  it("extracts level-2 and level-3 headings in document order with sequential ids", () => {
    const doc: TiptapDoc = {
      type: "doc",
      content: [paragraph("intro"), heading(2, "First"), paragraph("body"), heading(3, "Second")],
    };

    expect(extractHeadings(doc)).toEqual([
      { id: "heading-0", level: 2, text: "First" },
      { id: "heading-1", level: 3, text: "Second" },
    ]);
  });

  it("ignores h1 and h4+ headings", () => {
    const doc: TiptapDoc = {
      type: "doc",
      content: [heading(1, "Title"), heading(4, "Too deep"), heading(2, "Kept")],
    };

    expect(extractHeadings(doc)).toEqual([{ id: "heading-0", level: 2, text: "Kept" }]);
  });

  it("concatenates multiple text nodes within a single heading", () => {
    const doc: TiptapDoc = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [text("Hello "), { type: "text", text: "world", marks: [{ type: "bold" }] }],
        },
      ],
    };

    expect(extractHeadings(doc)[0]?.text).toBe("Hello world");
  });
});
