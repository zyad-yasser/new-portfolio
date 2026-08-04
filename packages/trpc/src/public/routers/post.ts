import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { post, user } from "@repo/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, publicProcedure, strictRateLimit } from "../init";

function slugify(title: string) {
  return `${title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${randomUUID().slice(0, 8)}`;
}

export const postRouter = createPublicTRPCRouter({
  list: publicProcedure.query(async () => {
    const rows = await db
      .select({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        createdAt: post.createdAt,
        authorName: user.name,
        authorImage: user.image,
      })
      .from(post)
      .innerJoin(user, eq(post.authorId, user.id))
      .where(eq(post.published, true))
      .orderBy(desc(post.createdAt));

    return rows;
  }),

  mine: authedProcedure.query(({ ctx }) =>
    db.query.post.findMany({
      where: eq(post.authorId, ctx.session.user.id),
      orderBy: desc(post.createdAt),
    })
  ),

  create: authedProcedure
    .use(strictRateLimit({ path: "post.create", limit: 5, window: "1 h" }))
    .input(
      z.object({
        title: z.string().trim().min(1).max(150),
        content: z.string().trim().min(1).max(20000),
        published: z.boolean().default(true),
      })
    )
    .mutation(({ ctx, input }) =>
      db
        .insert(post)
        .values({
          id: randomUUID(),
          authorId: ctx.session.user.id,
          title: input.title,
          slug: slugify(input.title),
          content: input.content,
          published: input.published,
        })
        .returning()
    ),

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
});
