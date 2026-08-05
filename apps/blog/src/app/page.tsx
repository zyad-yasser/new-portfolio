"use client";

import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import Link from "next/link";

export default function BlogHomePage() {
  const { data, isLoading } = publicApi.post.list.useQuery();
  const posts = data?.items;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 p-6 py-16">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold">Blog</h1>
        <p className="text-muted-foreground">Writing from Zyad Yasser.</p>
        <div className="mt-2">
          <Button asChild>
            <Link href="/new">Write a post</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}

        {!isLoading && posts?.length === 0 && (
          <p className="text-center text-muted-foreground">No posts yet - be the first.</p>
        )}

        {posts?.map((post) => (
          <Link key={post.id} href={`/post/${post.slug}`}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {post.authorName} &middot;{" "}
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">{post.content}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
