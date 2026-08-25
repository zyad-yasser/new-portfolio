"use client";

import { PostCard } from "@/components/posts/post-card";
import { SiteHeader } from "@/components/site-header";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { TooltipProvider } from "@repo/ui/tooltip";
import { useIsRestoring } from "@tanstack/react-query";
import { Loader2, Repeat2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

const FEED_TABS = ["following", "all"] as const;
type FeedTab = (typeof FEED_TABS)[number];

function feedScrollKey(tab: FeedTab) {
  return `blog-feed-scroll:${tab}`;
}

function useInfiniteScrollSentinel(hasNextPage: boolean | undefined, fetchNextPage: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = ref.current;
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

  return ref;
}

function FeedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
      <p>Couldn't load your feed. Please try again.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function LoadMoreButton({
  loadMoreRef,
  isFetchingNextPage,
  onClick,
}: {
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  onClick: () => void;
}) {
  return (
    <div ref={loadMoreRef} className="flex justify-center py-6">
      <Button
        variant="outline"
        size="sm"
        disabled={isFetchingNextPage}
        onClick={onClick}
        className="gap-2"
      >
        {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
        {isFetchingNextPage ? "Loading…" : "Load more"}
      </Button>
    </div>
  );
}

function FollowingFeed() {
  const isRestoring = useIsRestoring();
  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    publicApi.feed.following.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        // Mirrors the homepage feed: the persisted cache should just sit there after a
        // refresh, not get silently re-fetched and reshuffled underneath the restored scroll
        // position.
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      }
    );
  const items = useMemo(() => data?.pages.flatMap((page) => page.items), [data]);
  const hasItems = !!items && items.length > 0;
  // isRestoring must count as "still loading" here too: while the persisted cache is being
  // read, isLoading is false (the query is paused, not fetching) even though there's no data
  // yet. Checking isLoading alone would show neither the skeleton nor real content during
  // that window — a blank flash — since SSR has no persister and is never in this state.
  const showSkeleton = (isLoading || isRestoring) && !hasItems;
  const loadMoreRef = useInfiniteScrollSentinel(hasNextPage, fetchNextPage);
  useScrollRestoration(feedScrollKey("following"), !isRestoring && !isLoading);

  if (error) {
    return <FeedError onRetry={() => refetch()} />;
  }

  if (!showSkeleton && !hasItems) {
    return (
      <p className="text-center text-muted-foreground">
        Follow people to see their posts and reshares here.
      </p>
    );
  }

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2">
        {showSkeleton &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="skeleton-shimmer mb-5 h-52 w-full rounded-xl break-inside-avoid"
            />
          ))}

        {items?.map((item) => (
          <div
            key={item.kind === "reshare" ? `${item.resharer.id}:${item.post.id}` : item.post.id}
            className="mb-5 break-inside-avoid"
          >
            {item.kind === "reshare" && (
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Repeat2 className="size-3.5" />
                {item.resharer.name} reshared
              </span>
            )}
            <PostCard post={item.post} />
          </div>
        ))}
      </div>

      {hasNextPage && (
        <LoadMoreButton
          loadMoreRef={loadMoreRef}
          isFetchingNextPage={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        />
      )}
    </>
  );
}

function AllFeed() {
  const isRestoring = useIsRestoring();
  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    publicApi.feed.all.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      }
    );
  const posts = useMemo(() => data?.pages.flatMap((page) => page.items), [data]);
  const hasPosts = !!posts && posts.length > 0;
  const showSkeleton = (isLoading || isRestoring) && !hasPosts;
  const loadMoreRef = useInfiniteScrollSentinel(hasNextPage, fetchNextPage);
  useScrollRestoration(feedScrollKey("all"), !isRestoring && !isLoading);

  if (error) {
    return <FeedError onRetry={() => refetch()} />;
  }

  if (!showSkeleton && !hasPosts) {
    return <p className="text-center text-muted-foreground">No posts yet - be the first.</p>;
  }

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2">
        {showSkeleton &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="skeleton-shimmer mb-5 h-52 w-full rounded-xl break-inside-avoid"
            />
          ))}

        {posts?.map((post) => (
          <div key={post.id} className="mb-5 break-inside-avoid">
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {hasNextPage && (
        <LoadMoreButton
          loadMoreRef={loadMoreRef}
          isFetchingNextPage={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        />
      )}
    </>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: FeedTab = FEED_TABS.includes(tabParam as FeedTab)
    ? (tabParam as FeedTab)
    : "following";

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Feed</h1>
          <p className="text-muted-foreground">Posts and reshares from people you follow.</p>
        </div>

        <TooltipProvider>
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value="following" className="pt-4">
              <FollowingFeed />
            </TabsContent>
            <TabsContent value="all" className="pt-4">
              <AllFeed />
            </TabsContent>
          </Tabs>
        </TooltipProvider>
      </main>
    </>
  );
}
