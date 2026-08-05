"use client";

import { SiteHeader } from "@/components/site-header";
import { publicApi } from "@repo/trpc/public/react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { Calendar, ChevronRight, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

const WORDS_PER_MINUTE = 200;

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

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
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </main>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">Post not found</h1>
          <p className="text-muted-foreground">This post doesn't exist, or isn't published yet.</p>
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
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground hover:underline">
            Blog
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="truncate text-foreground">{post.title}</span>
        </nav>

        <div className="flex flex-col gap-3">
          {!post.published && <Badge variant="outline">Draft</Badge>}
          <h1 className="text-3xl font-semibold">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span>{post.author.name}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {readingTime(post.content)} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {post.viewCount} {post.viewCount === 1 ? "view" : "views"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 whitespace-pre-wrap text-base leading-relaxed">
            {post.content}
          </div>

          <aside className="flex flex-col gap-4">
            <Card className="flex flex-col gap-3 border-border/60 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-32" />
            </Card>
          </aside>
        </div>
      </main>
    </>
  );
}
