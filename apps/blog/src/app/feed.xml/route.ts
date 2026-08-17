import { db } from "@repo/db";
import { post } from "@repo/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { Feed } from "feed";

const BLOG_URL = "https://blog.zyadyasser.net";
const MAX_ITEMS = 50;

export async function GET() {
  const posts = await db.query.post.findMany({
    where: and(eq(post.published, true), eq(post.type, "article")),
    orderBy: desc(post.createdAt),
    limit: MAX_ITEMS,
    with: { author: { columns: { name: true } } },
  });

  const feed = new Feed({
    title: "Blog — Zyad Yasser",
    description: "Writing from Zyad Yasser.",
    id: `${BLOG_URL}/`,
    link: `${BLOG_URL}/`,
    language: "en",
    favicon: `${BLOG_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Zyad Yasser`,
    feedLinks: { rss: `${BLOG_URL}/feed.xml` },
  });

  for (const p of posts) {
    feed.addItem({
      title: p.title ?? "",
      id: `${BLOG_URL}/post/${p.slug}`,
      link: `${BLOG_URL}/post/${p.slug}`,
      description: p.excerptText ?? "",
      author: [{ name: p.author.name }],
      date: p.createdAt,
      ...(p.coverImageUrl ? { image: p.coverImageUrl } : {}),
    });
  }

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
