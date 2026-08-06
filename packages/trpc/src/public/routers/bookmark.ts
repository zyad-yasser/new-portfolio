import { db } from "@repo/db";
import { postBookmark } from "@repo/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter } from "../init";
import { formatPost, postWith } from "./post";

export const bookmarkRouter = createPublicTRPCRouter({
  mine: authedProcedure.query(async ({ ctx }) => {
    const rows = await db.query.postBookmark.findMany({
      where: eq(postBookmark.userId, ctx.session.user.id),
      orderBy: desc(postBookmark.createdAt),
      with: { post: { with: postWith } },
    });

    return rows.map((row) => formatPost(row.post));
  }),

  isBookmarked: authedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const existing = await db.query.postBookmark.findFirst({
        where: and(
          eq(postBookmark.userId, ctx.session.user.id),
          eq(postBookmark.postId, input.postId)
        ),
      });

      return !!existing;
    }),

  toggle: authedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const where = and(
        eq(postBookmark.userId, ctx.session.user.id),
        eq(postBookmark.postId, input.postId)
      );
      const existing = await db.query.postBookmark.findFirst({ where });

      if (existing) {
        await db.delete(postBookmark).where(where);
        return { bookmarked: false };
      }

      await db
        .insert(postBookmark)
        .values({ userId: ctx.session.user.id, postId: input.postId });

      return { bookmarked: true };
    }),
});
