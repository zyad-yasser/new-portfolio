import { db } from "@repo/db";
import { post, series } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://blog.zyadyasser.net";

  const [posts, allSeries] = await Promise.all([
    db.query.post.findMany({
      where: eq(post.published, true),
      columns: { slug: true, updatedAt: true },
    }),
    db.query.series.findMany({ columns: { slug: true, updatedAt: true } }),
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
  ];
}
