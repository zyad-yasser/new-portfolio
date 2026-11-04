"use client";

import { PostCard } from "@/components/posts/post-card";
import { SiteHeader } from "@/components/site-header";
import { categoryColorClasses } from "@/lib/category-colors";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";
import { TooltipProvider } from "@repo/ui/tooltip";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading, error } = publicApi.category.getBySlug.useQuery({ slug });
  const {
    data: postPages,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = publicApi.category.posts.useInfiniteQuery(
    { slug },
    { enabled: !!category, getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined }
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

  if (error || !category) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">Category not found</h1>
          <Button asChild variant="outline">
            <Link href="/">Back to blog</Link>
          </Button>
        </main>
      </>
    );
  }

  const colors = categoryColorClasses(category.color);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className={cn("size-2.5 rounded-full", colors.dot)} />
            <h1 className="text-3xl font-semibold">{category.name}</h1>
          </div>
          {category.description && (
            <p className="max-w-2xl text-muted-foreground">{category.description}</p>
          )}
          <span className="text-sm text-muted-foreground">
            {category.postCount} {category.postCount === 1 ? "post" : "posts"}
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
          <p className="text-muted-foreground">No published posts in this category yet.</p>
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
