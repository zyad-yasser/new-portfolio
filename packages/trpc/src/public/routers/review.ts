import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { review, user } from "@repo/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createPublicTRPCRouter, publicProcedure, strictRateLimit, verifiedProcedure } from "../init";
import { afterCursor, byOwnCursor, pageInputSchema, toPage } from "../pagination";

export const reviewRouter = createPublicTRPCRouter({
  list: publicProcedure.input(pageInputSchema(20, 50).optional()).query(async ({ input }) => {
    const limit = input?.limit ?? 20;
    const rows = await db
      .select({
        id: review.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        createdAt: review.createdAt,
        authorName: user.name,
        authorImage: user.image,
      })
      .from(review)
      .innerJoin(user, eq(review.userId, user.id))
      .where(afterCursor(review, input?.cursor))
      .orderBy(desc(review.createdAt), desc(review.id))
      .limit(limit + 1);

    return toPage(rows, limit, byOwnCursor);
  }),

  create: verifiedProcedure
    .use(strictRateLimit({ path: "review.create", limit: 50, window: "1 h" }))
    .input(
      z.object({
        rating: z.number().int().min(1).max(5),
        title: z.string().trim().min(1).max(120),
        body: z.string().trim().min(1).max(2000),
      })
    )
    .mutation(({ ctx, input }) =>
      db
        .insert(review)
        .values({
          id: randomUUID(),
          userId: ctx.session.user.id,
          rating: input.rating,
          title: input.title,
          body: input.body,
        })
        .returning()
    ),
});
