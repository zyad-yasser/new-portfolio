import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { post, postTag, series, tag, userBlock } from "@repo/db/schema";
import type { PostType, TiptapDoc } from "@repo/db/schema";
import { requireEnv } from "@repo/utils";
import { createRateLimiter, getClientIp, safeLimit } from "@repo/utils/rate-limit";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, lt, ne, notInArray, or, sql } from "drizzle-orm";
import type { PgUpdateSetSource } from "drizzle-orm/pg-core";
import { z } from "zod";
import {
  authedProcedure,
  createPublicTRPCRouter,
  publicProcedure,
  strictRateLimit,
  verifiedProcedure,
} from "../init";
import { assertNotBlocked } from "./block";
import { createNotification } from "./notification";
import { ensureUserProfile } from "./profile";

const appName = requireEnv("APP_NAME");
const viewRateLimiter = createRateLimiter({
  prefix: `${appName}:trpc:post.incrementView`,
  limit: 1,
  window: "1 h",
});

const WORDS_PER_MINUTE = 200;
const MAX_TAGS = 5;

function slugifyBase(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomSlugBase() {
  return randomUUID().replace(/-/g, "").slice(0, 10);
}

async function uniqueSlug(title: string | null | undefined, excludePostId?: string) {
  const base = (title ? slugifyBase(title) : "") || randomSlugBase();
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

const tiptapNodeSchema: z.ZodType<TiptapDoc> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    text: z.string().optional(),
    marks: z.array(z.record(z.string(), z.unknown())).optional(),
    content: z.array(tiptapNodeSchema).optional(),
  })
);

function extractPlainText(doc: TiptapDoc): string {
  const parts: string[] = [];

  function walk(node: TiptapDoc) {
    if (typeof node.text === "string") {
      parts.push(node.text);
    }
    for (const child of node.content ?? []) {
      walk(child);
    }
  }

  walk(doc);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function buildExcerpt(plainText: string) {
  return plainText.length > 300 ? `${plainText.slice(0, 300).trimEnd()}…` : plainText;
}

function buildSearchVector(title: string, plainText: string) {
  return sql`setweight(to_tsvector('english', ${title}), 'A') || setweight(to_tsvector('english', ${plainText}), 'B')`;
}

function estimateReadingMinutes(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

async function computeAppendOrder(seriesId: string, authorId: string) {
  const owning = await db.query.series.findFirst({ where: eq(series.id, seriesId) });
  if (!owning || owning.authorId !== authorId) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  const existing = await db.query.post.findMany({
    where: eq(post.seriesId, seriesId),
    columns: { id: true },
  });
  return existing.length;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function syncPostTags(tx: Tx, postId: string, tagNames: string[]) {
  const tagIds: string[] = [];

  for (const rawName of tagNames) {
    const name = rawName.trim();
    const slug = slugifyBase(name) || "tag";
    const existing = await tx.query.tag.findFirst({ where: eq(tag.slug, slug) });

    if (existing) {
      tagIds.push(existing.id);
      continue;
    }

    const id = randomUUID();
    await tx.insert(tag).values({ id, name, slug });
    tagIds.push(id);
  }

  await tx.delete(postTag).where(eq(postTag.postId, postId));

  if (tagIds.length) {
    await tx.insert(postTag).values(tagIds.map((tagId) => ({ postId, tagId })));
  }
}

const authorColumns = { id: true, name: true, image: true } as const;
const basePostWith = {
  author: { columns: authorColumns, with: { profile: { columns: { username: true } } } },
  category: true,
  series: true,
  postTags: { with: { tag: true } },
} as const;

export const postWith = {
  ...basePostWith,
  quotedPost: { with: basePostWith },
} as const;

function _postRowShape() {
  return db.query.post.findFirst({ with: postWith });
}
type PostRow = NonNullable<Awaited<ReturnType<typeof _postRowShape>>>;
type QuotedPostRow = NonNullable<PostRow["quotedPost"]>;

function formatQuotedPost(row: QuotedPostRow) {
  const { postTags, ...rest } = row;
  return { ...rest, tags: postTags.map((postTag) => postTag.tag) };
}

export function formatPost(row: PostRow) {
  const { postTags, quotedPost, ...rest } = row;
  return {
    ...rest,
    tags: postTags.map((postTag) => postTag.tag),
    quotedPost: quotedPost ? formatQuotedPost(quotedPost) : null,
  };
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
    .query(async ({ ctx, input }) => {
      const cursor = input?.cursor;
      const limit = input?.limit ?? 20;

      const blockedIds = ctx.session
        ? (
            await db.query.userBlock.findMany({
              where: eq(userBlock.blockerId, ctx.session.user.id),
              columns: { blockedId: true },
            })
          ).map((row) => row.blockedId)
        : [];

      const conditions = [eq(post.published, true)];
      if (blockedIds.length) {
        conditions.push(notInArray(post.authorId, blockedIds));
      }
      if (cursor) {
        const cursorCondition = or(
          lt(post.createdAt, cursor.createdAt),
          and(eq(post.createdAt, cursor.createdAt), lt(post.id, cursor.id))
        );
        if (cursorCondition) {
          conditions.push(cursorCondition);
        }
      }

      const rows = await db.query.post.findMany({
        where: and(...conditions),
        orderBy: [desc(post.createdAt), desc(post.id)],
        limit: limit + 1,
        with: postWith,
      });

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const last = items.at(-1);

      return {
        items: items.map(formatPost),
        nextCursor: hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
      };
    }),

  mine: authedProcedure
    .input(
      z
        .object({
          cursor: cursorSchema.optional(),
          limit: z.number().int().min(1).max(50).default(20),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const cursor = input?.cursor;
      const limit = input?.limit ?? 20;

      const conditions = [eq(post.authorId, ctx.session.user.id)];
      if (cursor) {
        conditions.push(
          or(
            lt(post.createdAt, cursor.createdAt),
            and(eq(post.createdAt, cursor.createdAt), lt(post.id, cursor.id))
          )!
        );
      }

      const rows = await db.query.post.findMany({
        where: and(...conditions),
        orderBy: [desc(post.createdAt), desc(post.id)],
        limit: limit + 1,
        with: postWith,
      });

      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const last = items.at(-1);

      return {
        items: items.map(formatPost),
        nextCursor: hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const found = await db.query.post.findFirst({
        where: eq(post.slug, input.slug),
        with: postWith,
      });

      const isOwner = !!ctx.session && found?.authorId === ctx.session.user.id;

      if (!found || (!found.published && !isOwner)) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      let seriesContext: {
        position: number;
        total: number;
        prevSlug: string | null;
        nextSlug: string | null;
      } | null = null;

      if (found.seriesId) {
        const siblings = await db.query.post.findMany({
          where: and(eq(post.seriesId, found.seriesId), eq(post.published, true)),
          orderBy: asc(post.seriesOrder),
          columns: { id: true, slug: true },
        });
        const index = siblings.findIndex((sibling) => sibling.id === found.id);
        if (index !== -1) {
          seriesContext = {
            position: index + 1,
            total: siblings.length,
            prevSlug: index > 0 ? (siblings[index - 1]?.slug ?? null) : null,
            nextSlug: index < siblings.length - 1 ? (siblings[index + 1]?.slug ?? null) : null,
          };
        }
      }

      return {
        ...formatPost(found),
        readingMinutes: estimateReadingMinutes(extractPlainText(found.contentJson)),
        seriesContext,
      };
    }),

  create: verifiedProcedure
    .use(strictRateLimit({ path: "post.create", limit: 50, window: "1 h" }))
    .input(
      z
        .object({
          type: z.enum(["article", "media"]).default("article"),
          title: z.string().trim().max(150).optional(),
          contentJson: tiptapNodeSchema,
          categoryId: z.string().nullable().optional(),
          seriesId: z.string().nullable().optional(),
          tagNames: z.array(z.string().trim().min(1).max(30)).max(MAX_TAGS).optional(),
          coverImageUrl: z.string().url().nullable().optional(),
          canonicalUrl: z.string().url().nullable().optional(),
          published: z.boolean().default(false),
        })
        .refine((value) => value.type !== "article" || !!value.title?.length, {
          message: "Title is required for articles",
          path: ["title"],
        })
    )
    .mutation(async ({ ctx, input }) => {
      await ensureUserProfile(ctx.session.user.id);
      const title = input.title?.length ? input.title : null;
      const slug = await uniqueSlug(title);
      const plainText = extractPlainText(input.contentJson);
      const seriesOrder = input.seriesId
        ? await computeAppendOrder(input.seriesId, ctx.session.user.id)
        : null;

      return db.transaction(async (tx) => {
        const rows = await tx
          .insert(post)
          .values({
            id: randomUUID(),
            authorId: ctx.session.user.id,
            categoryId: input.categoryId ?? null,
            seriesId: input.seriesId ?? null,
            seriesOrder,
            type: input.type as PostType,
            title,
            slug,
            excerptText: plainText ? buildExcerpt(plainText) : null,
            contentJson: input.contentJson,
            coverImageUrl: input.coverImageUrl ?? null,
            canonicalUrl: input.canonicalUrl ?? null,
            searchVector: buildSearchVector(title ?? "", plainText),
            published: input.published,
          })
          .returning();

        const created = rows[0];

        if (!created) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        if (input.tagNames?.length) {
          await syncPostTags(tx, created.id, input.tagNames);
        }

        return created;
      });
    }),

  createQuote: verifiedProcedure
    .use(strictRateLimit({ path: "post.createQuote", limit: 100, window: "1 h" }))
    .input(
      z.object({
        quotedPostId: z.string(),
        contentJson: tiptapNodeSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const quoted = await db.query.post.findFirst({ where: eq(post.id, input.quotedPostId) });

      if (!quoted || !quoted.published) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await assertNotBlocked(ctx.session.user.id, quoted.authorId);
      await ensureUserProfile(ctx.session.user.id);

      const plainText = extractPlainText(input.contentJson);
      const slug = await uniqueSlug(null);

      const created = await db
        .insert(post)
        .values({
          id: randomUUID(),
          authorId: ctx.session.user.id,
          type: "quote",
          quotedPostId: quoted.id,
          title: null,
          slug,
          excerptText: plainText ? buildExcerpt(plainText) : null,
          contentJson: input.contentJson,
          searchVector: buildSearchVector("", plainText),
          published: true,
        })
        .returning();

      const row = created[0];

      if (!row) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      await createNotification({
        recipientId: quoted.authorId,
        actorId: ctx.session.user.id,
        type: "quote",
        postId: row.id,
      });

      return row;
    }),

  update: verifiedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().trim().min(1).max(150).optional(),
        contentJson: tiptapNodeSchema.optional(),
        categoryId: z.string().nullable().optional(),
        seriesId: z.string().nullable().optional(),
        tagNames: z.array(z.string().trim().min(1).max(30)).max(MAX_TAGS).optional(),
        coverImageUrl: z.string().url().nullable().optional(),
        canonicalUrl: z.string().url().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const current = await db.query.post.findFirst({
        where: and(eq(post.id, input.id), eq(post.authorId, ctx.session.user.id)),
        columns: { title: true, contentJson: true, seriesId: true },
      });

      if (!current) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const patch: PgUpdateSetSource<typeof post> = { updatedAt: new Date() };

      if (input.title !== undefined) {
        patch.title = input.title;
      }
      if (input.contentJson !== undefined) {
        patch.contentJson = input.contentJson;
      }
      if (input.title !== undefined || input.contentJson !== undefined) {
        const title = input.title ?? current.title;
        const plainText = extractPlainText(input.contentJson ?? current.contentJson);
        if (input.contentJson !== undefined) {
          patch.excerptText = plainText ? buildExcerpt(plainText) : null;
        }
        patch.searchVector = buildSearchVector(title ?? "", plainText);
      }
      if (input.categoryId !== undefined) {
        patch.categoryId = input.categoryId;
      }
      if (input.coverImageUrl !== undefined) {
        patch.coverImageUrl = input.coverImageUrl;
      }
      if (input.canonicalUrl !== undefined) {
        patch.canonicalUrl = input.canonicalUrl;
      }
      if (input.seriesId !== undefined && input.seriesId !== current.seriesId) {
        patch.seriesId = input.seriesId;
        patch.seriesOrder = input.seriesId
          ? await computeAppendOrder(input.seriesId, ctx.session.user.id)
          : null;
      }

      return db.transaction(async (tx) => {
        const rows = await tx
          .update(post)
          .set(patch)
          .where(and(eq(post.id, input.id), eq(post.authorId, ctx.session.user.id)))
          .returning();

        const updated = rows[0];

        if (!updated) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (input.tagNames !== undefined) {
          await syncPostTags(tx, updated.id, input.tagNames);
        }

        return updated;
      });
    }),

  delete: verifiedProcedure
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

  setPublished: verifiedProcedure
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
      const { success } = await safeLimit(viewRateLimiter, `${ip}:${input.id}`);

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
