import { db } from "@repo/db";
import { userBlock } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter } from "../init";

export async function assertNotBlocked(viewerId: string, targetUserId: string) {
  if (viewerId === targetUserId) {
    return;
  }

  const existing = await db.query.userBlock.findFirst({
    where: or(
      and(eq(userBlock.blockerId, viewerId), eq(userBlock.blockedId, targetUserId)),
      and(eq(userBlock.blockerId, targetUserId), eq(userBlock.blockedId, viewerId))
    ),
  });

  if (existing) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This action isn't available between these accounts.",
    });
  }
}

export const blockRouter = createPublicTRPCRouter({
  list: authedProcedure.query(async ({ ctx }) => {
    const rows = await db.query.userBlock.findMany({
      where: eq(userBlock.blockerId, ctx.session.user.id),
      with: { blocked: { columns: { id: true, name: true, image: true } } },
    });

    return rows.map((row) => row.blocked);
  }),

  block: authedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You can't block yourself." });
      }

      const existing = await db.query.userBlock.findFirst({
        where: and(
          eq(userBlock.blockerId, ctx.session.user.id),
          eq(userBlock.blockedId, input.userId)
        ),
      });

      if (!existing) {
        await db
          .insert(userBlock)
          .values({ blockerId: ctx.session.user.id, blockedId: input.userId });
      }

      return { blocked: true };
    }),

  unblock: authedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(userBlock)
        .where(
          and(eq(userBlock.blockerId, ctx.session.user.id), eq(userBlock.blockedId, input.userId))
        );

      return { blocked: false };
    }),
});
