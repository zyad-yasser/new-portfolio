import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { post, postTag, tag, userBlock } from "@repo/db/schema";
import type { TiptapDoc } from "@repo/db/schema";
import { requireEnv } from "@repo/utils";
import { createRateLimiter, getClientIp } from "@repo/utils/rate-limit";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, ne, notInArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, publicProcedure, strictRateLimit } from "../init";
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

function buildExcerpt(doc: TiptapDoc) {
  const text = extractPlainText(doc);
  return text.length > 300 ? `${text.slice(0, 300).trimEnd()}…` : text;
}

function estimateReadingMinutes(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
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
export const postWith = {
  author: { columns: authorColumns, with: { profile: { columns: { username: true } } } },
  category: true,
  postTags: { with: { tag: true } },
} as const;

export function formatPost<T extends { postTags: Array<{ tag: unknown }> }>(row: T) {
  const { postTags, ...rest } = row;
  type Tag = T["postTags"][number]["tag"];
  return { ...rest, tags: postTags.map((postTag) => postTag.tag) as Tag[] };
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

  mine: authedProcedure.query(async ({ ctx }) => {
    const rows = await db.query.post.findMany({
      where: eq(post.authorId, ctx.session.user.id),
      orderBy: desc(post.createdAt),
      with: postWith,
    });

    return rows.map(formatPost);
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

      return {
        ...formatPost(found),
        readingMinutes: estimateReadingMinutes(extractPlainText(found.contentJson)),
      };
    }),

  create: authedProcedure
    .use(strictRateLimit({ path: "post.create", limit: 5, window: "1 h" }))
    .input(
      z.object({
        title: z.string().trim().min(1).max(150),
        contentJson: tiptapNodeSchema,
        categoryId: z.string().nullable().optional(),
        tagNames: z.array(z.string().trim().min(1).max(30)).max(MAX_TAGS).optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ensureUserProfile(ctx.session.user.id);
      const slug = await uniqueSlug(input.title);

      return db.transaction(async (tx) => {
        const rows = await tx
          .insert(post)
          .values({
            id: randomUUID(),
            authorId: ctx.session.user.id,
            categoryId: input.categoryId ?? null,
            title: input.title,
            slug,
            excerptText: buildExcerpt(input.contentJson),
            contentJson: input.contentJson,
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

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().trim().min(1).max(150).optional(),
        contentJson: tiptapNodeSchema.optional(),
        categoryId: z.string().nullable().optional(),
        tagNames: z.array(z.string().trim().min(1).max(30)).max(MAX_TAGS).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.transaction(async (tx) => {
        const patch: Partial<typeof post.$inferInsert> = { updatedAt: new Date() };

        if (input.title !== undefined) {
          patch.title = input.title;
        }
        if (input.contentJson !== undefined) {
          patch.contentJson = input.contentJson;
          patch.excerptText = buildExcerpt(input.contentJson);
        }
        if (input.categoryId !== undefined) {
          patch.categoryId = input.categoryId;
        }

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
