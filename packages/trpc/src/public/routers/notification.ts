import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { notification, userBlock } from "@repo/db/schema";
import type { NotificationType } from "@repo/db/schema";
import { and, desc, eq, isNull, lt, or, sql } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter } from "../init";

export async function createNotification(input: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string | null;
  commentId?: string | null;
}) {
  if (input.recipientId === input.actorId) {
    return;
  }

  const blocked = await db.query.userBlock.findFirst({
    where: or(
      and(eq(userBlock.blockerId, input.recipientId), eq(userBlock.blockedId, input.actorId)),
      and(eq(userBlock.blockerId, input.actorId), eq(userBlock.blockedId, input.recipientId))
    ),
  });

  if (blocked) {
    return;
  }

  await db.insert(notification).values({
    id: randomUUID(),
    recipientId: input.recipientId,
    actorId: input.actorId,
    type: input.type,
    postId: input.postId ?? null,
    commentId: input.commentId ?? null,
  });
}

const actorColumns = { id: true, name: true, image: true } as const;
const cursorSchema = z.object({ createdAt: z.coerce.date(), id: z.string() });

export const notificationRouter = createPublicTRPCRouter({
  list: authedProcedure
    .input(
      z
        .object({
          cursor: cursorSchema.optional(),
          limit: z.number().int().min(1).max(50).default(30),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const cursor = input?.cursor;
      const limit = input?.limit ?? 30;

      const conditions = [eq(notification.recipientId, ctx.session.user.id)];
      if (cursor) {
        const cursorCondition = or(
          lt(notification.createdAt, cursor.createdAt),
          and(eq(notification.createdAt, cursor.createdAt), lt(notification.id, cursor.id))
        );
        if (cursorCondition) {
          conditions.push(cursorCondition);
        }
      }

      const rows = await db.query.notification.findMany({
        where: and(...conditions),
        orderBy: [desc(notification.createdAt), desc(notification.id)],
        limit: limit + 1,
        with: {
          actor: { columns: actorColumns, with: { profile: { columns: { username: true } } } },
          post: { columns: { slug: true, title: true } },
        },
      });

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const last = items.at(-1);

      return {
        items,
        nextCursor: hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
      };
    }),

  unreadCount: authedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notification)
      .where(and(eq(notification.recipientId, ctx.session.user.id), isNull(notification.readAt)));

    return rows[0]?.count ?? 0;
  }),

  markRead: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(notification)
        .set({ readAt: new Date() })
        .where(
          and(eq(notification.id, input.id), eq(notification.recipientId, ctx.session.user.id))
        );

      return { id: input.id };
    }),

  markAllRead: authedProcedure.mutation(async ({ ctx }) => {
    await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(
        and(eq(notification.recipientId, ctx.session.user.id), isNull(notification.readAt))
      );

    return { ok: true };
  }),
});
