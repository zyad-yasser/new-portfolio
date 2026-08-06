"use client";

import { PostCard } from "@/components/posts/post-card";
import { SiteHeader } from "@/components/site-header";
import { categoryColorClasses } from "@/lib/category-colors";
import { publicAuthClient } from "@repo/auth/public-client";
import { publicApi } from "@repo/trpc/public/react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";
import { TooltipProvider } from "@repo/ui/tooltip";
import { PenLine } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function BlogHomePage() {
  const { data: session } = publicAuthClient.useSession();
  const { data, isLoading, error, refetch } = publicApi.post.list.useQuery();
  const { data: categories } = publicApi.category.list.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  });
  const { data: tags } = publicApi.tag.list.useQuery(undefined, { staleTime: 5 * 60 * 1000 });

  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [tagSlug, setTagSlug] = useState<string | null>(null);

  const posts = data?.items;
  const filteredPosts = useMemo(() => {
    if (!posts) {
      return posts;
    }
    return posts.filter((post) => {
      if (categorySlug && post.category?.slug !== categorySlug) {
        return false;
      }
      if (tagSlug && !post.tags.some((tag) => tag.slug === tagSlug)) {
        return false;
      }
      return true;
    });
  }, [posts, categorySlug, tagSlug]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Blog</h1>
          <p className="text-muted-foreground">A space for everyone to write.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr] xl:grid-cols-[200px_1fr_240px]">
          <aside className="flex flex-col gap-1">
            <span className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Categories
            </span>
            <button
              type="button"
              onClick={() => setCategorySlug(null)}
              className={cn(
                "cursor-pointer rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                !categorySlug && "bg-accent font-medium"
              )}
            >
              All posts
            </button>
            {categories?.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setCategorySlug(category.slug === categorySlug ? null : category.slug)
                }
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                  categorySlug === category.slug && "bg-accent font-medium"
                )}
              >
                <span
                  className={cn("size-2 rounded-full", categoryColorClasses(category.color).dot)}
                />
                {category.name}
              </button>
            ))}
          </aside>

          <TooltipProvider>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-52 w-full rounded-xl" />
                ))}

              {error && (
                <div className="col-span-full flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                  <p>Couldn't load posts. {error.message}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Try again
                  </Button>
                </div>
              )}

              {!isLoading && !error && filteredPosts?.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground">
                  {posts?.length === 0
                    ? "No posts yet - be the first."
                    : "No posts match this filter."}
                </p>
              )}

              {filteredPosts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TooltipProvider>

          <aside className="hidden flex-col gap-4 xl:flex">
            <Card className="flex flex-col gap-3 border-border/60 p-4">
              <span className="text-sm font-medium">
                {session ? "Have something to say?" : "Join the conversation"}
              </span>
              <p className="text-sm text-muted-foreground">
                {session
                  ? "Share your thoughts with the community."
                  : "Sign up to write, comment, and react to posts."}
              </p>
              <Button asChild size="sm" className="gap-2">
                <Link href={session ? "/new" : "/signup"}>
                  <PenLine className="size-4" />
                  {session ? "Write a post" : "Sign up"}
                </Link>
              </Button>
            </Card>

            {tags && tags.length > 0 && (
              <Card className="flex flex-col gap-2 border-border/60 p-4">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className="cursor-pointer"
                      onClick={() => setTagSlug(tag.slug === tagSlug ? null : tag.slug)}
                    >
                      <Badge variant={tagSlug === tag.slug ? "default" : "secondary"}>
                        {tag.name}
                      </Badge>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
