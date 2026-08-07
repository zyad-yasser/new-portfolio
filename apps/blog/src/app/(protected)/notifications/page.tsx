"use client";

import { SiteHeader } from "@/components/site-header";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";
import { Heart, Loader2, MessageCircle, Reply, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

type NotificationItem = {
  id: string;
  type: "follow" | "comment" | "reply" | "reaction" | "mention";
  readAt: Date | string | null;
  createdAt: Date | string;
  actor: {
    id: string;
    name: string;
    image: string | null;
    profile: { username: string } | null;
  } | null;
  post: { slug: string; title: string } | null;
};

const TYPE_ICON = {
  follow: UserPlus,
  comment: MessageCircle,
  reply: Reply,
  reaction: Heart,
  mention: MessageCircle,
} as const;

function notificationText(n: NotificationItem) {
  const actorName = n.actor?.name ?? "Someone";
  switch (n.type) {
    case "follow":
      return `${actorName} started following you`;
    case "comment":
      return `${actorName} commented on "${n.post?.title ?? "your post"}"`;
    case "reply":
      return `${actorName} replied to your comment on "${n.post?.title ?? "a post"}"`;
    case "reaction":
      return `${actorName} reacted to "${n.post?.title ?? "your post"}"`;
    case "mention":
      return `${actorName} mentioned you in "${n.post?.title ?? "a post"}"`;
  }
}

function notificationHref(n: NotificationItem) {
  if (n.type === "follow") {
    return n.actor?.profile ? `/u/${n.actor.profile.username}` : "/";
  }
  return n.post ? `/post/${n.post.slug}` : "/";
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function NotificationsPage() {
  const utils = publicApi.useUtils();
  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    publicApi.notification.list.useInfiniteQuery(
      {},
      { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined }
    );

  const markRead = publicApi.notification.markRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const markAllRead = publicApi.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const notifications = useMemo(() => data?.pages.flatMap((page) => page.items), [data]);
  const hasUnread = notifications?.some((n) => !n.readAt) ?? false;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasUnread || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all as read
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}

          {error && (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <p>Couldn't load notifications. {error.message}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !error && notifications?.length === 0 && (
            <p className="text-muted-foreground">You don't have any notifications yet.</p>
          )}

          {notifications?.map((n) => {
            const Icon = TYPE_ICON[n.type];
            return (
              <Link
                key={n.id}
                href={notificationHref(n)}
                onClick={() => {
                  if (!n.readAt) {
                    markRead.mutate({ id: n.id });
                  }
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border/60 p-3 hover:bg-accent",
                  !n.readAt && "bg-accent/50"
                )}
              >
                <Avatar size="sm">
                  <AvatarImage src={n.actor?.image ?? undefined} alt={n.actor?.name ?? ""} />
                  <AvatarFallback>{n.actor ? initialsFor(n.actor.name) : "?"}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm">{notificationText(n)}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <Icon className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}

          {hasNextPage && (
            <div className="flex justify-center py-4">
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
        </div>
      </main>
    </>
  );
}
