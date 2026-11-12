import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import type { NotificationType } from "@repo/db/schema";
import { notification, userBlock } from "@repo/db/schema";
import { getRedis } from "@repo/utils/redis";
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter } from "../init";
import { afterCursor, byOwnCursor, createdAtCursorSchema, toPage } from "../pagination";

const UNREAD_CACHE_TTL_SECONDS = 24 * 60 * 60;

function unreadCacheKey(userId: string) {
  return `notif:unread:${userId}`;
}

async function invalidateUnreadCount(userId: string) {
  try {
    await getRedis().del(unreadCacheKey(userId));
  } catch {}
}

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

  if (input.type !== "comment" && input.type !== "reply") {
    const duplicate = await db.query.notification.findFirst({
      where: and(
        eq(notification.recipientId, input.recipientId),
        eq(notification.actorId, input.actorId),
        eq(notification.type, input.type),
        input.postId ? eq(notification.postId, input.postId) : isNull(notification.postId),
        isNull(notification.readAt)
      ),
      columns: { id: true },
    });

    if (duplicate) {
      return;
    }
  }

  await db.insert(notification).values({
    id: randomUUID(),
    recipientId: input.recipientId,
    actorId: input.actorId,
    type: input.type,
    postId: input.postId ?? null,
    commentId: input.commentId ?? null,
  });

  await invalidateUnreadCount(input.recipientId);
}

const actorColumns = { id: true, name: true, image: true } as const;

export const notificationRouter = createPublicTRPCRouter({
  list: authedProcedure
    .input(
      z
        .object({
          cursor: createdAtCursorSchema.optional(),
          limit: z.number().int().min(1).max(50).default(30),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const cursor = input?.cursor;
      const limit = input?.limit ?? 30;

      const conditions = [eq(notification.recipientId, ctx.session.user.id)];
      const cursorCondition = afterCursor(notification, cursor);
      if (cursorCondition) {
        conditions.push(cursorCondition);
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

      return toPage(rows, limit, byOwnCursor);
    }),

  unreadCount: authedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const key = unreadCacheKey(userId);
    const redis = getRedis();

    const cached = await redis.get<number>(key).catch(() => null);
    if (typeof cached === "number") {
      return cached;
    }

    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notification)
      .where(and(eq(notification.recipientId, userId), isNull(notification.readAt)));

    const count = rows[0]?.count ?? 0;
    await redis.set(key, count, { ex: UNREAD_CACHE_TTL_SECONDS }).catch(() => {});

    return count;
  }),

  markRead: authedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(and(eq(notification.id, input.id), eq(notification.recipientId, ctx.session.user.id)));

    await invalidateUnreadCount(ctx.session.user.id);

    return { id: input.id };
  }),

  markAllRead: authedProcedure.mutation(async ({ ctx }) => {
    await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(and(eq(notification.recipientId, ctx.session.user.id), isNull(notification.readAt)));

    await getRedis()
      .set(unreadCacheKey(ctx.session.user.id), 0, { ex: UNREAD_CACHE_TTL_SECONDS })
      .catch(() => {});

    return { ok: true };
  }),
});
