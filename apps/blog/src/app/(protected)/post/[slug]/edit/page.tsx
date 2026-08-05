"use client";

import { PostEditor } from "@/components/editor/post-editor";
import { SiteHeader } from "@/components/site-header";
import { publicApi } from "@repo/trpc/public/react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: posts, isLoading } = publicApi.post.mine.useQuery();
  const post = posts?.find((p) => p.slug === slug);

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">Post not found</h1>
          <Button asChild variant="outline">
            <Link href="/mine">Back to my posts</Link>
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
        <PostEditor
          key={post.id}
          mode="edit"
          existingPostId={post.id}
          initialTitle={post.title}
          initialContentJson={post.contentJson}
          initialCategoryId={post.categoryId}
          initialTagNames={post.tags.map((t) => t.name)}
          doneHref={`/post/${post.slug}`}
        />
      </main>
    </>
  );
}
