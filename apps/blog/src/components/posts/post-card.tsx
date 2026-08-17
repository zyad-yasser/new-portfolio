"use client";

import { ReshareButton } from "@/components/posts/reshare-button";
import { categoryColorClasses } from "@/lib/category-colors";
import { publicAuthClient } from "@repo/auth/public-client";
import type { TiptapDoc } from "@repo/db/schema";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/tooltip";
import { Bookmark, Eye, Library, Quote, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

type PostCardAuthor = { name: string; image: string | null; profile: { username: string } | null };

export type PostCardData = {
  id: string;
  slug: string;
  authorId: string;
  type: "article" | "media" | "quote";
  title: string | null;
  excerptText: string | null;
  contentJson: TiptapDoc;
  createdAt: string | Date;
  viewCount: number;
  coverImageUrl: string | null;
  category: { name: string; color: string } | null;
  series: { title: string; slug: string } | null;
  tags: { id: string; name: string }[];
  author: PostCardAuthor;
  quotedPost: {
    slug: string;
    title: string | null;
    excerptText: string | null;
    author: PostCardAuthor;
  } | null;
};

function MediaPreview({ media }: { media: { kind: "image" | "video"; src: string } }) {
  const isVideo = media.kind === "video";
  return (
    <>
      {isVideo ? (
        <video
          src={media.src}
          muted
          playsInline
          preload="metadata"
          className="-mx-5 w-[calc(100%+2.5rem)] max-h-96 object-cover"
        />
      ) : (
        <div className="relative -mx-5 aspect-[4/3] w-[calc(100%+2.5rem)] overflow-hidden">
          <Image
            src={media.src}
            alt=""
            fill
            sizes="(min-width: 768px) 380px, 100vw"
            className="object-cover"
          />
        </div>
      )}
    </>
  );
}

function extractFirstMedia(doc: TiptapDoc): { kind: "image" | "video"; src: string } | null {
  if (doc.type === "image" || doc.type === "video") {
    const src = doc.attrs?.src;
    if (typeof src === "string") {
      return { kind: doc.type, src };
    }
  }
  for (const child of doc.content ?? []) {
    const found = extractFirstMedia(child);
    if (found) {
      return found;
    }
  }
  return null;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function sharePost(slug: string, title: string) {
  const url = `${window.location.origin}/post/${slug}`;

  if (navigator.share) {
    navigator.share({ title, url }).catch(() => {});
    return;
  }

  navigator.clipboard
    .writeText(url)
    .then(() => toast.success("Link copied to clipboard."))
    .catch(() => toast.error("Couldn't copy the link."));
}

function BookmarkButton({ postId }: { postId: string }) {
  const { data: session } = publicAuthClient.useSession();
  const utils = publicApi.useUtils();
  const { data: bookmarked } = publicApi.bookmark.isBookmarked.useQuery(
    { postId },
    { enabled: !!session }
  );

  const toggle = publicApi.bookmark.toggle.useMutation({
    onSuccess: () => {
      utils.bookmark.isBookmarked.invalidate({ postId });
      utils.bookmark.mine.invalidate();
    },
    onError: (error) => toast.error(error.message ?? "Couldn't save this post."),
  });

  const disabledReason = !session
    ? "Sign in to save"
    : !session.user.emailVerified
      ? "Verify your email to save posts"
      : null;

  const button = (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      disabled={!!disabledReason || toggle.isPending}
      aria-label={bookmarked ? "Remove bookmark" : "Save post"}
      aria-pressed={!!bookmarked}
      onClick={(event) => {
        event.preventDefault();
        toggle.mutate({ postId });
      }}
    >
      <Bookmark className={cn("size-3.5", bookmarked && "fill-current")} />
    </Button>
  );

  if (!disabledReason) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* biome-ignore lint/a11y/noNoninteractiveTabindex: focusable so keyboard users can reveal why the disabled control inside is disabled */}
        <span tabIndex={0} className="inline-flex">
          {button}
        </span>
      </TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  );
}

function PostCardActions({ post }: { post: PostCardData }) {
  return (
    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <BookmarkButton postId={post.id} />
      <ReshareButton post={post} />
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        aria-label="Share post"
        onClick={(event) => {
          event.preventDefault();
          sharePost(post.slug, post.title ?? post.excerptText ?? "this post");
        }}
      >
        <Share2 className="size-3.5" />
      </Button>
    </div>
  );
}

function PostCardFooter({ post }: { post: PostCardData }) {
  const authorHref = post.author.profile ? `/u/${post.author.profile.username}` : undefined;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
      <div className="flex min-w-0 items-center gap-2">
        <Avatar size="sm" className="shrink-0">
          <AvatarImage src={post.author.image ?? undefined} alt={post.author.name} />
          <AvatarFallback>{initialsFor(post.author.name)}</AvatarFallback>
        </Avatar>
        {authorHref ? (
          <Link
            href={authorHref}
            onClick={(event) => event.stopPropagation()}
            className="truncate hover:text-foreground hover:underline"
          >
            {post.author.name}
          </Link>
        ) : (
          <span className="truncate">{post.author.name}</span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
        <span>{formatDate(post.createdAt)}</span>
        <span className="flex items-center gap-1">
          <Eye className="size-3.5" />
          {post.viewCount}
        </span>
      </div>
    </div>
  );
}

export function PostCard({ post }: { post: PostCardData }) {
  const utils = publicApi.useUtils();
  const colors = categoryColorClasses(post.category?.color);

  function prefetchPost() {
    utils.post.getBySlug.prefetch({ slug: post.slug });
  }

  if (post.type === "media") {
    const media = extractFirstMedia(post.contentJson);

    return (
      <Card className="card-hover group relative flex flex-col gap-3 overflow-hidden rounded-xl p-5">
        <span className={cn("absolute inset-y-0 left-0 w-1", colors.bar)} aria-hidden />

        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Post
          </span>
          <PostCardActions post={post} />
        </div>

        <Link
          href={`/post/${post.slug}`}
          className="flex flex-1 flex-col gap-2"
          onMouseEnter={prefetchPost}
          onFocus={prefetchPost}
        >
          {media && <MediaPreview media={media} />}
          {post.excerptText && (
            <p className="line-clamp-3 flex-1 text-sm whitespace-pre-wrap">{post.excerptText}</p>
          )}
        </Link>

        <PostCardFooter post={post} />
      </Card>
    );
  }

  if (post.type === "quote") {
    return (
      <Card className="card-hover group relative flex flex-col gap-3 overflow-hidden rounded-xl p-5">
        <span className={cn("absolute inset-y-0 left-0 w-1", colors.bar)} aria-hidden />

        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Quote className="size-3.5" />
            Quote
          </span>
          <PostCardActions post={post} />
        </div>

        <Link
          href={`/post/${post.slug}`}
          className="flex flex-1 flex-col gap-2"
          onMouseEnter={prefetchPost}
          onFocus={prefetchPost}
        >
          {post.excerptText && (
            <p className="line-clamp-3 text-sm whitespace-pre-wrap">{post.excerptText}</p>
          )}

          {post.quotedPost ? (
            <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-3">
              <span className="text-xs font-medium">{post.quotedPost.author.name}</span>
              {post.quotedPost.title && (
                <span className="text-sm font-medium">{post.quotedPost.title}</span>
              )}
              {post.quotedPost.excerptText && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {post.quotedPost.excerptText}
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
              This post is no longer available.
            </p>
          )}
        </Link>

        <PostCardFooter post={post} />
      </Card>
    );
  }

  return (
    <Card className="card-hover group relative flex flex-col gap-3 overflow-hidden rounded-xl p-5">
      <span className={cn("absolute inset-y-0 left-0 w-1", colors.bar)} aria-hidden />

      {post.coverImageUrl && (
        <div className="relative -mx-5 -mt-5 aspect-[2/1] w-[calc(100%+2.5rem)] overflow-hidden">
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 380px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {post.category ? post.category.name : "Post"}
        </span>
        <PostCardActions post={post} />
      </div>

      <Link
        href={`/post/${post.slug}`}
        className="flex flex-1 flex-col gap-2"
        onMouseEnter={prefetchPost}
        onFocus={prefetchPost}
      >
        <h2 className="text-lg leading-snug font-semibold group-hover:underline">{post.title}</h2>
        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{post.excerptText}</p>
      </Link>

      {post.series && (
        <Link
          href={`/series/${post.series.slug}`}
          onClick={(event) => event.stopPropagation()}
          className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          <Library className="size-3.5" />
          {post.series.title}
        </Link>
      )}

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-[10px]">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <PostCardFooter post={post} />
    </Card>
  );
}
