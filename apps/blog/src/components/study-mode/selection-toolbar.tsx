"use client";

import { VerifiedGate } from "@/components/verified-gate";
import type { HighlightColor } from "@repo/db/schema";
import { getErrorMessage } from "@repo/trpc/error";
import { publicApi } from "@repo/trpc/public/react";
import { Popover, PopoverAnchor, PopoverContent } from "@repo/ui/popover";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ColorSwatchPicker } from "./color-swatch-picker";
import { extractQuote, rangeToTextOffsets } from "./highlight-anchor";

type PendingSelection = {
  rect: DOMRect;
  from: number;
  to: number;
  text: string;
};

export function SelectionToolbar({
  postId,
  containerRef,
  session,
  onHighlightCreated,
}: {
  postId: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  session: { user: { emailVerified: boolean } } | null | undefined;
  onHighlightCreated: (highlight: {
    id: string;
    quoteText: string;
    prefixText: string;
    suffixText: string;
    startOffset: number;
    color: HighlightColor;
  }) => void;
}) {
  const [pending, setPending] = useState<PendingSelection | null>(null);

  const createHighlight = publicApi.highlight.create.useMutation({
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't save this highlight.")),
  });

  useEffect(() => {
    function handleSelectionChange() {
      const container = containerRef.current;
      const selection = window.getSelection();

      if (!container || !selection || selection.isCollapsed || selection.rangeCount === 0) {
        setPending(null);
        return;
      }

      const range = selection.getRangeAt(0);
      if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
        setPending(null);
        return;
      }

      const offsets = rangeToTextOffsets(container, range);
      if (!offsets) {
        setPending(null);
        return;
      }

      setPending({ rect: range.getBoundingClientRect(), ...offsets });
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [containerRef]);

  function handlePick(color: HighlightColor) {
    if (!pending) return;
    const { quoteText, prefixText, suffixText } = extractQuote(
      pending.text,
      pending.from,
      pending.to
    );

    createHighlight.mutate(
      {
        postId,
        quoteText,
        prefixText,
        suffixText,
        startOffset: pending.from,
        endOffset: pending.to,
        color,
        noteJson: null,
      },
      {
        onSuccess: (created) => {
          if (!created) return;
          toast.success("Highlight added.");
          window.getSelection()?.removeAllRanges();
          setPending(null);
          onHighlightCreated({
            id: created.id,
            quoteText: created.quoteText,
            prefixText: created.prefixText,
            suffixText: created.suffixText,
            startOffset: created.startOffset,
            color: created.color,
          });
        },
      }
    );
  }

  if (!pending) return null;

  return (
    <Popover open modal={false}>
      <PopoverAnchor asChild>
        <div
          style={{
            position: "fixed",
            top: pending.rect.top,
            left: pending.rect.left + pending.rect.width / 2,
            width: 0,
            height: 0,
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="center"
        className="w-auto p-2"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {!session ? (
          <p className="text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Log in
            </Link>{" "}
            to save highlights.
          </p>
        ) : (
          <VerifiedGate
            verified={session.user.emailVerified}
            message="Verify your email to save highlights"
          >
            <ColorSwatchPicker onChange={handlePick} disabled={createHighlight.isPending} />
          </VerifiedGate>
        )}
      </PopoverContent>
    </Popover>
  );
}
