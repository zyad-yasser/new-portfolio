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
            {series.posts.length} {series.posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {series.posts.length === 0 ? (
          <p className="text-muted-foreground">No published posts in this series yet.</p>
        ) : (
          <TooltipProvider>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {series.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TooltipProvider>
        )}
      </main>
    </>
  );
}
