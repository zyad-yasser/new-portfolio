"use client";

import { VerifiedGate } from "@/components/verified-gate";
import { publicAuthClient } from "@repo/auth/public-client";
import type { TiptapDoc } from "@repo/db/schema";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { cn } from "@repo/ui/lib/utils";
import { Textarea } from "@repo/ui/textarea";
import { Loader2, Quote as QuoteIcon, Repeat2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function buildQuoteContentJson(comment: string): TiptapDoc {
  const trimmed = comment.trim();
  return {
    type: "doc",
    content: [
      { type: "paragraph", content: trimmed ? [{ type: "text", text: trimmed }] : undefined },
    ],
  };
}

function QuoteDialog({
  post,
  open,
  onOpenChange,
}: {
  post: { id: string; title: string | null; excerptText: string | null; author: { name: string } };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const utils = publicApi.useUtils();
  const [comment, setComment] = useState("");

  const createQuote = publicApi.post.createQuote.useMutation({
    onSuccess: () => {
      utils.post.list.invalidate();
      utils.feed.following.invalidate();
      setComment("");
      onOpenChange(false);
      toast.success("Quote posted.");
    },
    onError: (mutationError) => {
      toast.error(mutationError.message ?? "Couldn't quote this post.");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setComment("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quote post</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Textarea
            autoFocus
            placeholder="Add your take…"
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />

          <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-3">
            <span className="text-xs font-medium">{post.author.name}</span>
            {post.title && <span className="text-sm font-medium">{post.title}</span>}
            {post.excerptText && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{post.excerptText}</p>
            )}
          </div>

          <Button
            type="button"
            className="btn-glow w-full gap-2"
            disabled={createQuote.isPending}
            onClick={() => {
              createQuote.mutate({
                quotedPostId: post.id,
                contentJson: buildQuoteContentJson(comment),
              });
            }}
          >
            {createQuote.isPending && <Loader2 className="size-4 animate-spin" />}
            Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ReshareButton({
  post,
}: {
  post: {
    id: string;
    authorId: string;
    title: string | null;
    excerptText: string | null;
    author: { name: string };
  };
}) {
  const { data: session } = publicAuthClient.useSession();
  const utils = publicApi.useUtils();
  const [quoteOpen, setQuoteOpen] = useState(false);

  const { data: reshared } = publicApi.reshare.isReshared.useQuery(
    { postId: post.id },
    { enabled: !!session }
  );

  const createReshare = publicApi.reshare.create.useMutation({
    onSuccess: () => {
      utils.reshare.isReshared.invalidate({ postId: post.id });
      utils.post.list.invalidate();
      utils.feed.following.invalidate();
    },
    onError: (mutationError) => {
      toast.error(mutationError.message ?? "Couldn't reshare this post.");
    },
  });
  const removeReshare = publicApi.reshare.remove.useMutation({
    onSuccess: () => {
      utils.reshare.isReshared.invalidate({ postId: post.id });
    },
    onError: (mutationError) => {
      toast.error(mutationError.message ?? "Couldn't undo the reshare.");
    },
  });

  if (!session || session.user.id === post.authorId) {
    return null;
  }

  const isPending = createReshare.isPending || removeReshare.isPending;

  return (
    <>
      <VerifiedGate
        verified={session.user.emailVerified}
        message="Verify your email to reshare posts"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-7", reshared && "text-primary")}
              aria-label="Reshare post"
              disabled={!session.user.emailVerified || isPending}
            >
              <Repeat2 className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                reshared
                  ? removeReshare.mutate({ postId: post.id })
                  : createReshare.mutate({ postId: post.id })
              }
            >
              <Repeat2 />
              {reshared ? "Undo reshare" : "Reshare"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setQuoteOpen(true)}>
              <QuoteIcon />
              Reshare with opinion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </VerifiedGate>

      <QuoteDialog post={post} open={quoteOpen} onOpenChange={setQuoteOpen} />
    </>
  );
}
