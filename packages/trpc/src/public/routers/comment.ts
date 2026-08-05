import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { comment, post, userBlock } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, isNull, notInArray } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, publicProcedure, strictRateLimit } from "../init";
import { assertNotBlocked } from "./block";

const authorColumns = { id: true, name: true, image: true } as const;

export const commentRouter = createPublicTRPCRouter({
  listByPost: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
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

      return db.query.comment.findMany({
        where: and(...baseWhere),
        orderBy: asc(comment.createdAt),
        with: {
          author: { columns: authorColumns },
          replies: {
            where: blockedIds.length ? notInArray(comment.authorId, blockedIds) : undefined,
            orderBy: asc(comment.createdAt),
            with: { author: { columns: authorColumns } },
          },
        },
      });
    }),

  create: authedProcedure
    .use(strictRateLimit({ path: "comment.create", limit: 20, window: "1 h" }))
    .input(
      z.object({
        postId: z.string(),
        body: z.string().trim().min(1).max(2000),
        parentCommentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const targetPost = await db.query.post.findFirst({ where: eq(post.id, input.postId) });

      if (!targetPost) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await assertNotBlocked(ctx.session.user.id, targetPost.authorId);

      if (input.parentCommentId) {
        const parent = await db.query.comment.findFirst({
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

      const rows = await db
        .insert(comment)
        .values({
          id: randomUUID(),
          postId: input.postId,
          authorId: ctx.session.user.id,
          parentCommentId: input.parentCommentId ?? null,
          body: input.body,
        })
        .returning();

      return rows[0];
    }),

  update: authedProcedure
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

  delete: authedProcedure
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

      await db
        .update(comment)
        .set({ deletedAt: new Date(), body: "" })
        .where(eq(comment.id, input.id));

      return { id: input.id };
    }),
});
