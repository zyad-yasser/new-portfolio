import { db } from "@repo/db";
import { post, postTag, tag } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { z } from "zod";
import { createPublicTRPCRouter, publicProcedure } from "../init";
import { afterCursor, byOwnCursor, pageInputSchema, toPage } from "../pagination";
import { formatPost, postWith } from "./post";

function publishedTagIds() {
  return db
    .selectDistinct({ id: postTag.tagId })
    .from(postTag)
    .innerJoin(post, and(eq(post.id, postTag.postId), eq(post.published, true)));
}

async function findTagBySlug(slug: string) {
  const found = await db.query.tag.findFirst({ where: eq(tag.slug, slug) });

  if (!found) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  return found;
}

function publishedWithTag(tagId: string) {
  return and(
    eq(post.published, true),
    inArray(
      post.id,
      db.select({ id: postTag.postId }).from(postTag).where(eq(postTag.tagId, tagId))
    )
  );
}

export const tagRouter = createPublicTRPCRouter({
  list: publicProcedure.query(() =>
    db.query.tag.findMany({
      where: inArray(tag.id, publishedTagIds()),
      orderBy: asc(tag.name),
    })
  ),

  search: publicProcedure
    .input(z.object({ query: z.string().trim().max(30) }))
    .query(({ input }) =>
      db.query.tag.findMany({
        where: and(
          inArray(tag.id, publishedTagIds()),
          input.query ? ilike(tag.name, `%${input.query}%`) : undefined
        ),
        orderBy: asc(tag.name),
        limit: 20,
      })
    ),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const found = await findTagBySlug(input.slug);

      const [countRow] = await db
        .select({ value: count() })
        .from(post)
        .where(publishedWithTag(found.id));
      const postCount = countRow?.value ?? 0;

      if (!postCount) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { ...found, postCount };
    }),

  posts: publicProcedure
    .input(pageInputSchema(12, 50).extend({ slug: z.string() }))
    .query(async ({ input }) => {
      const found = await findTagBySlug(input.slug);

      const rows = await db.query.post.findMany({
        where: and(publishedWithTag(found.id), afterCursor(post, input.cursor)),
        orderBy: [desc(post.createdAt), desc(post.id)],
        limit: input.limit + 1,
        with: postWith,
      });

      const page = toPage(rows, input.limit, byOwnCursor);
      return { ...page, items: page.items.map(formatPost) };
    }),
});
