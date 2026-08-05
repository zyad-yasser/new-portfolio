"use client";

import { TiptapContent } from "@/components/editor/tiptap-content";
import { extractHeadings } from "@/components/editor/toc";
import { SiteHeader } from "@/components/site-header";
import { categoryColorClasses } from "@/lib/category-colors";
import { publicApi } from "@repo/trpc/public/react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";
import { Calendar, ChevronRight, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = publicApi.post.getBySlug.useQuery({ slug });
  const incrementView = publicApi.post.incrementView.useMutation();
  const hasTrackedView = useRef(false);

  const headings = useMemo(() => (post ? extractHeadings(post.contentJson) : []), [post]);

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

  const colors = categoryColorClasses(post.category?.color);

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
          <div className="flex flex-wrap items-center gap-2">
            {!post.published && <Badge variant="outline">Draft</Badge>}
            {post.category && (
              <Badge variant="outline" className={colors.badge}>
                {post.category.name}
              </Badge>
            )}
          </div>
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
              {post.readingMinutes} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {post.viewCount} {post.viewCount === 1 ? "view" : "views"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0">
            <TiptapContent json={post.contentJson} />
          </div>

          <aside className="flex flex-col gap-4">
            {post.tags.length > 0 && (
              <Card className="flex flex-col gap-2 border-border/60 p-4">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {headings.length >= 2 && (
              <Card className="flex flex-col gap-2 border-border/60 p-4">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  On this page
                </span>
                <nav className="flex flex-col gap-1.5 text-sm">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={cn(
                        "text-muted-foreground hover:text-foreground hover:underline",
                        heading.level === 3 && "pl-3"
                      )}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
