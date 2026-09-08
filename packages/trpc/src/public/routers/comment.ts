import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { comment, post, userBlock } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt, isNull, notInArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  createPublicTRPCRouter,
  publicProcedure,
  strictRateLimit,
  verifiedProcedure,
} from "../init";
import { assertNotBlocked } from "./block";
import { createNotification } from "./notification";
import { ensureUserProfile } from "./profile";

const authorColumns = { id: true, name: true, image: true } as const;
const authorWith = { profile: { columns: { username: true } } } as const;
const MAX_REPLIES_PER_COMMENT = 50;
const cursorSchema = z.object({ createdAt: z.coerce.date(), id: z.string() });

export const commentRouter = createPublicTRPCRouter({
  listByPost: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        cursor: cursorSchema.optional(),
        limit: z.number().int().min(1).max(100).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit;
      const blockedIds = ctx.session
        ? (
            await db.query.userBlock.findMany({
              where: eq(userBlock.blockerId, ctx.session.user.id),
              columns: { blockedId: true },
            })
          ).map((row) => row.blockedId)
        : [];

      const baseWhere = [eq(comment.postId, input.postId), isNull(comment.parentCommentId)];
      if (blockedIds.length) {
        baseWhere.push(notInArray(comment.authorId, blockedIds));
      }
      if (input.cursor) {
        baseWhere.push(
          or(
            gt(comment.createdAt, input.cursor.createdAt),
            and(eq(comment.createdAt, input.cursor.createdAt), gt(comment.id, input.cursor.id))
          )!
        );
      }

      const rows = await db.query.comment.findMany({
        where: and(...baseWhere),
        orderBy: [asc(comment.createdAt), asc(comment.id)],
        limit: limit + 1,
        with: {
          author: { columns: authorColumns, with: authorWith },
          replies: {
            where: blockedIds.length ? notInArray(comment.authorId, blockedIds) : undefined,
            orderBy: asc(comment.createdAt),
            limit: MAX_REPLIES_PER_COMMENT,
            with: { author: { columns: authorColumns, with: authorWith } },
          },
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

  create: verifiedProcedure
    .use(strictRateLimit({ path: "comment.create", limit: 200, window: "1 h" }))
    .input(
      z.object({
        postId: z.string(),
        body: z.string().trim().min(1).max(2000),
        parentCommentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ensureUserProfile(ctx.session.user.id);
      const targetPost = await db.query.post.findFirst({ where: eq(post.id, input.postId) });

      if (!targetPost) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await assertNotBlocked(ctx.session.user.id, targetPost.authorId);

      let parent: typeof comment.$inferSelect | undefined;

      if (input.parentCommentId) {
        parent = await db.query.comment.findFirst({
          where: eq(comment.id, input.parentCommentId),
        });

        if (!parent || parent.postId !== input.postId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        if (parent.parentCommentId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Can't reply to a reply." });
        }

        await assertNotBlocked(ctx.session.user.id, parent.authorId);
      }

      const created = await db.transaction(async (tx) => {
        const rows = await tx
          .insert(comment)
          .values({
            id: randomUUID(),
            postId: input.postId,
            authorId: ctx.session.user.id,
            parentCommentId: input.parentCommentId ?? null,
            body: input.body,
          })
          .returning();

        await tx
          .update(post)
          .set({ commentCount: sql`${post.commentCount} + 1` })
          .where(eq(post.id, input.postId));

        return rows[0];
      });

      if (created) {
        await createNotification({
          recipientId: parent ? parent.authorId : targetPost.authorId,
          actorId: ctx.session.user.id,
          type: parent ? "reply" : "comment",
          postId: input.postId,
          commentId: created.id,
        });
      }

      return created;
    }),

  update: verifiedProcedure
    .input(z.object({ id: z.string(), body: z.string().trim().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .update(comment)
        .set({ body: input.body, updatedAt: new Date() })
        .where(and(eq(comment.id, input.id), eq(comment.authorId, ctx.session.user.id)))
        .returning();

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return rows[0];
    }),

  delete: verifiedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const target = await db.query.comment.findFirst({
        where: eq(comment.id, input.id),
        with: { post: { columns: { authorId: true } } },
      });

      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const isOwner = target.authorId === ctx.session.user.id;
      const isPostAuthor = target.post.authorId === ctx.session.user.id;

      if (!isOwner && !isPostAuthor) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.transaction(async (tx) => {
        const deleted = await tx
          .update(comment)
          .set({ deletedAt: new Date(), body: "" })
          .where(and(eq(comment.id, input.id), isNull(comment.deletedAt)))
          .returning({ id: comment.id });

        if (deleted.length) {
          await tx
            .update(post)
            .set({ commentCount: sql`greatest(${post.commentCount} - 1, 0)` })
            .where(eq(post.id, target.postId));
        }
      });

      return { id: input.id };
    }),
});
