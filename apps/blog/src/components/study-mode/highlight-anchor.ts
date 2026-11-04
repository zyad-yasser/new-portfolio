import type { Node as PMNode } from "@tiptap/pm/model";

const CONTEXT_LENGTH = 30;

type Checkpoint = { textOffset: number; pmPos: number };

export type TextIndex = {
  text: string;
  posAt: (textOffset: number) => number;
};

export function buildTextIndex(doc: PMNode): TextIndex {
  let text = "";
  const checkpoints: Checkpoint[] = [];

  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      checkpoints.push({ textOffset: text.length, pmPos: pos });
      text += node.text;
    }
    return true;
  });

  function posAt(textOffset: number): number {
    let match: Checkpoint | undefined = checkpoints[0];
    for (const checkpoint of checkpoints) {
      if (checkpoint.textOffset > textOffset) break;
      match = checkpoint;
    }
    return (match?.pmPos ?? 0) + (textOffset - (match?.textOffset ?? 0));
  }

  return { text, posAt };
}

export function rangeToTextOffsets(
  container: HTMLElement,
  range: Range
): { from: number; to: number; text: string } | null {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let text = "";
  let from = -1;
  let to = -1;
  let node: Node | null = walker.nextNode();

  while (node) {
    if (node === range.startContainer) from = text.length + range.startOffset;
    if (node === range.endContainer) to = text.length + range.endOffset;
    text += node.textContent ?? "";
    node = walker.nextNode();
  }

  if (from === -1 || to === -1 || to <= from) return null;
  return { from, to, text };
}

export function extractQuote(text: string, from: number, to: number) {
  return {
    quoteText: text.slice(from, to),
    prefixText: text.slice(Math.max(0, from - CONTEXT_LENGTH), from),
    suffixText: text.slice(to, to + CONTEXT_LENGTH),
  };
}

function affixScore(a: string, b: string): number {
  let score = 0;
  const max = Math.min(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[a.length - 1 - i] !== b[b.length - 1 - i]) break;
    score++;
  }
  return score;
}

export function findQuoteOffset(
  fullText: string,
  quote: string,
  prefix: string,
  suffix: string,
  hintOffset?: number
): number | null {
  if (!quote) return null;

  if (hintOffset !== undefined && fullText.slice(hintOffset, hintOffset + quote.length) === quote) {
    return hintOffset;
  }

  const occurrences: number[] = [];
  let index = fullText.indexOf(quote);
  while (index !== -1) {
    occurrences.push(index);
    index = fullText.indexOf(quote, index + 1);
  }

  if (occurrences.length === 0) return null;
  if (occurrences.length === 1) return occurrences[0]!;

  let best = occurrences[0]!;
  let bestScore = -1;

  for (const occurrence of occurrences) {
    const before = fullText.slice(Math.max(0, occurrence - prefix.length), occurrence);
    const after = fullText.slice(
      occurrence + quote.length,
      occurrence + quote.length + suffix.length
    );
    const score = affixScore(prefix, before) + affixScore(suffix, after);

    if (score > bestScore) {
      bestScore = score;
      best = occurrence;
    }
  }

  if (bestScore <= 0 && hintOffset !== undefined) {
    return occurrences.reduce((closest, occurrence) =>
      Math.abs(occurrence - hintOffset) < Math.abs(closest - hintOffset) ? occurrence : closest
    );
  }

  return best;
}
