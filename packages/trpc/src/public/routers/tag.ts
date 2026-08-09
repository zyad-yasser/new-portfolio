import { db } from "@repo/db";
import { post, postTag, tag } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, ilike, inArray } from "drizzle-orm";
import { z } from "zod";
import { createPublicTRPCRouter, publicProcedure } from "../init";
import { formatPost, postWith } from "./post";

export const tagRouter = createPublicTRPCRouter({
  list: publicProcedure.query(() => db.query.tag.findMany({ orderBy: asc(tag.name) })),

  search: publicProcedure
    .input(z.object({ query: z.string().trim().max(30) }))
    .query(({ input }) =>
      db.query.tag.findMany({
        where: input.query ? ilike(tag.name, `%${input.query}%`) : undefined,
        orderBy: asc(tag.name),
        limit: 20,
      })
    ),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const found = await db.query.tag.findFirst({
        where: eq(tag.slug, input.slug),
      });

      if (!found) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const rows = await db.query.post.findMany({
        where: and(
          eq(post.published, true),
          inArray(
            post.id,
            db.select({ id: postTag.postId }).from(postTag).where(eq(postTag.tagId, found.id))
          )
        ),
        orderBy: desc(post.createdAt),
        with: postWith,
      });

      return { ...found, posts: rows.map(formatPost) };
    }),
});
