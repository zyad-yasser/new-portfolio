"use client";

import { publicAuthClient } from "@repo/auth/public-client";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import Link from "next/link";
import { initialsFor } from "@/lib/notifications";

export function FollowersTab() {
  const { data: session } = publicAuthClient.useSession();
  const userId = session?.user.id;

  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    publicApi.follow.followers.useInfiniteQuery(
      { userId: userId ?? "" },
      { enabled: !!userId, getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined }
    );
  const followers = data?.pages.flatMap((page) => page.items);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Followers</h2>

      {isLoading && <Skeleton className="skeleton-shimmer h-24 w-full" />}
      {error && (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <p>Couldn't load your followers. Please try again.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}
      {!isLoading && !error && followers?.length === 0 && (
        <p className="text-muted-foreground">No one is following you yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {followers?.map((user) => (
          <Card key={user.id} className="flex flex-row items-center gap-3 p-4">
            <Link
              href={user.profile?.username ? `/u/${user.profile.username}` : "#"}
              className="flex items-center gap-3"
            >
              <Avatar size="sm">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback>{initialsFor(user.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name}</span>
            </Link>
          </Card>
        ))}

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
      </div>
    </div>
  );
}
