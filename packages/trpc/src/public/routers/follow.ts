import { db } from "@repo/db";
import { userFollow } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, publicProcedure } from "../init";
import { assertNotBlocked } from "./block";

const followUserColumns = { id: true, name: true, image: true } as const;

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
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const rows = await db.query.userFollow.findMany({
        where: eq(userFollow.followingId, input.userId),
        with: { follower: { columns: followUserColumns, with: { profile: true } } },
      });

      return rows.map((row) => row.follower);
    }),

  following: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const rows = await db.query.userFollow.findMany({
        where: eq(userFollow.followerId, input.userId),
        with: { following: { columns: followUserColumns, with: { profile: true } } },
      });

      return rows.map((row) => row.following);
    }),

  follow: authedProcedure
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
      }

      return { following: true };
    }),

  unfollow: authedProcedure
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
