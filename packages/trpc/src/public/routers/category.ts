import { db } from "@repo/db";
import { category, post } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createPublicTRPCRouter, publicProcedure } from "../init";
import { afterCursor, byOwnCursor, pageInputSchema, toPage } from "../pagination";
import { formatPost, postWith } from "./post";

async function findCategoryBySlug(slug: string) {
  const found = await db.query.category.findFirst({ where: eq(category.slug, slug) });

  if (!found) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  return found;
}

function publishedInCategory(categoryId: string) {
  return and(eq(post.published, true), eq(post.categoryId, categoryId));
}

export const categoryRouter = createPublicTRPCRouter({
  list: publicProcedure.query(() => db.query.category.findMany({ orderBy: asc(category.name) })),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const found = await findCategoryBySlug(input.slug);

      const [countRow] = await db
        .select({ value: count() })
        .from(post)
        .where(publishedInCategory(found.id));

      return { ...found, postCount: countRow?.value ?? 0 };
    }),

  posts: publicProcedure
    .input(pageInputSchema(12, 50).extend({ slug: z.string() }))
    .query(async ({ input }) => {
      const found = await findCategoryBySlug(input.slug);

      const rows = await db.query.post.findMany({
        where: and(publishedInCategory(found.id), afterCursor(post, input.cursor)),
        orderBy: [desc(post.createdAt), desc(post.id)],
        limit: input.limit + 1,
        with: postWith,
      });

      const page = toPage(rows, input.limit, byOwnCursor);
      return { ...page, items: page.items.map(formatPost) };
    }),
});
