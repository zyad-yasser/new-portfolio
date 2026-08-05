"use client";

import { SiteHeader } from "@/components/site-header";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/tooltip";
import { Bookmark, Eye, Share2 } from "lucide-react";
import Link from "next/link";

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

export default function BlogHomePage() {
  const { data, isLoading } = publicApi.post.list.useQuery();
  const posts = data?.items;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Blog</h1>
          <p className="text-muted-foreground">Writing from Zyad Yasser.</p>
        </div>

        <TooltipProvider>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-52 w-full rounded-xl" />
              ))}

            {!isLoading && posts?.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground">
                No posts yet - be the first.
              </p>
            )}

            {posts?.map((post) => (
              <Card
                key={post.id}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border-border/60 p-5"
              >
                <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />

                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Post
                  </span>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7" disabled>
                          <Bookmark className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Sign in to save</TooltipContent>
                    </Tooltip>
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
                  <h2 className="text-lg leading-snug font-semibold group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                    {post.content}
                  </p>
                </Link>

                <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarImage src={post.authorImage ?? undefined} alt={post.authorName} />
                      <AvatarFallback>{initialsFor(post.authorName)}</AvatarFallback>
                    </Avatar>
                    <span>{post.authorName}</span>
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
            ))}
          </div>
        </TooltipProvider>
      </main>
    </>
  );
}
