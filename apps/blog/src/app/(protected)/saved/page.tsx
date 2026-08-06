"use client";

import { PostCard } from "@/components/posts/post-card";
import { SiteHeader } from "@/components/site-header";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { TooltipProvider } from "@repo/ui/tooltip";

export default function SavedPostsPage() {
  const { data: posts, isLoading, error, refetch } = publicApi.bookmark.mine.useQuery();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
        <h1 className="text-2xl font-semibold">Saved posts</h1>

        <TooltipProvider>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-52 w-full rounded-xl" />
              ))}
            {error && (
              <div className="col-span-full flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                <p>Couldn't load saved posts. {error.message}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try again
                </Button>
              </div>
            )}

            {!isLoading && !error && posts?.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground">No saved posts yet.</p>
            )}
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TooltipProvider>
      </main>
    </>
  );
}
