import { db } from "@repo/db";
import { category, post, series, tag } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://blog.zyadyasser.net";

  const [posts, allSeries, allCategories, allTags] = await Promise.all([
    db.query.post.findMany({
      where: eq(post.published, true),
      columns: { slug: true, updatedAt: true },
    }),
    db.query.series.findMany({ columns: { slug: true, updatedAt: true } }),
    db.query.category.findMany({ columns: { slug: true, createdAt: true } }),
    db.query.tag.findMany({ columns: { slug: true, createdAt: true } }),
  ]);

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/series`, changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((p) => ({
      url: `${baseUrl}/post/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...allSeries.map((s) => ({
      url: `${baseUrl}/series/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...allCategories.map((c) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: c.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...allTags.map((t) => ({
      url: `${baseUrl}/tag/${t.slug}`,
      lastModified: t.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
