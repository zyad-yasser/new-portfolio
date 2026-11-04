import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { post, series } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, count, eq, gt, inArray, ne, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  authedProcedure,
  createPublicTRPCRouter,
  publicProcedure,
  strictRateLimit,
  verifiedProcedure,
} from "../init";
import { formatPost, postWith } from "./post";

function slugifyBase(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSeriesSlug(title: string, excludeSeriesId?: string) {
  const base = slugifyBase(title) || "series";
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await db.query.series.findFirst({
      where: excludeSeriesId
        ? and(eq(series.slug, candidate), ne(series.id, excludeSeriesId))
        : eq(series.slug, candidate),
    });

    if (!existing) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

const authorColumns = { id: true, name: true, image: true } as const;
const authorWith = { profile: { columns: { username: true } } } as const;

const UNORDERED_SERIES_POSITION = 2147483647;
const seriesOrderKey = sql<number>`coalesce(${post.seriesOrder}, ${UNORDERED_SERIES_POSITION})`;

const seriesListCursorSchema = z.object({ title: z.string(), id: z.string() });
const seriesPostsCursorSchema = z.object({ order: z.number().int(), id: z.string() });

async function findSeriesBySlug(slug: string) {
  const found = await db.query.series.findFirst({
    where: eq(series.slug, slug),
    with: { author: { columns: authorColumns, with: authorWith } },
  });

  if (!found) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  return found;
}

async function publishedPostCounts(seriesIds: string[]) {
  if (!seriesIds.length) {
    return new Map<string, number>();
  }

  const rows = await db
    .select({ seriesId: post.seriesId, value: count() })
    .from(post)
    .where(and(inArray(post.seriesId, seriesIds), eq(post.published, true)))
    .groupBy(post.seriesId);

  return new Map(rows.map((row) => [row.seriesId ?? "", row.value]));
}

function visibleSeriesPosts(seriesId: string, isOwner: boolean) {
  return isOwner
    ? eq(post.seriesId, seriesId)
    : and(eq(post.seriesId, seriesId), eq(post.published, true));
}

export const seriesRouter = createPublicTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          cursor: seriesListCursorSchema.optional(),
          limit: z.number().int().min(1).max(50).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const cursor = input?.cursor;
      const limit = input?.limit ?? 20;

      const rows = await db.query.series.findMany({
        where: cursor
          ? or(
              gt(series.title, cursor.title),
              and(eq(series.title, cursor.title), gt(series.id, cursor.id))
            )
          : undefined,
        orderBy: [asc(series.title), asc(series.id)],
        limit: limit + 1,
        with: { author: { columns: authorColumns, with: authorWith } },
      });

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const last = items.at(-1);
      const postCounts = await publishedPostCounts(items.map((row) => row.id));

      return {
        items: items.map((row) => ({ ...row, postCount: postCounts.get(row.id) ?? 0 })),
        nextCursor: hasMore && last ? { title: last.title, id: last.id } : null,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const found = await findSeriesBySlug(input.slug);
      const isOwner = !!ctx.session && found.authorId === ctx.session.user.id;

      const [countRow] = await db
        .select({ value: count() })
        .from(post)
        .where(visibleSeriesPosts(found.id, isOwner));

      return { ...found, postCount: countRow?.value ?? 0 };
    }),

  posts: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        cursor: seriesPostsCursorSchema.optional(),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const found = await findSeriesBySlug(input.slug);
      const isOwner = !!ctx.session && found.authorId === ctx.session.user.id;
      const { cursor } = input;

      const rows = await db.query.post.findMany({
        where: and(
          visibleSeriesPosts(found.id, isOwner),
          cursor
            ? or(
                gt(seriesOrderKey, cursor.order),
                and(eq(seriesOrderKey, cursor.order), gt(post.id, cursor.id))
              )
            : undefined
        ),
        orderBy: [asc(seriesOrderKey), asc(post.id)],
        limit: input.limit + 1,
        with: postWith,
      });

      const hasMore = rows.length > input.limit;
      const items = hasMore ? rows.slice(0, input.limit) : rows;
      const last = items.at(-1);

      return {
        items: items.map(formatPost),
        nextCursor:
          hasMore && last
            ? { order: last.seriesOrder ?? UNORDERED_SERIES_POSITION, id: last.id }
            : null,
      };
    }),

  mine: authedProcedure.query(async ({ ctx }) => {
    const rows = await db.query.series.findMany({
      where: eq(series.authorId, ctx.session.user.id),
      orderBy: [asc(series.title)],
      with: { posts: { columns: { id: true, title: true, slug: true, seriesOrder: true } } },
    });

    return rows.map((row) => ({
      ...row,
      posts: [...row.posts].sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0)),
    }));
  }),

  create: verifiedProcedure
    .use(strictRateLimit({ path: "series.create", limit: 100, window: "1 h" }))
    .input(
      z.object({
        title: z.string().trim().min(1).max(150),
        description: z.string().trim().max(500).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = await uniqueSeriesSlug(input.title);

      const rows = await db
        .insert(series)
        .values({
          id: randomUUID(),
          authorId: ctx.session.user.id,
          title: input.title,
          slug,
          description: input.description ?? null,
        })
        .returning();

      const created = rows[0];
      if (!created) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return created;
    }),

  update: verifiedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().trim().min(1).max(150).optional(),
        description: z.string().trim().max(500).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const patch: Partial<typeof series.$inferInsert> = { updatedAt: new Date() };
      if (input.title !== undefined) {
        patch.title = input.title;
      }
      if (input.description !== undefined) {
        patch.description = input.description;
      }

      const rows = await db
        .update(series)
        .set(patch)
        .where(and(eq(series.id, input.id), eq(series.authorId, ctx.session.user.id)))
        .returning();

      const updated = rows[0];
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  delete: verifiedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .delete(series)
        .where(and(eq(series.id, input.id), eq(series.authorId, ctx.session.user.id)))
        .returning();

      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { id: rows[0].id };
    }),

  reorder: verifiedProcedure
    .input(z.object({ seriesId: z.string(), postIds: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      const owned = await db.query.series.findFirst({
        where: and(eq(series.id, input.seriesId), eq(series.authorId, ctx.session.user.id)),
      });

      if (!owned) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const seriesPosts = await db.query.post.findMany({
        where: eq(post.seriesId, input.seriesId),
        columns: { id: true },
      });
      const validIds = new Set(seriesPosts.map((p) => p.id));

      if (
        input.postIds.length !== validIds.size ||
        !input.postIds.every((id) => validIds.has(id))
      ) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "postIds must match the series" });
      }

      await db.transaction(async (tx) => {
        for (const [index, postId] of input.postIds.entries()) {
          await tx
            .update(post)
            .set({ seriesOrder: index })
            .where(and(eq(post.id, postId), eq(post.seriesId, input.seriesId)));
        }
      });

      return { ok: true };
    }),
});
