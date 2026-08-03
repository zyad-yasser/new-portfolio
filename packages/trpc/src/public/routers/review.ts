import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { review, user } from "@repo/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, publicProcedure } from "../init";

export const reviewRouter = createPublicTRPCRouter({
  list: publicProcedure.query(async () => {
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
      .orderBy(desc(review.createdAt));

    return rows;
  }),

  create: authedProcedure
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
