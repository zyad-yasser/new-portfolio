import { db } from "@repo/db";
import { userFollow } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, publicProcedure, strictRateLimit, verifiedProcedure } from "../init";
import { afterCursor, pageInputSchema, toPage } from "../pagination";
import { assertNotBlocked } from "./block";
import { createNotification } from "./notification";

const followUserColumns = { id: true, name: true, image: true } as const;
const followPageInputSchema = pageInputSchema(20, 50).extend({ userId: z.string() });

export const followRouter = createPublicTRPCRouter({
  isFollowing: authedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const existing = await db.query.userFollow.findFirst({
        where: and(
          eq(userFollow.followerId, ctx.session.user.id),
          eq(userFollow.followingId, input.userId)
        ),
      });

      return !!existing;
    }),

  followers: publicProcedure
    .input(followPageInputSchema)
    .query(async ({ input }) => {
      const rows = await db.query.userFollow.findMany({
        where: and(
          eq(userFollow.followingId, input.userId),
          afterCursor({ createdAt: userFollow.createdAt, id: userFollow.followerId }, input.cursor)
        ),
        orderBy: [desc(userFollow.createdAt), desc(userFollow.followerId)],
        limit: input.limit + 1,
        with: { follower: { columns: followUserColumns, with: { profile: true } } },
      });

      const page = toPage(rows, input.limit, (row) => ({
        createdAt: row.createdAt,
        id: row.followerId,
      }));
      return { ...page, items: page.items.map((row) => row.follower) };
    }),

  following: publicProcedure
    .input(followPageInputSchema)
    .query(async ({ input }) => {
      const rows = await db.query.userFollow.findMany({
        where: and(
          eq(userFollow.followerId, input.userId),
          afterCursor({ createdAt: userFollow.createdAt, id: userFollow.followingId }, input.cursor)
        ),
        orderBy: [desc(userFollow.createdAt), desc(userFollow.followingId)],
        limit: input.limit + 1,
        with: { following: { columns: followUserColumns, with: { profile: true } } },
      });

      const page = toPage(rows, input.limit, (row) => ({
        createdAt: row.createdAt,
        id: row.followingId,
      }));
      return { ...page, items: page.items.map((row) => row.following) };
    }),

  follow: verifiedProcedure
    .use(strictRateLimit({ path: "follow.follow", limit: 100, window: "1 h" }))
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You can't follow yourself." });
      }

      await assertNotBlocked(ctx.session.user.id, input.userId);

      const existing = await db.query.userFollow.findFirst({
        where: and(
          eq(userFollow.followerId, ctx.session.user.id),
          eq(userFollow.followingId, input.userId)
        ),
      });

      if (!existing) {
        await db
          .insert(userFollow)
          .values({ followerId: ctx.session.user.id, followingId: input.userId });

        await createNotification({
          recipientId: input.userId,
          actorId: ctx.session.user.id,
          type: "follow",
        });
      }

      return { following: true };
    }),

  unfollow: verifiedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(userFollow)
        .where(
          and(
            eq(userFollow.followerId, ctx.session.user.id),
            eq(userFollow.followingId, input.userId)
          )
        );

      return { following: false };
    }),
});
