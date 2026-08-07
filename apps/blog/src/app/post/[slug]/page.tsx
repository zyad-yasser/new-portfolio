import { PostDetailView } from "@/components/posts/post-detail-view";
import { PostStructuredData } from "@/components/seo/post-structured-data";
import { db } from "@repo/db";
import { post } from "@repo/db/schema";
import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { cache } from "react";

const getPost = cache(async (slug: string) => {
  return db.query.post.findFirst({
    where: and(eq(post.slug, slug), eq(post.published, true)),
    columns: {
      title: true,
      excerptText: true,
      coverImageUrl: true,
      canonicalUrl: true,
      createdAt: true,
      updatedAt: true,
    },
    with: { author: { columns: { name: true } } },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await getPost(slug);

  if (!found) {
    return {};
  }

  const url = found.canonicalUrl ?? `https://blog.zyadyasser.net/post/${slug}`;

  return {
    title: found.title,
    description: found.excerptText,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: found.title,
      description: found.excerptText,
      url,
      publishedTime: found.createdAt.toISOString(),
      modifiedTime: found.updatedAt.toISOString(),
      authors: [found.author.name],
      images: found.coverImageUrl ? [{ url: found.coverImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: found.title,
      description: found.excerptText,
      images: found.coverImageUrl ? [found.coverImageUrl] : undefined,
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = await getPost(slug);

  return (
    <>
      {found && <PostStructuredData post={found} slug={slug} />}
      <PostDetailView slug={slug} />
    </>
  );
}
