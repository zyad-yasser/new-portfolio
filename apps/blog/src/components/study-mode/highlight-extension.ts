import type { HighlightColor } from "@repo/db/schema";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { buildTextIndex, findQuoteOffset } from "./highlight-anchor";

export type AnchoredHighlight = {
  id: string;
  quoteText: string;
  prefixText: string;
  suffixText: string;
  startOffset: number;
  color: HighlightColor;
};

export type ResolvedHighlight = { id: string; found: boolean };

export interface StudyHighlightsOptions {
  highlights: AnchoredHighlight[];
  onResolved?: ((resolved: ResolvedHighlight[]) => void) | undefined;
  onHighlightClick?: ((id: string) => void) | undefined;
}

export const studyHighlightsPluginKey = new PluginKey<DecorationSet>("studyHighlights");

function buildDecorations(
  doc: Parameters<typeof DecorationSet.create>[0],
  highlights: AnchoredHighlight[],
  onResolved?: (resolved: ResolvedHighlight[]) => void
): DecorationSet {
  const { text, posAt } = buildTextIndex(doc);
  const decorations: Decoration[] = [];
  const resolved: ResolvedHighlight[] = [];

  for (const highlight of highlights) {
    const offset = findQuoteOffset(
      text,
      highlight.quoteText,
      highlight.prefixText,
      highlight.suffixText,
      highlight.startOffset
    );

    if (offset === null) {
      resolved.push({ id: highlight.id, found: false });
      continue;
    }

    const from = posAt(offset);
    const to = posAt(offset + highlight.quoteText.length);

    decorations.push(
      Decoration.inline(from, to, {
        class: `study-highlight study-highlight-${highlight.color}`,
        "data-highlight-id": highlight.id,
      })
    );
    resolved.push({ id: highlight.id, found: true });
  }

  onResolved?.(resolved);
  return DecorationSet.create(doc, decorations);
}

export const StudyHighlights = Extension.create<StudyHighlightsOptions>({
  name: "studyHighlights",

  addOptions() {
    return {
      highlights: [],
      onResolved: undefined,
      onHighlightClick: undefined,
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: studyHighlightsPluginKey,
        state: {
          init(_, { doc }) {
            return buildDecorations(
              doc,
              extension.options.highlights,
              extension.options.onResolved
            );
          },
          apply(tr, old, _oldState, newState) {
            if (tr.docChanged || tr.getMeta(studyHighlightsPluginKey)) {
              return buildDecorations(
                newState.doc,
                extension.options.highlights,
                extension.options.onResolved
              );
            }
            return old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return studyHighlightsPluginKey.getState(state);
          },
          handleClick(_view, _pos, event) {
            const target = (event.target as HTMLElement).closest("[data-highlight-id]");
            if (target) {
              const id = target.getAttribute("data-highlight-id");
              if (id) {
                extension.options.onHighlightClick?.(id);
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});
