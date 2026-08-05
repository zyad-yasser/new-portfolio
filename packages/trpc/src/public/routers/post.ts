import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { post, user } from "@repo/db/schema";
import { requireEnv } from "@repo/utils";
import { createRateLimiter, getClientIp } from "@repo/utils/rate-limit";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, ne, or, sql } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, publicProcedure, strictRateLimit } from "../init";

const appName = requireEnv("APP_NAME");
const viewRateLimiter = createRateLimiter({
  prefix: `${appName}:trpc:post.incrementView`,
  limit: 1,
  window: "1 h",
});

function slugifyBase(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(title: string, excludePostId?: string) {
  const base = slugifyBase(title) || "post";
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await db.query.post.findFirst({
      where: excludePostId
        ? and(eq(post.slug, candidate), ne(post.id, excludePostId))
        : eq(post.slug, candidate),
    });

    if (!existing) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

const cursorSchema = z.object({ createdAt: z.coerce.date(), id: z.string() });

export const postRouter = createPublicTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          cursor: cursorSchema.optional(),
          limit: z.number().int().min(1).max(50).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const cursor = input?.cursor;
      const limit = input?.limit ?? 20;
      const rows = await db
        .select({
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          createdAt: post.createdAt,
          viewCount: post.viewCount,
          authorName: user.name,
          authorImage: user.image,
        })
        .from(post)
        .innerJoin(user, eq(post.authorId, user.id))
        .where(
          cursor
            ? and(
                eq(post.published, true),
                or(
                  lt(post.createdAt, cursor.createdAt),
                  and(eq(post.createdAt, cursor.createdAt), lt(post.id, cursor.id))
                )
              )
            : eq(post.published, true)
        )
        .orderBy(desc(post.createdAt), desc(post.id))
        .limit(limit + 1);

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const last = items.at(-1);

      return {
        items,
        nextCursor: hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
      };
    }),

  mine: authedProcedure.query(({ ctx }) =>
    db.query.post.findMany({
      where: eq(post.authorId, ctx.session.user.id),
      orderBy: desc(post.createdAt),
    })
  ),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const found = await db.query.post.findFirst({
        where: eq(post.slug, input.slug),
        with: { author: true },
      });

      const isOwner = !!ctx.session && found?.authorId === ctx.session.user.id;

      if (!found || (!found.published && !isOwner)) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return found;
    }),

  create: authedProcedure
    .use(strictRateLimit({ path: "post.create", limit: 5, window: "1 h" }))
    .input(
      z.object({
        title: z.string().trim().min(1).max(150),
        content: z.string().trim().min(1).max(20000),
        published: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = await uniqueSlug(input.title);

      const rows = await db
        .insert(post)
        .values({
          id: randomUUID(),
          authorId: ctx.session.user.id,
          title: input.title,
          slug,
          content: input.content,
          published: input.published,
        })
        .returning();

      return rows[0];
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().trim().min(1).max(150),
        content: z.string().trim().min(1).max(20000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .update(post)
        .set({ title: input.title, content: input.content, updatedAt: new Date() })
        .where(and(eq(post.id, input.id), eq(post.authorId, ctx.session.user.id)))
        .returning();

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return rows[0];
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .delete(post)
        .where(and(eq(post.id, input.id), eq(post.authorId, ctx.session.user.id)))
        .returning();

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { id: rows[0].id };
    }),

  setPublished: authedProcedure
    .input(z.object({ id: z.string(), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .update(post)
        .set({ published: input.published, updatedAt: new Date() })
        .where(and(eq(post.id, input.id), eq(post.authorId, ctx.session.user.id)))
        .returning();

      return rows[0] ?? null;
    }),

  incrementView: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ip = getClientIp(ctx.headers);
      const { success } = await viewRateLimiter.limit(`${ip}:${input.id}`);

      if (!success) {
        return { counted: false };
      }

      await db
        .update(post)
        .set({ viewCount: sql`${post.viewCount} + 1` })
        .where(eq(post.id, input.id));

      return { counted: true };
    }),
});
