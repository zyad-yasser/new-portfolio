"use client";

import { PostCard } from "@/components/posts/post-card";
import { SiteHeader } from "@/components/site-header";
import { publicAuthClient } from "@repo/auth/public-client";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { TooltipProvider } from "@repo/ui/tooltip";
import { Calendar, Globe, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: session } = publicAuthClient.useSession();
  const utils = publicApi.useUtils();

  const {
    data: profile,
    isLoading,
    error,
  } = publicApi.profile.getByUsername.useQuery({ username });
  const { data: posts, isLoading: postsLoading } = publicApi.profile.posts.useQuery({ username });

  const isOwnProfile = !!session && session.user.id === profile?.userId;

  const { data: isFollowing } = publicApi.follow.isFollowing.useQuery(
    { userId: profile?.userId ?? "" },
    { enabled: !!session && !!profile && !isOwnProfile }
  );

  const follow = publicApi.follow.follow.useMutation({
    onSuccess: () => {
      if (profile) {
        utils.follow.isFollowing.invalidate({ userId: profile.userId });
      }
      utils.profile.getByUsername.invalidate({ username });
    },
  });
  const unfollow = publicApi.follow.unfollow.useMutation({
    onSuccess: () => {
      if (profile) {
        utils.follow.isFollowing.invalidate({ userId: profile.userId });
      }
      utils.profile.getByUsername.invalidate({ username });
    },
  });

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </main>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">User not found</h1>
          <Button asChild variant="outline">
            <Link href="/">Back to blog</Link>
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar size="lg" className="size-20">
            <AvatarImage src={profile.user.image ?? undefined} alt={profile.user.name} />
            <AvatarFallback className="text-lg">{initialsFor(profile.user.name)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-1">
            <h1 className="text-2xl font-semibold">{profile.user.name}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="mt-1 text-sm">{profile.bio}</p>}
          </div>

          {!isOwnProfile && session && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              disabled={follow.isPending || unfollow.isPending}
              onClick={() =>
                isFollowing
                  ? unfollow.mutate({ userId: profile.userId })
                  : follow.mutate({ userId: profile.userId })
              }
            >
              {(follow.isPending || unfollow.isPending) && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-center gap-8 border-y border-border/60 py-4 text-sm sm:justify-start">
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-lg font-semibold">{profile.postCount}</span>
            <span className="text-muted-foreground">Posts</span>
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-lg font-semibold">{profile.followerCount}</span>
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-lg font-semibold">{profile.followingCount}</span>
            <span className="text-muted-foreground">Following</span>
          </div>
        </div>

        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="pt-4">
            <TooltipProvider>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {postsLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-52 w-full rounded-xl" />
                  ))}
                {!postsLoading && posts?.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground">
                    No published posts yet.
                  </p>
                )}
                {posts?.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </TooltipProvider>
          </TabsContent>

          <TabsContent value="about" className="flex flex-col gap-3 pt-4 text-sm">
            {profile.bio ? (
              <p>{profile.bio}</p>
            ) : (
              <p className="text-muted-foreground">No bio yet.</p>
            )}
            {profile.location && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3.5" />
                {profile.location}
              </span>
            )}
            {profile.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline"
              >
                <Globe className="size-3.5" />
                {profile.websiteUrl}
              </a>
            )}
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-3.5" />
              Joined{" "}
              {new Date(profile.user.createdAt).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </span>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
