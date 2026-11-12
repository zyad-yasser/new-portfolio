import { db } from "@repo/db";
import { postBookmark } from "@repo/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  authedProcedure,
  createPublicTRPCRouter,
  strictRateLimit,
  verifiedProcedure,
} from "../init";
import { afterCursor, pageInputSchema, toPage } from "../pagination";
import { formatPost, postWith } from "./post";
import { assertReadablePost, isReadableBy } from "./readable-post";

export const bookmarkRouter = createPublicTRPCRouter({
  mine: authedProcedure.input(pageInputSchema(20, 50).optional()).query(async ({ ctx, input }) => {
    const limit = input?.limit ?? 20;
    const rows = await db.query.postBookmark.findMany({
      where: and(
        eq(postBookmark.userId, ctx.session.user.id),
        afterCursor({ createdAt: postBookmark.createdAt, id: postBookmark.postId }, input?.cursor)
      ),
      orderBy: [desc(postBookmark.createdAt), desc(postBookmark.postId)],
      limit: limit + 1,
      with: { post: { with: postWith } },
    });

    const page = toPage(rows, limit, (row) => ({ createdAt: row.createdAt, id: row.postId }));
    return {
      ...page,
      items: page.items
        .filter((row) => isReadableBy(row.post, ctx.session.user.id))
        .map((row) => formatPost(row.post)),
    };
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

  toggle: verifiedProcedure
    .use(strictRateLimit({ path: "bookmark.toggle", limit: 300, window: "1 h" }))
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

      await assertReadablePost(input.postId, ctx.session.user.id);

      await db.insert(postBookmark).values({ userId: ctx.session.user.id, postId: input.postId });

      return { bookmarked: true };
    }),
});
