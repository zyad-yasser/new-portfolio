import { db } from "@repo/db";
import { userBlock } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, strictRateLimit, verifiedProcedure } from "../init";
import { afterCursor, pageInputSchema, toPage } from "../pagination";

export async function getBlockedUserIds(viewerId: string | null | undefined) {
  if (!viewerId) {
    return [];
  }

  const rows = await db.query.userBlock.findMany({
    where: eq(userBlock.blockerId, viewerId),
    columns: { blockedId: true },
  });

  return rows.map((row) => row.blockedId);
}

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
  list: authedProcedure
    .input(pageInputSchema(20, 50).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const rows = await db.query.userBlock.findMany({
        where: and(
          eq(userBlock.blockerId, ctx.session.user.id),
          afterCursor({ createdAt: userBlock.createdAt, id: userBlock.blockedId }, input?.cursor)
        ),
        orderBy: [desc(userBlock.createdAt), desc(userBlock.blockedId)],
        limit: limit + 1,
        with: { blocked: { columns: { id: true, name: true, image: true } } },
      });

      const page = toPage(rows, limit, (row) => ({ createdAt: row.createdAt, id: row.blockedId }));
      return { ...page, items: page.items.map((row) => row.blocked) };
    }),

  block: verifiedProcedure
    .use(strictRateLimit({ path: "block.block", limit: 100, window: "1 h" }))
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

  unblock: verifiedProcedure
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
