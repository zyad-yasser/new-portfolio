"use client";

import { publicAuthClient } from "@repo/auth/public-client";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AuthorCard({ username }: { username: string }) {
  const { data: session } = publicAuthClient.useSession();
  const utils = publicApi.useUtils();
  const { data: profile } = publicApi.profile.getByUsername.useQuery({ username });

  const isOwnProfile = !!session && !!profile && session.user.id === profile.userId;

  const { data: isFollowing } = publicApi.follow.isFollowing.useQuery(
    { userId: profile?.userId ?? "" },
    { enabled: !!session && !!profile && !isOwnProfile }
  );

  const follow = publicApi.follow.follow.useMutation({
    onSuccess: () => {
      if (profile) {
        utils.follow.isFollowing.invalidate({ userId: profile.userId });
      }
    },
  });
  const unfollow = publicApi.follow.unfollow.useMutation({
    onSuccess: () => {
      if (profile) {
        utils.follow.isFollowing.invalidate({ userId: profile.userId });
      }
    },
  });

  if (!profile) {
    return null;
  }

  return (
    <Card className="flex flex-col gap-3 border-border/60 p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={profile.user.image ?? undefined} alt={profile.user.name} />
          <AvatarFallback>{initialsFor(profile.user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <Link href={`/u/${profile.username}`} className="text-sm font-semibold hover:underline">
            {profile.user.name}
          </Link>
          <span className="text-xs text-muted-foreground">@{profile.username}</span>
        </div>
      </div>

      {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}

      {!isOwnProfile && session && (
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          disabled={follow.isPending || unfollow.isPending}
          onClick={() =>
            isFollowing
              ? unfollow.mutate({ userId: profile.userId })
              : follow.mutate({ userId: profile.userId })
          }
        >
          {(follow.isPending || unfollow.isPending) && (
            <Loader2 className="size-3.5 animate-spin" />
          )}
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </Card>
  );
}
