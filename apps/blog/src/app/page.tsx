"use client";

import { PostCard } from "@/components/posts/post-card";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { SiteHeader } from "@/components/site-header";
import { VerifiedGate } from "@/components/verified-gate";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
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
import { useIsRestoring } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUp, Loader2, PenLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

const HOME_SCROLL_KEY = "blog-home-scroll";

type Session = ReturnType<typeof publicAuthClient.useSession>["data"];

function WriteCta({ session }: { session: Session }) {
  if (session && !session.user.emailVerified) {
    return (
      <VerifiedGate verified={false} message="Verify your email to write an article">
        <Button size="sm" className="gap-2" disabled>
          <PenLine className="size-4" />
          Write an article
        </Button>
      </VerifiedGate>
    );
  }

  return (
    <Button asChild size="sm" className="gap-2">
      <Link href={session ? "/new" : "/signup"}>
        <PenLine className="size-4" />
        {session ? "Write an article" : "Sign up"}
      </Link>
    </Button>
  );
}

export default function BlogHomePage() {
  const isRestoring = useIsRestoring();
  const utils = publicApi.useUtils();
  const { data: session } = publicAuthClient.useSession();
  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    publicApi.post.list.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        // The feed is restored from the persisted cache on refresh and otherwise only
        // moves forward via fetchNextPage. Automatic refetches would re-fetch page 1 with
        // whatever is newest right now, silently shifting already-visible posts around —
        // new content should only ever appear through the "new posts" banner below.
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      }
    );
  const { data: categories } = publicApi.category.list.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  });
  const { data: tags } = publicApi.tag.list.useQuery(undefined, { staleTime: 5 * 60 * 1000 });

  const posts = useMemo(() => data?.pages.flatMap((page) => page.items), [data]);
  const latestPostId = posts?.[0]?.id;
  const hasPosts = !!posts && posts.length > 0;
  // isRestoring must count as "still loading" here too: while the persisted cache is being
  // read, isLoading is false (the query is paused, not fetching) even though there's no data
  // yet — SSR never has a persister, so it never pauses this way and isLoading is always true
  // in the equivalent state there. Without isRestoring here, the server would render this
  // skeleton block while the client's first paint renders nothing, a hydration mismatch.
  const showSkeleton = (isLoading || isRestoring) && !hasPosts;

  const newestPeek = publicApi.post.list.useQuery(
    { limit: 1 },
    {
      enabled: !isRestoring && !!latestPostId,
      staleTime: 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    }
  );
  const hasNewPosts =
    !!latestPostId && !!newestPeek.data?.items[0] && newestPeek.data.items[0].id !== latestPostId;

  // Re-fetches just the first page in place rather than utils.post.list.reset(), which
  // clears `data` before refetching and briefly shows the loading skeleton — jarring for a
  // "refresh" gesture that should feel seamless, not like the feed emptied out and reloaded.
  // React Query v5 dropped per-page refetch selection, and refetch() with multiple loaded
  // pages re-fetches every one of them using their old cursors — if the freshly-fetched page
  // 1 now covers different posts, page 2's old cursor no longer lines up, risking duplicates.
  // Truncating to a single page first sidesteps that: refetch() then only has that one page
  // to redo, and `data` is never undefined in between.
  async function refreshLatest() {
    utils.post.list.setInfiniteData({}, (old) =>
      old && old.pages.length > 1
        ? { pages: old.pages.slice(0, 1), pageParams: old.pageParams.slice(0, 1) }
        : old
    );
    await refetch();
  }

  async function loadNewPosts() {
    await refreshLatest();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handlePullRefresh() {
    await refreshLatest();
  }

  useScrollRestoration(HOME_SCROLL_KEY, !isRestoring && !isLoading);

  // The grid itself always renders based on isLoading/posts (matching what SSR renders,
  // since there's no persister — and so no isRestoring pause — on the server). Gating this
  // decision below on isRestoring instead of on whether the grid renders avoids a hydration
  // mismatch: isRestoring is only ever true on the client's first paint, never on the server.
  // Once restoration resolves, if posts are already sitting in the cache there was never a
  // loading phase to reveal *from*, so the entrance animation is skipped entirely and the
  // feed just appears, the way reloading a normal page looks. A genuine first-ever fetch (no
  // cached data) still animates in. This is a deliberate one-time render-phase capture (not
  // an effect) so the first paint after restoring already has the right answer.
  const revealDecided = useRef(false);
  const skipEntranceAnimationRef = useRef(false);
  const initialPostIdsRef = useRef<Set<string> | null>(null);
  if (!isRestoring && !revealDecided.current) {
    revealDecided.current = true;
    skipEntranceAnimationRef.current = !!posts && posts.length > 0;
    initialPostIdsRef.current = new Set(posts?.map((post) => post.id));
  }
  const skipEntranceAnimation = skipEntranceAnimationRef.current;

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
      <PullToRefresh onRefresh={handlePullRefresh}>
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
              <div className="min-w-0">
                {hasNewPosts && (
                  <div className="sticky top-4 z-10 mb-5 flex justify-center">
                    <Button
                      size="sm"
                      className="btn-glow gap-2 rounded-full shadow-lg"
                      onClick={loadNewPosts}
                    >
                      <ArrowUp className="size-3.5" />
                      New posts — tap to load
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                    <p>Couldn't load posts. Please try again.</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      Try again
                    </Button>
                  </div>
                )}

                {!showSkeleton && !error && !hasPosts && posts !== undefined && (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 p-10 text-center">
                    <p className="text-muted-foreground">
                      No posts yet — be the first to share something.
                    </p>
                    <WriteCta session={session} />
                  </div>
                )}

                {!error && (hasPosts || showSkeleton) && (
                  <motion.div
                    initial={skipEntranceAnimation ? false : "hidden"}
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2"
                  >
                    {showSkeleton &&
                      Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="skeleton-shimmer h-52 w-full rounded-xl" />
                      ))}

                    {posts?.map((post) => {
                      const isInitialPost = initialPostIdsRef.current?.has(post.id) ?? false;
                      const skip = skipEntranceAnimation && isInitialPost;
                      return (
                        <motion.div
                          key={post.id}
                          variants={itemVariants}
                          {...(skip ? { initial: false } : {})}
                        >
                          <PostCard post={post} />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {hasNextPage && (
                  <div ref={loadMoreRef} className="flex justify-center py-6">
                    {isFetchingNextPage && (
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading more posts…
                      </span>
                    )}
                  </div>
                )}
              </div>
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
                <WriteCta session={session} />
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
      </PullToRefresh>
    </>
  );
}
