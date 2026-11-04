import { db } from "@repo/db";
import { post, postReshare } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, strictRateLimit, verifiedProcedure } from "../init";
import { assertNotBlocked } from "./block";
import { createNotification } from "./notification";
import { formatPost, postWith } from "./post";
import { isReadableBy } from "./readable-post";

export const reshareRouter = createPublicTRPCRouter({
  mine: authedProcedure.query(async ({ ctx }) => {
    const rows = await db.query.postReshare.findMany({
      where: eq(postReshare.userId, ctx.session.user.id),
      orderBy: desc(postReshare.createdAt),
      with: { post: { with: postWith } },
    });

    return rows
      .filter((row) => isReadableBy(row.post, ctx.session.user.id))
      .map((row) => formatPost(row.post));
  }),

  isReshared: authedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const existing = await db.query.postReshare.findFirst({
        where: and(
          eq(postReshare.userId, ctx.session.user.id),
          eq(postReshare.postId, input.postId)
        ),
      });

      return !!existing;
    }),

  create: verifiedProcedure
    .use(strictRateLimit({ path: "reshare.create", limit: 100, window: "1 h" }))
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const target = await db.query.post.findFirst({ where: eq(post.id, input.postId) });

      if (!target || !target.published) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (target.authorId === ctx.session.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You can't reshare your own post." });
      }

      await assertNotBlocked(ctx.session.user.id, target.authorId);

      const existing = await db.query.postReshare.findFirst({
        where: and(
          eq(postReshare.userId, ctx.session.user.id),
          eq(postReshare.postId, input.postId)
        ),
      });

      if (!existing) {
        await db.insert(postReshare).values({ userId: ctx.session.user.id, postId: input.postId });

        await createNotification({
          recipientId: target.authorId,
          actorId: ctx.session.user.id,
          type: "reshare",
          postId: target.id,
        });
      }

      return { reshared: true };
    }),

  remove: verifiedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(postReshare)
        .where(
          and(eq(postReshare.userId, ctx.session.user.id), eq(postReshare.postId, input.postId))
        );

      return { reshared: false };
    }),
});
