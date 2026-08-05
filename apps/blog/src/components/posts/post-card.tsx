"use client";

import { categoryColorClasses } from "@/lib/category-colors";
import { publicAuthClient } from "@repo/auth/public-client";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/tooltip";
import { Bookmark, Eye, Share2 } from "lucide-react";
import Link from "next/link";

export type PostCardData = {
  id: string;
  slug: string;
  title: string;
  excerptText: string;
  createdAt: string | Date;
  viewCount: number;
  category: { name: string; color: string } | null;
  tags: { id: string; name: string }[];
  author: { name: string; image: string | null; profile: { username: string } | null };
};

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

  navigator.clipboard.writeText(url);
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
  });

  if (!session) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7" disabled>
            <Bookmark className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Sign in to save</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      disabled={toggle.isPending}
      onClick={(event) => {
        event.preventDefault();
        toggle.mutate({ postId });
      }}
    >
      <Bookmark className={cn("size-3.5", bookmarked && "fill-current")} />
    </Button>
  );
}

export function PostCard({ post }: { post: PostCardData }) {
  const colors = categoryColorClasses(post.category?.color);
  const authorHref = post.author.profile ? `/u/${post.author.profile.username}` : undefined;

  return (
    <Card className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border-border/60 p-5">
      <span className={cn("absolute inset-y-0 left-0 w-1", colors.bar)} aria-hidden />

      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {post.category ? post.category.name : "Post"}
        </span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <BookmarkButton postId={post.id} />
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={(event) => {
              event.preventDefault();
              sharePost(post.slug, post.title);
            }}
          >
            <Share2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <Link href={`/post/${post.slug}`} className="flex flex-1 flex-col gap-2">
        <h2 className="text-lg leading-snug font-semibold group-hover:underline">{post.title}</h2>
        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{post.excerptText}</p>
      </Link>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-[10px]">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarImage src={post.author.image ?? undefined} alt={post.author.name} />
            <AvatarFallback>{initialsFor(post.author.name)}</AvatarFallback>
          </Avatar>
          {authorHref ? (
            <Link
              href={authorHref}
              onClick={(event) => event.stopPropagation()}
              className="hover:text-foreground hover:underline"
            >
              {post.author.name}
            </Link>
          ) : (
            <span>{post.author.name}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{formatDate(post.createdAt)}</span>
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" />
            {post.viewCount}
          </span>
        </div>
      </div>
    </Card>
  );
}
