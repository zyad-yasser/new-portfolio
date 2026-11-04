import { db } from "@repo/db";
import { category, post } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createPublicTRPCRouter, publicProcedure } from "../init";
import { formatPost, postWith } from "./post";

export const categoryRouter = createPublicTRPCRouter({
  list: publicProcedure.query(() => db.query.category.findMany({ orderBy: asc(category.name) })),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const found = await db.query.category.findFirst({
        where: eq(category.slug, input.slug),
      });

      if (!found) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const rows = await db.query.post.findMany({
        where: and(eq(post.published, true), eq(post.categoryId, found.id)),
        orderBy: desc(post.createdAt),
        with: postWith,
      });

      return { ...found, posts: rows.map(formatPost) };
    }),
});
