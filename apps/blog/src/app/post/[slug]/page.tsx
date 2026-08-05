"use client";

import { publicApi } from "@repo/trpc/public/react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = publicApi.post.getBySlug.useQuery({ slug });
  const incrementView = publicApi.post.incrementView.useMutation();
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (post && !hasTrackedView.current) {
      hasTrackedView.current = true;
      incrementView.mutate({ id: post.id });
    }
  }, [post, incrementView]);

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 py-16">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Post not found</h1>
        <p className="text-muted-foreground">This post doesn't exist, or isn't published yet.</p>
        <Button asChild variant="outline">
          <Link href="/">Back to blog</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">
        &larr; Back to blog
      </Link>

      <div className="flex flex-col gap-3">
        {!post.published && <Badge variant="outline">Draft</Badge>}
        <h1 className="text-3xl font-semibold">{post.title}</h1>
        <p className="text-sm text-muted-foreground">
          {post.author.name} &middot;{" "}
          {new Date(post.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          &middot; {post.viewCount} {post.viewCount === 1 ? "view" : "views"}
        </p>
      </div>

      <div className="whitespace-pre-wrap text-base leading-relaxed">{post.content}</div>
    </main>
  );
}
