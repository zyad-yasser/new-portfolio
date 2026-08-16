"use client";

import { PostCard } from "@/components/posts/post-card";
import { SiteHeader } from "@/components/site-header";
import { VerifiedGate } from "@/components/verified-gate";
import { categoryColorClasses } from "@/lib/category-colors";
import { publicAuthClient } from "@repo/auth/public-client";
import { publicApi } from "@repo/trpc/public/react";
import { AmbientGradient } from "@repo/ui/ambient-gradient";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { containerVariants, itemVariants } from "@repo/ui/lib/motion";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";
import { TooltipProvider } from "@repo/ui/tooltip";
import { motion } from "framer-motion";
import { Loader2, PenLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

export default function BlogHomePage() {
  const { data: session } = publicAuthClient.useSession();
  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    publicApi.post.list.useInfiniteQuery(
      {},
      { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined }
    );
  const { data: categories } = publicApi.category.list.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  });
  const { data: tags } = publicApi.tag.list.useQuery(undefined, { staleTime: 5 * 60 * 1000 });

  const posts = useMemo(() => data?.pages.flatMap((page) => page.items), [data]);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
        <div className="relative flex flex-col gap-2">
          <AmbientGradient variant="subtle" className="-z-10" />
          <h1 className="text-3xl font-semibold">Blog</h1>
          <p className="text-muted-foreground">A space for everyone to write.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr] xl:grid-cols-[200px_1fr_240px]">
          <aside className="flex flex-col gap-1">
            <span className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Categories
            </span>
            <Link
              href="/"
              className="rounded-md bg-accent px-2 py-1.5 text-left text-sm font-medium hover:bg-accent"
            >
              All posts
            </Link>
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span
                  className={cn("size-2 rounded-full", categoryColorClasses(category.color).dot)}
                />
                {category.name}
              </Link>
            ))}
          </aside>

          <TooltipProvider>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            >
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="skeleton-shimmer h-52 w-full rounded-xl" />
                ))}

              {error && (
                <div className="col-span-full flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                  <p>Couldn't load posts. {error.message}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Try again
                  </Button>
                </div>
              )}

              {!isLoading && !error && posts?.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground">
                  No posts yet - be the first.
                </p>
              )}

              {posts?.map((post) => (
                <motion.div key={post.id} variants={itemVariants}>
                  <PostCard post={post} />
                </motion.div>
              ))}
            </motion.div>

            {hasNextPage && (
              <div ref={loadMoreRef} className="flex justify-center py-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                  className="gap-2"
                >
                  {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </TooltipProvider>

          <aside className="hidden flex-col gap-4 xl:flex">
            <Card className="flex flex-col gap-3 border-border/60 p-4">
              <span className="text-sm font-medium">
                {session ? "Have something to say?" : "Join the conversation"}
              </span>
              <p className="text-sm text-muted-foreground">
                {session
                  ? "Share your thoughts with the community."
                  : "Sign up to write, comment, and react to posts."}
              </p>
              {session && !session.user.emailVerified ? (
                <VerifiedGate verified={false} message="Verify your email to write a post">
                  <Button size="sm" className="gap-2" disabled>
                    <PenLine className="size-4" />
                    Write a post
                  </Button>
                </VerifiedGate>
              ) : (
                <Button asChild size="sm" className="gap-2">
                  <Link href={session ? "/new" : "/signup"}>
                    <PenLine className="size-4" />
                    {session ? "Write a post" : "Sign up"}
                  </Link>
                </Button>
              )}
            </Card>

            {tags && tags.length > 0 && (
              <Card className="flex flex-col gap-2 border-border/60 p-4">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Link key={tag.id} href={`/tag/${tag.slug}`}>
                      <Badge variant="secondary">{tag.name}</Badge>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
