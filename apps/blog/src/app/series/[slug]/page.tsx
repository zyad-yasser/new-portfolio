"use client";

import { PostCard } from "@/components/posts/post-card";
import { SiteHeader } from "@/components/site-header";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { TooltipProvider } from "@repo/ui/tooltip";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SeriesDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: series, isLoading, error } = publicApi.series.getBySlug.useQuery({ slug });
  const {
    data: postPages,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = publicApi.series.posts.useInfiniteQuery(
    { slug },
    { enabled: !!series, getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined }
  );
  const posts = postPages?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16">
          <Skeleton className="skeleton-shimmer h-9 w-1/2" />
          <Skeleton className="skeleton-shimmer h-4 w-1/3" />
        </main>
      </>
    );
  }

  if (error || !series) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">Series not found</h1>
          <Button asChild variant="outline">
            <Link href="/series">Back to series</Link>
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">{series.title}</h1>
          {series.description && (
            <p className="max-w-2xl text-muted-foreground">{series.description}</p>
          )}
          <span className="text-sm text-muted-foreground">
            By{" "}
            {series.author.profile ? (
              <Link
                href={`/u/${series.author.profile.username}`}
                className="font-medium text-foreground hover:underline"
              >
                {series.author.name}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{series.author.name}</span>
            )}
            {" · "}
            {series.postCount} {series.postCount === 1 ? "post" : "posts"}
          </span>
        </div>

        {postsLoading ? (
          <div className="columns-1 gap-5 sm:columns-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="skeleton-shimmer mb-5 h-52 w-full rounded-xl break-inside-avoid"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No published posts in this series yet.</p>
        ) : (
          <TooltipProvider>
            <div className="columns-1 gap-5 sm:columns-2">
              {posts.map((post) => (
                <div key={post.id} className="mb-5 break-inside-avoid">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </TooltipProvider>
        )}

        {hasNextPage && (
          <Button
            variant="outline"
            className="self-center"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        )}
      </main>
    </>
  );
}
