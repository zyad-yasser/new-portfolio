"use client";

import { initialsFor } from "@/lib/notifications";
import { publicAuthClient } from "@repo/auth/public-client";
import { getErrorMessage } from "@repo/trpc/error";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";

export function FollowingTab() {
  const { data: session } = publicAuthClient.useSession();
  const userId = session?.user.id;
  const utils = publicApi.useUtils();

  const {
    data: following,
    isLoading,
    error,
    refetch,
  } = publicApi.follow.following.useQuery({ userId: userId ?? "" }, { enabled: !!userId });

  const unfollow = publicApi.follow.unfollow.useMutation({
    onSuccess: () => {
      utils.follow.following.invalidate();
      toast.success("Unfollowed.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't unfollow this user.")),
  });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Following</h2>

      {isLoading && <Skeleton className="skeleton-shimmer h-24 w-full" />}
      {error && (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <p>Couldn't load the people you follow. Please try again.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}
      {!isLoading && !error && following?.length === 0 && (
        <p className="text-muted-foreground">You're not following anyone yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {following?.map((user) => (
          <Card key={user.id} className="flex flex-row items-center justify-between gap-3 p-4">
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
            <Button
              variant="outline"
              size="sm"
              disabled={unfollow.isPending}
              onClick={() => unfollow.mutate({ userId: user.id })}
            >
              Unfollow
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
